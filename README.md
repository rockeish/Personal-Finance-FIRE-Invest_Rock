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

```bash
pnpm i # or npm i / yarn
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
