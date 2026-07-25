# Judge0 Configuration

This directory contains Judge0-related configuration and notes.

## Self-Hosting via Docker Compose

Judge0 runs as part of the `docker-compose.yml` in the project root. It has its **own** separate Postgres and Redis instances (required by Judge0 internally).

## Sandbox Limits (configured in docker-compose.yml)

| Setting | Value | Notes |
|---|---|---|
| CPU Time Limit | 5 seconds | Per submission |
| Wall Time Limit | 10 seconds | Includes I/O waiting |
| Memory Limit | 256 MB | Per submission |
| Stack Limit | 128 MB | |
| Max Processes | 60 | Prevents fork bombs |

## Supported Languages (MVP)

| Language | Judge0 Language ID |
|---|---|
| C++ (GCC 10.2.0) | 54 |
| Python (3.8.1) | 71 |
| Java (OpenJDK 13.0.1) | 62 |
| JavaScript (Node 12.14.0) | 63 |

## API Endpoints

- **Submit**: `POST http://localhost:2358/submissions?wait=true`
- **Get result**: `GET http://localhost:2358/submissions/:token`
- **Languages**: `GET http://localhost:2358/languages`

## Rate Limiting Strategy
- Max 5 submissions per user per minute during a duel
- Max 10 "run" (sample test) executions per user per minute
- Implemented via Redis in the backend, not at the Judge0 level
