# 🛍️ Jasivo Lifestyle — E-Commerce Backend API

<p align="center">
  <img src="src/assets/jasivo-black-logo.png" alt="Jasivo Lifestyle Logo" width="220" />
</p>

<p align="center">
  <strong>Redefine Your Everyday Style</strong><br />
  A scalable, type-safe, and production-ready RESTful API for <strong>Jasivo Lifestyle Bangladesh</strong> built with Node.js, Express, TypeScript, Prisma ORM, and PostgreSQL.
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [User Roles & Permissions](#-user-roles--permissions)
- [Key Features (A–Z)](#-key-features-az)
- [Project Architecture](#-project-architecture)
- [Database Schema Overview](#-database-schema-overview)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Environment Variables](#-environment-variables)
- [Local Setup & Installation](#-local-setup--installation)

---

## 🌟 Overview

**Jasivo Lifestyle** is a full-featured fashion & lifestyle e-commerce backend engineered for reliability, data integrity, and smooth customer checkout experiences. It supports multi-variant products (size & color), atomic inventory management via database transactions, district-based delivery fee calculation, promo code validation, automated PDF invoice generation, and branded HTML/EJS email notifications.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Runtime & Framework** | Node.js, Express.js, TypeScript |
| **Database & ORM** | PostgreSQL, Prisma ORM |
| **Authentication & Security** | JWT (Access & Refresh Tokens), bcrypt |
| **Validation** | Zod (Request Body, Query & Params Validation) |
| **File & Media Storage** | Multer, Cloudinary |
| **PDF & Email Engine** | PDFKit (In-Memory Buffer), Nodemailer, EJS Templates |

---

## 👥 User Roles & Permissions

The platform enforces strict Role-Based Access Control (RBAC) across all endpoints:

### 1. `CUSTOMER` (Registered Shopper)
- Register, verify email via OTP/link, login, update profile, and reset password.
- Browse active categories, products, and size/color variants.
- Toggle products in their personal **Wishlist**.
- Add product variants to the **Shopping Cart**, update quantities, or clear the cart.
- Manage multiple **Delivery Addresses** (Home, Office) with automatic single-default enforcement.
- Validate and apply **Promo Coupons** at checkout.
- Place orders (`COD` / `ONLINE`), receive instant **PDF Invoice** via email, view order history, and cancel `PENDING` orders (with automatic stock restoration).

### 2. `ADMIN, SUPER ADMIN, STAFF` (Store Manager / Owner)
- Full access to all Customer capabilities plus administrative controls.
- Create, update, and manage **Categories** and **Products** with multi-image Cloudinary uploads.
- Manage **Product Variants** (SKU, size, color, variant-specific pricing, and stock inventory).
- Create, update, activate/deactivate, and delete **Coupons** (`PERCENTAGE` or `FIXED` discounts).
- View all platform orders with search/status filtering and pagination.
- Update **Order Status** (`PENDING` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED` / `CANCELLED`) and **Payment Status** (`UNPAID` / `PAID` / `REFUNDED`).

---

## 🚀 Key Features (A–Z)

- **Atomic Checkout & Inventory (`$transaction`):** Guarantees that order creation, variant stock deduction, coupon usage increment, and cart clearing succeed or fail together as a single atomic unit.
- **Address Snapshot Preservation:** Stores a JSON snapshot of the customer's shipping address at the time of order placement so future address edits never alter historical invoices.
- **Automated Branded PDF Invoices:** Generates custom **Deep Purple (`#1E0B36`) & Lime Green (`#A3E635`)** PDF invoices in memory (`Buffer`) using `PDFKit` and attaches them directly to order confirmation emails.
- **Branded EJS Email Notifications:** Sends responsive HTML emails (Welcome, Verification, Order Confirmation) styled with Jasivo Lifestyle's official color palette and logos.
- **District-Based Delivery Calculation:** Automatically calculates shipping fees based on the delivery district (`BDT 60` inside Dhaka, `BDT 120` outside Dhaka).
- **Dynamic Coupon Engine:** Supports percentage and fixed discounts, expiry dates, minimum order thresholds, maximum discount caps, and global usage limits.
- **Smart Shopping Cart:** Prevents adding out-of-stock variants, auto-increments quantities for duplicate variants within stock limits, and computes real-time subtotals.
- **Wishlist Toggle:** One-click add/remove functionality for saving favorite items.
- **Stock Restoration on Cancellation:** Automatically restores variant stock quantities whenever a customer or admin cancels an order.

---

## 📁 Project Architecture

```text
ecom-backend/
├── prisma/
│   ├── generated/              # prisma sql file generated
│   ├── migrations/              # Database migration history
│   └── schema.prisma            # PostgreSQL models, enums & relations
├── src/
│   ├── app/
│   │   ├── config/              # Environment & third-party configurations
│   │   ├── lib/                 # Prisma client & Cloudinary setup
|   |   |   ├── generateInvoicePdf.ts  # PDFKit branded invoice generator
|   |   |   ├── cloudinary.ts  # image upload to cloudinary configuration
|   |   |   ├── multer.ts  # fs file upload configure
|   |   |   ├── nodemailer.ts  # email generate nodemailer configuration
|   |   |   ├── prisma.ts  # prisma configaration
|   |   |   ├── redis.ts  # otp and data store for 5 minutes
│   │   ├── middlewares/         # Global error handler, auth guard, Zod validator
|   |   ├── assets/              # Brand logos (jasivo-black-logo.png, etc.)
│   │   ├── modules/
│   │   │   ├── auth/            # Authentication, JWT, password reset
│   │   │   ├── user/            # User profile & account management
│   │   │   ├── category/        # Product categories
│   │   │   ├── product/         # Products & size/color variants
│   │   │   ├── wishlist/        # User wishlist toggle & retrieval
│   │   │   ├── cart/            # Shopping cart & subtotal calculation
│   │   │   ├── address/         # Delivery addresses & default management
│   │   │   ├── coupon/          # Promo codes & discount validation
│   │   │   └── order/           # Checkout, order lifecycle & stock sync
│   │   ├── utils/
│   │   │   ├── generateSlug.ts  # PDFKit branded invoice generator
│   │   │   ├── get-client-into.ts           # Nodemailer transporter with attachments
│   │   │   ├── jwt.ts           # Nodemailer transporter with attachments
│   │   │   ├── seed.ts           #admin, super admin, staff, create
│   │   │   ├── catchAsync.ts          # Async error wrapper
│   │   │   ├── sendResponse.ts        # Standardized API response formatter
│   │   │   └── appError.ts            # Custom operational error class
│   │   └── templates/               # EJS email templates (Welcome, Order Confirmation)
│   ├── app.ts                   # Express app setup & global middlewares
│   └── server.ts                # Server entry point
├── .env                         # Environment variables
├── package.json
└── .gitignore
└── biome.json
└── tsconfig.json
