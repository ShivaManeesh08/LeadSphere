const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// ─── CORS ──────────────────────────────────────────────────────────────────
// In production, the frontend is served from the same origin — no CORS needed
// but we keep it for local dev where frontend runs on :5173
if (!isProd) {
    app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
}

app.use(express.json());

// ─── API Routes ─────────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({
    status: 'healthy',
    database: 'JSON_FILE',
    env: process.env.NODE_ENV || 'development'
}));

// ─── Serve React Frontend (Production) ──────────────────────────────────────
if (isProd) {
    const distPath = path.join(__dirname, '..', 'frontend', 'dist');
    app.use(express.static(distPath));
    // All non-API routes → React's index.html (SPA fallback)
    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

// ─── Start Server ───────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  LeadSphere running on port ${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    if (isProd) console.log(`  Serving React frontend from /frontend/dist`);
    console.log(`  Database: backend/data/leads.json\n`);
});
