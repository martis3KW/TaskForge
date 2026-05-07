# TaskForge – Team Task Management System

A full-stack collaborative task management platform that enables teams to create projects, assign tasks, monitor progress, and manage workflows using secure role-based access control.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

---

## 🚀 Features

- **Authentication System** – Register, Login, Logout with JWT tokens
- **Role-Based Access Control** – Admin & Member roles with granular permissions
- **Project Management** – Create, update, delete projects; add team members
- **Task Management** – Full CRUD with status (Todo/In Progress/Completed) and priority (Low/Medium/High)
- **Dashboard Analytics** – Real-time stats: total, completed, pending, overdue tasks
- **Team Management** – View all team members and their roles
- **Profile Management** – Update name and email
- **Responsive Design** – Works on desktop, tablet, and mobile
- **Input Validation** – Server-side validation with express-validator
- **Error Handling** – Global error handler with proper HTTP status codes

---

## 🛠️ Tech Stack

| Layer          | Technology                     |
|----------------|--------------------------------|
| Frontend       | React + Vite                   |
| Styling        | Tailwind CSS v4                |
| Backend        | Node.js + Express              |
| Database       | MongoDB Atlas + Mongoose       |
| Authentication | JWT + bcryptjs                 |
| HTTP Client    | Axios                          |
| Routing        | React Router DOM               |
| Notifications  | React Hot Toast                |
| Icons          | React Icons                    |

---

## 📁 Project Structure

```
TaskForge/
├── client/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── context/           # Auth context
│   │   ├── layouts/           # App layout
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service layer
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                    # Backend (Node.js + Express)
│   ├── config/                # Database config
│   ├── controllers/           # Route controllers
│   ├── middleware/             # Auth, error, validation
│   ├── models/                # Mongoose models
│   ├── routes/                # API routes
│   ├── utils/                 # Utilities
│   ├── validators/            # Input validators
│   ├── server.js
│   ├── .env
│   └── package.json
├── start-backend.bat
├── start-frontend.bat
└── README.md
```

---

## ⚡ Installation

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/TaskForge.git
cd TaskForge
```

### 2. Setup Backend
```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/taskforge
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

### 3. Setup Frontend
```bash
cd ../client
npm install
```

### 4. Run the Application

**Backend** (Terminal 1):
```bash
cd server
npm run dev
```

**Frontend** (Terminal 2):
```bash
cd client
npm run dev
```

Or use the batch files:
- `start-backend.bat`
- `start-frontend.bat`

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint              | Description       | Access  |
|--------|-----------------------|-------------------|---------|
| POST   | `/api/auth/register`  | Register user     | Public  |
| POST   | `/api/auth/login`     | Login user        | Public  |
| GET    | `/api/auth/me`        | Get current user  | Private |
| PUT    | `/api/auth/profile`   | Update profile    | Private |
| GET    | `/api/auth/users`     | Get all users     | Private |

### Projects
| Method | Endpoint              | Description       | Access        |
|--------|-----------------------|-------------------|---------------|
| GET    | `/api/projects`       | Get all projects  | Private       |
| POST   | `/api/projects`       | Create project    | Admin only    |
| PUT    | `/api/projects/:id`   | Update project    | Admin only    |
| DELETE | `/api/projects/:id`   | Delete project    | Admin only    |

### Tasks
| Method | Endpoint                    | Description        | Access        |
|--------|-----------------------------|--------------------|---------------|
| GET    | `/api/tasks`                | Get all tasks      | Private       |
| POST   | `/api/tasks`                | Create task        | Admin only    |
| PUT    | `/api/tasks/:id`            | Update task        | Private       |
| DELETE | `/api/tasks/:id`            | Delete task        | Admin only    |
| GET    | `/api/tasks/stats/dashboard`| Dashboard stats    | Private       |

---

## 🗃️ Database Schema

### User
```javascript
{ name, email, password, role: ['admin', 'member'], timestamps }
```

### Project
```javascript
{ title, description, createdBy, members: [userId], status, timestamps }
```

### Task
```javascript
{ title, description, status, priority, dueDate, assignedTo, projectId, createdBy, timestamps }
```

---

## 🔐 Security Features

- Password hashing with bcryptjs (12 salt rounds)
- JWT authentication with configurable expiry
- Role-based authorization middleware
- Input validation with express-validator
- CORS configuration
- Duplicate email prevention
- Protected API routes

---

## 📸 Screenshots

> Add screenshots of your running application here

---

## 🚀 Deployment

### Railway
1. Push code to GitHub
2. Create a new project on Railway
3. Add environment variables
4. Deploy backend and frontend separately

### Environment Variables (Production)
```env
PORT=5000
MONGO_URI=your_production_mongo_uri
JWT_SECRET=your_production_secret
JWT_EXPIRE=7d
CLIENT_URL=https://your-frontend-url.railway.app
```

---

## 📄 License

MIT License

---

## 👨‍💻 Author

Built with ❤️ for team productivity.
