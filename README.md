# Enterprise Operations & Knowledge Platform (Performo)

A modern, secure, and professional full-stack enterprise operations platform coupling workforce delegation with a decoupled Express 5 REST API and Knowledge Base (SOP/FAQ) engine. Built with Next.js 16, TypeScript, TypeORM, Prisma, Recharts, and test-driven architecture (Jest + Supertest).

---

## Tech Stack

### Frontend & UI
- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling & Motion:** [Tailwind CSS v4](https://tailwindcss.com/), Framer Motion (Transitions & Micro-Animations)
- **Data Visualization:** [Recharts](https://recharts.org/) (Real-Time Productivity & Department Metrics)
- **Data Fetching & Cache:** [SWR](https://swr.vercel.app/) (Stale-While-Revalidate with optimistic UI mutations)

### Backend & Microservices
- **REST API Runtime:** [Express 5](https://expressjs.com/) with modular middleware architecture (`auth`, `validator`, `error`)
- **ORMs:** [Prisma ORM](https://www.prisma.io/) (Workforce Domain) & [TypeORM](https://typeorm.io/) (Knowledge Base DataMapper)
- **Validation:** [express-validator](https://express-validator.github.io/docs/)
- **Database:** SQLite (local persistent `dev.db` & in-memory `better-sqlite3` for test isolation)
- **Authentication:** Custom JWT sessions in HTTP-only cookies (`jose`), `bcryptjs`, and Next-Auth RBAC

### Automated Testing (TDD)
- **Framework:** [Jest](https://jestjs.io/) with `ts-jest`
- **API Integration Testing:** [Supertest](https://github.com/ladjs/supertest) (HTTP endpoint contracts, status codes, payload validations)
- **Component Testing:** [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) & `jest-dom`

---

## Core Features

- **Workforce Task Delegation & Tracking:** Assign strategic tasks to employees across departments, set deadlines, and monitor real-time execution across TODO, IN_PROGRESS, and DONE states.
- **Knowledge Base & SOP Repository:** Searchable corporate policy, standard operating procedures (SOP), and FAQ repository powered by Express 5, TypeORM, and SWR optimistic UI updates.
- **Decoupled Express 5 REST API:** Custom server pipeline decoupling RESTful services (`/api/knowledge`, `/api/faq`) with validation pipelines and centralized error middleware.
- **Daily Work Logs & Time Tracking:** Minute-by-minute work logging attached to specific tasks, enabling accurate time allocation tracking and employee self-reporting.
- **Daily Routine Compliance Checks:** Configurable daily routine checklists ensuring standard operating procedures and operational compliance.
- **Productivity & Department Comparison:** Interactive Recharts analytics visualizing team productivity, department time distributions, and cross-team operational performance.
- **Role-Based Access Control (RBAC):**
    - `ADMIN`: Full management command center across tasks, employees, daily logs, system analytics, and corporate knowledge base.
    - `USER`: Personal dashboard for managing assigned tasks, searching SOPs/FAQs, logging work hours, and submitting daily reports.
- **Test-Driven Reliability:** Comprehensive test suite covering end-to-end API integration lifecycles (Supertest), controller business logic, and frontend view components.

---

## Business Value & Target Audience

- **Target Audience:** Operations leads, department managers, and HR teams managing distributed or hybrid corporate workforces.
- **Value Proposition:** Eliminates disjointed spreadsheets, chaotic Slack threads, and tribal knowledge by providing a unified command center for delegating work, tracking effort, analyzing productivity, and maintaining an authoritative corporate knowledge base.

## Folder Structure

```text
├── prisma/
│   ├── schema.prisma           # Prisma models (User, EmployeeTask, DailyReport)
│   ├── seed.ts                 # Initial data seeding
│   └── dev.db                  # Local SQLite database
├── src/
│   ├── app/                    # Next.js App Router (Admin Console, Dashboard, Login)
│   │   ├── admin/
│   │   │   ├── knowledge-base/ # Knowledge Base & SOP Management Page
│   │   │   ├── employees/      # Personnel Management
│   │   │   ├── tasks/          # Strategic Missions & Task Delegation
│   │   │   ├── comparison/     # Cross-Department Productivity Analytics
│   │   │   └── daily-reports/  # Operational Audit Logs
│   │   ├── api/                # Next.js API Routes & Express Bridge
│   │   ├── dashboard/          # Employee Portal
│   │   └── login/              # Secure Authentication
│   ├── components/             # Reusable UI & Recharts Data Visualizations
│   ├── lib/                    # Authentication, Date, SWR Hooks, and Translation Utilities
│   └── server/                 # Decoupled Express 5 Architecture
│       ├── controllers/        # Knowledge Base Controller Handlers
│       ├── database/           # TypeORM DataSource & Entity Definitions
│       ├── middlewares/        # Auth, Validation, and Global Error Middlewares
│       ├── models/             # KnowledgeBaseItem Entity (UUID, Indexed)
│       ├── routes/             # Express Route Definitions
│       └── utils/              # Standardized API Response Envelopes
├── tests/
│   ├── api/                    # Supertest API Integration Test Suite
│   ├── views/                  # Controller Unit Tests
│   └── frontend/               # React Testing Library Component Tests
├── server.ts                   # Custom Unified Server (Express 5 + Next.js Handler)
├── jest.config.js              # Jest Configuration
└── package.json
```

---

## Testing & Quality Assurance

Run the complete automated test suite:

```bash
npm test
```

The test runner executes:
1. **API Integration Tests** (`tests/api/knowledge.test.ts`) — Validates CRUD operations, schema constraints, status codes, and database persistence using Supertest.
2. **Controller Unit Tests** (`tests/views/knowledge.controller.test.ts`) — Tests controller request-response lifecycles, error propagation, and filtering.
3. **Frontend Component Tests** (`tests/frontend/knowledge.frontend.test.tsx`) — Tests dynamic search, loading skeletons, and empty states using React Testing Library.

---

## Local Setup

### Prerequisites
- Node.js 18+ (tested on Node 20 & 26)
- npm

### Installation
```bash
git clone https://github.com/yigitsarpavci/enterprise-admin-dashboard.git
cd enterprise-admin-dashboard
npm install
```

### Database Initialization
```bash
npx prisma db push
npm run seed
```

### Running the Application
```bash
npm run dev
# or for production:
npm run build
npm start
```

---

## License

This project is open-source and available under the MIT License.
