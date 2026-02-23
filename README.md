# LeadSphere — HSR Motors Lead Intelligence Platform

A full-stack CRM application for HSR Motors built with **React + Vite** (frontend) and **Express.js** (backend), featuring Role-Based Access Control (RBAC) and a Jeton-inspired dark UI.

## 🚀 Tech Stack
- **Frontend:** React 19, Vite 7, Tailwind CSS v4, Recharts, Lucide Icons
- **Backend:** Express.js, Node.js, file-based JSON persistence
- **Hosting:** [Render](https://render.com)

## 🏃 Running Locally

```bash
# Backend
cd backend && npm install && node server.js

# Frontend (in a new terminal)
cd frontend && npm install && npm run dev
```

### Environment Variables

**Frontend** — create `frontend/.env.local`:
```
VITE_API_URL=http://localhost:5000/api
```

**Backend** — create `backend/.env`:
```
PORT=5000
FRONTEND_URL=http://localhost:5173
```

## 🌐 Deploying to Render

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → **New → Blueprint**
3. Connect your GitHub repo — Render auto-detects `render.yaml`
4. After backend deploys, copy its URL (e.g. `https://leadsphere-api.onrender.com`)
5. In the **frontend service → Environment**, set:
   ```
   VITE_API_URL = https://leadsphere-api.onrender.com/api
   ```
6. Trigger a redeploy of the frontend

## 👥 User Roles (RBAC)
| Role | Access |
|---|---|
| **Business Manager** (Amit Shah) | Full dashboard, all leads, pipeline view |
| **Sales Executive** (Priya Mehta, Rohit Kapoor) | Personal leads only, no pipeline |

Switch roles using the identity switcher in the top-right profile menu.
