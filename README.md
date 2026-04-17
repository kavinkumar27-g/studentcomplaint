# 📋 ComplainEase — Student Complaint Management System

A full-stack web application for managing student complaints, built with **Spring Boot**, **React.js**, and **MySQL**.

---

## 🗂️ Project Structure

```
Student-complainent/
├── backend/             ← Spring Boot application (Java 17)
│   ├── src/main/java/com/example/demo/
│   │   ├── controller/  ← REST API endpoints
│   │   ├── service/     ← Business logic
│   │   ├── repository/  ← Database access (JPA)
│   │   ├── model/       ← JPA Entities (User, Complaint, Comment)
│   │   ├── dto/         ← Data Transfer Objects (request/response bodies)
│   │   ├── security/    ← JWT auth, Spring Security config
│   │   └── config/      ← CORS, file upload, data initializer
│   └── src/main/resources/
│       └── application.properties  ← DB, JWT, upload config
│
├── frontend/            ← React + Vite application
│   └── src/
│       ├── api/         ← Axios HTTP client (with JWT interceptor)
│       ├── context/     ← AuthContext, ToastContext
│       ├── components/  ← Navbar, ProtectedRoute
│       └── pages/       ← LoginPage, RegisterPage, StudentDashboard, AdminDashboard
│
└── database/
    └── schema.sql       ← MySQL schema & sample data
```

---

## ⚙️ Prerequisites

Before starting, make sure the following are installed:

| Tool | Version | Download |
|------|---------|----------|
| Java JDK | 17 or later | https://adoptium.net |
| Maven | 3.8+ (or use `mvnw`) | https://maven.apache.org |
| Node.js | 18 or later | https://nodejs.org |
| MySQL | 8.0+ | https://dev.mysql.com/downloads |

---

## 🚀 Setup Instructions

### Step 1 — Set Up MySQL Database

1. Open **MySQL Workbench** or the MySQL command line.
2. Run the schema file:
   ```sql
   source D:/Student-complainent/database/schema.sql
   ```
   Or execute manually:
   ```sql
   CREATE DATABASE IF NOT EXISTS student_complaints;
   ```
3. Note your MySQL **username** and **password**.

---

### Step 2 — Configure the Backend

Open `backend/src/main/resources/application.properties`:

```properties
# Change this to your MySQL password:
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

> **Note:** Leave it empty (`spring.datasource.password=`) if your MySQL root has no password.

---

### Step 3 — Run the Backend (Spring Boot)

Open a terminal in the `backend` folder:

```powershell
cd D:\Student-complainent\backend

# Option A: Using Maven Wrapper (no Maven installation needed)
.\mvnw.cmd spring-boot:run

# Option B: If you have Maven installed globally
mvn spring-boot:run
```

✅ **Expected output:**
```
Started DemoApplication in X.XXX seconds
Default Admin created: admin@example.com / admin123
```

The backend will run at: **http://localhost:8080**

---

### Step 4 — Run the Frontend (React)

Open a **new** terminal in the `frontend` folder:

```powershell
cd D:\Student-complainent\frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

✅ **Expected output:**
```
VITE v8.x.x  ready in XX ms
➜  Local:   http://localhost:5173/
```

---

### Step 5 — Open the App

Navigate to: **http://localhost:5173**

---

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@example.com` | `admin123` |
| **Student** | Register a new account | (you choose) |

> The admin account is auto-created on first backend startup by `DataInitializer.java`.

---

## 🌐 API Endpoints Reference

### Auth (Public — No token required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new account |
| POST | `/api/auth/login` | Login and get JWT token |

### Complaints (Authenticated)
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/complaints` | Student, Admin | Submit a new complaint |
| GET | `/api/complaints` | Admin | Get ALL complaints |
| GET | `/api/complaints/my` | Student | Get logged-in student's complaints |
| GET | `/api/complaints/{id}` | Any | Get single complaint |
| PUT | `/api/complaints/{id}/status` | Admin | Update complaint status |
| DELETE | `/api/complaints/{id}` | Admin | Delete a complaint |

### Comments (Authenticated)
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/comments/{complaintId}` | Any | Add a comment |
| GET | `/api/comments/{complaintId}` | Any | Get comments for a complaint |

---

## 🧪 Testing with Postman / curl

**Login Example:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

**Submit Complaint (as Student):**
```bash
curl -X POST http://localhost:8080/api/complaints \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Library AC not working" \
  -F "description=The air conditioning in the main library has been broken for 2 weeks." \
  -F "category=ACADEMIC"
```

---

## 🏗️ Architecture Overview

```
Frontend (React + Vite)          Backend (Spring Boot)
┌────────────────┐               ┌─────────────────────┐
│  LoginPage     │  POST /login  │  AuthController     │
│  RegisterPage  │ ─────────────▶│  ComplaintController│
│  StudentDash   │  JWT Token    │  CommentController  │
│  AdminDash     │ ◀─────────────│                     │
└────────────────┘               └──────────┬──────────┘
       │                                    │ Spring Data JPA
  Axios + JWT                               ▼
  Interceptor                    ┌─────────────────────┐
                                 │  MySQL Database     │
                                 │  - users            │
                                 │  - complaints       │
                                 │  - comments         │
                                 └─────────────────────┘
```

---

## 🔐 How JWT Authentication Works

1. User submits email + password to `/api/auth/login`
2. Backend verifies credentials and returns a **JWT token**
3. Frontend stores token in **localStorage**
4. Every API request sends: `Authorization: Bearer <token>`
5. Backend's `JwtAuthenticationFilter` validates the token on each request
6. Token expires after **24 hours** (configurable in `application.properties`)

---

## 📁 Key Files Explained

| File | Purpose |
|------|---------|
| `WebSecurityConfig.java` | Spring Security rules — which endpoints are public/protected |
| `JwtUtil.java` | Creates and validates JWT tokens |
| `JwtAuthenticationFilter.java` | Intercepts every request to extract JWT |
| `UserDetailsImpl.java` | Wraps User entity for Spring Security |
| `DataInitializer.java` | Creates default admin account on startup |
| `AuthContext.jsx` | React global state for logged-in user |
| `axios.js` | HTTP client that auto-attaches JWT to requests |
| `ProtectedRoute.jsx` | Prevents access to pages without proper role |

---

## 🛠️ Common Issues & Fixes

### ❌ "Access denied" on backend startup
**Fix:** Check MySQL is running and credentials in `application.properties` are correct.

### ❌ "CORS error" in browser
**Fix:** Backend has CORS enabled for all origins. Make sure backend runs on port **8080**.

### ❌ JWT token errors
**Fix:** Clear browser localStorage (`localStorage.clear()` in browser console) and log in again.

### ❌ `mvnw: Permission denied` (Linux/Mac)
**Fix:** Run `chmod +x mvnw` then `./mvnw spring-boot:run`

### ❌ Port 8080 already in use
**Fix:** Change port in `application.properties`: `server.port=8081` 
And update `axios.js` baseURL accordingly.

---

## 📊 Complaint Status Flow

```
PENDING ──────▶ IN_PROGRESS ──────▶ RESOLVED
   │                                    │
   └────────────────────────────────────▶ (Admin can set any status)
```

---

## 🎓 Database Schema

```sql
users         (id, name, email, password, role)
    │
    │ (1 user → many complaints)
    ▼
complaints    (id, title, description, category, status, image_url, user_id, created_at, updated_at)
    │
    │ (1 complaint → many comments)
    ▼
comments      (id, message, complaint_id, user_id, timestamp)
```

---

## 📝 License

This project is for educational purposes. Feel free to modify and use it for your college projects.
