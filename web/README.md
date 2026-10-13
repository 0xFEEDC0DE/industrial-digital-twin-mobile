Simple React + Vite dashboard that consumes /api/dashboard/overview and subscribes to /api/runtime/events via SSE.

Run locally:

cd web
npm install
npm run dev

Note: the dev server proxies /api to http://localhost:4000 so run the API locally.
