export interface DocPage {
  slug: string;
  title: string;
  description: string;
  content: string;
}

export const docPages: DocPage[] = [
  {
    slug: "mock-data-generator",
    title: "Mock Data Generator Documentation",
    description:
      "Complete guide to AI Utils Mock Data Generator: input formats, schema inference, AI semantic detection, Faker.js integration, and export options.",
    content: `
<p>The AI Utils Mock Data Generator transforms JSON samples or schemas into realistic test datasets. It combines schema inference, semantic field detection, and the Faker.js library to produce data that looks and behaves like production records. This documentation covers every feature of the tool.</p>

<h2>Quick Start</h2>

<ol>
<li>Navigate to <a href="/mock">ai-utils.work/mock</a></li>
<li>Paste a JSON sample or JSON Schema into the editor</li>
<li>Click <strong>Generate</strong></li>
<li>Review and export the generated data</li>
</ol>

<p>The tool runs entirely in your browser. No data is sent to any server unless you explicitly enable AI-powered semantic detection.</p>

<h2>Input Formats</h2>

<p>The generator accepts two input formats:</p>

<h3>JSON Sample</h3>

<p>Paste any valid JSON object or array. The tool will infer the schema automatically, detecting types, formats, and structure.</p>

<pre><code>{
  "id": 1,
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "age": 28,
  "isActive": true,
  "address": {
    "street": "123 Main St",
    "city": "Portland",
    "state": "OR",
    "zip": "97201"
  },
  "tags": ["developer", "designer"]
}
</code></pre>

<p>From this sample, the tool infers:</p>
<ul>
<li><code>id</code> is an integer</li>
<li><code>name</code> is a string (semantic: person's full name)</li>
<li><code>email</code> is a string with email format</li>
<li><code>age</code> is an integer with a plausible range</li>
<li><code>isActive</code> is a boolean</li>
<li><code>address</code> is a nested object with address-related fields</li>
<li><code>tags</code> is an array of strings</li>
</ul>

<h3>JSON Schema</h3>

<p>For more precise control, provide a JSON Schema document directly. The generator respects all standard JSON Schema keywords including <code>type</code>, <code>format</code>, <code>minimum</code>, <code>maximum</code>, <code>minLength</code>, <code>maxLength</code>, <code>enum</code>, <code>pattern</code>, and <code>required</code>.</p>

<pre><code>{
  "type": "object",
  "properties": {
    "id": { "type": "integer", "minimum": 1 },
    "email": { "type": "string", "format": "email" },
    "role": { "type": "string", "enum": ["admin", "user", "editor"] },
    "score": { "type": "number", "minimum": 0, "maximum": 100 }
  },
  "required": ["id", "email", "role"]
}
</code></pre>

<h2>Schema Inference Engine</h2>

<p>When you provide a JSON sample rather than a schema, the inference engine analyzes the data to build a complete JSON Schema. The inference process works as follows:</p>

<h3>Type Detection</h3>

<p>The engine maps JavaScript types to JSON Schema types:</p>

<ul>
<li>Strings are checked for known formats (email, URL, date-time, UUID, IPv4)</li>
<li>Numbers are classified as <code>integer</code> or <code>number</code> based on whether they contain decimals</li>
<li>Arrays are analyzed to determine item types (homogeneous vs. heterogeneous)</li>
<li>Nested objects are recursively inferred</li>
<li>Null values are recorded with nullable annotations</li>
</ul>

<h3>Format Detection</h3>

<p>String values are tested against format patterns:</p>

<ul>
<li><strong>email</strong> - Contains @ with a valid domain structure</li>
<li><strong>uri</strong> - Starts with http:// or https://</li>
<li><strong>date-time</strong> - ISO 8601 format (2024-01-15T10:30:00Z)</li>
<li><strong>date</strong> - ISO date format (2024-01-15)</li>
<li><strong>uuid</strong> - Standard UUID v4 pattern</li>
<li><strong>ipv4</strong> - Dotted quad notation</li>
</ul>

<h2>Semantic Detection</h2>

<p>Semantic detection is what makes the Mock Data Generator produce realistic data rather than random strings. It analyzes field names to determine their real-world meaning and maps them to appropriate Faker.js generator methods.</p>

<h3>Pattern-Based Detection (Default)</h3>

<p>The built-in regex engine contains 148 pattern rules covering the most common field names across multiple domains:</p>

<h4>Person Fields</h4>
<ul>
<li><code>firstName</code>, <code>first_name</code>, <code>givenName</code> &rarr; <code>person.firstName()</code></li>
<li><code>lastName</code>, <code>last_name</code>, <code>surname</code> &rarr; <code>person.lastName()</code></li>
<li><code>fullName</code>, <code>name</code>, <code>displayName</code> &rarr; <code>person.fullName()</code></li>
<li><code>email</code>, <code>emailAddress</code> &rarr; <code>internet.email()</code></li>
<li><code>phone</code>, <code>telephone</code>, <code>mobile</code> &rarr; <code>phone.number()</code></li>
<li><code>avatar</code>, <code>profileImage</code> &rarr; <code>image.avatar()</code></li>
</ul>

<h4>Address Fields</h4>
<ul>
<li><code>street</code>, <code>streetAddress</code> &rarr; <code>location.streetAddress()</code></li>
<li><code>city</code>, <code>town</code> &rarr; <code>location.city()</code></li>
<li><code>state</code>, <code>province</code> &rarr; <code>location.state()</code></li>
<li><code>zip</code>, <code>zipCode</code>, <code>postalCode</code> &rarr; <code>location.zipCode()</code></li>
<li><code>country</code> &rarr; <code>location.country()</code></li>
<li><code>latitude</code>, <code>lat</code> &rarr; <code>location.latitude()</code></li>
<li><code>longitude</code>, <code>lng</code>, <code>lon</code> &rarr; <code>location.longitude()</code></li>
</ul>

<h4>Commerce Fields</h4>
<ul>
<li><code>productName</code>, <code>product</code> &rarr; <code>commerce.productName()</code></li>
<li><code>price</code>, <code>amount</code>, <code>cost</code> &rarr; <code>commerce.price()</code></li>
<li><code>department</code>, <code>category</code> &rarr; <code>commerce.department()</code></li>
<li><code>company</code>, <code>companyName</code>, <code>organization</code> &rarr; <code>company.name()</code></li>
</ul>

<h4>Internet Fields</h4>
<ul>
<li><code>url</code>, <code>website</code>, <code>homepage</code> &rarr; <code>internet.url()</code></li>
<li><code>username</code>, <code>handle</code> &rarr; <code>internet.userName()</code></li>
<li><code>password</code> &rarr; <code>internet.password()</code></li>
<li><code>ip</code>, <code>ipAddress</code> &rarr; <code>internet.ipv4()</code></li>
<li><code>userAgent</code> &rarr; <code>internet.userAgent()</code></li>
</ul>

<h4>Date Fields</h4>
<ul>
<li><code>createdAt</code>, <code>created</code>, <code>dateCreated</code> &rarr; <code>date.past()</code></li>
<li><code>updatedAt</code>, <code>modified</code> &rarr; <code>date.recent()</code></li>
<li><code>birthdate</code>, <code>dob</code>, <code>dateOfBirth</code> &rarr; <code>date.birthdate()</code></li>
</ul>

<h3>AI-Powered Detection (Optional)</h3>

<p>For schemas with ambiguous field names, you can enable AI-powered detection. This sends the field names (not the values) to an AI model that analyzes them in context to infer semantic meaning.</p>

<p>AI detection excels at:</p>
<ul>
<li>Domain-specific fields (e.g., <code>sku</code>, <code>isbn</code>, <code>iata</code>)</li>
<li>Abbreviated field names (e.g., <code>fn</code>, <code>addr</code>, <code>qty</code>)</li>
<li>Detecting relationships between fields (coherent names + emails)</li>
<li>Understanding context from neighboring fields</li>
</ul>

<p>To enable AI detection, toggle the "AI Analysis" switch in the generator panel. Note that this feature requires an internet connection as it sends field names to the AI provider configured on the server.</p>

<h2>Generation Options</h2>

<h3>Record Count</h3>
<p>Set the number of records to generate, from 1 to 10,000. Higher counts are useful for performance testing and database seeding.</p>

<h3>Random Seed</h3>
<p>Provide a numeric seed for reproducible output. The same seed with the same schema always produces identical data, which is essential for reproducible tests.</p>

<h3>Locale</h3>
<p>Select a locale to generate culturally appropriate data. Available locales include:</p>
<ul>
<li><strong>en</strong> - English (United States)</li>
<li><strong>en_GB</strong> - English (United Kingdom)</li>
<li><strong>de</strong> - German</li>
<li><strong>fr</strong> - French</li>
<li><strong>ja</strong> - Japanese</li>
<li><strong>ko</strong> - Korean</li>
<li><strong>zh_CN</strong> - Chinese (Simplified)</li>
<li>And 50+ additional locales</li>
</ul>

<p>Locale affects names, addresses, phone number formats, and other culturally specific data. Switching to the Japanese locale, for example, generates names in kanji, addresses in Japanese format, and phone numbers with the +81 country code.</p>

<h2>Export Formats</h2>

<p>Generated data can be exported in four formats:</p>

<h3>JSON</h3>
<p>Standard JSON array. This is the default format, suitable for API testing, seed files, and frontend development. The output is formatted with 2-space indentation for readability.</p>

<h3>CSV</h3>
<p>Comma-separated values with header row. Nested objects are flattened using dot notation (e.g., <code>address.city</code>). Arrays are serialized as JSON strings within cells. This format is ideal for spreadsheet import and data analysis.</p>

<h3>SQL</h3>
<p>SQL INSERT statements for direct database seeding. The generator infers appropriate SQL types from the JSON Schema types and produces valid INSERT INTO statements. Table names are derived from the schema title or default to "data".</p>

<pre><code>INSERT INTO users (id, name, email, age) VALUES
(1, 'Alice Johnson', 'alice@example.com', 28),
(2, 'Bob Smith', 'bob.smith@mail.com', 34),
(3, 'Carol Williams', 'carol.w@company.org', 22);
</code></pre>

<h3>TypeScript</h3>
<p>Type-safe TypeScript code with an interface definition and a typed array. This format is perfect for embedding test fixtures directly in TypeScript test files.</p>

<pre><code>interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

const users: User[] = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", age: 28 },
  // ...
];
</code></pre>

<h2>Schema Extension Format</h2>

<p>Internally, the generator enriches JSON Schema with custom <code>x-</code> extensions that control data generation:</p>

<pre><code>{
  "type": "object",
  "properties": {
    "firstName": {
      "type": "string",
      "x-faker": {
        "method": "person.firstName",
        "args": []
      }
    }
  },
  "x-ai-domain": "e-commerce",
  "x-ai-coherence": [["firstName", "lastName", "email"]]
}
</code></pre>

<ul>
<li><code>x-faker.method</code> - The Faker.js method path to call for this field</li>
<li><code>x-faker.args</code> - Optional arguments to pass to the Faker.js method</li>
<li><code>x-ai-domain</code> - The detected domain context (e.g., "e-commerce", "healthcare")</li>
<li><code>x-ai-coherence</code> - Groups of fields that should be generated coherently</li>
</ul>

<p>You can manually add these extensions to your JSON Schema to override the automatic detection.</p>

<h2>Privacy and Security</h2>

<p>The Mock Data Generator processes all data locally in your browser by default. Your JSON input is parsed, analyzed, and used for generation entirely on the client side.</p>

<p>The only exception is AI-powered semantic detection, which sends field names (not values) to the configured AI provider. This is opt-in and clearly indicated in the UI.</p>

<p>Generated data is never stored on any server. It exists only in your browser's memory until you export it or close the page.</p>

<h2>Keyboard Shortcuts</h2>

<ul>
<li><kbd>Ctrl</kbd> + <kbd>Enter</kbd> - Generate mock data</li>
<li><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>C</kbd> - Copy generated output</li>
<li><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>E</kbd> - Export to selected format</li>
</ul>

<h2>Troubleshooting</h2>

<h3>Invalid JSON Error</h3>
<p>Ensure your input is valid JSON. Common issues include trailing commas, single quotes (JSON requires double quotes), and unquoted keys. The editor highlights syntax errors with line numbers.</p>

<h3>Unexpected Field Values</h3>
<p>If a field generates random strings instead of realistic data, the semantic detector may not recognize the field name. Try renaming the field to a more common name (e.g., <code>fn</code> to <code>firstName</code>) or enable AI detection for better inference.</p>

<h3>Large Schema Performance</h3>
<p>Schemas with deeply nested objects or very large arrays may take longer to generate. For best performance, keep the record count under 1,000 for complex schemas.</p>
`,
  },
  {
    slug: "i18n-sync-tool",
    title: "i18n Sync Tool Documentation",
    description:
      "Complete guide to AI Utils i18n Sync Tool: file formats, AI-powered translation, diff comparison, language management, and export options.",
    content: `
<p>The AI Utils i18n Sync Tool helps developers manage internationalization files across multiple languages. It provides AI-powered translation, visual diff comparison, and batch export capabilities, all running in your browser. This documentation covers every feature and workflow.</p>

<h2>Quick Start</h2>

<ol>
<li>Navigate to <a href="/intl">ai-utils.work/intl</a></li>
<li>Upload or paste your source language JSON file</li>
<li>Select target languages</li>
<li>Review, edit, and export translations</li>
</ol>

<h2>Supported File Formats</h2>

<p>The i18n tool accepts standard JSON translation files used by popular internationalization frameworks:</p>

<h3>Flat JSON</h3>
<p>Simple key-value pairs used by i18next (flat mode), react-intl, and vue-i18n:</p>

<pre><code>{
  "welcome": "Welcome to our app",
  "login.title": "Sign In",
  "login.submit": "Log In",
  "login.forgot": "Forgot Password?",
  "dashboard.greeting": "Hello, {{name}}",
  "items.count": "You have {{count}} items"
}
</code></pre>

<h3>Nested JSON</h3>
<p>Hierarchical key structure used by i18next (default mode) and ngx-translate:</p>

<pre><code>{
  "welcome": "Welcome to our app",
  "login": {
    "title": "Sign In",
    "submit": "Log In",
    "forgot": "Forgot Password?"
  },
  "dashboard": {
    "greeting": "Hello, {{name}}"
  },
  "items": {
    "count": "You have {{count}} items"
  }
}
</code></pre>

<p>The tool automatically detects the format and preserves the structure when exporting.</p>

<h2>Core Features</h2>

<h3>Translation Management</h3>

<p>The main interface shows your translation keys in a spreadsheet-like view with columns for each language. You can:</p>

<ul>
<li><strong>Edit translations inline</strong> - Click any cell to edit the translation directly</li>
<li><strong>See missing translations</strong> - Empty cells are highlighted in red, making gaps easy to spot</li>
<li><strong>Filter keys</strong> - Search for specific keys or filter by translation status (translated, missing, modified)</li>
<li><strong>Sort keys</strong> - Alphabetically or by modification date</li>
</ul>

<h3>Key Filtering</h3>

<p>The key filter allows you to focus on specific sections of your translation file. Type a prefix to show only matching keys:</p>

<ul>
<li>Type <code>login</code> to show only keys starting with "login"</li>
<li>Type <code>error</code> to show all error messages</li>
<li>Use the status filter to show only missing or modified translations</li>
</ul>

<h3>Language Swap</h3>

<p>The swap feature lets you quickly switch the source and target languages. This is useful when you want to verify translations by reading them in the target language context, or when you want to use a previously translated file as the new source.</p>

<h2>AI-Powered Translation</h2>

<p>The i18n tool integrates with AI language models to provide automated translations. This feature is designed for developer workflows, not production-quality translation, so always review AI translations before shipping.</p>

<h3>How It Works</h3>

<ol>
<li>Select the source language and one or more target languages</li>
<li>Click "AI Translate" to send the source strings to the AI model</li>
<li>The AI analyzes the context (key names, surrounding translations, interpolation variables) to produce contextually appropriate translations</li>
<li>Translations appear in the editor for review and editing</li>
</ol>

<h3>Translation Quality</h3>

<p>The AI translator is particularly good at:</p>

<ul>
<li><strong>Preserving interpolation variables</strong> - <code>{{name}}</code>, <code>{count}</code>, and <code>%s</code> placeholders are maintained correctly</li>
<li><strong>Understanding context from key names</strong> - A key like <code>button.cancel</code> is translated differently than <code>subscription.cancel</code></li>
<li><strong>Handling plurals</strong> - When the source contains plural forms, the AI generates appropriate plural forms for the target language</li>
<li><strong>Technical terms</strong> - Common developer-facing terms (API, URL, JSON) are left untranslated when appropriate</li>
</ul>

<h3>Limitations</h3>

<ul>
<li>AI translations are a starting point, not a final product. Always have native speakers review critical translations.</li>
<li>Highly contextual strings (marketing copy, legal text) may need manual translation</li>
<li>Some language pairs produce better results than others. European languages and CJK languages are well-supported.</li>
<li>The AI model processes strings individually. It does not have access to your full application context.</li>
</ul>

<h2>Diff Comparison</h2>

<p>The diff view shows changes between two versions of a translation file. This is essential for reviewing translations after AI processing or after receiving translations from external translators.</p>

<h3>What the Diff Shows</h3>

<ul>
<li><strong>Added keys</strong> (green) - Keys present in the new version but not the old</li>
<li><strong>Removed keys</strong> (red) - Keys present in the old version but not the new</li>
<li><strong>Modified values</strong> (yellow) - Keys where the translation text has changed</li>
<li><strong>Unchanged keys</strong> (gray) - Keys with identical values in both versions</li>
</ul>

<h3>Using the Diff View</h3>

<ol>
<li>Upload or paste the original translation file</li>
<li>Upload or paste the updated translation file</li>
<li>The diff view appears automatically, highlighting all changes</li>
<li>Use the filter to show only changed, added, or removed keys</li>
</ol>

<p>The diff comparison works at the value level, not the character level. If a translation changes from "Hello" to "Hi there", the entire value is marked as modified. This keeps the view clean and focused on what matters: which translations changed.</p>

<h2>Locale Detection</h2>

<p>The tool includes a locale detection utility that identifies the language of a translation file based on its content. This is helpful when you receive translation files without clear language labels.</p>

<p>The detector analyzes common words, character frequency, and script type (Latin, CJK, Cyrillic, Arabic) to identify the most likely language. It supports over 30 languages with high accuracy for files containing more than 20 translated strings.</p>

<h2>Searchable Language Selector</h2>

<p>The language selector includes a search field for quickly finding languages. Type a language name or code to filter the list:</p>

<ul>
<li>Type "ko" to find Korean</li>
<li>Type "port" to find Portuguese</li>
<li>Type "zh" to find Chinese (Simplified and Traditional)</li>
</ul>

<p>The selector shows both the language name and its ISO code, making it easy to identify the correct locale for your project.</p>

<h2>Export Options</h2>

<p>Translated files can be exported in several formats:</p>

<h3>JSON (Flat)</h3>
<p>Exports a flat key-value JSON file suitable for i18next flat mode and react-intl:</p>

<pre><code>{
  "welcome": "Bienvenue dans notre application",
  "login.title": "Se connecter",
  "login.submit": "Connexion"
}
</code></pre>

<h3>JSON (Nested)</h3>
<p>Exports a hierarchical JSON file that preserves the original nesting structure:</p>

<pre><code>{
  "welcome": "Bienvenue dans notre application",
  "login": {
    "title": "Se connecter",
    "submit": "Connexion"
  }
}
</code></pre>

<h3>Batch Export</h3>
<p>Export all languages at once as a ZIP file. Each language gets its own JSON file named by locale code (e.g., <code>fr.json</code>, <code>de.json</code>, <code>ja.json</code>). This is the fastest way to update all translation files in your project.</p>

<h2>Workflow: Adding a New Language</h2>

<p>Here is the recommended workflow for adding a new language to your project using the i18n tool:</p>

<ol>
<li><strong>Upload your source language file</strong> (typically <code>en.json</code>)</li>
<li><strong>Add the target language</strong> using the language selector</li>
<li><strong>Run AI translation</strong> for an initial pass</li>
<li><strong>Review all translations</strong> in the editor, paying special attention to:
  <ul>
  <li>Interpolation variables are preserved</li>
  <li>Technical terms are handled correctly</li>
  <li>Context-dependent strings make sense</li>
  </ul>
</li>
<li><strong>Export the translation file</strong> and add it to your project</li>
<li><strong>Test in your application</strong> to verify formatting and layout</li>
</ol>

<h2>Workflow: Syncing Translations After Code Changes</h2>

<p>When you add new strings to your source language file, follow this workflow to update all target languages:</p>

<ol>
<li><strong>Upload the updated source file</strong></li>
<li><strong>Upload the existing target language file</strong></li>
<li><strong>Use the diff view</strong> to identify new and changed keys</li>
<li><strong>Run AI translation</strong> on only the missing keys</li>
<li><strong>Review and export</strong></li>
</ol>

<p>The tool preserves existing translations and only fills in the gaps, so your previously reviewed translations remain untouched.</p>

<h2>Best Practices</h2>

<ol>
<li><strong>Use descriptive key names.</strong> Keys like <code>dashboard.welcomeMessage</code> give the AI better context than <code>msg_001</code>.</li>
<li><strong>Keep source strings simple.</strong> Short, clear English strings produce better translations than long, complex sentences.</li>
<li><strong>Mark untranslatable strings.</strong> If a key should not be translated (e.g., brand names), prefix it with a convention like <code>_brand.</code>.</li>
<li><strong>Review in context.</strong> After exporting, test translations in your actual application to catch layout issues (German text is often 30% longer than English).</li>
<li><strong>Version control your translations.</strong> Commit translation files to git so you can track changes over time and revert if needed.</li>
<li><strong>Translate iteratively.</strong> Do not try to translate 500 strings at once. Work in batches of 50-100 for better quality control.</li>
</ol>

<h2>Privacy</h2>

<p>Your translation files are processed locally in your browser. The only data sent externally is the text content of strings when you use AI translation. Key names and file structure are included for context but no other metadata is transmitted.</p>

<p>AI translation requests are processed in real-time and not stored. No translation data is retained after your browser session ends.</p>

<h2>Troubleshooting</h2>

<h3>File Upload Fails</h3>
<p>Ensure your file is valid JSON. The tool validates the file on upload and shows specific error messages for malformed JSON. Common issues include BOM characters at the start of the file, trailing commas, and mixed encoding.</p>

<h3>AI Translation Returns Empty Results</h3>
<p>This can happen when the AI provider is temporarily unavailable. Wait a moment and try again. If the issue persists, check your browser's network tab for error details.</p>

<h3>Interpolation Variables Missing After Translation</h3>
<p>While the AI is designed to preserve interpolation variables, it may occasionally modify them. Always verify that <code>{{variable}}</code> placeholders are intact after AI translation. The diff view highlights these changes to make verification easy.</p>

<h3>Large Files Are Slow</h3>
<p>Files with more than 1,000 keys may experience slower performance in the editor. Use the key filter to work with smaller subsets of keys at a time.</p>
`,
  },
  {
    slug: "export-formats",
    title: "Export Formats Reference",
    description:
      "Detailed reference for JSON, CSV, SQL, and TypeScript export formats with examples, options, and use cases.",
    content: `
<p>The Mock Data Generator supports four export formats, each suited to different workflows and toolchains. This reference covers every option available for each format, data type handling rules, edge cases, and concrete examples showing the same sample data rendered in all four formats.</p>

<h2>Overview</h2>

<p>After generating mock records you can export them using the format selector in the output panel. The four formats are:</p>

<ul>
<li><strong>JSON</strong> – Universal interchange format, suitable for APIs, seed scripts, and frontend fixtures.</li>
<li><strong>CSV</strong> – Tabular format for spreadsheet tools, data pipelines, and reporting systems.</li>
<li><strong>SQL</strong> – INSERT statements for seeding relational databases directly.</li>
<li><strong>TypeScript</strong> – Typed interfaces and typed arrays for embedding fixtures in TypeScript test files.</li>
</ul>

<p>All formats are generated in your browser. No data is transmitted to any server during export.</p>

<h2>JSON Export</h2>

<p>JSON is the default export format. The output is always a valid JSON document that can be parsed directly by any JSON parser without pre-processing.</p>

<h3>Pretty Print vs. Minified</h3>

<p>By default the output uses 2-space indentation (pretty print), which makes it easy to read and diff in version control. When you need the smallest possible file size — for example, when embedding fixtures in a bundle — switch to minified output. Minified JSON removes all whitespace between tokens.</p>

<p>Pretty print example:</p>

<pre><code>[
  {
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice@example.com"
  },
  {
    "id": 2,
    "name": "Bob Smith",
    "email": "bob.smith@mail.com"
  }
]
</code></pre>

<p>Minified equivalent:</p>

<pre><code>[{"id":1,"name":"Alice Johnson","email":"alice@example.com"},{"id":2,"name":"Bob Smith","email":"bob.smith@mail.com"}]
</code></pre>

<h3>Array vs. Single Object</h3>

<p>When the record count is set to 1, you can export as either a single JSON object or a single-element array. Most API mocking tools expect an array regardless of count, so the default is always an array. Use single-object mode when your fixture loader expects a plain object rather than an array.</p>

<h3>Nested vs. Flat Output</h3>

<p>If your schema contains nested objects, the JSON export preserves the full nesting hierarchy. There is no automatic flattening in JSON mode — you get exactly the structure you defined in the schema.</p>

<pre><code>{
  "id": 1,
  "name": "Alice Johnson",
  "address": {
    "street": "742 Evergreen Terrace",
    "city": "Springfield",
    "state": "IL",
    "zip": "62701"
  }
}
</code></pre>

<p>This makes JSON the ideal format when downstream code consumes the data via <code>JSON.parse()</code> and expects the original shape.</p>

<h2>CSV Export</h2>

<p>CSV export produces a comma-separated file with a header row followed by one data row per generated record. The output conforms to RFC 4180 and is compatible with Microsoft Excel, Google Sheets, LibreOffice Calc, pandas, and most ETL pipelines.</p>

<h3>RFC 4180 Compliance</h3>

<p>The following RFC 4180 rules are enforced:</p>

<ul>
<li>Fields containing commas, double-quote characters, or line breaks are wrapped in double quotes.</li>
<li>A double-quote character inside a quoted field is escaped by doubling it (<code>""</code>).</li>
<li>Each record ends with CRLF (<code>\r\n</code>) for maximum cross-platform compatibility.</li>
<li>The header row uses the same quoting rules as data rows.</li>
</ul>

<h3>Handling Nested Objects (Flattening)</h3>

<p>CSV is inherently two-dimensional, so nested objects are flattened using dot notation. A field at <code>address.city</code> becomes the column header <code>address.city</code>.</p>

<p>Given this schema:</p>

<pre><code>{
  "id": 1,
  "name": "Alice Johnson",
  "address": {
    "city": "Springfield",
    "state": "IL"
  }
}
</code></pre>

<p>The CSV output is:</p>

<pre><code>id,name,address.city,address.state
1,Alice Johnson,Springfield,IL
2,Bob Smith,Portland,OR
</code></pre>

<h3>Handling Arrays</h3>

<p>Array fields cannot be represented natively in CSV. Arrays are serialized as a JSON string and placed inside a quoted CSV cell. For example, a <code>tags</code> field containing <code>["developer", "designer"]</code> appears as <code>"[""developer"",""designer""]"</code> in the CSV.</p>

<p>This approach preserves the data losslessly. When you re-import the file, you can parse the JSON string to recover the original array. If you need one row per array element instead, pre-process the data before exporting.</p>

<h3>UTF-8 Encoding and Excel Compatibility</h3>

<p>The CSV file is encoded in UTF-8. For Excel compatibility on Windows, the file includes a UTF-8 BOM (byte order mark, <code>\uFEFF</code>) at the start. The BOM causes Excel to correctly interpret Unicode characters (CJK names, accented European characters, Arabic script) instead of displaying mojibake.</p>

<p>Modern tools (pandas, Google Sheets, Python's <code>csv</code> module) handle the BOM transparently. If your pipeline strips the BOM, set the encoding explicitly to <code>utf-8-sig</code> when reading with Python.</p>

<h2>SQL Export</h2>

<p>SQL export generates a series of <code>INSERT INTO</code> statements that can be run directly against a relational database. The output targets standard ANSI SQL syntax and is compatible with MySQL, PostgreSQL, SQLite, and SQL Server with minor dialect adjustments.</p>

<h3>INSERT Statement Format</h3>

<p>Each generated record becomes one row in a multi-row <code>INSERT</code> statement. Records are batched into groups of 500 to avoid hitting database row limits per statement:</p>

<pre><code>INSERT INTO users (id, name, email, age, is_active) VALUES
(1, 'Alice Johnson', 'alice@example.com', 28, TRUE),
(2, 'Bob Smith', 'bob.smith@mail.com', 34, FALSE),
(3, 'Carol Williams', 'carol.w@company.org', 22, TRUE);
</code></pre>

<h3>Table Naming</h3>

<p>The table name is derived from the schema title if one is present (e.g., <code>"title": "User"</code> produces <code>INSERT INTO users</code>, pluralized and lowercased). When no title is present, the table name defaults to <code>data</code>. You can override the table name in the export settings panel.</p>

<h3>Data Type Mapping</h3>

<p>JSON Schema types are mapped to SQL column types as follows:</p>

<ul>
<li><code>string</code> (general) &rarr; <code>VARCHAR(255)</code></li>
<li><code>string</code> with <code>format: "date-time"</code> &rarr; <code>DATETIME</code></li>
<li><code>string</code> with <code>format: "date"</code> &rarr; <code>DATE</code></li>
<li><code>string</code> with <code>format: "uuid"</code> &rarr; <code>CHAR(36)</code></li>
<li><code>integer</code> &rarr; <code>INT</code></li>
<li><code>number</code> (decimal) &rarr; <code>FLOAT</code></li>
<li><code>boolean</code> &rarr; <code>BOOLEAN</code></li>
<li><code>object</code> or <code>array</code> &rarr; <code>JSON</code> (serialized as a JSON string literal)</li>
</ul>

<p>The CREATE TABLE statement (commented out at the top of the export) uses these mapped types to help you set up your schema:</p>

<pre><code>-- CREATE TABLE users (
--   id INT,
--   name VARCHAR(255),
--   email VARCHAR(255),
--   age INT,
--   is_active BOOLEAN,
--   created_at DATETIME
-- );
</code></pre>

<h3>Handling NULL Values</h3>

<p>Fields that are nullable in the schema may generate <code>NULL</code> values. These are emitted as the SQL keyword <code>NULL</code> (unquoted) in the VALUES list:</p>

<pre><code>(4, 'Dave Lee', NULL, 41, TRUE)
</code></pre>

<h3>Batch Inserts</h3>

<p>Large exports (more than 500 records) are split into multiple INSERT statements, each covering up to 500 rows. This prevents hitting database packet size limits and allows partial imports if an error occurs mid-way through a large seed operation.</p>

<h2>TypeScript Export</h2>

<p>TypeScript export generates two things: a typed interface derived from the schema and a typed <code>const</code> array containing the generated data. This is the preferred format for embedding test fixtures directly in TypeScript test files.</p>

<h3>Interface Generation</h3>

<p>The exporter analyzes the schema and generates a TypeScript interface with the correct property types:</p>

<pre><code>export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  createdAt: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  tags: string[];
}
</code></pre>

<h3>Optional Fields</h3>

<p>Fields marked as non-required in the JSON Schema (i.e., not listed in the <code>required</code> array) are emitted as optional properties using the <code>?</code> modifier:</p>

<pre><code>export interface Product {
  id: number;
  name: string;
  description?: string;   // not in required array
  price: number;
  sku?: string;            // not in required array
}
</code></pre>

<h3>Union Types for Enum-Like Fields</h3>

<p>Fields with a JSON Schema <code>enum</code> constraint generate a TypeScript union type instead of a plain <code>string</code>:</p>

<pre><code>export interface User {
  id: number;
  role: "admin" | "editor" | "viewer";
  status: "active" | "inactive" | "pending";
}
</code></pre>

<h3>as const for Literal Types</h3>

<p>The generated data array uses <code>as const</code> to preserve literal types, which is useful in tests that assert exact values:</p>

<pre><code>export const users: User[] = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    age: 28,
    isActive: true,
    createdAt: "2024-03-15T08:22:00.000Z",
    address: {
      street: "742 Evergreen Terrace",
      city: "Springfield",
      state: "IL",
      zip: "62701"
    },
    tags: ["developer", "designer"]
  }
] as const;
</code></pre>

<h2>Choosing the Right Format</h2>

<p>Use this guide to pick the right format for your use case:</p>

<ul>
<li><strong>JSON</strong> – Use when the consuming code does <code>JSON.parse()</code>, when you need nested structures preserved, or when you are mocking API responses. This is the most universal format.</li>
<li><strong>CSV</strong> – Use when loading data into a spreadsheet, a BI tool, or a Python data pipeline. Also the right choice when you need the data in a human-readable tabular view.</li>
<li><strong>SQL</strong> – Use when you are seeding a relational database and want to run INSERT statements directly without writing migration scripts or seed scripts by hand.</li>
<li><strong>TypeScript</strong> – Use when writing unit tests or integration tests in TypeScript and want fully typed fixture data co-located with your test files.</li>
</ul>

<h2>Same Data in All Four Formats</h2>

<p>The following examples show the same two user records exported in each format.</p>

<p><strong>Source schema:</strong></p>

<pre><code>{ "id": 1, "name": "Alice Johnson", "email": "alice@example.com", "age": 28, "isActive": true }
{ "id": 2, "name": "Bob Smith",    "email": "bob@mail.com",       "age": 34, "isActive": false }
</code></pre>

<p><strong>JSON export:</strong></p>

<pre><code>[
  { "id": 1, "name": "Alice Johnson", "email": "alice@example.com", "age": 28, "isActive": true },
  { "id": 2, "name": "Bob Smith",     "email": "bob@mail.com",      "age": 34, "isActive": false }
]
</code></pre>

<p><strong>CSV export:</strong></p>

<pre><code>id,name,email,age,isActive
1,Alice Johnson,alice@example.com,28,true
2,Bob Smith,bob@mail.com,34,false
</code></pre>

<p><strong>SQL export:</strong></p>

<pre><code>INSERT INTO data (id, name, email, age, is_active) VALUES
(1, 'Alice Johnson', 'alice@example.com', 28, TRUE),
(2, 'Bob Smith', 'bob@mail.com', 34, FALSE);
</code></pre>

<p><strong>TypeScript export:</strong></p>

<pre><code>export interface Data {
  id: number;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
}

export const data: Data[] = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", age: 28, isActive: true },
  { id: 2, name: "Bob Smith",     email: "bob@mail.com",      age: 34, isActive: false }
] as const;
</code></pre>
`,
  },
  {
    slug: "ai-semantic-detection",
    title: "AI Semantic Detection Guide",
    description:
      "How AI Utils detects field meanings from JSON field names to generate realistic mock data — supported field types, accuracy, and customization.",
    content: `
<p>Semantic detection is the engine that makes generated mock data look real. Without it, a field named <code>email</code> would receive a random string like <code>"xkj42fg"</code>. With it, the same field receives a properly formatted email address like <code>"alice.johnson@example.com"</code>. This guide explains how the detection system works, what it supports, and how to get the best results.</p>

<h2>What Semantic Detection Is and Why It Matters</h2>

<p>Every Faker.js method produces a specific category of realistic data. <code>person.firstName()</code> returns first names, <code>internet.email()</code> returns email addresses, <code>location.city()</code> returns city names. The challenge is mapping from your field name — which could be anything — to the right Faker.js method.</p>

<p>Semantic detection solves this by reading the field name and inferring its real-world meaning. The field name <code>firstName</code> maps to <code>person.firstName()</code>, the field name <code>companyName</code> maps to <code>company.name()</code>, and the field name <code>createdAt</code> maps to <code>date.past()</code>. Without this mapping, every string field would fall back to generic lorem ipsum text, producing output that looks artificial and is harder to use in tests that check realistic data patterns.</p>

<h2>Two Detection Modes</h2>

<p>The Mock Data Generator uses two complementary detection mechanisms:</p>

<ol>
<li><strong>Regex pattern detection</strong> – Fast, offline, and deterministic. Runs in your browser with no external calls.</li>
<li><strong>AI inference</strong> – Slower, requires a network call, but handles ambiguous and domain-specific field names that patterns cannot cover.</li>
</ol>

<p>Regex detection always runs first. AI inference is optional and only activates when you toggle "AI Analysis" in the generator panel. When AI inference is enabled, it supplements the regex results rather than replacing them — fields already matched by regex patterns are not re-sent to the AI.</p>

<h2>How Regex Detection Works</h2>

<p>The regex engine contains 148 pattern rules. Each rule is a regular expression tested against the field name (case-insensitively). When a rule matches, the engine records the corresponding Faker.js method path and stores it as an <code>x-faker</code> extension on the schema property.</p>

<p>Rules are evaluated in priority order. More specific rules (exact matches like <code>/^email$/i</code>) are tested before broader prefix/suffix rules (like <code>/email/i</code>). This prevents a field named <code>alternateEmail</code> from accidentally matching a less-specific rule intended for a different concept.</p>

<p>The pattern matching is purely syntactic — it looks only at the field name, not at sample values or neighboring fields. A field named <code>email</code> always maps to <code>internet.email()</code> regardless of what values it held in the input sample.</p>

<h2>Supported Field Categories</h2>

<h3>Personal Data</h3>

<ul>
<li><strong>Name fields</strong> – <code>firstName</code>, <code>first_name</code>, <code>givenName</code> &rarr; <code>person.firstName()</code>; <code>lastName</code>, <code>last_name</code>, <code>surname</code>, <code>familyName</code> &rarr; <code>person.lastName()</code>; <code>name</code>, <code>fullName</code>, <code>displayName</code> &rarr; <code>person.fullName()</code></li>
<li><strong>Email</strong> – <code>email</code>, <code>emailAddress</code>, <code>userEmail</code> &rarr; <code>internet.email()</code></li>
<li><strong>Phone</strong> – <code>phone</code>, <code>telephone</code>, <code>mobile</code>, <code>phoneNumber</code>, <code>cell</code> &rarr; <code>phone.number()</code></li>
<li><strong>Gender</strong> – <code>gender</code>, <code>sex</code> &rarr; <code>person.sex()</code></li>
<li><strong>Date of birth</strong> – <code>dob</code>, <code>birthdate</code>, <code>dateOfBirth</code>, <code>birthday</code> &rarr; <code>date.birthdate()</code></li>
<li><strong>Avatar</strong> – <code>avatar</code>, <code>profileImage</code>, <code>photo</code>, <code>picture</code> &rarr; <code>image.avatar()</code></li>
<li><strong>Bio</strong> – <code>bio</code>, <code>biography</code>, <code>about</code> &rarr; <code>lorem.paragraph()</code></li>
</ul>

<h3>Address Data</h3>

<ul>
<li><code>street</code>, <code>streetAddress</code>, <code>address1</code> &rarr; <code>location.streetAddress()</code></li>
<li><code>city</code>, <code>town</code> &rarr; <code>location.city()</code></li>
<li><code>state</code>, <code>province</code>, <code>region</code> &rarr; <code>location.state()</code></li>
<li><code>zip</code>, <code>zipCode</code>, <code>postalCode</code> &rarr; <code>location.zipCode()</code></li>
<li><code>country</code>, <code>countryName</code> &rarr; <code>location.country()</code></li>
<li><code>countryCode</code> &rarr; <code>location.countryCode()</code></li>
<li><code>latitude</code>, <code>lat</code> &rarr; <code>location.latitude()</code></li>
<li><code>longitude</code>, <code>lng</code>, <code>lon</code> &rarr; <code>location.longitude()</code></li>
<li><code>timezone</code>, <code>tz</code> &rarr; <code>location.timeZone()</code></li>
</ul>

<h3>Business Data</h3>

<ul>
<li><code>company</code>, <code>companyName</code>, <code>organization</code>, <code>employer</code> &rarr; <code>company.name()</code></li>
<li><code>jobTitle</code>, <code>position</code>, <code>occupation</code>, <code>role</code> &rarr; <code>person.jobTitle()</code></li>
<li><code>department</code>, <code>division</code>, <code>team</code> &rarr; <code>commerce.department()</code></li>
<li><code>industry</code> &rarr; <code>company.buzzNoun()</code></li>
<li><code>catchPhrase</code>, <code>slogan</code>, <code>tagline</code> &rarr; <code>company.catchPhrase()</code></li>
</ul>

<h3>Internet and Technical Data</h3>

<ul>
<li><code>url</code>, <code>website</code>, <code>homepage</code>, <code>link</code> &rarr; <code>internet.url()</code></li>
<li><code>domain</code>, <code>domainName</code> &rarr; <code>internet.domainName()</code></li>
<li><code>username</code>, <code>handle</code>, <code>login</code> &rarr; <code>internet.userName()</code></li>
<li><code>password</code> &rarr; <code>internet.password()</code></li>
<li><code>ip</code>, <code>ipAddress</code>, <code>ipv4</code> &rarr; <code>internet.ipv4()</code></li>
<li><code>ipv6</code> &rarr; <code>internet.ipv6()</code></li>
<li><code>mac</code>, <code>macAddress</code> &rarr; <code>internet.mac()</code></li>
<li><code>userAgent</code>, <code>ua</code> &rarr; <code>internet.userAgent()</code></li>
<li><code>port</code> &rarr; <code>internet.port()</code></li>
<li><code>color</code>, <code>colour</code>, <code>hex</code> &rarr; <code>color.rgb()</code></li>
</ul>

<h3>Financial Data</h3>

<ul>
<li><code>price</code>, <code>amount</code>, <code>cost</code>, <code>total</code>, <code>subtotal</code> &rarr; <code>commerce.price()</code></li>
<li><code>currency</code>, <code>currencyCode</code> &rarr; <code>finance.currencyCode()</code></li>
<li><code>iban</code> &rarr; <code>finance.iban()</code></li>
<li><code>bic</code>, <code>swift</code> &rarr; <code>finance.bic()</code></li>
<li><code>creditCard</code>, <code>cardNumber</code> &rarr; <code>finance.creditCardNumber()</code></li>
<li><code>accountNumber</code> &rarr; <code>finance.accountNumber()</code></li>
<li><code>routingNumber</code> &rarr; <code>finance.routingNumber()</code></li>
</ul>

<h3>Datetime Fields</h3>

<ul>
<li><code>createdAt</code>, <code>created</code>, <code>dateCreated</code>, <code>insertedAt</code> &rarr; <code>date.past()</code></li>
<li><code>updatedAt</code>, <code>modified</code>, <code>lastModified</code>, <code>editedAt</code> &rarr; <code>date.recent()</code></li>
<li><code>deletedAt</code>, <code>archivedAt</code> &rarr; <code>date.past()</code> (with nullable annotation)</li>
<li><code>publishedAt</code>, <code>releasedAt</code> &rarr; <code>date.past()</code></li>
<li><code>expiresAt</code>, <code>expiry</code>, <code>validUntil</code> &rarr; <code>date.future()</code></li>
<li><code>scheduledAt</code>, <code>startDate</code> &rarr; <code>date.soon()</code></li>
</ul>

<h3>Identifiers</h3>

<ul>
<li><code>id</code>, <code>_id</code>, <code>uid</code> &rarr; <code>number.int()</code> (or <code>string.uuid()</code> if the inferred type is string)</li>
<li><code>uuid</code>, <code>guid</code> &rarr; <code>string.uuid()</code></li>
<li><code>slug</code> &rarr; <code>helpers.slugify(lorem.words())</code></li>
<li><code>hash</code>, <code>checksum</code>, <code>token</code> &rarr; <code>string.alphanumeric(32)</code></li>
<li><code>sku</code> &rarr; <code>commerce.isbn()</code></li>
<li><code>barcode</code>, <code>ean</code> &rarr; <code>commerce.isbn(13)</code></li>
</ul>

<h2>How AI Detection Works</h2>

<p>When AI detection is enabled, the generator collects all field names that were not matched by regex patterns and sends them to the AI provider in a single batch request. The prompt includes the field names, their inferred JSON Schema types, and the names of neighboring fields for context.</p>

<p>The AI model responds with a JSON object mapping each field name to a suggested Faker.js method path. These suggestions are validated against the list of known Faker.js methods before being applied. Invalid suggestions are discarded and the field falls back to type-based generation.</p>

<p>The AI is particularly effective for:</p>

<ul>
<li><strong>Abbreviated names</strong> – <code>fn</code> (first name), <code>addr</code> (address), <code>qty</code> (quantity), <code>dob</code> (date of birth)</li>
<li><strong>Domain-specific codes</strong> – <code>iata</code> (airport code), <code>isbn</code>, <code>npi</code> (healthcare provider ID)</li>
<li><strong>Context inference</strong> – A field named <code>token</code> next to fields named <code>expiresAt</code> and <code>userId</code> is recognized as an auth token, not a payment token</li>
<li><strong>Unconventional naming</strong> – Legacy schemas with names like <code>CUST_FIRST_NM</code> or <code>acct_no</code></li>
</ul>

<h2>AI Providers Supported</h2>

<p>Three AI providers are supported. The active provider is configured server-side via the <code>AI_PROVIDER</code> environment variable.</p>

<ul>
<li><strong>Google Gemini</strong> (default) – Fastest response times, best accuracy for common field patterns. Uses <code>GOOGLE_API_KEY</code>.</li>
<li><strong>OpenAI</strong> – Compatible with any OpenAI-format API including local LM Studio deployments. Uses <code>OPENAI_BASE_URL</code> and <code>OPENAI_MODEL</code>.</li>
<li><strong>Cloudflare Workers AI</strong> – Runs in the Cloudflare edge network. Uses <code>CLOUDFLARE_MODEL</code> and requires the <code>wrangler dev --remote</code> runtime.</li>
</ul>

<p>End users do not configure the provider — the server selects it based on the deployment environment. The AI feature is entirely opt-in; if you do not click "AI Analysis", no external calls are made.</p>

<h2>Tips for Better Detection</h2>

<h3>Use Descriptive Field Names</h3>

<p>The more descriptive the field name, the more likely it is to match a pattern. Compare:</p>

<ul>
<li><code>e</code> &rarr; No match (falls back to lorem)</li>
<li><code>em</code> &rarr; No match</li>
<li><code>email</code> &rarr; Matches <code>internet.email()</code></li>
<li><code>userEmail</code> &rarr; Matches <code>internet.email()</code></li>
<li><code>primaryEmailAddress</code> &rarr; Matches <code>internet.email()</code></li>
</ul>

<h3>Follow Standard Naming Conventions</h3>

<p>The regex patterns are designed around camelCase (JavaScript/TypeScript convention). Both camelCase and snake_case variants are covered for most patterns, but camelCase produces the most reliable matches:</p>

<ul>
<li><code>firstName</code> and <code>first_name</code> – Both match</li>
<li><code>createdAt</code> and <code>created_at</code> – Both match</li>
<li><code>phoneNumber</code> and <code>phone_number</code> – Both match</li>
</ul>

<h3>Use Common Patterns for Nested Objects</h3>

<p>When a field is nested inside an object, the detector sees the leaf field name, not the full path. A field at <code>contact.email</code> is detected by looking at just <code>email</code>. Keeping leaf field names conventional produces better results than relying on parent object names for disambiguation.</p>

<h2>What Happens When Detection Fails</h2>

<p>When neither regex nor AI detection produces a result for a field, the generator falls back to type-based generation:</p>

<ul>
<li><code>string</code> &rarr; <code>lorem.words(3)</code> (3 random words)</li>
<li><code>integer</code> &rarr; <code>number.int({ min: 1, max: 1000 })</code></li>
<li><code>number</code> (decimal) &rarr; <code>number.float({ min: 0, max: 1000, fractionDigits: 2 })</code></li>
<li><code>boolean</code> &rarr; <code>datatype.boolean()</code></li>
<li><code>array</code> &rarr; Array of 2–5 type-based items</li>
<li><code>object</code> &rarr; Empty object <code>{}</code></li>
</ul>

<p>Type-based fallback always produces valid data of the correct type, just not semantically meaningful data. If you see fields generating <code>"lorem ipsum"</code> style output, it means the semantic detector did not recognize the field name. Renaming the field or enabling AI analysis will resolve this.</p>

<h2>The x-faker Extension Format</h2>

<p>Internally, detected semantics are stored as a custom JSON Schema extension property named <code>x-faker</code>. This extension is attached to each property object in the enriched schema:</p>

<pre><code>{
  "type": "object",
  "properties": {
    "firstName": {
      "type": "string",
      "x-faker": {
        "method": "person.firstName",
        "args": []
      }
    },
    "age": {
      "type": "integer",
      "x-faker": {
        "method": "number.int",
        "args": [{ "min": 18, "max": 99 }]
      }
    }
  }
}
</code></pre>

<ul>
<li><code>method</code> – Dot-notation path to the Faker.js method. The generator calls <code>faker[namespace][method](...args)</code>.</li>
<li><code>args</code> – Array of arguments passed to the Faker.js method. Can be empty, a single options object, or multiple positional arguments.</li>
</ul>

<p>You can add or override <code>x-faker</code> extensions manually in your JSON Schema to force a specific Faker.js method for any field. This gives you full control when the automatic detection does not produce the result you want. Valid method paths are anything supported by the installed version of <code>@faker-js/faker</code>.</p>

<h2>Schema Before and After Semantic Enrichment</h2>

<p><strong>Input schema (from JSON sample inference):</strong></p>

<pre><code>{
  "type": "object",
  "properties": {
    "id":        { "type": "integer" },
    "firstName": { "type": "string" },
    "lastName":  { "type": "string" },
    "email":     { "type": "string", "format": "email" },
    "phone":     { "type": "string" },
    "company":   { "type": "string" },
    "createdAt": { "type": "string", "format": "date-time" }
  },
  "required": ["id", "firstName", "lastName", "email"]
}
</code></pre>

<p><strong>Enriched schema after semantic detection:</strong></p>

<pre><code>{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer",
      "x-faker": { "method": "number.int", "args": [{ "min": 1, "max": 99999 }] }
    },
    "firstName": {
      "type": "string",
      "x-faker": { "method": "person.firstName", "args": [] }
    },
    "lastName": {
      "type": "string",
      "x-faker": { "method": "person.lastName", "args": [] }
    },
    "email": {
      "type": "string",
      "format": "email",
      "x-faker": { "method": "internet.email", "args": [] }
    },
    "phone": {
      "type": "string",
      "x-faker": { "method": "phone.number", "args": [] }
    },
    "company": {
      "type": "string",
      "x-faker": { "method": "company.name", "args": [] }
    },
    "createdAt": {
      "type": "string",
      "format": "date-time",
      "x-faker": { "method": "date.past", "args": [] }
    }
  },
  "required": ["id", "firstName", "lastName", "email"],
  "x-ai-coherence": [["firstName", "lastName", "email"]]
}
</code></pre>

<p>The <code>x-ai-coherence</code> array at the root level lists groups of fields that should be generated together for coherence. When <code>firstName</code>, <code>lastName</code>, and <code>email</code> are grouped, the generator ensures the email address uses a variation of the generated name (e.g., <code>alice.johnson@example.com</code> for Alice Johnson) instead of an unrelated random email.</p>
`,
  },
];

export function getDocPage(slug: string): DocPage | undefined {
  return docPages.find((p) => p.slug === slug);
}

export function getAllDocPages(): DocPage[] {
  return docPages;
}
