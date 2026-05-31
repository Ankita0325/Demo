# Damusia - Startup Validation Landing Page

Damusia is a modern, responsive, premium startup validation MVP landing page designed to measure market demand and collect high-intent early interest sign-ups before building a full-scale product.

It is built with **Next.js 15 (Next.js 16)**, **TypeScript**, **Tailwind CSS**, and integrates with **Supabase** for database storage and click logs.

---

## 🚀 Interest-Validation Features

- **Single-Page Design**: Mobile-first responsive layout with floating animations, glowing glassmorphic panels, and glowing radial background lights.
- **Social Proof Counter**: Interactive banner showing live interest counter: `"🔥 428 people already interested"` (querying the database in real-time).
- **Popup Interest Form**: Centered backdrop-blur modal collecting **Name**, **Phone Number**, **Gender**, and **Date of Birth**.
- **Database-Driven Duplicate Prevention**: Does **not** write any data to `localStorage`. Instead, when the form is submitted, the backend queries the database directly to check if the `phone` number has already shown interest under `project_id: "damusia"`.
- **Input Validations**: Enforces minimum name lengths, valid phone number formatting, and logical age/date limits.
- **Google Analytics**: Performance-optimized deferred GA tag script placeholder.
- **CI/CD Pipeline**: Pre-configured GitHub Actions pipeline validating compilation and lint quality automatically on pushes.

---

## 📂 Folder Structure

```text
damusia/
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI pipeline
├── app/
│   ├── globals.css            # Dark/Light theme colors & animations
│   ├── layout.tsx             # Root layout with fonts, SEO tags, & GA Script
│   └── page.tsx               # Main landing page layout
├── components/
│   ├── GoogleAnalytics.tsx    # Google Analytics script hook
│   └── WaitlistModal.tsx      # Modal form collecting Name, Phone, Gender, and DOB
├── lib/
│   └── supabase.ts            # Client client configuration & duplicate-checking helpers
├── public/
│   ├── favicon.ico            # Favicon asset
│   ├── logo.png               # Main brand image (utilized in Navbar & Footer)
│   └── og-image.png           # OG preview card image
├── supabase_schema.sql        # Database initialization SQL scripts
├── package.json               # Dependencies and lint scripts
├── tsconfig.json              # TypeScript configuration
└── README.md                  # Project instructions & Master Prompt
```

---

## ⚙️ Setup & Installation

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Environment variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-public-anon-key
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 3. Initialize Supabase Database

Run the following query in your Supabase project's SQL Editor to configure the schema:

```sql
-- 1. Create interested_users table
CREATE TABLE IF NOT EXISTS interested_users (
  id BIGSERIAL PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  gender TEXT NOT NULL,
  dob DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- Enforce unique constraint per project to prevent duplicate signups
  CONSTRAINT unique_project_phone UNIQUE (project_id, phone)
);

-- 2. Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id BIGSERIAL PRIMARY KEY,
  project_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  clicked_join BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE interested_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies to allow anonymous public insertions
CREATE POLICY "Allow public insert to interested_users" ON interested_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert to analytics" ON analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read of interest counts" ON interested_users FOR SELECT USING (true);
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the landing page.

---

## 🧪 Testing & Validation

This project has a production-ready validation pipeline to ensure high code quality, security, and performance.

### Verification Scripts

You can run these scripts locally to verify your code before submitting a Pull Request:

- **`npm run lint`** (Code Quality Check)
  - _What it does:_ Analyzes JavaScript and TypeScript files using ESLint for formatting rules, syntax patterns, and potential logic bugs.
- **`npm run format:check`** (Style Consistency Check)
  - _What it does:_ Checks if code files match the Prettier style guidelines. You can automatically fix formatting using `npm run format:write`.
- **`npm run typecheck`** (Type Safety Check)
  - _What it does:_ Compiles the TypeScript project (`tsc --noEmit`) to verify that all component props, types, and variables are correctly declared.
- **`npm run test`** (Unit & Integration Tests)
  - _What it does:_ Runs unit tests using Vitest and React Testing Library to verify Supabase mock data queries and React component rendering logic.
- **`npm run test:e2e`** (End-to-End Browser Tests)
  - _What it does:_ Runs Playwright tests that compile the production app, start the web server in the background, and simulate real browser user flows (e.g. clicking buttons, verifying waitlist form elements).
- **`npm run build`** (Production Compilation)
  - _What it does:_ Runs Next.js production build compiler to ensure there are no bundling or routing issues.

### CI/CD Pipeline Checks

When you push code or open a Pull Request, GitHub Actions automatically executes these checks in parallel:

1.  **ESLint Code Quality** (Runs `npm run lint`)
2.  **Code Formatting (Prettier)** (Runs `npm run format:check`)
3.  **TypeScript Type Check** (Runs `npm run typecheck`)
4.  **Vitest Unit Tests** (Runs `npm run test`)
5.  **Dependency Vulnerability Audit** (Runs `npm audit --audit-level=high` to detect dangerous packages)
6.  **Playwright E2E Tests** (Runs `npm run test:e2e` in browser container)
7.  **Lighthouse Performance Audit** (Uses Lighthouse to measure Performance, Accessibility, and SEO scores)
8.  **GitGuardian Secret Detection** (Uses GitGuardian to prevent accidental leaks of API tokens/keys)
9.  **Production Bundle Build** (Runs `npm run build`)

---

## 🔄 Adjusting the Project ID

To test a different venture idea using the same codebase, change the active identifier in `app/page.tsx`:

1. Open [app/page.tsx](file:///d:/DAMUSIA/damusia/app/page.tsx).
2. Edit the constant at the top of the component:
   ```typescript
   const activeProjectId = "my-new-startup";
   const activeProjectName = "My Startup Name";
   ```
3. Submissions and click analytics will automatically log under this new `project_id`.

---

## 📝 Master Prompt

To replicate this startup validation interest page in another workspace, paste this prompt into your AI agent:

```text
Build a premium startup validation landing page called "Damusia" using Next.js (App Router), TypeScript, and Tailwind CSS.

Platform Requirements:
1. Validation Scope: Focus on a single venture with project_id "damusia". Avoid "join waitlist", "register" or "join now" wording, replacing them with interest-based CTAs like "I'm Interested" and "Get Early Access".
2. Dark / Light Mode: A toggle switch updating global background, text, and card themes.
3. Database Setup: Use a single Supabase project with one shared table structure containing a project_id column.
4. Schema Details:
   - table "interested_users": fields (id bigserial primary key, project_id text, name text, phone text, gender text, dob date, created_at timestamp, CONSTRAINT unique_project_phone UNIQUE(project_id, phone))
   - table "analytics": fields (id bigserial primary key, project_id text, visitor_id text, clicked_join bool, created_at timestamp)
5. Form Modal: Blur-backdrop popup collecting Name, Phone, Gender, and DOB (no email). Enforce name length >= 2, numeric phone format, and logical date of birth.
6. Real-time duplicate check: Do NOT use localStorage. When form is submitted, query Supabase to verify if the phone number has already shown interest for the active project. If duplicate, show a validation warning: "This phone number has already shown interest."
```
