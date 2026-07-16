# Housmata Academy LMS

A full-featured Learning Management System built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

---

## 🚀 Quick Start (Local Development)

```bash
npm install
npm run dev
```

The app runs in **offline/mock mode** by default using `localStorage`. All features work without a Supabase project.

---

## 🗄️ Connecting to Supabase (Production Database)

Follow these steps to enable the live database:

### Step 1 — Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in.
2. Click **New Project**, fill in the details, and wait for it to provision.

### Step 2 — Run the Database Migrations

In your Supabase project, navigate to **SQL Editor** and run the following files **in order**:

1. `supabase/migrations/20260531_init.sql` — Creates all tables, RLS policies, and seeds the instructor profile.
2. `supabase/migrations/20260601_update.sql` — Adds missing columns and creates the `student_progress` and `announcements` tables.

> **Tip**: Copy the entire contents of each file and paste into the SQL Editor, then click **Run**.

### Step 3 — Get Your API Keys

In your Supabase project, go to **Project Settings → API**:

- Copy the **Project URL**
- Copy the **anon / public** key

### Step 4 — Set Environment Variables

Create a `.env.local` file in the root of the project (copy from `.env.local.example`):

```bash
cp .env.local.example .env.local
```

Then fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 5 — Restart the Dev Server

```bash
npm run dev
```

On first load, the app will automatically detect the connected Supabase project and seed it with mock data if empty.

---

## 🧱 Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Framework   | Next.js 15 (App Router)           |
| Language    | TypeScript 5                      |
| Styling     | Tailwind CSS 4                    |
| Database    | Supabase (PostgreSQL + RLS)       |
| PDF/Cert    | jsPDF                             |
| QR Codes    | qrcode                            |
| Icons       | Lucide React                      |

---

## 👥 Default User Roles & Logins

| Role       | Email                     | Password      |
| :--------- | :------------------------ | :------------ |
| Admin      | `admin@housmata.com`      | `admin123`    |
| Instructor | `director@propertymax.co` | `instructor123` |
| Student    | `student@test.com`        | `student123`  |

> Credentials are defined in `src/lib/mockData.ts` and automatically seeded.

---

## 🗂️ Project Structure

```text
src/
├── app/
│   ├── lms/
│   │   ├── admin/         # Admin dashboard, cohorts, students, applications
│   │   ├── instructor/    # Instructor dashboard, attendance, grading
│   │   └── student/       # Student dashboard & credentials
│   └── verify/[code]/     # Public certificate verification
│
├── components/            # Shared UI components
└── lib/
    ├── db.ts              # Database abstraction (localStorage + Supabase sync)
    ├── mockData.ts        # Seed data & TypeScript types
    └── generatedQuizzes.ts # Quiz question banks
```

---

## 📦 Build for Production

```bash
npm run build
npm run start
```

---

## 🌐 Deploy on Vercel

1. Push your repo to GitHub.
2. Import the project on [Vercel](https://vercel.com).
3. Add the environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project settings.
4. Deploy!
# housmatalms
