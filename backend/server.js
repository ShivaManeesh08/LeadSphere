const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Allow requests from local dev and the Render-hosted frontend
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL, // e.g. https://leadsphere-app.onrender.com
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow Postman / curl (no origin) and whitelisted origins
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS blocked: ${origin}`));
        }
    },
    credentials: true,
}));

app.use(express.json());

// Main API Routes
app.use('/api', apiRoutes);

// Health Check
app.get('/health', (req, res) => res.json({
    status: 'healthy',
    database: 'JSON_FILE',
    env: process.env.NODE_ENV || 'development'
}));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  🚀 LeadSphere API running on port ${PORT}`);
    console.log(`  🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  📂 Database: backend/data/leads.json\n`);
});
