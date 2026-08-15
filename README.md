# SkillSync Learning & Placement Platform

![SkillSync Platform](https://img.shields.io/badge/Status-Active-success) ![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react) ![Go](https://img.shields.io/badge/Backend-Go%20%2B%20Gin-00ADD8?logo=go) ![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)

SkillSync is a modern, full-stack interactive coding and placement preparation platform built to deliver an exceptional learning experience. It combines a dynamic, dark-glassmorphism React frontend with high-performance Go API backends.

## 🌟 Key Features

*   **Interactive Code Workspace**: Integrated with Monaco Editor (the technology behind VS Code) for real-time code writing and execution directly in the browser.
*   **Genuine OAuth Authentication**: Secure, one-click logins using real Google and GitHub Identity Services via OAuth 2.0.
*   **Admin Dashboard**: A dedicated interface for educators to effortlessly construct and manage Courses, Topics, and interactive Lessons.
*   **Practice & Problem Modules**: A gamified algorithmic problem-solving arena with difficulty ratings and instant feedback.
*   **Career & Interview Preparation**: Comprehensive modules covering HR Interviews, System Design, Mock Interviews, and Resume Building.
*   **Rich Aesthetics**: Beautiful, dark-themed UI enhanced with Framer Motion animations and sleek Lucide React icons.

## 🛠️ Technology Stack

### Frontend (React / Vite)
*   **Framework**: React 19 + Vite (for blazing fast HMR and optimized builds)
*   **Routing**: React Router DOM
*   **State & Requests**: Context API, Axios
*   **Authentication**: `@react-oauth/google`
*   **UI / UX**: TailwindCSS (v4), Framer Motion, Lucide React icons
*   **Code Editor**: `@monaco-editor/react`

### Backend (Go)
*   **Framework**: Gin-Gonic (High-performance HTTP web framework)
*   **Database**: MongoDB (via official `mongo-driver`)
*   **Authentication**: Custom OAuth 2.0 exchange endpoint for GitHub securely handled server-side.
*   **Architecture**: Modular design (`config`, `database`, `handlers`, `routes`)

---

## 📁 Project Structure

```
├── Learning System/
│   ├── backend/               # Go API server
│   │   ├── config/            # Environment configurations
│   │   ├── database/          # MongoDB initialization
│   │   ├── handlers/          # API Controllers & OAuth logic
│   │   └── routes/            # Gin router configurations
│   ├── frontend/              # React Vite application
│   │   ├── src/
│   │   │   ├── api/           # Centralized Axios client
│   │   │   ├── components/    # Reusable UI components & Admin forms
│   │   │   ├── context/       # Auth state management
│   │   │   └── pages/         # Application views (Dashboard, Login, Practice)
│   └── render.yaml            # Render Infrastructure as Code Blueprint
```

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   Go (v1.20+)
*   MongoDB instance (local or MongoDB Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/crishh007/Coding-Platform.git
cd Coding-Platform/Learning\ System
```

### 2. Environment Setup

**Backend (`backend/.env`)**
Create a `.env` file in the `backend` directory:
```env
DATABASE_URL=your_mongodb_atlas_connection_string
DATABASE_NAME=learning_system
PORT=8080
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
```

**Frontend (`frontend/.env`)**
Create a `.env` file in the `frontend` directory:
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
VITE_GITHUB_CLIENT_ID=your_github_oauth_client_id
```

### 3. Run the Backend
```bash
cd backend
go mod download
go run main.go
```
The server will start on `http://localhost:8080`.

### 4. Run the Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The React app will be accessible at `http://localhost:5173`.

---

## ☁️ Deployment (Render)

This project is fully configured to be deployed automatically using [Render](https://render.com/).

1. Push your code to GitHub.
2. In your Render Dashboard, click **New +** and select **Blueprint**.
3. Connect this repository.
4. Render will automatically read the included `render.yaml` file, build your Go Web Service and your React Static Site, and link them securely.
5. Provide your environment variables when prompted during the initial deploy.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! 

## 📝 License
This project is open-source and available under the MIT License.
