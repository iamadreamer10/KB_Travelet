# Deployment

## Vercel

Set the frontend project root to this repository.

Recommended Vercel environment variable:

`VITE_API_BASE_URL=/api`

This project uses Vue Router history mode, so `vercel.json` rewrites all routes to `index.html`.
API requests should go through the Vercel rewrite at `/api/*`, which forwards to Railway.

## Railway

Railway runs the JSON API from `server.js`.

Recommended settings:

- Start command: `npm run start`
- Root directory: repository root
- Exposed port: Railway `PORT` env is used automatically

## Local

- Frontend: `npm run dev`
- API: `npm run api`

For local frontend proxying, Vite uses `VITE_API_PROXY_TARGET` and defaults to `http://localhost:3000`.
