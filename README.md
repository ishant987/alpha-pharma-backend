# 🏥 Alpha Pharma Backend API

A modern, high-performance **Node.js/Express** backend architecture for the Alpha Pharma Management System.

---

## ✨ Features

- 🚀 **Fast & Scalable**: Built on the latest Express framework.
- 📦 **Modern Modules (ESM)**: Uses ES6 modules (`import`/`export`) for clean, standard Javascript code.
- 🛡️ **Robust Error Handling**: Centralized error management to prevent application crashes and improve debugging.
- 📡 **API Connectivity**: Pre-configured CORS and environment variables for easy frontend-backend integration.
- 🛠️ **Developer Friendly**: Uses `nodemon` for automatic restarts and `morgan` for detailed request logging.
- 🔄 **Structured codebase**: Decoupled Controllers, Routes, and Middleware for separation of concerns.

---

## 🏗️ Project Structure

```text
src/
├── app.js             # Express application logic and middleware
├── index.js           # Server entry point and database connection logic
├── config/            # External configurations (e.g., db.js)
├── controllers/       # High-level business logic handlers
├── routes/            # API endpoints mapping to controllers
├── middleware/        # Custom middleware (auth, logging, etc.)
├── models/            # Mongoose schemas/models (placeholder for DB)
└── utils/             # Helper utilities (e.g., asyncHandler)
```

---

## ⚡ Quick Start

### 1. Installation
Install project dependencies:
```bash
npm install
```

### 2. Configuration
The API relies on environment variables. Create or edit the `.env` file in the root directory:
```bash
# Example .env settings
PORT=5001
CORS_ORIGIN=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/alpha-pharma
```

### 3. Development Mode
Start the API with hot-reloading enabled:
```bash
npm run dev
```

### 4. Production Mode
Run the API in a production environment:
```bash
npm start
```

---

## 🛠️ API Reference

### Health Check
- **GET** `/`
  Check API status and current version.
- **GET** `/health`
  Check detailed system health.

### Pharmacy Products
- **GET** `/api/v1/products`
  Retrieve a list of all pharmacy products.
- **GET** `/api/v1/products/:id`
  Retrieve detailed information for a specific product.

---

## 🔒 Security

- **CORS enabled**: Pre-authenticated to only allow authorized domains.
- **Environment Protection**: Sensitive configuration managed entirely via `.env`.
- **Graceful Shutdown**: Properly closes connections and handles signals to avoid data corruption.

🚀 *Built for professional pharmaceutical management.*
