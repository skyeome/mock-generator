import type { SemanticType } from '../types';

interface SemanticRule {
  semantic: SemanticType;
  fieldPatterns: RegExp[];
  valuePatterns?: RegExp[];
  format?: string;
}

export const SEMANTIC_RULES: SemanticRule[] = [
  // Name fields - more specific patterns first
  {
    semantic: 'firstName',
    fieldPatterns: [/^(first_?name|fname|given_?name)$/i]
  },
  {
    semantic: 'lastName',
    fieldPatterns: [/^(last_?name|lname|surname|family_?name)$/i]
  },
  // username must come before fullName to avoid conflict
  {
    semantic: 'username',
    fieldPatterns: [/^(username|user_?id|login|handle|screen_?name)$/i]
  },
  {
    semantic: 'fullName',
    fieldPatterns: [/^(full_?name|name|display_?name)$/i]
  },

  // Contact fields
  {
    semantic: 'email',
    fieldPatterns: [/^(email|e_?mail|mail|email_?address)$/i],
    format: 'email'
  },
  {
    semantic: 'phone',
    fieldPatterns: [/^(phone|phone_?number|tel|telephone|mobile|cell)$/i]
  },
  {
    semantic: 'url',
    fieldPatterns: [/^(url|website|link|href|homepage|web)$/i],
    format: 'uri'
  },
  {
    semantic: 'avatar',
    fieldPatterns: [/^(avatar|profile_?image|profile_?pic|user_?image|photo)$/i]
  },

  // Address fields
  {
    semantic: 'streetAddress',
    fieldPatterns: [/^(address|street|street_?address|line1|address_?line)$/i]
  },
  {
    semantic: 'city',
    fieldPatterns: [/^(city|town|municipality)$/i]
  },
  {
    semantic: 'country',
    fieldPatterns: [/^(country|nation|country_?code)$/i]
  },
  {
    semantic: 'zipCode',
    fieldPatterns: [/^(zip|zip_?code|postal_?code|postcode)$/i]
  },
  {
    semantic: 'latitude',
    fieldPatterns: [/^(lat|latitude)$/i]
  },
  {
    semantic: 'longitude',
    fieldPatterns: [/^(lng|lon|longitude)$/i]
  },

  // ID fields
  {
    semantic: 'uuid',
    fieldPatterns: [/^(uuid|guid)$/i],
    format: 'uuid'
  },
  {
    semantic: 'id',
    fieldPatterns: [/^(id|_id|pk|key|identifier)$/i]
  },

  // Date fields
  {
    semantic: 'date',
    fieldPatterns: [/^(date|birth_?date|dob)$/i],
    format: 'date'
  },
  {
    semantic: 'datetime',
    fieldPatterns: [/^(datetime|date_?time|timestamp)$/i],
    format: 'date-time'
  },
  {
    semantic: 'pastDate',
    fieldPatterns: [/(created|updated|modified|registered|joined)_?(at|on|date|time)?$/i]
  },
  {
    semantic: 'futureDate',
    fieldPatterns: [/(expires?|expir(ation|y)|due|deadline|scheduled)_?(at|on|date|time)?$/i]
  },

  // Business fields
  {
    semantic: 'price',
    fieldPatterns: [/^(price|cost|amount|total|subtotal|fee|rate)$/i]
  },
  {
    semantic: 'currency',
    fieldPatterns: [/^(currency|currency_?code)$/i]
  },
  {
    semantic: 'creditCard',
    fieldPatterns: [/^(card|credit_?card|card_?number|cc)$/i]
  },
  {
    semantic: 'company',
    fieldPatterns: [/^(company|organization|org|employer|business)$/i]
  },
  {
    semantic: 'jobTitle',
    fieldPatterns: [/^(job|position|role|job_?title|occupation)$/i]
  },

  // Content fields - 'title' goes here, not in jobTitle
  {
    semantic: 'sentence',
    fieldPatterns: [/^(title|headline|subject|summary|tagline)$/i]
  },
  {
    semantic: 'paragraph',
    fieldPatterns: [/^(description|bio|about|content|body|text|message|comment|note)$/i]
  },
  {
    semantic: 'word',
    fieldPatterns: [/^(word|tag|label|category|status|type)$/i]
  },

  // Media fields
  {
    semantic: 'imageUrl',
    fieldPatterns: [/^(image|img|picture|thumbnail|cover|banner|logo)$/i]
  },
];

// Semantic types that are only valid for string types (not numeric)
const STRING_ONLY_SEMANTICS: SemanticType[] = [
  'username', 'email', 'phone', 'url', 'avatar',
  'streetAddress', 'city', 'country', 'zipCode',
  'firstName', 'lastName', 'fullName',
  'company', 'jobTitle', 'sentence', 'paragraph', 'word',
  'imageUrl', 'creditCard', 'currency'
];

// Pattern to detect fields that end with "Id" or "_id" (common ID naming patterns)
const ID_SUFFIX_PATTERN = /(?:_?id|Id)$/;

/**
 * Detect semantic type from field name, format, and optionally schema type.
 * When schemaType is provided, type takes priority over name patterns.
 *
 * Example: "userId" with integer type → "id" (not "username")
 */
export function detectSemantic(
  fieldName: string,
  format?: string,
  schemaType?: string
): SemanticType {
  // First check format-based detection (highest priority)
  if (format) {
    const formatMatch = SEMANTIC_RULES.find(r => r.format === format);
    if (formatMatch) return formatMatch.semantic;
  }

  // Type-priority logic: numeric types with ID suffix should be "id"
  if (schemaType === 'integer' || schemaType === 'number') {
    // Fields ending with "id" or "Id" should be treated as numeric IDs
    if (ID_SUFFIX_PATTERN.test(fieldName)) {
      return 'id';
    }
  }

  // Then check field name patterns
  for (const rule of SEMANTIC_RULES) {
    // Skip string-only semantics for numeric types
    if ((schemaType === 'integer' || schemaType === 'number') &&
        STRING_ONLY_SEMANTICS.includes(rule.semantic)) {
      continue;
    }

    for (const pattern of rule.fieldPatterns) {
      if (pattern.test(fieldName)) {
        return rule.semantic;
      }
    }
  }

  return 'unknown';
}
