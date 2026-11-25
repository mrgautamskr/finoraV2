# Finora — Financial Management

A React financial management app: track daily expenses & incomes, budgets, goals, accounts and reports. Mobile-first with glassmorphism UI, dark/light themes, PWA (installable on mobile).

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Features

- **Add expenses & incomes** — Dashboard form + account select; category datalist (salary, restaurants, groceries, groceries, transportation, …)
- **History** — All entries with edit/delete and filters (type, category, date range, search)
- **Budgets** — Per-category monthly budgets with spent/remaining/progress tracking
- **Goals** — Savings goals with targets and progress; log savings against each goal
- **Accounts** — Multiple accounts (checking, savings, …) with computed balances
- **Reports** — Category pie, monthly trends, exports (CSV/JSON)
- **Settings** — Currency, decimal places, date format, theme, custom categories

## Supabase sign-in (optional)

1. Create a project at https://supabase.com/dashboard.
2. Create the `finora_data` table and policies — paste into Dashboard → SQL Editor:

```sql
create table if not exists public.finora_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id)
);
alter table public.finora_data enable row level security;
create policy "Users can read their own finora data" on public.finora_data
  for select using (auth.uid() = user_id);
create policy "Users can insert their own finora data" on public.finora_data
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own finora data" on public.finora_data
  for update using (auth.uid() = user_id);
create policy "Users can delete their own finora data" on public.finora_data
  for delete using (auth.uid() = user_id);
```

3. Paste your project URL and anonymous key into `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) and restart the dev server (or run `npm run build` + `npm run preview` for production).
4. New users sign up with email/password — **new accounts start from zero** — and their data is stored on Supabase, so they can sign in from any browser and get their data.

Without Supabase configured, the app runs in local mode (data stored in the browser).

## Data model (local)

- `transactions` — expenses/incomes with kind, category, amount, date, description, accountId
- `budgets` — per-category monthly limits
- `goals` — savings goals with target/saved
- `accounts` — bank accounts; balance = openingBalance + income − expenses of that account
