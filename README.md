# Adani App Connectivity

Professional dashboard for monitoring and managing app connectivity across the Adani ecosystem.

## ✨ Premium Features

- **Dynamic Navigation**: Reimagined sidebar with premium spring animations, state-aware indicators, and glassmorphism depth.
- **Advanced Excel Viewer**: Interactive grid with fixed headers, cascading filters (State, Region, Substation), and high-performance rendering.
- **Multi-Format Export**: One-click report download in both **CSV** and **XLSX** (Excel) formats.
- **Branded Design**: High-fidelity Adani Renewables identity with perfectly matched brand gradients and vector icons.
- **Automated Data Pipeline**: Self-bootstrapping backend that initializes a SQLite database directly from source CSV files on first run.

## 🛠 Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Backend**: FastAPI (Python), Pandas, Openpyxl
- **Styling**: Tailwind CSS, Framer Motion
- **UI Components**: Shadcn/ui, Lucide React
- **Data Persistence**: SQLite (Managed via CSV sources)

---

## 🚀 Running the Application

The application is designed as a unified system where the Python backend serves both the API and the production-ready frontend.

### 1. Preparation (First-time)

**A. Backend Setup**
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
```

**B. Frontend Build**
```bash
cd frontend
npm install
npm run build
```

### 2. Launching the App

Start the unified server from the **backend** directory:
```bash
cd backend
python app.py
```

- **Dashboard**: [http://localhost:1581](http://localhost:1581)
- **API Docs**: [http://localhost:1581/docs](http://localhost:1581/docs)

---

## 📂 Project Structure

```text
├── backend/               # FastAPI Server (Port 1581)
│   ├── core/              # Infrastructure
│   │   ├── auth/          # JWT & Security logic
│   │   └── db_connection/ # SQLite database & source CSV files
│   ├── src/               # Application Logic
│   │   ├── config/        # Environment & Settings
│   │   ├── routes/        # API Endpoints (Reports, Auth)
│   │   └── utils/         # Data migration & helper scripts
│   ├── app.py             # Unified entry point (API + Frontend hosting)
│   └── requirements.txt   # Backend dependencies
├── frontend/              # React Application
│   ├── src/               # UI components, state, and pages
│   ├── public/            # Branded assets (logo.png)
│   └── package.json       # Frontend dependencies
└── README.md
```

## 🏦 Data Management

Report data is sourced from CSV files located in `backend/core/db_connection/`.
- `Margin.csv`
- `Transformation Capacity.csv`
- `Data to be captured.csv`
- `Element Status.csv`

The system automatically synchronizes these files into the SQLite database whenever the server starts.

---
© 2026 Adani Group. All rights reserved.
