/**
 * Country definitions with display names and database aliases.
 * Contains ONLY countries that exist in our gallery database.
 * Aliases derived from actual database values in export-galleries CSV.
 */

export interface Country {
  /** Display name shown in UI */
  name: string;
  /** ISO 3166-1 alpha-2 code */
  code: string;
  /** All possible variations found in database */
  aliases: string[];
}

/**
 * Complete list of countries with their database aliases.
 * Only includes countries that have galleries in our database.
 * Aliases are case-insensitive and trimmed during matching.
 */
export const COUNTRIES: Country[] = [
  // A
  { name: 'Afghanistan', code: 'AF', aliases: ['Afghanistan'] },
  { name: 'Albania', code: 'AL', aliases: ['Albania'] },
  { name: 'Algeria', code: 'DZ', aliases: ['Algeria'] },
  { name: 'Andorra', code: 'AD', aliases: ['Andorra'] },
  { name: 'Antigua and Barbuda', code: 'AG', aliases: ['Antigua & Barbuda', 'Antigua and Barbuda'] },
  { name: 'Argentina', code: 'AR', aliases: ['Argentina'] },
  { name: 'Armenia', code: 'AM', aliases: ['Armenia'] },
  { name: 'Australia', code: 'AU', aliases: ['Australia'] },
  { name: 'Austria', code: 'AT', aliases: ['Austria'] },
  { name: 'Azerbaijan', code: 'AZ', aliases: ['Azerbaijan'] },
  { name: 'Åland Islands', code: 'AX', aliases: ['Åland Islands', 'Aland Islands'] },

  // B
  { name: 'Bahamas', code: 'BS', aliases: ['Bahamas'] },
  { name: 'Bahrain', code: 'BH', aliases: ['Bahrain'] },
  { name: 'Bangladesh', code: 'BD', aliases: ['Bangladesh'] },
  { name: 'Barbados', code: 'BB', aliases: ['Barbados'] },
  { name: 'Belgium', code: 'BE', aliases: ['Belgium'] },
  { name: 'Benin', code: 'BJ', aliases: ['Benin'] },
  { name: 'Bermuda', code: 'BM', aliases: ['Bermuda'] },
  { name: 'Bolivia', code: 'BO', aliases: ['Bolivia', 'Bolivia, Plurinational State of'] },
  { name: 'Bosnia and Herzegovina', code: 'BA', aliases: ['Bosnia & Herzegovina', 'Bosnia and Herzegovina'] },
  { name: 'Brazil', code: 'BR', aliases: ['Brazil'] },
  { name: 'Bulgaria', code: 'BG', aliases: ['Bulgaria'] },

  // C
  { name: 'Cambodia', code: 'KH', aliases: ['Cambodia'] },
  { name: 'Cameroon', code: 'CM', aliases: ['Cameroon'] },
  { name: 'Canada', code: 'CA', aliases: ['Canada'] },
  { name: 'Chile', code: 'CL', aliases: ['Chile'] },
  { name: 'China', code: 'CN', aliases: ['China'] },
  { name: 'Colombia', code: 'CO', aliases: ['Colombia'] },
  { name: 'Cook Islands', code: 'CK', aliases: ['Cook Islands'] },
  { name: 'Costa Rica', code: 'CR', aliases: ['Costa Rica'] },
  { name: "Côte d'Ivoire", code: 'CI', aliases: ["Côte d'Ivoire", "Côte d'Ivoire", "Cote d'Ivoire"] },
  { name: 'Croatia', code: 'HR', aliases: ['Croatia'] },
  { name: 'Cuba', code: 'CU', aliases: ['Cuba'] },
  { name: 'Cyprus', code: 'CY', aliases: ['Cyprus'] },
  { name: 'Czechia', code: 'CZ', aliases: ['Czechia', 'Czech Republic'] },

  // D
  { name: 'Denmark', code: 'DK', aliases: ['Denmark'] },
  { name: 'Dominican Republic', code: 'DO', aliases: ['Dominican Republic'] },

  // E
  { name: 'Ecuador', code: 'EC', aliases: ['Ecuador'] },
  { name: 'Egypt', code: 'EG', aliases: ['Egypt'] },
  { name: 'El Salvador', code: 'SV', aliases: ['El Salvador'] },
  { name: 'Eswatini', code: 'SZ', aliases: ['Eswatini', 'Swaziland'] },
  { name: 'Estonia', code: 'EE', aliases: ['Estonia'] },
  { name: 'Ethiopia', code: 'ET', aliases: ['Ethiopia'] },

  // F
  { name: 'Faroe Islands', code: 'FO', aliases: ['Faroe Islands'] },
  { name: 'Finland', code: 'FI', aliases: ['Finland'] },
  { name: 'France', code: 'FR', aliases: ['France'] },

  // G
  { name: 'Georgia', code: 'GE', aliases: ['Georgia'] },
  { name: 'Germany', code: 'DE', aliases: ['Germany'] },
  { name: 'Ghana', code: 'GH', aliases: ['Ghana'] },
  { name: 'Greece', code: 'GR', aliases: ['Greece'] },
  { name: 'Greenland', code: 'GL', aliases: ['Greenland'] },
  { name: 'Guadeloupe', code: 'GP', aliases: ['Guadeloupe'] },
  { name: 'Guatemala', code: 'GT', aliases: ['Guatemala'] },
  { name: 'Guernsey', code: 'GG', aliases: ['Guernsey'] },

  // H
  { name: 'Haiti', code: 'HT', aliases: ['Haiti'] },
  { name: 'Honduras', code: 'HN', aliases: ['Honduras'] },
  { name: 'Hong Kong', code: 'HK', aliases: ['Hong Kong'] },
  { name: 'Hungary', code: 'HU', aliases: ['Hungary'] },

  // I
  { name: 'Iceland', code: 'IS', aliases: ['Iceland'] },
  { name: 'India', code: 'IN', aliases: ['India'] },
  { name: 'Indonesia', code: 'ID', aliases: ['Indonesia'] },
  { name: 'Iran', code: 'IR', aliases: ['Iran', 'Iran, Islamic Republic of'] },
  { name: 'Ireland', code: 'IE', aliases: ['Ireland'] },
  { name: 'Italy', code: 'IT', aliases: ['Italy'] },

  // J
  { name: 'Japan', code: 'JP', aliases: ['Japan'] },
  { name: 'Jersey', code: 'JE', aliases: ['Jersey'] },
  { name: 'Jordan', code: 'JO', aliases: ['Jordan'] },

  // K
  { name: 'Kazakhstan', code: 'KZ', aliases: ['Kazakhstan'] },
  { name: 'Kenya', code: 'KE', aliases: ['Kenya'] },
  { name: 'Kosovo', code: 'XK', aliases: ['Kosovo'] },
  { name: 'Kyrgyzstan', code: 'KG', aliases: ['Kyrgyzstan'] },

  // L
  { name: 'Latvia', code: 'LV', aliases: ['Latvia'] },
  { name: 'Lebanon', code: 'LB', aliases: ['Lebanon'] },
  { name: 'Liechtenstein', code: 'LI', aliases: ['Liechtenstein'] },
  { name: 'Lithuania', code: 'LT', aliases: ['Lithuania'] },
  { name: 'Luxembourg', code: 'LU', aliases: ['Luxembourg'] },

  // M
  { name: 'Macau', code: 'MO', aliases: ['Macao', 'Macau'] },
  { name: 'Madagascar', code: 'MG', aliases: ['Madagascar'] },
  { name: 'Malaysia', code: 'MY', aliases: ['Malaysia'] },
  { name: 'Maldives', code: 'MV', aliases: ['Maldives'] },
  { name: 'Mali', code: 'ML', aliases: ['Mali'] },
  { name: 'Malta', code: 'MT', aliases: ['Malta'] },
  { name: 'Mexico', code: 'MX', aliases: ['Mexico'] },
  { name: 'Monaco', code: 'MC', aliases: ['Monaco'] },
  { name: 'Mongolia', code: 'MN', aliases: ['Mongolia'] },
  { name: 'Montenegro', code: 'ME', aliases: ['Montenegro'] },
  { name: 'Morocco', code: 'MA', aliases: ['Morocco'] },
  { name: 'Mozambique', code: 'MZ', aliases: ['Mozambique'] },
  { name: 'Myanmar', code: 'MM', aliases: ['Myanmar'] },

  // N
  { name: 'Namibia', code: 'NA', aliases: ['Namibia'] },
  { name: 'Nepal', code: 'NP', aliases: ['Nepal'] },
  { name: 'Netherlands', code: 'NL', aliases: ['Netherlands'] },
  { name: 'New Zealand', code: 'NZ', aliases: ['New Zealand', ', New Zealand'] },
  { name: 'Nigeria', code: 'NG', aliases: ['Nigeria'] },
  { name: 'North Korea', code: 'KP', aliases: ['North Korea'] },
  { name: 'North Macedonia', code: 'MK', aliases: ['North Macedonia'] },
  { name: 'Norway', code: 'NO', aliases: ['Norway'] },

  // O
  { name: 'Oman', code: 'OM', aliases: ['Oman'] },

  // P
  { name: 'Pakistan', code: 'PK', aliases: ['Pakistan'] },
  { name: 'Palestine', code: 'PS', aliases: ['Palestine', 'Palestinian territories'] },
  { name: 'Panama', code: 'PA', aliases: ['Panama'] },
  { name: 'Papua New Guinea', code: 'PG', aliases: ['Papua New Guinea'] },
  { name: 'Peru', code: 'PE', aliases: ['Peru'] },
  { name: 'Philippines', code: 'PH', aliases: ['Philippines'] },
  { name: 'Poland', code: 'PL', aliases: ['Poland'] },
  { name: 'Portugal', code: 'PT', aliases: ['Portugal'] },
  { name: 'Puerto Rico', code: 'PR', aliases: ['Puerto Rico'] },

  // Q
  { name: 'Qatar', code: 'QA', aliases: ['Qatar'] },

  // R
  { name: 'Réunion', code: 'RE', aliases: ['Réunion', 'Reunion'] },
  { name: 'Romania', code: 'RO', aliases: ['Romania'] },
  { name: 'Russia', code: 'RU', aliases: ['Russia'] },

  // S
  { name: 'San Marino', code: 'SM', aliases: ['San Marino'] },
  { name: 'Saudi Arabia', code: 'SA', aliases: ['Saudi Arabia'] },
  { name: 'Senegal', code: 'SN', aliases: ['Senegal'] },
  { name: 'Serbia', code: 'RS', aliases: ['Serbia'] },
  { name: 'Singapore', code: 'SG', aliases: ['Singapore'] },
  { name: 'Slovakia', code: 'SK', aliases: ['Slovakia'] },
  { name: 'Slovenia', code: 'SI', aliases: ['Slovenia'] },
  { name: 'South Africa', code: 'ZA', aliases: ['South Africa'] },
  { name: 'South Korea', code: 'KR', aliases: ['South Korea', 'Korea', 'Korea, Republic of'] },
  { name: 'Spain', code: 'ES', aliases: ['Spain'] },
  { name: 'Sri Lanka', code: 'LK', aliases: ['Sri Lanka'] },
  { name: 'Suriname', code: 'SR', aliases: ['Suriname'] },
  { name: 'Sweden', code: 'SE', aliases: ['Sweden'] },
  { name: 'Switzerland', code: 'CH', aliases: ['Switzerland'] },

  // T
  { name: 'Taiwan', code: 'TW', aliases: ['Taiwan', 'Taiwan, Province of China'] },
  { name: 'Thailand', code: 'TH', aliases: ['Thailand'] },
  { name: 'Trinidad and Tobago', code: 'TT', aliases: ['Trinidad and Tobago'] },
  { name: 'Tunisia', code: 'TN', aliases: ['Tunisia', 'Tunis'] },
  { name: 'Turkey', code: 'TR', aliases: ['Turkey', 'Türkiye'] },

  // U
  { name: 'UAE', code: 'AE', aliases: ['UAE', 'United Arab Emirates'] },
  { name: 'Uganda', code: 'UG', aliases: ['Uganda'] },
  { name: 'Ukraine', code: 'UA', aliases: ['Ukraine'] },
  { name: 'United Kingdom', code: 'GB', aliases: ['United Kingdom', 'UK'] },
  { name: 'United States', code: 'US', aliases: ['United States', 'USA', 'United State', ', United States'] },
  { name: 'Uruguay', code: 'UY', aliases: ['Uruguay'] },
  { name: 'Uzbekistan', code: 'UZ', aliases: ['Uzbekistan'] },

  // V
  { name: 'Vatican City', code: 'VA', aliases: ['Vatican City'] },
  { name: 'Venezuela', code: 'VE', aliases: ['Venezuela'] },
  { name: 'Vietnam', code: 'VN', aliases: ['Vietnam'] },
  { name: 'Virgin Islands (US)', code: 'VI', aliases: ['Virgin Islands'] },

  // Y
  { name: 'Yemen', code: 'YE', aliases: ['Yemen'] },

  // Z
  { name: 'Zambia', code: 'ZM', aliases: ['Zambia'] },
  { name: 'Zimbabwe', code: 'ZW', aliases: ['Zimbabwe'] },
];

/**
 * Map of lowercase alias -> Country for quick lookup.
 */
const ALIAS_MAP = new Map<string, Country>();

// Build the lookup map
for (const country of COUNTRIES) {
  for (const alias of country.aliases) {
    ALIAS_MAP.set(alias.toLowerCase().trim(), country);
  }
}

/**
 * Normalize a database country value to a standard Country object.
 * Returns undefined if country is not recognized.
 */
export function normalizeCountry(dbValue: string | null | undefined): Country | undefined {
  if (!dbValue) return undefined;
  const normalized = dbValue.toLowerCase().trim();
  return ALIAS_MAP.get(normalized);
}

/**
 * Get the display name for a database country value.
 * Returns the original value if not recognized.
 */
export function getCountryDisplayName(dbValue: string | null | undefined): string {
  if (!dbValue) return 'Unknown';
  const country = normalizeCountry(dbValue);
  return country?.name ?? dbValue;
}

/**
 * Get all countries sorted by display name.
 */
export function getAllCountries(): Country[] {
  return [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Check if a database country value matches a selected country code.
 */
export function matchesCountry(dbValue: string | null | undefined, countryCode: string): boolean {
  if (!dbValue || !countryCode) return false;
  const country = normalizeCountry(dbValue);
  return country?.code === countryCode;
}

/**
 * Get all database aliases for a country code (for GraphQL filter).
 */
export function getCountryAliases(countryCode: string): string[] {
  const country = COUNTRIES.find(c => c.code === countryCode);
  return country?.aliases ?? [];
}
