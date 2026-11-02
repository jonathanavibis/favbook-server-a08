# ⚙️ FavBook Server — RESTful Library Management API

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-lightgrey?logo=express)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas_v8-47A248?logo=mongodb)](https://www.mongodb.com/atlas)
[![Mongoose](https://img.shields.io/badge/Mongoose-ODM-880000)](https://mongoosejs.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT_Tokens-red?logo=jsonwebtokens)](https://jwt.io/)
[![Vercel Deployment](https://img.shields.io/badge/Serverless-Vercel-black?logo=vercel)](https://favbook-a08-server.vercel.app)

> **FavBook Server** is the robust, serverless RESTful API engine powering the **FavBook** library management ecosystem. It manages catalog databases, executes atomic inventory transactions, handles user loans, and enforces secure JWT and OAuth authentication via MongoDB Atlas.

---

## 🔗 Project Ecosystem & Live Deployment

| Resource | Direct Link |
|:---|:---|
| 🚀 **Live Backend API** | [https://favbook-a08-server.vercel.app](https://favbook-a08-server.vercel.app) |
| 🌐 **Live Web Application** | [https://favbook-a08.vercel.app](https://favbook-a08.vercel.app) |
| ⚙️ **Backend GitHub Repository** | [https://github.com/jonathanavibis/favbook-server-a08](https://github.com/jonathanavibis/favbook-server-a08) |
| 💻 **Frontend GitHub Repository** | [https://github.com/jonathanavibis/favbook-a08](https://github.com/jonathanavibis/favbook-a08) |

---

## 📡 What This API Does (Endpoints & Capabilities)

Every API response is formatted with pretty-printed JSON (`app.set('json spaces', 2)`) for readable inspection directly in browser tabs or API clients.

### 📚 Book Catalog Endpoints
| Method | Endpoint | Access | Purpose |
|:---|:---|:---|:---|
| `GET` | `/` | Public | Live API health status, MongoDB Atlas connectivity status, and latest 10 catalog additions |
| `GET` | `/books` | Public | Retrieve books with optional query filters (`category`, `search`, `limit`, `sort`, `userEmail`) |
| `GET` | `/books/:id` | Public | Get complete details and current availability of a specific book by ID |
| `POST` | `/books` | **Protected (JWT)** | Add a new book to the library catalog with contributor association |
| `PATCH` | `/books/:id` | **Protected (JWT)** | Update existing book attributes (title, author, copies, rating, description) |
| `DELETE` | `/books/:id` | **Protected (JWT)** | Remove a book from the catalog (with ownership verification) |

### 📥 Borrow & Loan Endpoints
| Method | Endpoint | Access | Purpose |
|:---|:---|:---|:---|
| `POST` | `/borrows` | **Protected (JWT)** | Borrow a book with loan validation, copies decrement (`$inc: -1`), and double-borrow lock |
| `GET` | `/borrows` | **Protected (JWT)** | Fetch all active book loans for the authenticated reader |
| `DELETE` | `/borrows/:id` | **Protected (JWT)** | Return a borrowed book and atomically replenish inventory stock (`$inc: +1`) |

### 🔐 Authentication Endpoints
| Method | Endpoint | Access | Purpose |
|:---|:---|:---|:---|
| `POST` | `/auth/register` | Public | Create new reader account with password complexity rules |
| `POST` | `/auth/login` | Public | Verify credentials, authenticate reader, and issue signed JWT |
| `POST` | `/auth/social` | Public | Synchronize Google and GitHub OAuth profiles into MongoDB |
| `POST` | `/auth/jwt` | Public | Validate and refresh authentication tokens |

---

## 💡 Technical Highlights: Easy & Medium Challenges Solved

### 🟢 Easy Challenges
- **Pretty-Printed Live JSON Serving**: Configured Express `json spaces: 2` across all routes so instructors and developers can inspect the live database catalog directly in any web browser.
- **Dynamic CORS Middleware**: Whitelisted cross-origin requests from `localhost:3000`, `localhost:5173`, and any deployed Vercel domain (`*.vercel.app`) with full credentials support.
- **Centralized Error Handling**: Built global error-trapping middleware preventing unhandled promise rejections from crashing the server and returning uniform JSON error responses.

### 🟡 Medium Challenges
- **Serverless MongoDB Connection Caching on Vercel**:
  - In serverless environments, opening new Mongoose connections on every invocation causes cold-start lag and query buffering timeouts (`Operation buffering timed out`).
  - Implemented global connection pooling and connection state verification (`mongoose.connection.readyState === 1`) alongside pre-route middleware to guarantee persistent database access across cloud invocations.
- **Atomic Inventory Synchronization (`$inc`)**:
  - Used MongoDB's native `$inc: { copies: -1 }` operation combined with an availability condition (`copies: { $gt: 0 }`), ensuring that concurrent borrow requests can never reduce inventory below zero.
  - Returns immediately increment stock by `$inc: { copies: 1 }` in the same operation that marks the borrow record as returned.
- **Compound Duplicate Borrow Lock**:
  - Enforced a compound query check `{ bookId, userEmail, status: "borrowed" }` prior to creating any borrow transaction, preventing users from holding simultaneous concurrent copies of the same title.
- **Dual Authentication Bridge**:
  - Accommodated both client-issued JWT tokens and BetterAuth session sync to support native credential logins as well as third-party Google and GitHub OAuth handshakes.

---

## 🛠️ Technology Stack

- **Runtime Environment**: [Node.js](https://nodejs.org/) (ES Modules)
- **Web Framework**: [Express.js 4.x](https://expressjs.com/)
- **Database & ODM**: [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose 8.x](https://mongoosejs.com/)
- **Security & Tokens**: [JSON Web Tokens (jsonwebtoken)](https://jwt.io/) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Deployment Platform**: [Vercel Serverless Functions](https://vercel.com/)
