# 🏥 Smart Medical Appointment & Priority Queue System

A full-stack healthcare web application designed to reduce waiting time in hospitals by introducing a **smart appointment system with priority-based queue management**.



---

## 📌 Problem Statement

In hospitals, patients often face:

* Long waiting queues
* No priority for elderly or emergency cases
* Inefficient appointment management

---

## 💡 Solution

This system introduces:

* 🧠 Smart priority-based queue
* 👨‍⚕️ Doctor dashboard for scheduling
* 🧑‍⚕️ Compounder verification system
* 📊 Efficient patient flow management

---

## ✨ Key Features

### 👤 Patient Module

* Fill form with symptoms, age, details
* Get token number + estimated time
* AI-based priority assignment

### 🧑‍⚕️ Compounder Module

* Verify patients
* Manage patient queue
* Approve/reject entries

### 👨‍⚕️ Doctor Module

* View patient queue
* Mark status (waiting, in-progress, completed)
* Manage daily schedule

### 🔐 Authentication System

* Login / Signup
* Role-based access (Patient / Doctor / Compounder)
* JWT-based authentication

### 🧠 AI Priority System

* High priority for:

  * Age > 60
  * Emergency symptoms (chest pain, breathing, etc.)

---

## 🛠️ Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS

### Backend

* Node.js
* Express.js

### Database

* MongoDB (Atlas)

### Other Tools

* JWT Authentication
* Git & GitHub
* Vercel (Frontend Deployment)
* Render (Backend Deployment)

---

## 📂 Project Structure

```
smart_medical/
│
├── medical_app/        # Frontend (React)
├── medical-backend/    # Backend (Node.js)
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```
git clone https://github.com/akshit-jareat/smart_medical.git
cd smart_medical
```

---

### 2️⃣ Backend Setup

```
cd medical-backend
npm install
```

Create `.env` file:

```
MONGO_URI=your_mongodb_connection
PORT=5000
JWT_SECRET=your_secret_key
```

Run backend:

```
npm start
```

---

### 3️⃣ Frontend Setup

```
cd medical_app
npm install
npm run dev
```

---

## 🌐 API Endpoints

### Auth

* POST `/api/auth/signup`
* POST `/api/auth/login`

### Patients

* GET `/api/patients`
* POST `/api/patients`
* PUT `/api/patients/:id/verify`
* PUT `/api/patients/:id/start`
* PUT `/api/patients/:id/complete`

---

## 📊 Future Enhancements

* 📡 Real-time queue (Socket.io)
* 📱 QR code check-in
* 📊 Analytics dashboard
* 🧠 Advanced AI symptom analysis

---

## 👨‍💻 Author

Abhishek Sharma
GitHub: https://github.com/abhishekxshrma


---

## ⭐ Show Your Support

If you like this project:

* ⭐ Star the repo
* 🔗 Share with others

---

## 📌 Note

This project is built for educational and demonstration purposes.
