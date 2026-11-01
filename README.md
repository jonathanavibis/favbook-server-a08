# BookHype Server — Online Library Management API

> REST API backend server for **BookHype**, a modern online library platform where readers can browse books, add new titles, borrow books with real-time inventory management, and return borrowed copies.

- **Frontend Repository**: [https://github.com/jonathanavibis/bookhive-a08](https://github.com/jonathanavibis/bookhive-a08)
- **Backend Repository**: [https://github.com/jonathanavibis/backend-bookhive-a08](https://github.com/jonathanavibis/backend-bookhive-a08)
- **Live Backend API**: Deployed on Vercel / Render

---

## 🌟 Key Features & Architectural Highlights

1. **Complete Library CRUD Operations**:
   - `GET /books`: Public catalog listing with category filtering, search, and sorting.
   - `GET /books/:id`: Individual book specifications and availability details.
   - `POST /books`: Protected route for registered users to contribute books.
   - `PATCH /books/:id`: Protected route allowing book owners to update information.
   - `DELETE /books/:id`: Protected route allowing contributors to safely remove books.

2. **Smart Borrowing System & Atomic Inventory Sync ($inc)**:
   - `POST /borrows`: Borrows a book, decrements `copies` count atomically by 1 using MongoDB `$inc: { copies: -1 }`.
   - `GET /borrows`: Retrieves all active borrowed books for the logged-in user.
   - `DELETE /borrows/:id`: Returns a borrowed book and automatically restores 1 copy back to the library inventory using `$inc: { copies: 1 }`.

3. **Double-Borrow Prevention Challenge**:
   - Enforces business logic ensuring a user cannot borrow the same book twice simultaneously. If an active unreturned borrow exists, the server rejects the request with an explicit error.

4. **Zero-Stock Availability Safeguard**:
   - Books with `copies <= 0` cannot be borrowed. The server returns a 400 status preventing negative inventory.

5. **JWT Authentication & Authorization**:
   - Endpoints requiring user context are guarded with token verification (`Bearer <token>`). Tokens are signed using HMAC-SHA256 with robust expiration.

---

## 🔌 API Routes Summary

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/books` | Public | List all books (supports `?category=`, `?search=`, `?limit=6`, `?sort=`) |
| `GET` | `/books/:id` | Public | Get specific book details |
| `POST` | `/books` | Private (JWT) | Add a new book (Title, Author, Category, Image, Description, Copies) |
| `PATCH` | `/books/:id` | Private (JWT) | Update book details (Owner/Librarian only) |
| `DELETE` | `/books/:id` | Private (JWT) | Delete book from library (Owner/Librarian only) |
| `POST` | `/borrows` | Private (JWT) | Borrow a book (Decrements copies, prevents double-borrow) |
| `GET` | `/borrows` | Private (JWT) | Get personal borrows for the authenticated user |
| `DELETE` | `/borrows/:id` | Private (JWT) | Return borrowed book (Restores book copies by 1) |
| `POST` | `/auth/register` | Public | Register new reader account with password strength checks |
| `POST` | `/auth/login` | Public | Authenticate reader credentials & return JWT |
| `POST` | `/jwt` | Public | Issue signed JWT token for verified session |

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`
- **CORS & Environment**: `cors`, `dotenv`

---

## 🚀 Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/jonathanavibis/backend-bookhive-a08.git
   cd backend-bookhive-a08
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file from `.env.example`:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLIENT_URL=http://localhost:3000
   ```

4. **Run Server**:
   ```bash
   npm run dev
   # or
   npm start
   ```
