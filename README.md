# Company Performance Admin Panel

A modern, secure, and professional full-stack administrative tool designed for internal company management. Built with the latest Next.js features and a focus on clean architecture and security.

## 🚀 Tech Stack

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database:** [SQLite](https://www.sqlite.org/) (via [Prisma ORM](https://www.prisma.io/))
- **Authentication:** Custom JWT-based sessions with HTTP-only Cookies (using `jose`)
- **Security:** Password hashing with `bcryptjs`, server-side role validation, and protected middleware.

## ✨ Current Features

- **Secure Authentication:** Name and password-based login system.
- **Session Management:** Secure server-side sessions using HTTP-only cookies.
- **Admin Dashboard:**
    - Real-time statistics (Total Users, Profiles Created).
    - Comprehensive User Directory.
    - **User Onboarding:** Create new company users with automatic profile generation.
    - **User Management:** Secure deletion of accounts with self-deletion protection.
- **Role-Based Access Control (RBAC):**
    - `ADMIN`: Full access to user management and system settings.
    - `USER`: Access to personal dashboard and performance metrics.
- **Responsive Design:** Fully optimized for desktop, tablet, and mobile devices.
- **Modern UI:** Clean, minimalist professional interface using a refined Zinc/Blue color palette.

## 📅 Future Planned Features

- **Employee Management:** Extended profile details and document management.
- **Performance Scoring:** Quarterly and annual performance tracking systems.
- **Task Tracking:** Project and task assignment for team members.
- **Analytics & Reports:** Detailed productivity reports and department-wise analytics.

## 📂 Folder Structure

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

## 🛠 Installation & Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd company-admin-panel
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

## 🔑 Default Admin Credentials

Use these credentials to access the management features after seeding:

- **Username:** `admin`
- **Password:** `admin12345`

---

Built with ❤️ for professional company management.
