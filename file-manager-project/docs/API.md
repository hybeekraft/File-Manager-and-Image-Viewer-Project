# API Reference

Base URL: `http://localhost:5000/api`

## Health

`GET /health`

Response:

```json
{ "status": "ok", "service": "file-manager-api" }
```

## List files

`GET /files`

Optional query parameters:

- `search`
- `type=image`

## Upload

`POST /files/upload`

Multipart form field:

```text
file
```

## Download

`GET /files/:id/download`

## Delete

`DELETE /files/:id`

## Stats

`GET /stats`

Returns total files, image files, and total bytes.
