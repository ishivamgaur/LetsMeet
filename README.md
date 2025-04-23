# Let's Meet - Full Stack Application

This is the complete documentation for **Let's Meet** — a real-time video conferencing web application inspired by Zoom. Built with the **MERN stack** (MongoDB, Express, React, Node.js), it supports user authentication, secure cookie-based sessions, and video conferencing with Socket.IO/WebRTC.

---

## 🌐 Live URLs

- **Frontend**: [https://shivam-lets-meet.netlify.app](https://shivam-lets-meet.netlify.app)
- **Backend**: [https://letsmeet-t85e.onrender.com](https://letsmeet-t85e.onrender.com)

---

## 📦 Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Axios
- React Router DOM
- Toastify (for notifications)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JSON Web Token (JWT)
- Socket.IO
- bcryptjs
- cookie-parser
- cors

---

## 📄 Features

- 🔒 JWT-based secure login with cookie-based auth
- 👥 Create, join, and manage meetings
- 📹 Real-time communication using WebRTC (frontend)
- 🍪 Cross-site cookie support for auth check
- 🧠 Passwords securely hashed with bcrypt
- 📦 REST APIs for user actions and auth

---

## 🔐 Environment Variables (Backend)

Create a `.env` file inside the `/server` directory and add:

```env
PORT=8000
MONGODB_URI=mongodb+srv://yourpassword:yourappname@cluster0.z15yalo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=secret
NODE_ENV=development
```

---

## 🚀 Getting Started

### Backend Setup

```bash
cd server
npm install
npm run dev
```

Runs at: `http://localhost:8000`

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

Runs at: `http://localhost:5173`

---

## 🔁 API Endpoints (Backend)

### Auth
- `POST /api/v1/users/check` - Check is api working
- `POST /api/v1/users/register` - Register user
- `POST /api/v1/users/login` - Login user
- `GET /api/v1/users/auth-check` - Auth check via cookies
- `POST /api/v1/users/logout` - Logout user

More API endpoints related to meetings and Socket.IO are handled on the frontend for real-time connections.

---

## 🧪 Testing

Make sure to test CORS and cookie settings properly:
- Allow third-party cookies in your browser settings
- Backend must allow frontend origin
- Frontend Axios requests must use `{ withCredentials: true }`

---

## 📬 Contact

Made with ❤️ by **Shivam Gaur**

- 🔗 [GitHub](https://github.com/imshivamgaur)
- 📸 [Instagram](https://instagram.com/ishivamgaur)

---


