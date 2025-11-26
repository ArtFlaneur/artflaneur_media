# Art Flaneur Media

Contemporary art exhibitions, reviews, and artist stories.

## Project Structure

This is a monorepo containing:

- **apps/studio** - Sanity Studio for content management
- **apps/web** - Frontend (coming soon)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+

Install pnpm globally if you haven't:

# Art Flaneur Media Studio

Sanity Studio for managing contemporary art exhibitions, reviews, and artist stories.

## Project structure

- `apps/studio` – Sanity Studio configuration (this package)
- `apps/web` – Frontend web client

## Getting started

### Prerequisites

- Node.js 18+
- pnpm 9+

Install dependencies from the repository root:

```bash
pnpm install
```

## Syncing Directus content

Populate Sanity with galleries, artists, and exhibitions from Directus so editors can select them via references.

1. Provide environment variables (`.env` works):
	- `SANITY_STUDIO_PROJECT_ID`
	- `SANITY_STUDIO_DATASET`
	- `SANITY_API_TOKEN`
	- `DIRECTUS_URL`
	- `DIRECTUS_TOKEN`
2. Run the sync script:

```bash
pnpm --filter @artflaneur/studio sync:directus
```

По умолчанию скрипт обновляет только галереи и художников. Чтобы добавить другие коллекции, передайте их список через запятую:

```bash
pnpm --filter @artflaneur/studio sync:directus galleries,artists
pnpm --filter @artflaneur/studio sync:directus galleries,artists,exhibitions
```

The script paginates Directus data, batches Sanity mutations, and records the `syncedAt` timestamp on each document for auditing.

## Removing exhibitions

To fully clear all exhibition documents from the connected Sanity dataset, provide the same Sanity credentials (.env works) and run:

```bash
pnpm --filter @artflaneur/studio clear:exhibitions
```

The script counts existing exhibition docs, removes them in a single query, and logs progress so you can confirm the dataset is clean.