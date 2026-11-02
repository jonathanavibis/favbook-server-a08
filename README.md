# 📚 BookNook Server — Express.js & MongoDB Library Backend

Welcome to the **BookNook Server**, a high-performance RESTful API backend built with **Express.js**, **Mongoose**, and **MongoDB Atlas** for managing online library catalogs, user loans, and authentication.

---

## 🌟 Key Features

- **MongoDB Direct Persistence**: Books, borrows, and user accounts are directly persisted into MongoDB Atlas.
- **Live Formatted JSON Serving**: Every endpoint serves structured, pretty-printed JSON data (`app.set('json spaces', 2)`).
- **Challenge — Atomic Inventory Management**:
  - Automatically decrements book copies by 1 with `$inc: -1` when a reader borrows a book.
  - Automatically increments copies by 1 with `$inc: 1` when a reader returns a book.
  - Prevents borrowing if available copies reach `0` ("Not Available").
- **Challenge — No Double Borrow**: Compound uniqueness validation prevents a user from borrowing the same title concurrently until the previous loan is returned.
- **Challenge — JWT Authentication & Authorization**: Secure route protection with JSON Web Tokens (`Bearer <token>`) and role/ownership checks.
- **Social OAuth Integration**: Syncs Google and GitHub social logins directly to MongoDB User accounts.

---

## 🚀 API Endpoints Overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Public | Live server status & MongoDB books archive in formatted JSON |
| `GET` | `/books` | Public | Fetch all books (with category filter, search & sort) |
| `GET` | `/books/:id` | Public | Fetch single book details |
| `POST` | `/books` | **Private (JWT)** | Add new book to MongoDB |
| `PATCH` | `/books/:id` | **Private (JWT)** | Update book details (contributor/admin only) |
| `DELETE` | `/books/:id` | **Private (JWT)** | Delete book from catalog (contributor/admin only) |
| `POST` | `/borrows` | **Private (JWT)** | Borrow a book (`$inc: -1`, no double borrow check) |
| `GET` | `/borrows` | **Private (JWT)** | Get active borrows for logged-in user |
| `DELETE` | `/borrows/:id` | **Private (JWT)** | Return a book (`$inc: +1`, marks loan returned) |
| `POST` | `/auth/register` | Public | Register new user with password validation |
| `POST` | `/auth/login` | Public | Authenticate user & issue JWT |
| `POST` | `/auth/social` | Public | Google / GitHub social login sync to MongoDB |
| `POST` | `/auth/jwt` | Public | Issue / refresh token |

---

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas via Mongoose ORM
- **Security**: JWT (jsonwebtoken), bcryptjs password hashing, CORS
- **Deployment**: Vercel Serverless / Render

---

## 💻 Local Setup & Development

1. **Clone the repository**:
   ```bash
   git clone <server-repo-url>
   cd fav-book-server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables (`.env`)**:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the server**:
   ```bash
   npm run dev
   # or
   node index.js
   ```
