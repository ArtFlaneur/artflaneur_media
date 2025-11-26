const DAY_DEFINITIONS = [
  { key: 'monday', label: 'Monday', aliases: ['monday', 'mon'] },
  { key: 'tuesday', label: 'Tuesday', aliases: ['tuesday', 'tue', 'tues'] },
  { key: 'wednesday', label: 'Wednesday', aliases: ['wednesday', 'wed'] },
  { key: 'thursday', label: 'Thursday', aliases: ['thursday', 'thu', 'thur', 'thurs'] },
  { key: 'friday', label: 'Friday', aliases: ['friday', 'fri'] },
  { key: 'saturday', label: 'Saturday', aliases: ['saturday', 'sat'] },
  { key: 'sunday', label: 'Sunday', aliases: ['sunday', 'sun'] },
] as const;

const DAY_KEY_BY_ALIAS = DAY_DEFINITIONS.reduce<Record<string, (typeof DAY_DEFINITIONS)[number]['key']>>((acc, day) => {
  day.aliases.forEach((alias) => {
    acc[alias] = day.key;
  });
  return acc;
}, {});

const DAY_KEY_TO_INDEX = DAY_DEFINITIONS.reduce<Record<string, number>>((acc, day, index) => {
  acc[day.key] = index;
  return acc;
}, {});

const DAY_RANGE_REGEX = /\b(mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)\b\s*(?:-|–|—|to)\s*\b(mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)\b/;
const CLOSED_PATTERN = /(closed|off|tbd|n\/?a|unavailable)/i;

const splitEntries = (value?: string | null) =>
  value
    ?.split(/\r?\n|;/)
    .map((line) => line.trim())
    .filter(Boolean) ?? [];

const resolveDayKey = (token: string) => {
  const normalized = token.toLowerCase();
  if (DAY_KEY_BY_ALIAS[normalized]) return DAY_KEY_BY_ALIAS[normalized];
  const short = normalized.slice(0, 3);
  return DAY_KEY_BY_ALIAS[short] ?? null;
};

const padMinutes = (minutes?: string | null) => {
  if (!minutes?.length) return '00';
  return minutes.padEnd(2, '0');
};

const normalizeTimeSegment = (segment: string) => {
  const trimmed = segment.trim();
  if (!trimmed) return trimmed;

  const meridiem = /pm/i.test(trimmed) ? 'pm' : /am/i.test(trimmed) ? 'am' : null;
  const explicit = trimmed.match(/(\d{1,2})(?:[:.](\d{1,2}))?/);
  let hours: number | null = null;
  let minutes: string | null = null;

  if (explicit) {
    hours = Number(explicit[1]);
    minutes = explicit[2] ?? null;
  } else {
    const compact = trimmed.match(/(\d{1,2})(\d{2})/);
    if (compact) {
      hours = Number(compact[1]);
      minutes = compact[2];
    }
  }

  if (hours === null || Number.isNaN(hours)) {
    return trimmed.replace(/:/g, '.');
  }

  if (meridiem === 'pm' && hours < 12) {
    hours += 12;
  } else if (meridiem === 'am' && hours === 12) {
    hours = 0;
  }

  const normalizedHours = Math.min(Math.max(hours, 0), 23).toString().padStart(2, '0');
  return `${normalizedHours}.${padMinutes(minutes)}`;
};

const formatDayValue = (label: string, raw?: string) => {
  if (!raw) return `${label}: Closed`;
  const [, remainder] = raw.split(/:(.+)/);
  const schedule = (remainder ?? raw).trim();
  if (!schedule) return `${label}: Closed`;
  if (CLOSED_PATTERN.test(schedule)) return `${label}: Closed`;

  const sanitized = schedule.replace(/[–—]/g, '-');
  const [openRaw, closeRaw] = sanitized
    .split('-')
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (openRaw && closeRaw) {
    return `${label}: ${normalizeTimeSegment(openRaw)} - ${normalizeTimeSegment(closeRaw)}`;
  }

  if (!openRaw && closeRaw) {
    return `${label}: ${normalizeTimeSegment(closeRaw)}`;
  }

  if (openRaw && !closeRaw) {
    return `${label}: ${normalizeTimeSegment(openRaw)}`;
  }

  return `${label}: ${schedule.replace(/:/g, '.').trim()}`;
};

export const formatWorkingHoursSchedule = (value?: string | null): string[] => {
  const entries = splitEntries(value);
  if (!entries.length) return [];

  const dayMap = new Map<string, string>();

  entries.forEach((entry) => {
    const normalized = entry.toLowerCase();
    const rangeMatch = normalized.match(DAY_RANGE_REGEX);

    if (rangeMatch) {
      const startKey = resolveDayKey(rangeMatch[1]);
      const endKey = resolveDayKey(rangeMatch[2]);
      if (startKey && endKey) {
        const startIndex = DAY_KEY_TO_INDEX[startKey];
        const endIndex = DAY_KEY_TO_INDEX[endKey];
        if (startIndex <= endIndex) {
          for (let index = startIndex; index <= endIndex; index += 1) {
            const day = DAY_DEFINITIONS[index];
            dayMap.set(day.key, entry);
          }
          return;
        }
      }
    }

    DAY_DEFINITIONS.forEach((day) => {
      if (day.aliases.some((alias) => new RegExp(`\\b${alias}`).test(normalized))) {
        dayMap.set(day.key, entry);
      }
    });
  });

  if (!dayMap.size) {
    return entries.map((entry) => entry.replace(/:/g, '.'));
  }

  return DAY_DEFINITIONS.map((day) => formatDayValue(day.label, dayMap.get(day.key)));
};

export const getDisplayDomain = (value?: string | null) => {
  if (!value) return null;
  try {
    const normalizedValue = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    const {hostname} = new URL(normalizedValue);
    return hostname.replace(/^www\./i, '');
  } catch (error) {
    return value
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .split('/')[0];
  }
};
