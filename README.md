# Film Drop — LACC Cinema & Television

Self-hosted student film upload portal for the end-of-year showcase. Files land directly on the NAS with original filenames baked from student metadata.

## Stack

- Node.js + Express + Multer
- Single-container Docker image published to GHCR via GitHub Actions
- Files written to a host-mounted volume as plain files — no database, no UUIDs

## Filename format

Uploaded files are renamed on arrival:

```
Jane_Doe__Cinema_012__Trudgeon__2025-05-17T14-30-00.mp4
```

Fields: `studentName` + optional `classNumber` + optional `professor` + ISO timestamp + original extension.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `UPLOAD_PASS` | No | Password students must enter to upload. Leave unset for open uploads. |
| `UPLOAD_DIR` | No | Path inside the container where files are written. Default: `/data` |
| `PORT` | No | Port the server listens on. Default: `3000` |

## Deploy

```bash
# 1. Copy .env.example to .env and fill in all three values
cp .env.example .env

# 2. Create the upload directory (using whatever path you set in .env)
mkdir -p "$(grep UPLOAD_HOST_PATH .env | cut -d= -f2)"

# 3. Pull and run
docker compose up -d
```

The app will be available on port `3035`. Point Nginx Proxy Manager at it and add to the advanced tab:

```nginx
client_max_body_size 0;
proxy_read_timeout 3600;
proxy_send_timeout 3600;
proxy_request_buffering off;
```

## Local development

```bash
cd app
npm install
UPLOAD_PASS=dev UPLOAD_DIR=./uploads PORT=3000 node server.js
```

## GitHub Actions

On every push to `main` that touches `app/`, the workflow:
1. Builds the Docker image
2. Pushes it to `ghcr.io/<your-org>/film-drop:latest`

The `compose.yaml` pulls from GHCR so your server always gets the latest build with `docker compose pull && docker compose up -d`.

## Updating classes or professors

Edit `app/public/index.html` — the two `<select>` blocks near the top of the form. Push to `main` and the Action will rebuild and push the image automatically.
