const fs = require('fs');
const path = require('path');

const LEADS_FILE = path.join(__dirname, '../data/leads.json');
const ACTIVITY_FILE = path.join(__dirname, '../data/activity.json');
const USERS_FILE = path.join(__dirname, '../data/users.json');

const TEAM = ['Priya Mehta', 'Rohit Kapoor', 'Neha Soni'];

// Helper to read JSON
const readData = (file) => {
    try {
        if (!fs.existsSync(file)) return [];
        const content = fs.readFileSync(file, 'utf8');
        return JSON.parse(content);
    } catch (err) {
        return [];
    }
};

// Helper to write JSON
const writeData = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
};

const getLeads = () => readData(LEADS_FILE);

const getUsers = () => readData(USERS_FILE);

const getUser = (id) => getUsers().find(u => u.id === id);

const getLeadsByUser = (userId) => {
    const user = getUser(userId);
    const leads = getLeads();
    if (!user) return [];
    if (user.role === 'Business Manager') return leads;
    return leads.filter(l => l.assignedTo === user.name);
};

const getActivityLog = () => readData(ACTIVITY_FILE);

const addActivity = (user, action, type) => {
    const log = readData(ACTIVITY_FILE);
    const newEntry = {
        id: Date.now(),
        user,
        action,
        time: new Date().toISOString(),
        type
    };
    log.unshift(newEntry);
    writeData(ACTIVITY_FILE, log.slice(0, 50)); // Keep last 50
    return newEntry;
};

// Calculate Quality Score using Business Logic (No AI)
const calculateQualityScore = (lead) => {
    let score = 50; // Base score

    // Source weighting
    if (lead.source === 'Google') score += 15;
    if (lead.source === 'Website') score += 10;
    if (lead.source === 'Facebook') score += 5;

    // Budget weighting (Mock logic)
    if (lead.budget && lead.budget.toLowerCase().includes('l')) {
        const value = parseInt(lead.budget.match(/\d+/)[0]);
        if (value > 15) score += 20;
        else if (value > 10) score += 10;
    }

    // Priority weighting
    if (lead.priority === 'Hot') score += 15;
    if (lead.priority === 'Warm') score += 5;

    return Math.min(score, 100);
};

const getAutoAssignment = () => {
    const leads = getLeads();
    const counts = {};
    TEAM.forEach(member => {
        counts[member] = leads.filter(l => l.assignedTo === member && l.status !== 'Closed').length;
    });
    // Return team member with minimum work
    return Object.keys(counts).reduce((a, b) => counts[a] <= counts[b] ? a : b);
};

module.exports = {
    getLeads,
    getUsers,
    getUser,
    getLeadsByUser,
    writeData,
    LEADS_FILE,
    getActivityLog,
    addActivity,
    calculateQualityScore,
    getAutoAssignment,
    TEAM
};
