# Ledger System — MERN Banking Platform

A full-stack banking application built with the MERN stack. Implements a double-entry ledger with atomic transfers, idempotent transactions, and live balance computation.

**Live Demo:** https://banking-system-project-seven.vercel.app
**Backend API:** https://banking-system-project-0akd.onrender.com

---

## Tech Stack

**Frontend**
- React 18 (Vite)
- React Router 6
- Axios
- Lucide Icons
- Custom CSS design system

**Backend**
- Node.js + Express 4
- MongoDB + Mongoose
- JWT authentication (HttpOnly cookies)
- bcryptjs password hashing
- Nodemailer with Gmail OAuth2

**Database**
- MongoDB Atlas (free tier)

---

## Features

- **Double-entry ledger** — every transfer creates matching CREDIT + DEBIT entries with a shared transaction ID
- **Atomic transfers** — MongoDB sessions guarantee all-or-nothing consistency; if any step fails, all changes are rolled back
- **Idempotency keys** — prevent duplicate transactions when clients retry after network failures
- **Live balance computation** — balances are derived from the ledger via MongoDB aggregation pipelines
- **Immutable entries** — ledger documents block any update or delete operation
- **JWT authentication** with secure HttpOnly cookies
- **Role-based access** — regular users vs system users (treasury/admin)
- **Email notifications** — welcome email on registration, transaction receipts

---

## Demo Credentials

**Regular User**
- Email: `rahul@bank.com`
- Password: `rahul12345`

**System User (for initial funds)**
- Email: `sysadmin@bank.com`
- Password: `sysadmin123`

---

## Project Structure
