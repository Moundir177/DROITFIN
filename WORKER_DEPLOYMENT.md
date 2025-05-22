# Deploying Cloudflare Workers with Pages

This guide explains how to deploy the full application, including both the static content (Pages) and the backend API (Workers).

## Why We Need Workers

The admin interface and other dynamic features require persistent data storage. While the local development server uses browser localStorage, the deployed version needs a server-side storage solution. We use Cloudflare Workers and KV storage for this purpose.

## Prerequisites

- A Cloudflare account
- Wrangler CLI installed (included in the project's dependencies)
- Access to the project's Cloudflare Pages settings

## Deployment Steps

### 1. Create a KV Namespace

First, you need to create a KV namespace to store your application data:

```bash
npm run init:kv
```

This will output a namespace ID that looks something like `xxxx-xxxx-xxxx-xxxx-xxxx`.

### 2. Configure the Worker

Edit the `wrangler.toml` file and replace the placeholder KV namespace ID with your actual ID:

```toml
kv_namespaces = [
  { binding = "DROIT_KV", id = "your-kv-namespace-id-will-be-here" }
]
```

### 3. Deploy Everything (Pages + Worker)

To deploy both the static content and the Worker at once:

```bash
npm run deploy:full
```

Alternatively, you can deploy them separately:

```bash
# Deploy just the static content
npm run deploy

# Deploy just the Worker
npm run deploy:worker
```

## Troubleshooting

### Admin Interface Not Working After Deployment

If the admin interface works locally but not in the deployed version:

1. Check if the Worker was deployed properly using the Cloudflare dashboard
2. Verify that the KV namespace is correctly bound to the Worker
3. Check browser console for any API errors

### Testing the Worker Locally

You can test the Worker locally before deploying:

```bash
npx wrangler dev
```

## How It Works

- Static files are deployed to Cloudflare Pages
- API requests (starting with `/api/`) are routed to the Worker
- The Worker uses KV storage to persist data
- In development, the app uses localStorage
- In production, the app automatically detects the environment and uses the Worker API

## Initial Data Migration

When deploying for the first time, you may want to initialize the KV storage with some default data. You can use the `/api/initialize` endpoint by making a POST request to it after deployment. 