const DAY_DEFINITIONS = [
  { key: 'monday', label: 'Monday', aliases: ['monday', 'mon'] },
  { key: 'tuesday', label: 'Tuesday', aliases: ['tuesday', 'tue', 'tues'] },
  { key: 'wednesday', label: 'Wednesday', aliases: ['wednesday', 'wed'] },
  { key: 'thursday', label: 'Thursday', aliases: ['thursday', 'thu', 'thur', 'thurs'] },
  { key: 'friday', label: 'Friday', aliases: ['friday', 'fri'] },
  { key: 'saturday', label: 'Saturday', aliases: ['saturday', 'sat'] },
  { key: 'sunday', label: 'Sunday', aliases: ['sunday', 'sun'] },
] as const;

const ALL_DAY_KEYS = DAY_DEFINITIONS.map((day) => day.key);
const WEEKDAY_KEYS = DAY_DEFINITIONS.slice(0, 5).map((day) => day.key);
const WEEKEND_KEYS = DAY_DEFINITIONS.slice(5).map((day) => day.key);

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
const DAY_ALIAS_PATTERN = /\b(mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)\b/g;
const DAY_TOKEN_PATTERN = /\b(mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?|weekdays?|week\s*days?|weekends?|week\s*ends?|daily|every\s*day|7\s*days|seven\s*days|all\s*week|all\s*days)\b/gi;
const FILLER_TOKEN_PATTERN = /\b(and|from|until|till|through|thru|hrs?|hours?|hour|open|opening)\b/gi;
const DAILY_PATTERN = /\b(daily|every\s*day|7\s*days|seven\s*days|all\s*week|all\s*days)\b/;
const WEEKDAY_PATTERN = /\bweekday(s)?\b/;
const WEEKEND_PATTERN = /\bweekend(s)?\b/;

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
  const closedLabel = `${label}: Closed`;
  if (!raw) return closedLabel;

  const stripped = raw
    .replace(DAY_TOKEN_PATTERN, '')
    .replace(FILLER_TOKEN_PATTERN, '')
    .replace(/[,|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!stripped) return closedLabel;
  if (CLOSED_PATTERN.test(stripped)) return closedLabel;

  const sanitized = stripped.replace(/[–—]/g, '-').replace(/\bto\b/gi, '-');
  const [openRaw, closeRaw] = sanitized
    .split('-')
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (openRaw && closeRaw) {
    return `${label}: ${normalizeTimeSegment(openRaw)} - ${normalizeTimeSegment(closeRaw)}`;
  }

  if (openRaw) {
    return `${label}: ${normalizeTimeSegment(openRaw)}`;
  }

  return closedLabel;
};

const TIME_RANGE_PATTERN = /\b\d{1,2}(?:[:.]\d{2})?\s*(?:am|pm)?\s*(?:-|–|—|to)\s*\d{1,2}(?:[:.]\d{2})?\s*(?:am|pm)?\b/i;
const SINGLE_TIME_PATTERN = /\b\d{1,2}[:.]\d{2}\b|\b\d{1,2}\s*(?:am|pm)\b/i;

export const slugifyForUrl = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const buildExhibitionSlug = (exhibition: { id: string | number; title?: string | null }) => {
  const id = String(exhibition.id);
  const title = exhibition.title?.trim() ?? '';
  const titleSlug = title ? slugifyForUrl(title) : '';
  return titleSlug ? `${titleSlug}-${id}` : id;
};

export const extractNumericIdFromSlug = (slugOrId: string) => {
  const trimmed = slugOrId.trim();
  if (!trimmed) return trimmed;
  const parts = trimmed.split('-');
  const lastPart = parts[parts.length - 1];
  return /^\d+$/.test(lastPart) ? lastPart : trimmed;
};

const isFreeFormHoursNote = (entry: string) => {
  const normalized = entry.trim();
  if (!normalized) return false;
  if (DAY_TOKEN_PATTERN.test(normalized)) return false;
  if (TIME_RANGE_PATTERN.test(normalized)) return false;
  if (SINGLE_TIME_PATTERN.test(normalized)) return false;
  return true;
};

export const formatWorkingHoursSchedule = (value?: string | null): string[] => {
  const entries = splitEntries(value);
  const dayMap = new Map<string, string>();

  const assignEntryToKeys = (keys: string[], entry: string) => {
    keys.forEach((key) => dayMap.set(key, entry));
  };

  entries.forEach((entry) => {
    const normalized = entry.toLowerCase();

    if (DAILY_PATTERN.test(normalized)) {
      assignEntryToKeys(ALL_DAY_KEYS, entry);
      return;
    }

    if (WEEKDAY_PATTERN.test(normalized)) {
      assignEntryToKeys(WEEKDAY_KEYS, entry);
      return;
    }

    if (WEEKEND_PATTERN.test(normalized)) {
      assignEntryToKeys(WEEKEND_KEYS, entry);
      return;
    }

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

    const aliasMatches = normalized.match(DAY_ALIAS_PATTERN);
    if (aliasMatches?.length) {
      aliasMatches.forEach((token) => {
        const key = resolveDayKey(token);
        if (key) {
          dayMap.set(key, entry);
        }
      });
      return;
    }
  });

  if (!entries.length) {
    return DAY_DEFINITIONS.map((day) => `${day.label}: Closed`);
  }

  if (!dayMap.size) {
    if (entries.every(isFreeFormHoursNote)) {
      return entries;
    }
    assignEntryToKeys(ALL_DAY_KEYS, entries[0]);
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

export const getAppDownloadLink = () => {
  // Prefer a safe default (App Store) when UA is unavailable.
  const IOS_URL = 'https://apps.apple.com/au/app/art-flaneur-discover-art/id6449169783';
  const ANDROID_URL = 'https://play.google.com/store/apps/details?id=com.artflaneur';

  if (typeof navigator === 'undefined') {
    return IOS_URL;
  }

  const userAgent = navigator.userAgent || (navigator as any).vendor || (window as any).opera;

  if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
    return IOS_URL;
  }

  if (/android/i.test(userAgent)) {
    return ANDROID_URL;
  }

  return IOS_URL;
};
