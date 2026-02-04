# OpenNext Starter

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Read the documentation at https://opennext.js.org/cloudflare.

## Develop

Run the Next.js development server:

```bash
npm run dev
# or similar package manager command
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Preview

Preview the application locally on the Cloudflare runtime:

```bash
npm run preview
# or similar package manager command
```

## Deploy

Deploy the application to Cloudflare:

```bash
npm run deploy
# or similar package manager command
```

## AI-Enhanced Mock Data Generation

This project supports AI-powered semantic detection using Cloudflare Workers AI. When enabled, the AI analyzes your entire schema to:

- **Detect semantic types** for fields with complex names (e.g., `buyerFirstName` → firstName)
- **Identify domain context** (e-commerce, healthcare, social media, etc.)
- **Group related fields** for coherent data generation (same person's name and email)

### Configuration

AI enhancement is configured via environment variables:

| Variable               | Default                              | Description                     |
| ---------------------- | ------------------------------------ | ------------------------------- |
| `AI_ENABLED`           | `true`                               | Enable/disable AI enhancement   |
| `AI_MODEL`             | `@cf/meta/llama-3.1-8b-instruct-fp8` | Cloudflare Workers AI model     |
| `AI_MAX_TOKENS`        | `1024`                               | Maximum tokens for AI response  |
| `AI_TEMPERATURE`       | `0.7`                                | AI response temperature (0-2)   |
| `AI_FALLBACK_ON_ERROR` | `true`                               | Fall back to regex on AI errors |

### Local Development

For local development, add these to your `.dev.vars` file:

```bash
AI_ENABLED=true
AI_MODEL=@cf/meta/llama-3.1-8b-instruct-fp8
```

Note: AI features require `wrangler dev --remote` to access Cloudflare Workers AI.

### Example Improvement

**Without AI (regex-based):**

```json
{
  "buyerFirstName": "xK7mP2",
  "buyerLastName": "qW9nL4",
  "buyerEmail": "test@example.com"
}
```

**With AI enhancement:**

```json
{
  "buyerFirstName": "John",
  "buyerLastName": "Smith",
  "buyerEmail": "john.smith@example.com"
}
```

### Disabling AI

To use only regex-based detection, set `AI_ENABLED=false` in your environment or `.dev.vars` file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
