import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Calendar as CalendarIcon,
  CalendarPlus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  Globe2,
  Layers,
  MapPin,
  RefreshCcw,
  Sparkles,
} from 'lucide-react';
import { useSeo } from '../lib/useSeo';
import { client } from '../sanity/lib/client';
import { ALL_ART_EVENTS_QUERY } from '../sanity/lib/queries';

const CSV_URL = '/data/art-events.csv';
const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const IOS_APP_URL = 'https://apps.apple.com/au/app/art-flaneur-discover-art/id6449169783';
const ANDROID_APP_URL = 'https://play.google.com/store/apps/details?id=com.artflaneur';
const WEB_APP_URL = 'https://www.artflaneur.art';

type PlannerPlatform = 'ios' | 'android' | 'web';

const PLANNER_LINKS: Record<PlannerPlatform, { href: string; label: string }> = {
  ios: { href: IOS_APP_URL, label: 'App Store' },
  android: { href: ANDROID_APP_URL, label: 'Google Play' },
  web: { href: WEB_APP_URL, label: 'Art Flaneur' },
};

const TYPE_COLOR_CLASSES: Record<string, string> = {
  'Art Fair': 'bg-art-yellow text-art-black border-art-black',
  Biennale: 'bg-art-blue text-white border-art-blue',
  Triennale: 'bg-art-red text-white border-art-red',
  'Annual Festival': 'bg-black text-white border-black',
  'Art Weekend': 'bg-art-paper text-art-black border-art-black',
  Default: 'bg-white text-art-black border-art-black',
};

const TYPE_ACCENT_BORDER_CLASSES: Record<string, string> = {
  'Art Fair': 'border-art-yellow',
  Biennale: 'border-art-blue',
  Triennale: 'border-art-red',
  'Annual Festival': 'border-black',
  'Art Weekend': 'border-gray-500',
  Default: 'border-art-blue',
};

const TYPE_ACCENT_BG_CLASSES: Record<string, string> = {
  'Art Fair': 'bg-art-yellow',
  Biennale: 'bg-art-blue',
  Triennale: 'bg-art-red',
  'Annual Festival': 'bg-black',
  'Art Weekend': 'bg-gray-500',
  Default: 'bg-art-blue',
};

const getTypeBorderClass = (type: string) => TYPE_ACCENT_BORDER_CLASSES[type] ?? TYPE_ACCENT_BORDER_CLASSES.Default;
const getTypeBgClass = (type: string) => TYPE_ACCENT_BG_CLASSES[type] ?? TYPE_ACCENT_BG_CLASSES.Default;

const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const longDate = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

interface RawEventRow {
  [key: string]: string;
}

interface ArtEvent {
  id: string;
  name: string;
  type: string;
  city: string;
  country: string;
  region: string;
  discipline: string;
  startDate: Date;
  endDate: Date;
  website: string;
  instagram: string;
  organizer: string;
}

interface Filters {
  region: string[];
  country: string[];
  city: string[];
  type: string[];
}

type ViewMode = 'month' | 'year';

interface CalendarDayMeta {
  date: Date;
  key: string;
  isCurrentMonth: boolean;
  isToday: boolean;
}

const trimValue = (value?: string) => value?.trim() ?? '';

const COUNTRY_NORMALIZATION_MAP: Record<string, string> = {
  'usa': 'United States',
  'u.s.a': 'United States',
  'u.s.a.': 'United States',
  'united states of america': 'United States',
  'u.s.': 'United States',
  'uk': 'United Kingdom',
  'u.k.': 'United Kingdom',
  'uae': 'United Arab Emirates',
  'u.a.e': 'United Arab Emirates',
  'u.a.e.': 'United Arab Emirates',
  'kosolo': 'Kosovo',
  'urugvay': 'Uruguay',
};

const normalizeCountry = (value: string) => {
  const trimmed = trimValue(value);
  if (!trimmed) return '';
  const canonical = COUNTRY_NORMALIZATION_MAP[trimmed.toLowerCase()];
  if (canonical) return canonical;
  return trimmed;
};

const normalizeCity = (value: string) => {
  const trimmed = trimValue(value);
  if (!trimmed) return '';
  const primary = trimmed.split(',')[0]?.trim() ?? '';
  return primary.replace(/\s+/g, ' ');
};

const normaliseUrl = (value: string) => {
  const trimmed = trimValue(value);
  if (!trimmed) return '';
  if (/^https?:/i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, '')}`;
};

const normaliseInstagram = (value: string) => {
  const trimmed = trimValue(value);
  if (!trimmed) return '';
  if (trimmed.startsWith('http')) return trimmed;
  const handle = trimmed.replace(/^@/, '').replace(/\//g, '');
  return handle ? `https://www.instagram.com/${handle}/` : '';
};

const parseDateValue = (value: string): Date | null => {
  const trimmed = trimValue(value);
  if (!trimmed) return null;
  const parts = trimmed.split(/[\/-]/).map((part) => parseInt(part, 10));
  if (parts.length < 3) return null;
  const [month, day, year] = parts;
  if (!month || !day || !year) return null;
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const dateFromKey = (key: string) => {
  const [year, month, day] = key.split('-').map((part) => parseInt(part, 10));
  return new Date(year, (month ?? 1) - 1, day ?? 1);
};

const csvToRows = (text: string): string[][] => {
  const source = text.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let current = '';
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];

    if (char === '"') {
      if (inQuotes && source[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(current);
      current = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && source[i + 1] === '\n') {
        i += 1;
      }
      row.push(current);
      if (row.some((cell) => cell.trim().length > 0)) {
        rows.push(row);
      }
      row = [];
      current = '';
      continue;
    }

    current += char;
  }

  if (current || row.length) {
    row.push(current);
    if (row.some((cell) => cell.trim().length > 0)) {
      rows.push(row);
    }
  }

  return rows;
};

const parseCsv = (text: string): ArtEvent[] => {
  const rows = csvToRows(text);
  if (!rows.length) return [];
  const headers = rows[0];

  return rows.slice(1)
    .map((cells, rawIndex) => {
      const record: RawEventRow = {};
      headers.forEach((header, idx) => {
        record[header] = trimValue(cells[idx] ?? '');
      });

      const name = trimValue(record['Name']);
      if (!name || name.toLowerCase() === 'name') {
        return null;
      }
      const region = trimValue(record['Region']);
      const type = trimValue(record['Type']) || 'Event';
      const city = normalizeCity(record['City'] ?? '');
      const country = normalizeCountry(record['Country'] ?? '');
      const discipline = trimValue(record['Discipline']);
      const organizer = trimValue(record['Organaiser'] ?? record['Organiser']);

      let startDate = parseDateValue(record['Start Date']);
      let endDate = parseDateValue(record['End Date']);

      if (!startDate && endDate) {
        startDate = endDate;
      }

      if (!endDate && startDate) {
        endDate = startDate;
      }

      if (!startDate || !endDate) {
        return null;
      }

      if (endDate.getTime() < startDate.getTime()) {
        endDate = startDate;
      }

      return {
        id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${rawIndex}`,
        name,
        type,
        city,
        country,
        region,
        discipline,
        startDate,
        endDate,
        website: normaliseUrl(record['website'] ?? ''),
        instagram: normaliseInstagram(record['Instagram'] ?? ''),
        organizer,
      } satisfies ArtEvent;
    })
    .filter((event): event is ArtEvent => Boolean(event));
};

const uniqueSorted = (values: string[]) =>
  Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));

const matchesSelection = (value: string, selections: string[]) =>
  selections.length === 0 || (value ? selections.includes(value) : false);

const detectPlannerPlatform = (userAgent: string): PlannerPlatform => {
  if (/android/i.test(userAgent)) return 'android';
  if (/(iphone|ipad|ipod)/i.test(userAgent)) return 'ios';
  return 'web';
};

const formatDateRange = (start: Date, end: Date) => {
  if (start.getTime() === end.getTime()) {
    return longDate.format(start);
  }
  const sameMonth = start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth();
  if (sameMonth) {
    return `${shortDate.format(start)} – ${longDate.format(end)}`;
  }
  return `${longDate.format(start)} – ${longDate.format(end)}`;
};

const clampDate = (date: Date, min: Date, max: Date) => {
  if (date.getTime() < min.getTime()) return min;
  if (date.getTime() > max.getTime()) return max;
  return date;
};

const InsightCard: React.FC<{ label: string; value: string; helper: string; icon: React.ReactNode }> = ({
  label,
  value,
  helper,
  icon,
}) => (
  <div className="border-2 border-black bg-art-paper p-6 flex flex-col gap-3">
    <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-gray-500">
      {icon}
      <span>{label}</span>
    </div>
    <p className="text-4xl font-mono leading-none">{value}</p>
    <p className="text-sm text-gray-700">{helper}</p>
  </div>
);

const FilterSelect: React.FC<{
  label: string;
  value: string[];
  options: string[];
  placeholder: string;
  onChange: (next: string[]) => void;
}> = ({ label, value, options, placeholder, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (!option) return;
    const next = value.includes(option)
      ? value.filter((current) => current !== option)
      : [...value, option];
    const ordered = options.filter((opt) => next.includes(opt));
    onChange(ordered);
  };

  return (
    <label className="flex flex-col gap-2 text-xs font-mono uppercase tracking-widest">
      <span className="text-gray-500">{label}</span>
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative w-full border-2 border-black bg-white pl-4 pr-12 py-3 text-left text-sm font-mono hover:bg-art-paper focus:outline-none focus:border-art-blue"
        >
          <span className={value.length === 0 ? 'text-gray-400' : ''}>
            {value.length ? value.join(', ') : placeholder}
          </span>
          <ChevronDown
            className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        {isOpen && (
          <div className="absolute left-0 right-0 z-30 mt-2 max-h-64 overflow-auto border-2 border-black bg-white shadow-xl">
            {options.length ? (
              options.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-3 px-4 py-2 text-sm font-mono uppercase hover:bg-art-paper cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="accent-black"
                    checked={value.includes(option)}
                    onChange={() => toggleOption(option)}
                  />
                  <span>{option}</span>
                </label>
              ))
            ) : (
              <p className="px-4 py-3 text-xs text-gray-500">No options available.</p>
            )}
          </div>
        )}
      </div>
    </label>
  );
};

const EventCard: React.FC<{ event: ArtEvent; plannerLink: { href: string; label: string } }> = ({ event, plannerLink }) => {
  const typeClass = TYPE_COLOR_CLASSES[event.type] ?? TYPE_COLOR_CLASSES.Default;
  const accentBgClass = getTypeBgClass(event.type);
  return (
    <article className="relative border-2 border-black bg-white p-5 pl-8 flex flex-col gap-4">
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 top-0 bottom-0 w-2 ${accentBgClass}`}
      />
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono uppercase text-gray-500">
        <span>{event.region || 'Global'}</span>
        <span>{formatDateRange(event.startDate, event.endDate)}</span>
      </div>
      <div>
        <h3 className="text-2xl font-mono leading-tight">{event.name}</h3>
        <p className="text-sm text-gray-600 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {event.city ? `${event.city}, ${event.country}` : event.country}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 text-xs font-mono uppercase">
        <span className={`px-3 py-1 border ${typeClass}`}>{event.type}</span>
        {event.discipline && (
          <span className="px-3 py-1 border border-dashed border-gray-400 text-gray-600">{event.discipline}</span>
        )}
      </div>
      <div className="flex flex-wrap gap-3 text-xs font-mono uppercase">
        {event.website && (
          <a
            href={event.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-black px-3 py-1 hover:bg-art-yellow hover:text-black transition-colors"
          >
            <ExternalLink className="w-3 h-3" /> Website
          </a>
        )}
        {event.instagram && (
          <a
            href={event.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-black px-3 py-1 hover:bg-art-blue hover:text-white transition-colors"
          >
            <ExternalLink className="w-3 h-3" /> Instagram
          </a>
        )}
        <a
          href={plannerLink.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-black px-3 py-1 bg-art-black text-white hover:bg-art-red transition-colors"
          aria-label={`Add ${event.name} to your planner via ${plannerLink.label}`}
        >
          <CalendarPlus className="w-3 h-3" /> Add to your planner
        </a>
      </div>
    </article>
  );
};

const ArtEventsCalendar: React.FC = () => {
  const today = useMemo(() => new Date(), []);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<ArtEvent[]>([]);
  const [filters, setFilters] = useState<Filters>({ region: [], country: [], city: [], type: [] });
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(getDateKey(today));
  const calendarSectionRef = useRef<HTMLElement | null>(null);
  const [plannerLink, setPlannerLink] = useState(PLANNER_LINKS.ios);
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  const pageTitle = 'Global Art Events Calendar | Art Flaneur';
  const pageDescription =
    'Live world art events calendar with normalized metadata, multi-select filters, and AI-ready context for copilots, trip planners, and cultural researchers.';

  const seoJsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Global Art Events Calendar',
      description: pageDescription,
      url: 'https://www.artflaneur.art/calendar',
      isPartOf: {
        '@type': 'WebSite',
        name: 'Art Flaneur',
        url: 'https://www.artflaneur.art/',
      },
      about: {
        '@type': 'DataFeed',
        name: 'Art Flaneur Global Art Events Feed',
        description:
          'Structured biennial, art fair, and festival metadata with normalized geography ready for AI assistants and cultural research models.',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://www.artflaneur.art/calendar?region={region}',
        'query-input': 'required name=region',
      },
    }),
    [pageDescription],
  );

  useSeo({
    title: pageTitle,
    description: pageDescription,
    canonicalUrl: 'https://www.artflaneur.art/calendar',
    jsonLd: seoJsonLd,
  });

  const getCountriesForRegions = useCallback(
    (regions: string[]) => {
      const scoped = regions.length
        ? events.filter((event) => event.region && regions.includes(event.region))
        : events;
      return uniqueSorted(scoped.map((event) => event.country));
    },
    [events],
  );

  const getCitiesForRegionsCountries = useCallback(
    (regions: string[], countries: string[]) => {
      let scoped = events;
      if (regions.length) {
        scoped = scoped.filter((event) => event.region && regions.includes(event.region));
      }
      if (countries.length) {
        scoped = scoped.filter((event) => event.country && countries.includes(event.country));
      }
      return uniqueSorted(scoped.map((event) => event.city));
    },
    [events],
  );

  const handleRegionChange = useCallback(
    (nextRegions: string[]) => {
      setFilters((prev) => {
        const availableCountries = getCountriesForRegions(nextRegions);
        const nextCountries = prev.country.filter((country) => availableCountries.includes(country));
        const availableCities = getCitiesForRegionsCountries(nextRegions, nextCountries);
        const nextCities = prev.city.filter((city) => availableCities.includes(city));
        return { ...prev, region: nextRegions, country: nextCountries, city: nextCities };
      });
    },
    [getCountriesForRegions, getCitiesForRegionsCountries],
  );

  const handleCountryChange = useCallback(
    (nextCountries: string[]) => {
      setFilters((prev) => {
        const availableCities = getCitiesForRegionsCountries(prev.region, nextCountries);
        const nextCities = prev.city.filter((city) => availableCities.includes(city));
        return { ...prev, country: nextCountries, city: nextCities };
      });
    },
    [getCitiesForRegionsCountries],
  );

  const handleCityChange = useCallback((nextCities: string[]) => {
    setFilters((prev) => ({ ...prev, city: nextCities }));
  }, []);

  const handleTypeChange = useCallback((nextTypes: string[]) => {
    setFilters((prev) => ({ ...prev, type: nextTypes }));
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadEvents = async () => {
      setStatus('loading');
      setError(null);
      try {
        const data = await client.fetch(ALL_ART_EVENTS_QUERY);
        if (!isMounted) return;
        
        const parsed = data.map((event: any) => ({
          id: event._id,
          name: event.name,
          type: event.type,
          city: event.city,
          country: event.country,
          region: event.region,
          discipline: event.discipline || '',
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate),
          website: event.website || '',
          instagram: event.instagram ? normaliseInstagram(event.instagram) : '',
          organizer: event.organizer || '',
        }));
        
        setEvents(parsed);
        setStatus('ready');
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load events.');
        setStatus('error');
      }
    };

    loadEvents();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    const platform = detectPlannerPlatform(navigator.userAgent || '');
    setPlannerLink(PLANNER_LINKS[platform]);
  }, []);

  const calendarYears = useMemo(() => {
    const years = new Set<number>();
    events.forEach((event) => {
      years.add(event.startDate.getFullYear());
      years.add(event.endDate.getFullYear());
    });
    if (!years.size) {
      const base = today.getFullYear();
      return [base - 1, base, base + 1, base + 2];
    }
    return Array.from(years).sort((a, b) => a - b);
  }, [events, today]);

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        if (!matchesSelection(event.region, filters.region)) return false;
        if (!matchesSelection(event.country, filters.country)) return false;
        if (!matchesSelection(event.city, filters.city)) return false;
        if (!matchesSelection(event.type, filters.type)) return false;
        return true;
      }),
    [events, filters],
  );

  const monthStart = useMemo(() => new Date(calendarYear, calendarMonth, 1), [calendarYear, calendarMonth]);
  const monthEnd = useMemo(() => new Date(calendarYear, calendarMonth + 1, 0), [calendarYear, calendarMonth]);

  const monthlyEvents = useMemo(() => {
    const monthEndInclusive = new Date(monthEnd);
    monthEndInclusive.setHours(23, 59, 59, 999);
    return filteredEvents.filter((event) => {
      return (
        event.startDate.getTime() <= monthEndInclusive.getTime() &&
        event.endDate.getTime() >= monthStart.getTime()
      );
    });
  }, [filteredEvents, monthStart, monthEnd]);


  const eventsByDay = useMemo(() => {
    const map: Record<string, ArtEvent[]> = {};
    monthlyEvents.forEach((event) => {
      const start = clampDate(event.startDate, monthStart, monthEnd);
      const end = clampDate(event.endDate, monthStart, monthEnd);
      for (
        let cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        cursor.getTime() <= end.getTime();
        cursor.setDate(cursor.getDate() + 1)
      ) {
        const key = getDateKey(cursor);
        if (!map[key]) {
          map[key] = [];
        }
        map[key].push(event);
      }
    });
    Object.values(map).forEach((list) =>
      list.sort((a, b) => a.startDate.getTime() - b.startDate.getTime()),
    );
    return map;
  }, [monthlyEvents, monthStart, monthEnd]);

  useEffect(() => {
    const prefix = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}`;
    if (!selectedDayKey || !selectedDayKey.startsWith(prefix)) {
      const firstActive = Object.keys(eventsByDay)
        .filter((key) => key.startsWith(prefix))
        .sort()[0];
      setSelectedDayKey(firstActive ?? null);
    }
  }, [calendarMonth, calendarYear, eventsByDay, selectedDayKey]);

  const calendarMatrix = useMemo(() => {
    const start = new Date(monthStart);
    const startOffset = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - startOffset);

    const end = new Date(monthEnd);
    const endOffset = (end.getDay() + 6) % 7;
    end.setDate(end.getDate() + (6 - endOffset));

    const days: CalendarDayMeta[] = [];
    for (
      let cursor = new Date(start);
      cursor.getTime() <= end.getTime();
      cursor.setDate(cursor.getDate() + 1)
    ) {
      const dayDate = new Date(cursor);
      days.push({
        date: dayDate,
        key: getDateKey(dayDate),
        isCurrentMonth: dayDate.getMonth() === monthStart.getMonth(),
        isToday: getDateKey(dayDate) === getDateKey(today),
      });
    }

    const matrix: CalendarDayMeta[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      matrix.push(days.slice(i, i + 7));
    }
    return matrix;
  }, [monthStart, monthEnd, today]);

  const buildYearOverview = (filteredEvents: ArtEvent[], year: number, today: Date) => {
    const todayKey = getDateKey(today);
    return MONTH_LABELS.map((label, index) => {
      const monthStartBoundary = new Date(year, index, 1);
      const monthEndBoundary = new Date(year, index + 1, 0);
      const monthEndInclusive = new Date(monthEndBoundary);
      monthEndInclusive.setHours(23, 59, 59, 999);

      const eventsForMonth = filteredEvents.filter(
        (event) =>
          event.startDate.getTime() <= monthEndInclusive.getTime() &&
          event.endDate.getTime() >= monthStartBoundary.getTime(),
      );

      const eventsByDay: Record<string, ArtEvent[]> = {};
      eventsForMonth.forEach((event) => {
        const clampedStart = clampDate(event.startDate, monthStartBoundary, monthEndBoundary);
        const clampedEnd = clampDate(event.endDate, monthStartBoundary, monthEndBoundary);
        for (
          let cursor = new Date(clampedStart.getFullYear(), clampedStart.getMonth(), clampedStart.getDate());
          cursor.getTime() <= clampedEnd.getTime();
          cursor.setDate(cursor.getDate() + 1)
        ) {
          const key = getDateKey(cursor);
          if (!eventsByDay[key]) {
            eventsByDay[key] = [];
          }
          eventsByDay[key].push(event);
        }
      });
      Object.values(eventsByDay).forEach((list) =>
        list.sort((a, b) => a.startDate.getTime() - b.startDate.getTime()),
      );

      return {
        monthIndex: index,
        label,
        total: eventsForMonth.length,
        days: buildMonthMatrix(year, index, todayKey),
        eventsByDay,
      };
    });
  };

  const buildMonthMatrix = (year: number, monthIndex: number, todayKey: string) => {
    const start = new Date(year, monthIndex, 1);
    const calendarStart = new Date(start);
    const startOffset = (calendarStart.getDay() + 6) % 7;
    calendarStart.setDate(calendarStart.getDate() - startOffset);

    const end = new Date(year, monthIndex + 1, 0);
    const calendarEnd = new Date(end);
    const endOffset = (calendarEnd.getDay() + 6) % 7;
    calendarEnd.setDate(calendarEnd.getDate() + (6 - endOffset));

    const days: CalendarDayMeta[] = [];
    for (
      let cursor = new Date(calendarStart);
      cursor.getTime() <= calendarEnd.getTime();
      cursor.setDate(cursor.getDate() + 1)
    ) {
      const dayDate = new Date(cursor);
      const key = getDateKey(dayDate);
      days.push({
        date: dayDate,
        key,
        isCurrentMonth: dayDate.getMonth() === monthIndex,
        isToday: key === todayKey,
      });
    }

    return days;
  };

  const activeDayCount = useMemo(() => Object.keys(eventsByDay).length, [eventsByDay]);
  const regionsThisMonth = useMemo(
    () => new Set(monthlyEvents.map((event) => event.region).filter(Boolean)).size,
    [monthlyEvents],
  );
  const peakDay = useMemo(() => {
    const entries = Object.entries(eventsByDay);
    if (!entries.length) return null;
    return entries.reduce(
      (acc, [key, list]) => (list.length > acc.count ? { key, count: list.length } : acc),
      { key: entries[0][0], count: entries[0][1].length },
    );
  }, [eventsByDay]);

  const regionOptions = useMemo(() => uniqueSorted(events.map((event) => event.region)), [events]);
  const typeOptions = useMemo(
    () => uniqueSorted(events.map((event) => event.type).filter((value) => value && value !== 'Event')),
    [events],
  );
  const countryOptions = useMemo(() => {
    const scoped = filters.region.length
      ? events.filter((event) => event.region && filters.region.includes(event.region))
      : events;
    return uniqueSorted(scoped.map((event) => event.country));
  }, [events, filters.region]);
  const cityOptions = useMemo(() => {
    let scoped = events;
    if (filters.region.length) {
      scoped = scoped.filter((event) => event.region && filters.region.includes(event.region));
    }
    if (filters.country.length) {
      scoped = scoped.filter((event) => event.country && filters.country.includes(event.country));
    }
    return uniqueSorted(scoped.map((event) => event.city));
  }, [events, filters.region, filters.country]);

  const yearOverview = useMemo(
    () => buildYearOverview(filteredEvents, calendarYear, today),
    [filteredEvents, calendarYear, today],
  );

  const changeMonth = (direction: -1 | 1) => {
    setCalendarMonth((prev) => {
      let nextMonth = prev + direction;
      let nextYear = calendarYear;
      if (nextMonth < 0) {
        nextMonth = 11;
        nextYear -= 1;
      }
      if (nextMonth > 11) {
        nextMonth = 0;
        nextYear += 1;
      }
      setCalendarYear(nextYear);
      return nextMonth;
    });
  };

  const resetFilters = () => setFilters({ region: [], country: [], city: [], type: [] });

  return (
    <div className="bg-art-paper text-art-black font-mono">
      <section className="border-b-2 border-black bg-white">
        <div className="container mx-auto px-4 md:px-8 py-16 flex flex-col gap-6">
          <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.3em] text-gray-500">
            <CalendarIcon className="w-5 h-5" />
            Global Art Events Calendar
          </div>
          <div className="flex flex-col gap-6 max-w-5xl">
            <h1 className="text-4xl md:text-6xl font-mono tracking-tight">
              Navigate every biennale, fair, and festival without losing the plot.
            </h1>
            <p className="text-base md:text-lg text-gray-600">
              Switch months, filter by region or format, and zero in on the busiest days to plan itineraries without touching spreadsheets. The feed refreshes as soon as biennales, fairs, or festivals publish a definitive date range.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-8 py-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <InsightCard
          label="Events this month"
          value={monthlyEvents.length ? monthlyEvents.length.toString() : '0'}
          helper="Confirmed listings overlapping the selected month."
          icon={<Layers className="w-4 h-4" />}
        />
        <InsightCard
          label="Active days"
          value={activeDayCount ? activeDayCount.toString() : '0'}
          helper="How many days feature at least one event."
          icon={<Sparkles className="w-4 h-4" />}
        />
        <InsightCard
          label="Regions represented"
          value={regionsThisMonth ? regionsThisMonth.toString() : '0'}
          helper="Broaden your reach by hopping continents."
          icon={<Globe2 className="w-4 h-4" />}
        />
        <InsightCard
          label="Peak day"
          value={peakDay ? longDate.format(dateFromKey(peakDay.key)) : 'TBA'}
          helper={peakDay ? `${peakDay.count} overlapping happenings.` : 'Select another month to see activity.'}
          icon={<CalendarIcon className="w-4 h-4" />}
        />
      </section>

      <section className="border-y-2 border-black bg-white">
        <div className="container mx-auto px-4 md:px-8 py-10 flex flex-col gap-8">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-gray-500">
              <Filter className="w-4 h-4" />
              Filters
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <div className="inline-flex border-2 border-black text-xs font-mono uppercase">
                {(['month', 'year'] as ViewMode[]).map((mode, index) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-3 tracking-widest transition-colors ${
                      viewMode === mode ? 'bg-black text-white' : 'bg-white text-black'
                    } ${index === 0 ? 'border-r-2 border-black' : ''}`}
                  >
                    {mode === 'month' ? 'Monthly' : 'Yearly'}
                  </button>
                ))}
              </div>
              <div className="flex border-2 border-black">
                <button
                  type="button"
                  className="px-4 py-3 border-r-2 border-black hover:bg-art-yellow"
                  onClick={() => changeMonth(-1)}
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="px-4 py-3 hover:bg-art-yellow"
                  onClick={() => changeMonth(1)}
                  aria-label="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="relative">
                <select
                  className="border-2 border-black pl-4 pr-12 py-3 text-sm font-mono appearance-none"
                  value={calendarMonth}
                  onChange={(event) => setCalendarMonth(Number(event.target.value))}
                >
                  {MONTH_LABELS.map((label, index) => (
                    <option value={index} key={label}>
                      {label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
              </div>
              <div className="relative">
                <select
                  className="border-2 border-black pl-4 pr-12 py-3 text-sm font-mono appearance-none"
                  value={calendarYear}
                  onChange={(event) => setCalendarYear(Number(event.target.value))}
                >
                  {calendarYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 border-2 border-black px-4 py-3 text-xs font-mono uppercase hover:bg-art-paper"
              >
                <RefreshCcw className="w-4 h-4" /> Reset filters
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <FilterSelect
              label="Region"
              value={filters.region}
              options={regionOptions}
              placeholder="All regions"
              onChange={handleRegionChange}
            />
            <FilterSelect
              label="Country"
              value={filters.country}
              options={countryOptions}
              placeholder="All countries"
              onChange={handleCountryChange}
            />
            <FilterSelect
              label="City"
              value={filters.city}
              options={cityOptions}
              placeholder="All cities"
              onChange={handleCityChange}
            />
            <FilterSelect
              label="Format"
              value={filters.type}
              options={typeOptions}
              placeholder="All formats"
              onChange={handleTypeChange}
            />
          </div>
        </div>
      </section>

      {viewMode === 'month' && (
        <section
          className="container mx-auto px-4 md:px-8 py-12"
          ref={(node) => {
            calendarSectionRef.current = node;
          }}
        >
          <div className="border-2 border-black bg-white">
            <div className="grid grid-cols-7 border-b border-black bg-art-paper text-xs font-mono uppercase tracking-widest">
              {WEEKDAY_LABELS.map((day) => (
                <div key={day} className="px-2 py-3 text-center border-r border-black last:border-r-0">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {calendarMatrix.map((week, weekIndex) => (
                <React.Fragment key={weekIndex}>
                  {week.map((day) => {
                    const dailyEvents = eventsByDay[day.key] ?? [];
                    const isSelected = selectedDayKey === day.key;
                    return (
                      <button
                        type="button"
                        key={day.key}
                        onClick={() => setSelectedDayKey(day.key)}
                        className={`h-40 border border-black p-3 flex flex-col text-left transition-colors ${
                          day.isCurrentMonth ? 'bg-white' : 'bg-art-paper text-gray-400'
                        } ${isSelected ? 'ring-2 ring-art-blue ring-offset-2 ring-offset-white' : ''}`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono uppercase">
                          <span>{day.date.getDate()}</span>
                          {day.isToday && <span className="text-art-blue">Today</span>}
                        </div>
                        <div className="mt-2 flex flex-col gap-2 overflow-hidden">
                          {dailyEvents.slice(0, 3).map((event) => {
                            const accentBorderClass = getTypeBorderClass(event.type);
                            return (
                              <span
                                key={event.id}
                                className={`text-[11px] font-mono uppercase truncate border-l-4 pl-2 ${accentBorderClass}`}
                              >
                                {event.name}
                              </span>
                            );
                          })}
                          {dailyEvents.length > 3 && (
                            <span className="text-[11px] text-gray-500 font-mono">+{dailyEvents.length - 3} more</span>
                          )}
                          {!dailyEvents.length && (
                            <span className="text-[11px] text-gray-400 font-mono">No events</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>
      )}

      {viewMode === 'year' && (
      <section className="border-t-2 border-black bg-white">
        <div className="container mx-auto px-4 md:px-8 py-12 flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.3em] text-gray-500">
              <Layers className="w-4 h-4" />
              Year overview
            </div>
            <p className="text-sm text-gray-600 max-w-3xl">
              Full {calendarYear} calendar grid. Tap any mini-month to jump back to the detailed monthly view.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {yearOverview.map((month) => (
              <button
                type="button"
                key={month.monthIndex}
                onClick={() => {
                  setCalendarMonth(month.monthIndex);
                  setViewMode('month');
                  calendarSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`border-2 border-black bg-art-paper text-left p-4 flex flex-col gap-3 hover:bg-white transition-colors ${
                  month.monthIndex === calendarMonth ? 'ring-2 ring-art-blue' : ''
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono uppercase text-gray-500">
                  <span>
                    {month.label} {calendarYear}
                  </span>
                  <span>{month.total} events</span>
                </div>
                <div className="grid grid-cols-7 text-[10px] font-mono uppercase tracking-widest text-gray-500">
                  {WEEKDAY_LABELS.map((day) => (
                    <span key={`${month.monthIndex}-${day}`} className="py-1 text-center">
                      {day}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-7 text-[11px]">
                  {month.days.map((day) => {
                    const dailyEvents = month.eventsByDay[day.key] ?? [];
                    return (
                      <div
                        key={day.key}
                        className={`min-h-[48px] border border-black px-1 py-1 flex flex-col items-center justify-start gap-1 ${
                          day.isCurrentMonth ? 'bg-white' : 'bg-art-paper text-gray-400'
                        }`}
                      >
                        <span className="font-mono text-xs">{day.date.getDate()}</span>
                        {dailyEvents.length > 0 ? (
                          <div className="flex items-center justify-center gap-1 flex-wrap">
                            {dailyEvents.slice(0, 4).map((event) => (
                              <span
                                key={`${event.id}-${day.key}`}
                                className={`w-2 h-2 rounded-full ${getTypeBgClass(event.type)}`}
                                aria-label={event.type}
                              />
                            ))}
                            {dailyEvents.length > 4 && (
                              <span className="text-[9px] text-gray-500">+{dailyEvents.length - 4}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[9px] text-gray-400">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
      )}

      {viewMode === 'month' && (
        <section className="border-t-2 border-black bg-white">
          <div className="container mx-auto px-4 md:px-8 py-12 flex flex-col gap-8">
            <div>
              <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.3em] text-gray-500 mb-2">
                <Layers className="w-4 h-4" /> Events for selected day
              </div>
              {selectedDayKey && (
                <h3 className="text-2xl font-black uppercase">
                  {longDate.format(dateFromKey(selectedDayKey))}
                </h3>
              )}
            </div>
            <div className="grid gap-6">
              {(() => {
                const eventsForSelectedDay = selectedDayKey ? (eventsByDay[selectedDayKey] ?? []) : [];
                
                if (eventsForSelectedDay.length === 0) {
                  return (
                    <p className="text-gray-500 text-sm">
                      No events scheduled for this day. Select another day or adjust your filters.
                    </p>
                  );
                }
                
                return eventsForSelectedDay
                  .slice()
                  .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
                  .map((event) => (
                    <EventCard key={event.id} event={event} plannerLink={plannerLink} />
                  ));
              })()}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ArtEventsCalendar;
