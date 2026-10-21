# Schrottkarte

A shared map for collecting scrap spots. Team members place markers, track them from new to marked to done, and plan areas and routes on top of the map.

Copy `.env.example` to `.env`, set `BETTER_AUTH_SECRET` (`openssl rand -base64 32`) and, for production, `ORIGIN` to the public URL. Then run:

```bash
# production
docker compose up -d --build

# development
pnpm install
pnpm dev
```

In production the app is expected behind an HTTPS reverse proxy. To test the Docker image locally over plain HTTP, set `ORIGIN=http://localhost:3000` and build with the same origin, otherwise form submissions are rejected with 403:

```bash
docker compose build --build-arg BUILD_ORIGIN=http://localhost:3000
docker compose up -d
```
