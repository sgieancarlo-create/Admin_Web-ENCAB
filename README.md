# Registrar Admin Panel

Web admin panel for the enrollment app. Connects to the same backend as the mobile app. Only users with **admin** role can sign in.

## Setup

1. **Backend**  
   Ensure the enrollment backend is running (e.g. `cd backend && npm start`).

2. **Environment**  
   Copy `.env.example` to `.env` and set the API URL:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set `VITE_API_URL` to your backend base URL (e.g. `http://localhost:4000/api`).

3. **Install & run**
   ```bash
   npm install
   npm run dev
   ```
   Open the URL shown (e.g. http://localhost:5173).

4. **Admin user**  
   Sign-in uses the same `/auth/login` as the mobile app. The user must have `role = 'admin'` in the `users` table. To create an admin:
   - Register via the mobile app or insert a user in the DB, then:
   - `UPDATE users SET role = 'admin' WHERE email = 'registrar@school.edu';`
   - Sign in here with that user’s email/username and password.

## Features

- **Dashboard** – Counts of enrollments by status (total, pending, approved, rejected, draft).
- **Enrollments** – List all enrollments with filter by status; open a row to view details.
- **Enrollment detail** – View basic info, school background, and documents; approve, reject, or set status to pending.

## Build

```bash
npm run build
```
Output is in `dist/`. Serve with any static host; set `VITE_API_URL` for production API.
