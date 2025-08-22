# Personal Finance Pro

A best-in-class personal finance tool built with Next.js for Vercel.

## Features

- Dashboard with balances, spending, and net worth trends
- Transactions import (CSV) and listing
- Zero-based budgeting
- Investments tracker with live quotes
- FIRE calculator and dashboard
- Local-first state with backup/restore

## Local Development

To get started with local development, you'll need to have Node.js and Docker installed.

1.  **Install dependencies:**

    ```bash
    pnpm i # or npm i / yarn
    ```

2.  **Set up the database:**

    This project uses PostgreSQL. You can run a local instance using Docker:

    ```bash
    docker run --name personal-finance-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
    ```

    This will start a PostgreSQL container named `personal-finance-db` with the password `password`.

    Next, you need to create the database and tables. You can use a tool like `psql` or a GUI client to connect to the database and run the schema script.

    ```bash
    # (assuming you have psql installed)
    psql -h localhost -U postgres -d postgres -f db/schema.sql
    ```

    You will also need to create a `.env.local` file with the database connection string. See `.env.example` for the format.

3.  **Run the development server:**

    ```bash
    pnpm dev
    ```

## Deploy to Vercel

- Push to Git and import this repo into Vercel
- Framework: Next.js, Root: `./`
- Build Command: `next build`, Output: `.next`
- Ensure Node 18+ runtime

## CSV Format

- Supports common bank exports; map columns: `date|posted`, `description|memo|name`, `amount|debit|credit`

## Environment

- None required for core features. Quotes use Yahoo Finance public endpoints.
