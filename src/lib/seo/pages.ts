import type { LandingPage } from './types';

export const LANDING_PAGES: LandingPage[] = [
  // ============================================
  // Category 1: Tools (4 pages)
  // ============================================
  {
    slug: 'json-to-csv',
    path: '/tools/json-to-csv',
    category: 'tools',
    title: 'JSON to CSV Converter with Mock Data Generation',
    description:
      'Convert JSON schemas to CSV format with realistic mock data. Generate test data for spreadsheets, data analysis, and database imports.',
    h1: 'JSON to CSV Mock Data Generator',
    keywords: ['json to csv', 'convert json csv', 'csv generator', 'mock csv data'],
    content: {
      intro:
        'Transform your JSON data structures into clean, organized CSV files with AI-powered mock data generation. Our free online tool analyzes your JSON schema, understands the semantic meaning of each field, and generates realistic test data that you can export directly to CSV format. Perfect for spreadsheet workflows, data analysis, database imports, and testing scenarios where you need structured tabular data.',
      features: [
        'Intelligent field detection - Automatically recognizes names, emails, addresses, dates, and 100+ data types',
        'Instant CSV export - One-click download of properly formatted CSV with headers',
        'Bulk generation - Generate hundreds or thousands of rows in seconds',
        'Privacy-first - All processing happens in your browser, your data never leaves your device',
      ],
      howTo: [
        'Paste your JSON sample or schema into the editor on the left panel',
        'Our AI analyzes the structure and detects semantic field types automatically',
        'Adjust the number of mock records you want to generate (1 to 1000+)',
        'Click "Export to CSV" to download your generated mock data as a CSV file',
      ],
      faq: [
        {
          q: 'Is there a limit on how many rows I can generate?',
          a: 'No hard limit! Generate as many rows as you need. The tool handles thousands of records efficiently since everything runs in your browser.',
        },
        {
          q: 'Will my data be uploaded to any server?',
          a: 'Never. Our tool runs 100% client-side. Your JSON schema and generated data never leave your browser, making it safe for sensitive data structures.',
        },
        {
          q: 'Can I customize the generated data?',
          a: 'Yes! You can set a seed for reproducible results, choose different locales for region-specific data, and the AI adapts to your field naming conventions.',
        },
      ],
    },
    relatedPages: ['/tools/json-to-sql', '/tools/json-to-typescript', '/tools/json-schema-generator'],
  },
  {
    slug: 'json-to-sql',
    path: '/tools/json-to-sql',
    category: 'tools',
    title: 'JSON to SQL Insert Statement Generator',
    description:
      'Generate SQL INSERT statements from JSON schemas with realistic mock data. Perfect for database seeding, testing, and development environments.',
    h1: 'JSON to SQL Mock Data Generator',
    keywords: ['json to sql', 'sql insert generator', 'mock sql data', 'database seed generator'],
    content: {
      intro:
        'Generate production-ready SQL INSERT statements from your JSON data structures. Our AI-powered tool converts JSON schemas into properly formatted SQL with realistic mock data, making database seeding and test environment setup effortless. Support for multiple SQL dialects ensures compatibility with MySQL, PostgreSQL, SQLite, and more.',
      features: [
        'Multi-dialect support - Generate SQL compatible with MySQL, PostgreSQL, SQLite, and SQL Server',
        'Smart type mapping - JSON types automatically mapped to appropriate SQL data types',
        'Batch inserts - Generate efficient multi-row INSERT statements for faster imports',
        'Escaped values - All strings properly escaped to prevent SQL injection in test data',
      ],
      howTo: [
        'Paste your JSON sample representing your table structure',
        'The tool infers column names and data types from your JSON fields',
        'Select your target SQL dialect and number of rows to generate',
        'Copy the generated SQL INSERT statements or download as a .sql file',
      ],
      faq: [
        {
          q: 'Which SQL databases are supported?',
          a: 'We generate standard SQL that works with MySQL, PostgreSQL, SQLite, SQL Server, and most relational databases. Syntax differences are handled automatically.',
        },
        {
          q: 'Can I generate data for multiple tables?',
          a: 'Currently, the tool generates data for one table at a time. For related tables, generate each separately and use the seed feature for reproducible foreign key relationships.',
        },
        {
          q: 'Are the INSERT statements safe to run?',
          a: 'Yes, all string values are properly escaped. However, always review generated SQL before running in production environments.',
        },
      ],
    },
    relatedPages: ['/tools/json-to-csv', '/use-cases/database-seeding', '/mock-data/ecommerce'],
  },
  {
    slug: 'json-to-typescript',
    path: '/tools/json-to-typescript',
    category: 'tools',
    title: 'JSON to TypeScript Interface Generator with Mock Data',
    description:
      'Generate TypeScript interfaces and type definitions from JSON samples, complete with realistic mock data for testing. Perfect for frontend development.',
    h1: 'JSON to TypeScript Types Generator',
    keywords: [
      'json to typescript',
      'typescript types generator',
      'json to interface',
      'typescript mock data',
    ],
    content: {
      intro:
        'Convert your API responses and JSON data into strongly-typed TypeScript interfaces automatically. Our tool analyzes your JSON structure, generates accurate TypeScript type definitions, and provides realistic mock data that matches those types. Essential for frontend developers who want type safety without manual type definition work.',
      features: [
        'Accurate type inference - Distinguishes between string, number, boolean, arrays, and nested objects',
        'Optional field detection - Identifies nullable and optional fields from your samples',
        'Interface generation - Clean, readable TypeScript interfaces following best practices',
        'Mock data export - Download both types and matching mock data for immediate use',
      ],
      howTo: [
        'Paste a JSON response from your API or a sample data object',
        'Review the automatically generated TypeScript interface',
        'Optionally customize interface and property names',
        'Export the TypeScript file with embedded mock data factory functions',
      ],
      faq: [
        {
          q: 'Does it handle nested objects and arrays?',
          a: 'Yes! The tool recursively processes nested structures and generates separate interfaces for complex nested types, with proper references between them.',
        },
        {
          q: 'Can I use this with React or Next.js?',
          a: 'Absolutely. The generated TypeScript interfaces work seamlessly with any TypeScript project including React, Next.js, Vue, Angular, and Node.js backends.',
        },
        {
          q: 'How do I handle optional fields?',
          a: 'If you provide multiple JSON samples, the tool can detect which fields appear conditionally and mark them as optional with the ? modifier.',
        },
      ],
    },
    relatedPages: [
      '/tools/json-schema-generator',
      '/use-cases/frontend-development',
      '/use-cases/unit-testing',
    ],
  },
  {
    slug: 'json-schema-generator',
    path: '/tools/json-schema-generator',
    category: 'tools',
    title: 'JSON Schema Generator from Sample Data',
    description:
      'Infer JSON Schema from sample data with AI-powered semantic field detection. Generate valid JSON Schema drafts for API documentation and validation.',
    h1: 'JSON Schema Generator',
    keywords: [
      'json schema generator',
      'infer schema from json',
      'json schema from sample',
      'schema inference',
    ],
    content: {
      intro:
        'Generate valid JSON Schema definitions from your sample data instantly. Our AI-powered inference engine analyzes your JSON structure, detects field semantics, and produces comprehensive JSON Schema (Draft 7) that you can use for API documentation, request validation, and data contracts. Go beyond basic type detection with semantic hints for realistic mock data generation.',
      features: [
        'Full JSON Schema Draft 7 support - Generate complete schemas with types, formats, and constraints',
        'Semantic enhancement - AI adds format hints for emails, dates, URLs, and more',
        'Validation-ready - Generated schemas work with any JSON Schema validator',
        'Mock data integration - Extended x-faker hints enable realistic data generation',
      ],
      howTo: [
        'Paste your JSON sample data into the input editor',
        'The tool analyzes structure and infers types for each field',
        'Review the generated JSON Schema with detected formats',
        'Export the schema for use in your API documentation or validation layer',
      ],
      faq: [
        {
          q: 'Which JSON Schema draft version is generated?',
          a: 'We generate JSON Schema Draft 7 by default, which has wide support across validators and tools. The schema can be easily adapted to other drafts if needed.',
        },
        {
          q: 'Can it detect string formats like email and date?',
          a: 'Yes! Our AI analyzes field names and sample values to detect common formats including email, uri, date-time, uuid, and more.',
        },
        {
          q: 'What are the x-faker extensions?',
          a: 'These are custom schema extensions that map fields to Faker.js methods, enabling automatic mock data generation that matches your schema semantically.',
        },
      ],
    },
    relatedPages: ['/tools/json-to-typescript', '/use-cases/api-testing', '/generators/fake-emails'],
  },

  // ============================================
  // Category 2: Use Cases (4 pages)
  // ============================================
  {
    slug: 'api-testing',
    path: '/use-cases/api-testing',
    category: 'use-cases',
    title: 'Mock Data for API Testing - Generate Realistic Test Payloads',
    description:
      'Generate realistic mock data for API testing. Create valid request payloads, simulate responses, and stress test your endpoints with bulk data generation.',
    h1: 'Mock Data for API Testing',
    keywords: ['api testing mock data', 'fake api response', 'test payload generator', 'api mock data'],
    content: {
      intro:
        'Supercharge your API testing workflow with realistic mock data that matches your actual data structures. Whether you are testing REST APIs, GraphQL endpoints, or webhooks, our tool generates valid payloads that exercise your API logic properly. Stop using "test123" and start using semantically correct data that catches real bugs.',
      features: [
        'Realistic payloads - Names that look like names, emails that follow patterns, dates in proper formats',
        'Bulk generation - Create hundreds of test cases for load testing and edge case coverage',
        'Format flexibility - Export as JSON for direct use in Postman, Insomnia, or your test scripts',
        'Reproducible tests - Use seeds to generate the same data across test runs',
      ],
      howTo: [
        'Paste your API request/response schema or a sample JSON payload',
        'Let the AI detect field semantics and assign appropriate generators',
        'Generate as many test records as your testing scenario requires',
        'Export to JSON and integrate with your API testing tool of choice',
      ],
      faq: [
        {
          q: 'Can I use this data in Postman?',
          a: 'Yes! Export the generated JSON and import it into Postman as environment variables or use it directly in request bodies. The data format is standard JSON.',
        },
        {
          q: 'How do I test edge cases?',
          a: 'Generate large datasets and the randomization naturally includes edge cases. You can also modify the schema to generate specific boundary values.',
        },
        {
          q: 'Does it work with GraphQL?',
          a: 'Absolutely. JSON is JSON - paste your GraphQL response shape and generate matching mock data for your resolvers or client tests.',
        },
      ],
    },
    relatedPages: ['/use-cases/unit-testing', '/tools/json-schema-generator', '/mock-data/users'],
  },
  {
    slug: 'frontend-development',
    path: '/use-cases/frontend-development',
    category: 'use-cases',
    title: 'Mock Data for Frontend Development - React, Vue, Angular',
    description:
      'Generate realistic mock data for frontend development. Build and test UI components with real-looking data before your backend is ready.',
    h1: 'Mock Data for Frontend Development',
    keywords: ['frontend mock data', 'react test data', 'vue mock data', 'ui development data'],
    content: {
      intro:
        'Build beautiful, functional UIs without waiting for backend APIs. Our mock data generator creates realistic datasets that you can use immediately in React, Vue, Angular, or any frontend framework. See how your components handle real-world data patterns including long names, special characters, and edge cases - all before connecting to your actual backend.',
      features: [
        'Framework agnostic - Generated JSON works with React, Vue, Angular, Svelte, and vanilla JavaScript',
        'TypeScript export - Get type definitions alongside your mock data for type-safe development',
        'Realistic edge cases - Long strings, Unicode characters, and empty states for robust components',
        'Instant iteration - Regenerate different data sets to test various UI states quickly',
      ],
      howTo: [
        'Define your data shape by pasting a sample object your component expects',
        'Generate a dataset of the size you need (10 items for a list, 100 for pagination testing)',
        'Export as JSON or TypeScript with types for immediate use',
        'Import into your component and start building with realistic data',
      ],
      faq: [
        {
          q: 'Can I generate data for lists and tables?',
          a: 'Yes! Generate arrays of objects with as many items as you need. Perfect for testing list rendering, pagination, and virtualized scrolling.',
        },
        {
          q: 'How do I handle images and avatars?',
          a: 'The generator can include placeholder image URLs. You can configure it to use services like Picsum or UI Avatars for realistic placeholder images.',
        },
        {
          q: 'What about state management mock data?',
          a: 'Generate data once, export it, and use it as initial state in Redux, Zustand, or any state manager. The JSON format is universally compatible.',
        },
      ],
    },
    relatedPages: ['/tools/json-to-typescript', '/use-cases/unit-testing', '/generators/fake-names'],
  },
  {
    slug: 'database-seeding',
    path: '/use-cases/database-seeding',
    category: 'use-cases',
    title: 'Database Seeding with Mock Data - Populate Test Databases',
    description:
      'Seed your development and test databases with realistic mock data. Generate SQL inserts or JSON for any database system.',
    h1: 'Database Seeding with Mock Data',
    keywords: [
      'database seed data',
      'populate test database',
      'mock database records',
      'test data seeding',
    ],
    content: {
      intro:
        'Set up development and test databases in minutes instead of hours. Our tool generates realistic seed data that mimics production patterns, helping you test queries, validate constraints, and develop features with confidence. Export directly to SQL INSERT statements or JSON for use with ORMs like Prisma, TypeORM, or Drizzle.',
      features: [
        'SQL export - Generate INSERT statements ready to run against your database',
        'ORM compatible - JSON output works with Prisma seed scripts, TypeORM, Sequelize, and more',
        'Bulk generation - Create thousands of records for performance testing and realistic datasets',
        'Consistent relationships - Use seeds to generate matching foreign key relationships across tables',
      ],
      howTo: [
        'Paste a JSON representation of your database record structure',
        'Configure the number of records to generate for seeding',
        'Choose your export format - SQL for direct database import or JSON for ORM scripts',
        'Run the generated statements or integrate into your seed scripts',
      ],
      faq: [
        {
          q: 'How do I handle foreign keys?',
          a: 'Generate parent table data first, note the IDs, then generate child table data referencing those IDs. Using consistent seeds helps maintain relationships.',
        },
        {
          q: 'Can I seed multiple tables at once?',
          a: 'Generate data for each table separately, then combine the SQL statements in the correct order respecting foreign key constraints.',
        },
        {
          q: 'Does it work with Prisma?',
          a: 'Yes! Export as JSON and use it in your prisma/seed.ts script with Prisma Client create operations. The data structure matches your schema.',
        },
      ],
    },
    relatedPages: ['/tools/json-to-sql', '/mock-data/ecommerce', '/mock-data/users'],
  },
  {
    slug: 'unit-testing',
    path: '/use-cases/unit-testing',
    category: 'use-cases',
    title: 'Mock Data for Unit Tests - Generate Test Fixtures',
    description:
      'Generate consistent, realistic test fixtures for unit testing. Create reproducible mock data for Jest, Vitest, Mocha, and any testing framework.',
    h1: 'Mock Data for Unit Tests',
    keywords: ['unit test mock data', 'test fixtures generator', 'jest mock data', 'vitest fixtures'],
    content: {
      intro:
        'Write better unit tests with realistic mock data that catches real bugs. Our generator creates test fixtures that match your actual data shapes, with the added benefit of reproducibility through seeded generation. Stop hardcoding test data and start generating fixtures that make your tests more maintainable and comprehensive.',
      features: [
        'Reproducible fixtures - Use seeds to generate identical data across test runs',
        'TypeScript support - Export typed fixtures for compile-time safety in tests',
        'Edge case coverage - Realistic randomization naturally includes boundary conditions',
        'Framework agnostic - JSON fixtures work with Jest, Vitest, Mocha, Playwright, and more',
      ],
      howTo: [
        'Define your test data shape by pasting a sample object',
        'Generate a set of test fixtures with varied but realistic values',
        'Set a seed for reproducible test runs across your CI pipeline',
        'Export fixtures and import them into your test files',
      ],
      faq: [
        {
          q: 'How do I ensure tests are reproducible?',
          a: 'Use the seed parameter when generating data. The same seed always produces identical data, making your tests deterministic across environments.',
        },
        {
          q: 'Can I generate fixtures for snapshot testing?',
          a: 'Yes! Generate a fixture set once, save it to your test files, and use it for snapshot comparisons. Update fixtures when your data shape changes.',
        },
        {
          q: 'What about mocking API responses?',
          a: 'Generate mock response data and use it with MSW, nock, or your preferred mocking library. The realistic data makes your mocks more production-like.',
        },
      ],
    },
    relatedPages: [
      '/use-cases/api-testing',
      '/use-cases/frontend-development',
      '/tools/json-to-typescript',
    ],
  },

  // ============================================
  // Category 3: Mock Data / Industry (5 pages)
  // ============================================
  {
    slug: 'ecommerce',
    path: '/mock-data/ecommerce',
    category: 'mock-data',
    title: 'E-commerce Mock Data Generator - Products, Orders, Customers',
    description:
      'Generate realistic e-commerce test data including products, orders, customers, and transactions. Perfect for building and testing online stores.',
    h1: 'E-commerce Mock Data Generator',
    keywords: ['ecommerce test data', 'fake products orders', 'mock store data', 'ecommerce mock data'],
    content: {
      intro:
        'Build and test your e-commerce platform with realistic mock data that covers the full shopping experience. Generate interconnected datasets for products with realistic prices and SKUs, customer profiles with addresses, shopping carts, orders with line items, and transaction records. Our AI understands e-commerce semantics to create coherent, believable test data.',
      features: [
        'Product catalogs - Names, descriptions, prices, SKUs, categories, and inventory levels',
        'Customer profiles - Names, emails, addresses, and account details that look real',
        'Order data - Complete orders with items, quantities, prices, shipping, and status',
        'Transaction records - Payment details, timestamps, and order references',
      ],
      howTo: [
        'Start with a sample JSON of your product, customer, or order schema',
        'Our AI recognizes e-commerce fields and applies appropriate generators',
        'Generate datasets of any size for your development or testing needs',
        'Export to JSON, CSV for spreadsheets, or SQL for database seeding',
      ],
      faq: [
        {
          q: 'Can I generate related data like orders with products?',
          a: 'Yes! Generate products first, then reference those product IDs when generating orders. Using consistent seeds helps maintain data relationships.',
        },
        {
          q: 'Are the prices realistic?',
          a: 'The generator creates prices that follow typical e-commerce patterns, avoiding unrealistic values like $0.01 or $999999.',
        },
        {
          q: 'What about inventory and stock levels?',
          a: 'Stock quantities, reorder points, and inventory status are all generated with realistic distributions for testing inventory management features.',
        },
      ],
    },
    relatedPages: ['/mock-data/products', '/mock-data/orders', '/use-cases/database-seeding'],
  },
  {
    slug: 'users',
    path: '/mock-data/users',
    category: 'mock-data',
    title: 'User Profile Mock Data Generator - Names, Emails, Addresses',
    description:
      'Generate realistic user profile data including names, emails, addresses, and account information. Multi-locale support for international users.',
    h1: 'User Profile Mock Data Generator',
    keywords: ['fake user data', 'mock user profiles', 'user generator', 'fake account data'],
    content: {
      intro:
        'Create realistic user profiles for testing authentication, user management, and personalization features. Our generator produces coherent user data where names match email patterns, addresses are geographically consistent, and account metadata follows realistic patterns. Support for multiple locales lets you test internationalization with culturally appropriate names and addresses.',
      features: [
        'Complete profiles - First name, last name, email, phone, address, and account details',
        'Coherent data - Email addresses derived from names, addresses with matching city/state/zip',
        'Multi-locale - Generate users from US, UK, Germany, Japan, Korea, and 50+ locales',
        'Account metadata - Registration dates, last login, preferences, and role assignments',
      ],
      howTo: [
        'Paste your user object schema or start with a sample profile',
        'Select the locale(s) for generating culturally appropriate names and addresses',
        'Choose how many user profiles to generate',
        'Export as JSON for API testing or SQL for database seeding',
      ],
      faq: [
        {
          q: 'Are the email addresses valid?',
          a: 'Generated emails follow valid format patterns but use fake domains. They are perfect for testing but will not receive actual mail.',
        },
        {
          q: 'Can I generate users from specific countries?',
          a: 'Yes! Select a locale and all generated data including names, addresses, and phone formats will match that region.',
        },
        {
          q: 'How do I avoid duplicate emails?',
          a: 'The generator ensures unique emails within a generation batch. For very large datasets, consider adding unique suffixes or timestamps.',
        },
      ],
    },
    relatedPages: ['/generators/fake-names', '/generators/fake-emails', '/generators/fake-addresses'],
  },
  {
    slug: 'products',
    path: '/mock-data/products',
    category: 'mock-data',
    title: 'Product Catalog Mock Data - SKUs, Prices, Descriptions',
    description:
      'Generate realistic product catalog data with names, descriptions, prices, SKUs, and inventory. Perfect for e-commerce development and testing.',
    h1: 'Product Catalog Mock Data Generator',
    keywords: ['mock product data', 'fake inventory', 'product catalog generator', 'sku generator'],
    content: {
      intro:
        'Build product catalogs, test inventory systems, and develop e-commerce features with realistic product data. Our generator creates products with believable names, marketing-ready descriptions, realistic price points, unique SKUs, and inventory levels. Perfect for populating development environments and creating demo data.',
      features: [
        'Product names - Realistic product titles across various categories',
        'Descriptions - Marketing-style product descriptions with features and benefits',
        'Pricing - Realistic price points with optional sale prices and discounts',
        'Inventory - Stock levels, warehouse locations, and reorder thresholds',
      ],
      howTo: [
        'Define your product schema with the fields you need',
        'Our AI generates contextually appropriate product data',
        'Create as many products as your catalog requires',
        'Export to populate your database or product management system',
      ],
      faq: [
        {
          q: 'Can I generate products in specific categories?',
          a: 'The generator produces varied products by default. For category-specific products, include a category field and the descriptions will adapt.',
        },
        {
          q: 'How unique are the SKUs?',
          a: 'Generated SKUs are unique within each batch. They follow common SKU patterns but are entirely fictional.',
        },
        {
          q: 'What about product images?',
          a: 'The generator can include placeholder image URLs using services like Picsum for realistic product photography placeholders.',
        },
      ],
    },
    relatedPages: ['/mock-data/ecommerce', '/mock-data/orders', '/use-cases/database-seeding'],
  },
  {
    slug: 'orders',
    path: '/mock-data/orders',
    category: 'mock-data',
    title: 'Order History Mock Data - Transactions, Line Items, Shipping',
    description:
      'Generate realistic order and transaction data including line items, totals, shipping addresses, and payment details for e-commerce testing.',
    h1: 'Order History Mock Data Generator',
    keywords: ['mock order data', 'fake transactions', 'order generator', 'transaction mock data'],
    content: {
      intro:
        'Test order management, fulfillment workflows, and reporting with realistic order data. Generate complete orders with multiple line items, calculated totals, shipping information, payment records, and status tracking. Our generator creates orders that reflect real-world patterns including varied basket sizes, realistic timestamps, and proper order lifecycle states.',
      features: [
        'Complete orders - Order IDs, dates, status, and customer references',
        'Line items - Products with quantities, unit prices, and line totals',
        'Shipping data - Addresses, carriers, tracking numbers, and delivery dates',
        'Payment records - Transaction IDs, payment methods, and amounts',
      ],
      howTo: [
        'Paste your order object schema including line items structure',
        'Configure realistic date ranges and order statuses',
        'Generate a batch of orders to populate your system',
        'Export for database seeding or API testing',
      ],
      faq: [
        {
          q: 'Do the order totals calculate correctly?',
          a: 'Generated orders have internally consistent math - line item totals, subtotals, tax, and grand totals all add up correctly.',
        },
        {
          q: 'Can I generate orders in different states?',
          a: 'Yes! The generator creates orders across the full lifecycle: pending, paid, shipped, delivered, cancelled, and refunded.',
        },
        {
          q: 'How do I link orders to users and products?',
          a: 'Generate users and products first, then reference those IDs when generating orders. Consistent seeds help maintain relationships.',
        },
      ],
    },
    relatedPages: ['/mock-data/ecommerce', '/mock-data/products', '/tools/json-to-sql'],
  },
  {
    slug: 'companies',
    path: '/mock-data/companies',
    category: 'mock-data',
    title: 'Company and Business Mock Data Generator',
    description:
      'Generate realistic company data including business names, addresses, industries, and contact information for B2B application testing.',
    h1: 'Company and Business Mock Data',
    keywords: ['fake company data', 'mock business info', 'company generator', 'b2b test data'],
    content: {
      intro:
        'Build and test B2B applications with realistic company data. Generate business profiles with believable company names, industry classifications, office addresses, employee counts, and contact information. Perfect for CRM systems, business directories, lead management, and enterprise software development.',
      features: [
        'Company profiles - Names, industries, founding dates, and employee counts',
        'Contact info - Business emails, phone numbers, and office addresses',
        'Industry data - Realistic industry classifications and company descriptions',
        'B2B metadata - Revenue ranges, company types, and business identifiers',
      ],
      howTo: [
        'Define your company object schema with needed fields',
        'Generate company profiles with coherent business data',
        'Create datasets matching your B2B application needs',
        'Export for CRM imports, database seeding, or API testing',
      ],
      faq: [
        {
          q: 'Are the company names real businesses?',
          a: 'No, all company names are fictional and generated. They sound realistic but do not represent actual businesses.',
        },
        {
          q: 'Can I generate companies in specific industries?',
          a: 'The generator produces varied industries by default. Include an industry field to get appropriate matching data.',
        },
        {
          q: 'What about company domains and websites?',
          a: 'Generated company domains are fictional. Website URLs use placeholder formats that are safe for testing.',
        },
      ],
    },
    relatedPages: ['/mock-data/users', '/generators/fake-emails', '/generators/fake-addresses'],
  },

  // ============================================
  // Category 4: Generators (5 pages)
  // ============================================
  {
    slug: 'fake-names',
    path: '/generators/fake-names',
    category: 'generators',
    title: 'Fake Name Generator - Realistic First and Last Names',
    description:
      'Generate realistic fake names for testing and development. Support for multiple locales, genders, and name formats.',
    h1: 'Fake Name Generator',
    keywords: ['fake names', 'random name generator', 'name generator', 'fake person name'],
    content: {
      intro:
        'Generate realistic fake names for any testing scenario. Our name generator produces culturally appropriate first names, last names, and full names across 50+ locales. Whether you need American names, Japanese names, German names, or a mix of international names, our AI-powered generator creates believable identities for your applications.',
      features: [
        'Multi-locale support - Names from 50+ countries and cultures',
        'Format options - First name, last name, full name, with or without titles',
        'Gender awareness - Generate gender-specific or gender-neutral names',
        'Bulk generation - Create thousands of unique names instantly',
      ],
      howTo: [
        'Select your desired locale(s) for culturally appropriate names',
        'Choose the name format you need (first, last, full, with prefix/suffix)',
        'Specify how many names to generate',
        'Export as JSON, CSV, or copy to clipboard',
      ],
      faq: [
        {
          q: 'Are these names of real people?',
          a: 'No, all names are randomly generated combinations. While they follow realistic patterns, they do not represent actual individuals.',
        },
        {
          q: 'Can I generate names from multiple cultures?',
          a: 'Yes! Generate from a single locale for consistency, or mix locales for international diversity in your test data.',
        },
        {
          q: 'How do I get matching email addresses?',
          a: 'Use our full mock data generator to create coherent profiles where email addresses are derived from the generated names.',
        },
      ],
    },
    relatedPages: ['/generators/fake-emails', '/mock-data/users', '/generators/fake-addresses'],
  },
  {
    slug: 'fake-emails',
    path: '/generators/fake-emails',
    category: 'generators',
    title: 'Fake Email Generator - Realistic Email Addresses',
    description:
      'Generate realistic fake email addresses for testing. Properly formatted emails with varied domains that pass validation.',
    h1: 'Fake Email Generator',
    keywords: [
      'fake email addresses',
      'mock email generator',
      'random email generator',
      'test email addresses',
    ],
    content: {
      intro:
        'Generate properly formatted email addresses for testing your applications. Our email generator creates realistic addresses that pass validation, using varied username patterns and diverse domains. Perfect for testing signup forms, email validation, notification systems, and user management features without using real email addresses.',
      features: [
        'Valid format - All emails pass RFC 5322 format validation',
        'Varied patterns - firstname.lastname, firstnamelastname, initials, and more',
        'Multiple domains - Mix of realistic-looking domains that are safe for testing',
        'Uniqueness - Every generated email is unique within your batch',
      ],
      howTo: [
        'Specify how many email addresses you need',
        'Optionally select preferred patterns or domain styles',
        'Generate your batch of unique email addresses',
        'Export or copy for use in your testing workflow',
      ],
      faq: [
        {
          q: 'Will these emails receive actual mail?',
          a: 'No, the domains are fictional. These emails are formatted correctly but will not receive mail, making them safe for testing.',
        },
        {
          q: 'Do they pass email validation?',
          a: 'Yes! All generated emails follow proper RFC 5322 format and pass standard validation libraries and regex patterns.',
        },
        {
          q: 'Can I get emails matching specific names?',
          a: 'Use our full profile generator to create coherent user profiles where emails are derived from the generated names.',
        },
      ],
    },
    relatedPages: ['/generators/fake-names', '/mock-data/users', '/use-cases/api-testing'],
  },
  {
    slug: 'fake-addresses',
    path: '/generators/fake-addresses',
    category: 'generators',
    title: 'Fake Address Generator - Street, City, State, Zip',
    description:
      'Generate realistic fake addresses for testing. Complete addresses with streets, cities, states, and zip codes that follow regional formats.',
    h1: 'Fake Address Generator',
    keywords: [
      'fake addresses',
      'random address generator',
      'mock address data',
      'test address generator',
    ],
    content: {
      intro:
        'Generate complete, realistic addresses for testing location-based features, shipping systems, and address validation. Our generator creates addresses with proper street formats, real city names, valid state codes, and correctly formatted postal codes. Support for multiple countries ensures your international address handling works correctly.',
      features: [
        'Complete addresses - Street, city, state/province, postal code, and country',
        'Geographic consistency - Cities match states/regions, zip codes match areas',
        'Multi-country support - US, UK, Canada, Germany, Australia, and more',
        'Format compliance - Addresses follow regional formatting conventions',
      ],
      howTo: [
        'Select the country or region for address generation',
        'Choose components you need (full address or specific fields)',
        'Generate your batch of realistic addresses',
        'Export for testing address validation, shipping, or mapping features',
      ],
      faq: [
        {
          q: 'Are these real addresses?',
          a: 'The cities and states are real, but street addresses are generated. They follow realistic patterns but may not exist as actual physical locations.',
        },
        {
          q: 'Do the zip codes match the cities?',
          a: 'Zip codes are generated in the correct format for each region but are not guaranteed to be valid for the specific city.',
        },
        {
          q: 'Can I generate international addresses?',
          a: 'Yes! Select different locales to generate addresses following the conventions of each country, including proper postal code formats.',
        },
      ],
    },
    relatedPages: ['/generators/fake-phone-numbers', '/mock-data/users', '/use-cases/database-seeding'],
  },
  {
    slug: 'fake-phone-numbers',
    path: '/generators/fake-phone-numbers',
    category: 'generators',
    title: 'Fake Phone Number Generator - Valid Format Phone Numbers',
    description:
      'Generate realistic fake phone numbers for testing. Properly formatted numbers that pass validation for US, UK, and international formats.',
    h1: 'Fake Phone Number Generator',
    keywords: [
      'fake phone numbers',
      'mock phone generator',
      'random phone number',
      'test phone numbers',
    ],
    content: {
      intro:
        'Generate properly formatted phone numbers for testing your applications. Our phone generator creates numbers that follow correct formatting conventions for different countries, including country codes, area codes, and proper digit groupings. Perfect for testing phone validation, SMS features, and contact management systems.',
      features: [
        'Format compliance - Numbers follow regional formatting rules (XXX-XXX-XXXX, +1 (XXX) XXX-XXXX)',
        'Multi-country - US, UK, Canada, Australia, Germany, and 30+ country formats',
        'Area code variety - Mix of valid-format area codes for realistic distribution',
        'Mobile vs landline - Generate specific phone types when needed',
      ],
      howTo: [
        'Select the country format for your phone numbers',
        'Choose formatting style (with dashes, spaces, or compact)',
        'Generate your batch of phone numbers',
        'Export for testing phone validation, calling features, or CRM systems',
      ],
      faq: [
        {
          q: 'Are these real phone numbers?',
          a: 'No, numbers are generated to follow valid formats but are not assigned to real lines. They are safe for testing and will not connect to actual phones.',
        },
        {
          q: 'Do they pass phone validation?',
          a: 'Yes! Generated numbers follow proper format patterns and pass standard phone validation libraries for their respective countries.',
        },
        {
          q: 'Can I get numbers with specific area codes?',
          a: 'The generator uses varied area codes by default. For specific area codes, you can configure the generation settings.',
        },
      ],
    },
    relatedPages: ['/generators/fake-emails', '/generators/fake-addresses', '/mock-data/users'],
  },
  {
    slug: 'fake-dates',
    path: '/generators/fake-dates',
    category: 'generators',
    title: 'Fake Date Generator - Random Dates and Timestamps',
    description:
      'Generate random dates and timestamps for testing. Past dates, future dates, date ranges, and various format options.',
    h1: 'Fake Date Generator',
    keywords: ['random dates', 'mock timestamp generator', 'fake date generator', 'test date data'],
    content: {
      intro:
        'Generate dates and timestamps for testing time-based features in your applications. Our date generator creates realistic dates for birthdays, registration dates, order timestamps, expiration dates, and any temporal data you need. Control date ranges, formats, and distributions to match your testing requirements.',
      features: [
        'Flexible ranges - Past dates, future dates, or specific date ranges',
        'Multiple formats - ISO 8601, Unix timestamps, locale-specific formats',
        'Time inclusion - Date only or full datetime with timezone support',
        'Distribution control - Random spread or weighted toward recent dates',
      ],
      howTo: [
        'Define your date range (past X years, specific range, or future dates)',
        'Select output format (ISO, timestamp, or custom format)',
        'Generate your batch of dates',
        'Export for use in testing temporal features and date handling',
      ],
      faq: [
        {
          q: 'Can I generate birthdates in a realistic age range?',
          a: 'Yes! Specify a date range like "18-65 years ago" to generate birthdates representing adults of various ages.',
        },
        {
          q: 'What formats are supported?',
          a: 'ISO 8601, Unix timestamps (seconds and milliseconds), and common display formats. Custom format strings are also supported.',
        },
        {
          q: 'Can I generate sequential dates?',
          a: 'The generator creates random dates within your range. For sequential dates, generate a batch and sort them, or use timestamp increments.',
        },
      ],
    },
    relatedPages: ['/mock-data/orders', '/use-cases/api-testing', '/use-cases/database-seeding'],
  },
];

/**
 * Get all landing pages
 */
export function getAllLandingPages(): LandingPage[] {
  return LANDING_PAGES;
}

/**
 * Get a specific landing page by slug and category
 */
export function getLandingPage(slug: string, category: string): LandingPage | undefined {
  return LANDING_PAGES.find((p) => p.slug === slug && p.path.startsWith(`/${category}`));
}

/**
 * Get all landing pages in a specific category
 */
export function getLandingPagesByCategory(category: LandingPage['category']): LandingPage[] {
  return LANDING_PAGES.filter((p) => p.category === category);
}
