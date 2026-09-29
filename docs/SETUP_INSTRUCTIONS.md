# Smart Student & Faculty Management System - Setup & Execution Guide

## System Architecture

```
[ React + Vite Frontend (Port 3000) ]
        │
        ├──► REST API calls (JWT Bearer Auth)
        ▼
[ Spring Boot Backend (Port 8080) ]
        │                             │
        ├──► DB Transactions & Auth   ├──► QR Validation / Request
        ▼                             ▼
[ MySQL 8.0 Database (smart_sms) ]   [ FastAPI Python QR Service (Port 8001) ]
```

---

## 1. Database Setup (MySQL 8.0)

1. Connect to your local MySQL instance:
   ```bash
   mysql -u root -p
   ```
2. Execute the database schema script:
   ```sql
   SOURCE database/schema/schema.sql;
   ```
3. Execute the seed data script:
   ```sql
   SOURCE database/seed/seed.sql;
   ```

---

## 2. Python FastAPI QR Microservice Setup

1. Navigate to the `qr-service` directory:
   ```bash
   cd qr-service
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Launch the QR microservice on Port 8001:
   ```bash
   uvicorn main:app --port 8001 --reload
   ```

---

## 3. Spring Boot REST API Backend Setup

1. Open `backend/src/main/resources/application.properties` and verify your MySQL username/password:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/smart_sms?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
   spring.datasource.username=root
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   ```
2. Build and run the Spring Boot backend:
   ```bash
   cd backend
   mvn clean package -DskipTests
   java -jar target/backend-1.0.0.jar
   ```
   *The API will start on `http://localhost:8080` with Swagger UI at `http://localhost:8080/swagger-ui.html`.*

---

## 4. React + Vite Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:3000`.

---

## 5. Demo Login Credentials

| Role | Username / Email | Password |
|---|---|---|
| **Admin** | `admin@sms.com` | `Admin@123` |
| **Faculty** | `robert.chen@sms.com` | `Faculty@123` |
| **Student** | `alex.johnson@sms.com` | `Student@123` |
