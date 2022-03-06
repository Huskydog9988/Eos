# Getting Started

> Prerequisites

-   [Node.js 16](https://nodejs.org/en/) or later
-   [Yarn](https://yarnpkg.com/getting-started/install)
-   [Docker](https://docs.docker.com/get-docker/)

## Install Dependencies

```bash
yarn install
```

## Setup Enviroment

Setups the Postgres for development

> Make sure to modify the `DATABASE_URL` field in the root `.env` file and the one at `crawler/prisma/.env`

```bash
yarn crawler setup
```

## Flags

Comment in/out envrioment variables like `NOADD` or `NONEWJOBS` to enable/disable various features. See their respective comments to understand what they do.

## Crawler Commands

Build the crawler

```bash
yarn crawler build
```

Start the crawler

```bash
yarn crawler start
```

Run version of crawler

```bash
yarn crawler dev
```
