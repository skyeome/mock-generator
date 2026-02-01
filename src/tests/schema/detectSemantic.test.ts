import { describe, it, expect } from 'vitest';
import { detectSemantic, SEMANTIC_RULES } from '@/lib/schema/detectSemantic';
import { enrichSchemaWithSemantics } from '@/lib/schema/enrichSchema';
import type { JsonSchema } from '@/lib/types';

describe('detectSemantic', () => {
  describe('name fields', () => {
    it('should detect firstName from various patterns', () => {
      expect(detectSemantic('firstName')).toBe('firstName');
      expect(detectSemantic('first_name')).toBe('firstName');
      expect(detectSemantic('fname')).toBe('firstName');
      expect(detectSemantic('givenName')).toBe('firstName');
      expect(detectSemantic('given_name')).toBe('firstName');
    });

    it('should detect lastName from various patterns', () => {
      expect(detectSemantic('lastName')).toBe('lastName');
      expect(detectSemantic('last_name')).toBe('lastName');
      expect(detectSemantic('lname')).toBe('lastName');
      expect(detectSemantic('surname')).toBe('lastName');
      expect(detectSemantic('familyName')).toBe('lastName');
    });

    it('should detect fullName from various patterns', () => {
      expect(detectSemantic('fullName')).toBe('fullName');
      expect(detectSemantic('full_name')).toBe('fullName');
      expect(detectSemantic('name')).toBe('fullName');
      expect(detectSemantic('displayName')).toBe('fullName');
    });

    it('should detect username', () => {
      expect(detectSemantic('username')).toBe('username');
      expect(detectSemantic('user_id')).toBe('username');
      expect(detectSemantic('login')).toBe('username');
      expect(detectSemantic('handle')).toBe('username');
    });
  });

  describe('contact fields', () => {
    it('should detect email', () => {
      expect(detectSemantic('email')).toBe('email');
      expect(detectSemantic('e_mail')).toBe('email');
      expect(detectSemantic('mail')).toBe('email');
      expect(detectSemantic('emailAddress')).toBe('email');
    });

    it('should detect email from format', () => {
      expect(detectSemantic('contact', 'email')).toBe('email');
    });

    it('should detect phone', () => {
      expect(detectSemantic('phone')).toBe('phone');
      expect(detectSemantic('phone_number')).toBe('phone');
      expect(detectSemantic('tel')).toBe('phone');
      expect(detectSemantic('telephone')).toBe('phone');
      expect(detectSemantic('mobile')).toBe('phone');
    });

    it('should detect url', () => {
      expect(detectSemantic('url')).toBe('url');
      expect(detectSemantic('website')).toBe('url');
      expect(detectSemantic('link')).toBe('url');
      expect(detectSemantic('href')).toBe('url');
    });

    it('should detect url from format', () => {
      expect(detectSemantic('homepage', 'uri')).toBe('url');
    });

    it('should detect avatar', () => {
      expect(detectSemantic('avatar')).toBe('avatar');
      expect(detectSemantic('profile_image')).toBe('avatar');
      expect(detectSemantic('profile_pic')).toBe('avatar');
    });
  });

  describe('address fields', () => {
    it('should detect streetAddress', () => {
      expect(detectSemantic('address')).toBe('streetAddress');
      expect(detectSemantic('street')).toBe('streetAddress');
      expect(detectSemantic('street_address')).toBe('streetAddress');
    });

    it('should detect city', () => {
      expect(detectSemantic('city')).toBe('city');
      expect(detectSemantic('town')).toBe('city');
    });

    it('should detect country', () => {
      expect(detectSemantic('country')).toBe('country');
      expect(detectSemantic('nation')).toBe('country');
    });

    it('should detect zipCode', () => {
      expect(detectSemantic('zip')).toBe('zipCode');
      expect(detectSemantic('zipCode')).toBe('zipCode');
      expect(detectSemantic('zip_code')).toBe('zipCode');
      expect(detectSemantic('postal_code')).toBe('zipCode');
      expect(detectSemantic('postcode')).toBe('zipCode');
    });

    it('should detect latitude and longitude', () => {
      expect(detectSemantic('lat')).toBe('latitude');
      expect(detectSemantic('latitude')).toBe('latitude');
      expect(detectSemantic('lng')).toBe('longitude');
      expect(detectSemantic('lon')).toBe('longitude');
      expect(detectSemantic('longitude')).toBe('longitude');
    });
  });

  describe('ID fields', () => {
    it('should detect uuid', () => {
      expect(detectSemantic('uuid')).toBe('uuid');
      expect(detectSemantic('guid')).toBe('uuid');
    });

    it('should detect uuid from format', () => {
      expect(detectSemantic('identifier', 'uuid')).toBe('uuid');
    });

    it('should detect id', () => {
      expect(detectSemantic('id')).toBe('id');
      expect(detectSemantic('_id')).toBe('id');
      expect(detectSemantic('pk')).toBe('id');
      expect(detectSemantic('key')).toBe('id');
    });

    it('should prioritize type over name pattern - userId with integer type should be id, not username', () => {
      // When type is integer/number, fields ending with "id" should be detected as id
      expect(detectSemantic('userId', undefined, 'integer')).toBe('id');
      expect(detectSemantic('user_id', undefined, 'integer')).toBe('id');
      expect(detectSemantic('customerId', undefined, 'integer')).toBe('id');
      expect(detectSemantic('orderId', undefined, 'number')).toBe('id');
      expect(detectSemantic('postId', undefined, 'integer')).toBe('id');
    });

    it('should detect userId as username when type is string', () => {
      // When type is string, userId should still be username (login id)
      expect(detectSemantic('user_id', undefined, 'string')).toBe('username');
      expect(detectSemantic('userId', undefined, 'string')).toBe('username');
    });

    it('should detect userId as username when no type provided (backwards compatible)', () => {
      // Without type info, fall back to name-based detection
      expect(detectSemantic('user_id')).toBe('username');
      expect(detectSemantic('userId')).toBe('username');
    });
  });

  describe('date fields', () => {
    it('should detect date', () => {
      expect(detectSemantic('date')).toBe('date');
      expect(detectSemantic('birthDate')).toBe('date');
      expect(detectSemantic('birth_date')).toBe('date');
    });

    it('should detect date from format', () => {
      expect(detectSemantic('someDate', 'date')).toBe('date');
    });

    it('should detect datetime', () => {
      expect(detectSemantic('datetime')).toBe('datetime');
      expect(detectSemantic('date_time')).toBe('datetime');
      expect(detectSemantic('timestamp')).toBe('datetime');
    });

    it('should detect datetime from format', () => {
      expect(detectSemantic('someTime', 'date-time')).toBe('datetime');
    });

    it('should detect pastDate patterns', () => {
      expect(detectSemantic('createdAt')).toBe('pastDate');
      expect(detectSemantic('created_at')).toBe('pastDate');
      expect(detectSemantic('updatedAt')).toBe('pastDate');
      expect(detectSemantic('modified_at')).toBe('pastDate');
      expect(detectSemantic('registeredOn')).toBe('pastDate');
    });

    it('should detect futureDate patterns', () => {
      expect(detectSemantic('expiresAt')).toBe('futureDate');
      expect(detectSemantic('expires_at')).toBe('futureDate');
      expect(detectSemantic('expiration')).toBe('futureDate');
      expect(detectSemantic('dueDate')).toBe('futureDate');
      expect(detectSemantic('deadline')).toBe('futureDate');
    });
  });

  describe('business fields', () => {
    it('should detect price', () => {
      expect(detectSemantic('price')).toBe('price');
      expect(detectSemantic('cost')).toBe('price');
      expect(detectSemantic('amount')).toBe('price');
      expect(detectSemantic('total')).toBe('price');
    });

    it('should detect currency', () => {
      expect(detectSemantic('currency')).toBe('currency');
      expect(detectSemantic('currency_code')).toBe('currency');
    });

    it('should detect company', () => {
      expect(detectSemantic('company')).toBe('company');
      expect(detectSemantic('organization')).toBe('company');
      expect(detectSemantic('employer')).toBe('company');
    });

    it('should detect jobTitle', () => {
      expect(detectSemantic('job')).toBe('jobTitle');
      expect(detectSemantic('title')).toBe('sentence'); // 'title' maps to sentence, not jobTitle
      expect(detectSemantic('position')).toBe('jobTitle');
      expect(detectSemantic('job_title')).toBe('jobTitle');
    });
  });

  describe('content fields', () => {
    it('should detect sentence', () => {
      expect(detectSemantic('title')).toBe('sentence');
      expect(detectSemantic('headline')).toBe('sentence');
      expect(detectSemantic('subject')).toBe('sentence');
    });

    it('should detect paragraph', () => {
      expect(detectSemantic('description')).toBe('paragraph');
      expect(detectSemantic('bio')).toBe('paragraph');
      expect(detectSemantic('about')).toBe('paragraph');
      expect(detectSemantic('content')).toBe('paragraph');
      expect(detectSemantic('body')).toBe('paragraph');
      expect(detectSemantic('text')).toBe('paragraph');
      expect(detectSemantic('message')).toBe('paragraph');
    });

    it('should detect word', () => {
      expect(detectSemantic('word')).toBe('word');
      expect(detectSemantic('tag')).toBe('word');
      expect(detectSemantic('label')).toBe('word');
      expect(detectSemantic('category')).toBe('word');
      expect(detectSemantic('status')).toBe('word');
    });
  });

  describe('media fields', () => {
    it('should detect imageUrl', () => {
      expect(detectSemantic('image')).toBe('imageUrl');
      expect(detectSemantic('img')).toBe('imageUrl');
      expect(detectSemantic('picture')).toBe('imageUrl');
      expect(detectSemantic('thumbnail')).toBe('imageUrl');
      expect(detectSemantic('cover')).toBe('imageUrl');
      expect(detectSemantic('logo')).toBe('imageUrl');
    });
  });

  describe('case insensitivity', () => {
    it('should match regardless of case', () => {
      expect(detectSemantic('EMAIL')).toBe('email');
      expect(detectSemantic('FirstName')).toBe('firstName');
      expect(detectSemantic('PHONE_NUMBER')).toBe('phone');
    });
  });

  describe('unknown fields', () => {
    it('should return unknown for unrecognized fields', () => {
      expect(detectSemantic('randomField')).toBe('unknown');
      expect(detectSemantic('xyz')).toBe('unknown');
      expect(detectSemantic('foo_bar_baz')).toBe('unknown');
    });
  });
});

describe('enrichSchemaWithSemantics', () => {
  it('should add x-faker hint for email field', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
      },
    };
    const enriched = enrichSchemaWithSemantics(schema);
    expect(enriched.properties!.email['x-faker']).toBeDefined();
    expect(enriched.properties!.email['x-faker']!.method).toBe('internet.email');
  });

  it('should add x-faker hint for name fields', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
      },
    };
    const enriched = enrichSchemaWithSemantics(schema);
    expect(enriched.properties!.firstName['x-faker']!.method).toBe('person.firstName');
    expect(enriched.properties!.lastName['x-faker']!.method).toBe('person.lastName');
  });

  it('should handle nested objects', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            email: { type: 'string' },
          },
        },
      },
    };
    const enriched = enrichSchemaWithSemantics(schema);
    expect(enriched.properties!.user.properties!.email['x-faker']!.method).toBe('internet.email');
  });

  it('should handle arrays', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        emails: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    };
    const enriched = enrichSchemaWithSemantics(schema);
    expect(enriched.properties!.emails.type).toBe('array');
    expect(enriched.properties!.emails.items).toBeDefined();
  });

  it('should add args for id fields', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        id: { type: 'integer' },
      },
    };
    const enriched = enrichSchemaWithSemantics(schema);
    expect(enriched.properties!.id['x-faker']!.method).toBe('number.int');
    expect(enriched.properties!.id['x-faker']!.args).toBeDefined();
  });

  it('should preserve original schema properties', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        age: { type: 'integer', minimum: 0, maximum: 120 },
      },
      required: ['age'],
    };
    const enriched = enrichSchemaWithSemantics(schema);
    expect(enriched.required).toEqual(['age']);
    expect(enriched.properties!.age.minimum).toBe(0);
    expect(enriched.properties!.age.maximum).toBe(120);
  });
});

describe('SEMANTIC_RULES', () => {
  it('should have rules defined', () => {
    expect(SEMANTIC_RULES).toBeDefined();
    expect(SEMANTIC_RULES.length).toBeGreaterThan(0);
  });

  it('should cover all major semantic types', () => {
    const coveredTypes = new Set(SEMANTIC_RULES.map(r => r.semantic));
    expect(coveredTypes.has('email')).toBe(true);
    expect(coveredTypes.has('phone')).toBe(true);
    expect(coveredTypes.has('firstName')).toBe(true);
    expect(coveredTypes.has('lastName')).toBe(true);
    expect(coveredTypes.has('city')).toBe(true);
    expect(coveredTypes.has('country')).toBe(true);
    expect(coveredTypes.has('uuid')).toBe(true);
  });
});
