# Enterprise Admin Dashboard (Performo)

A modern, secure, and professional full-stack administrative tool designed for internal company management. Built with the latest Next.js features and a focus on clean architecture and security.

---

## Tech Stack

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling & Motion:** [Tailwind CSS](https://tailwindcss.com/), Framer Motion (Transitions & Micro-Animations)
- **Data Visualization:** [Recharts](https://recharts.org/) (Real-Time Metrics)
- **Database:** [SQLite](https://www.sqlite.org/) (via [Prisma ORM](https://www.prisma.io/))
- **Authentication:** Custom JWT-based sessions with HTTP-only Cookies (using `jose`)
- **Security:** Password hashing with `bcryptjs`, server-side role validation, and protected middleware.

---

## Core Features

- **Employee Task Delegation & Tracking:** Assign strategic tasks to employees across departments, set deadlines, and monitor real-time execution across TODO, IN_PROGRESS, and DONE states.
- **Daily Work Logs & Time Tracking:** Minute-by-minute work logging attached to specific tasks, enabling accurate time allocation tracking and employee self-reporting.
- **Daily Routine Compliance Checks:** Configurable daily routine checklists ensuring standard operating procedures and operational compliance.
- **Productivity & Department Comparison:** Interactive Recharts analytics visualizing team productivity, department time distributions, and cross-team operational performance.
- **Employee Directory & Onboarding:** Manage user profiles, assign corporate roles/departments, and oversee employee lifecycles with self-deletion safeguards.
- **Role-Based Access Control (RBAC):**
    - `ADMIN`: Full management command center across tasks, employees, daily logs, and system analytics.
    - `USER`: Personal dashboard for managing assigned tasks, logging work hours, and submitting daily routine reports.
- **Enterprise-Grade Security:** Custom JWT session handling in HTTP-only cookies (`jose`), password hashing via `bcryptjs`, and server-side protected route middleware.
- **Modern UI & Micro-Animations:** Built with Next.js 16 App Router, Tailwind CSS, and Framer Motion micro-interactions.

---

## Business Value & Target Audience

- **Target Audience:** Operations leads, department managers, and HR teams managing distributed or hybrid corporate workforces.
- **Value Proposition:** Eliminates disjointed spreadsheets and manual check-ins by providing a single, unified operations portal for delegating tasks, tracking daily work hours, and analyzing team productivity in real time.

## Monetization & Go-to-Market Strategy

- **Pricing Model:** Pay-per-seat SaaS subscription ($4/month per active user).
- **Enterprise Plan:** Dedicated deployments with custom department reporting and SSO integration.
- **Go-to-Market:** Product-led outreach to team leads and operations managers seeking visibility into daily project progress and time distribution.

---

## Folder Structure

```text
├── prisma/
│   ├── schema.prisma    # Database models and configuration
│   ├── seed.ts         # Initial data seeding (Admin user)
│   └── dev.db           # Local SQLite database
├── src/
│   ├── app/             # Next.js App Router (Pages & API)
│   │   ├── actions/     # Server Actions for Auth & Business logic
│   │   ├── admin/       # Management Console
│   │   ├── dashboard/   # User Dashboard
│   │   └── login/       # Authentication Pages
│   ├── components/      # Reusable UI Components (Navbar, Buttons, Forms)
│   ├── lib/             # Core Utilities (Auth helpers, Prisma client, Session)
│   └── middleware.ts    # Global Route Protection
├── .env                 # Environment variables
└── package.json         # Project dependencies and scripts
```

---

## Installation and Setup

### 1. Clone the repository
```bash
git clone https://github.com/yigitsarpavci/enterprise-admin-dashboard.git
cd enterprise-admin-dashboard
```

### 2. Install dependencies
```bash
npm install
```

### 3. Database Setup
Ensure you have your environment variables configured in a `.env` file:
```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="your-super-secure-secret-key"
```

Then, sync your database schema:
```bash
npx prisma db push
```

### 4. Seed Default Admin
Generate the initial administrator account:
```bash
npm run seed
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---


## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Connection string (SQLite for dev, PostgreSQL for prod) |
| `SESSION_SECRET` | ✅ | Cryptographic secret for `jose` JWT cookies |
| `NEXT_PUBLIC_APP_URL` | Optional | Base URL for internal API routing |

## Default Admin Credentials

Use these credentials to access the management features after seeding:

- **Username:** `admin`
- **Password:** `admin12345`

---

Built for professional company management by Yigit Sarp Avci.
