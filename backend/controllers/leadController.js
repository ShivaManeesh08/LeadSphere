const service = require('../services/leadService');

exports.getAllLeads = (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const leads = service.getLeadsByUser(userId);
        res.json(leads);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
};

exports.getUsers = (req, res) => {
    try {
        res.json(service.getUsers());
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

exports.createLead = (req, res) => {
    try {
        const leads = service.getLeads();
        const autoMember = service.getAutoAssignment();

        const newLead = {
            id: leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 1,
            ...req.body,
            assignedTo: req.body.assignedTo || autoMember,
            qualityScore: service.calculateQualityScore(req.body),
            createdAt: new Date().toISOString(),
            status: 'New',
            lastContacted: null,
            notes: [],
            timeline: [{
                type: 'created',
                time: new Date().toISOString(),
                title: 'Lead Created',
                desc: `Captured via ${req.body.source || 'Direct'} channel`,
                user: 'System'
            }]
        };

        leads.push(newLead);
        service.writeData(service.LEADS_FILE, leads);

        service.addActivity(newLead.assignedTo, `Assigned new lead: ${newLead.name}`, 'created');

        res.status(201).json(newLead);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create lead' });
    }
};

exports.updateLead = (req, res) => {
    try {
        const id = Number(req.params.id);
        let leads = service.getLeads();
        const index = leads.findIndex(l => l.id === id);

        if (index === -1) return res.status(404).json({ error: 'Lead not found' });

        const updatedLead = { ...leads[index], ...req.body };

        // Log status change
        if (req.body.status && req.body.status !== leads[index].status) {
            updatedLead.timeline.push({
                type: 'status',
                time: new Date().toISOString(),
                title: 'Status Updated',
                desc: `${leads[index].status} → ${req.body.status}`,
                user: 'Sales Pro'
            });
            service.addActivity('Sales Pro', `Updated lead status: ${updatedLead.name} to ${req.body.status}`, 'status');
        }

        leads[index] = updatedLead;
        service.writeData(service.LEADS_FILE, leads);

        res.json(updatedLead);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update lead' });
    }
};

exports.deleteLead = (req, res) => {
    try {
        const id = Number(req.params.id);
        let leads = service.getLeads();
        const filtered = leads.filter(l => l.id !== id);
        service.writeData(service.LEADS_FILE, filtered);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete lead' });
    }
};

exports.bulkUpdate = (req, res) => {
    try {
        const { ids, status } = req.body;
        let leads = service.getLeads();
        leads = leads.map(l => {
            if (ids.includes(l.id)) {
                return { ...l, status };
            }
            return l;
        });
        service.writeData(service.LEADS_FILE, leads);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed bulk update' });
    }
};

exports.bulkDelete = (req, res) => {
    try {
        const { ids } = req.body;
        let leads = service.getLeads();
        const filtered = leads.filter(l => !ids.includes(l.id));
        service.writeData(service.LEADS_FILE, filtered);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Failed bulk delete' });
    }
};

exports.getAnalytics = (req, res) => {
    const userId = req.headers['x-user-id'];
    const user = service.getUser(userId);
    const leads = service.getLeadsByUser(userId);

    if (user && user.role === 'Sales Executive') {
        // Limited dashboard for sales execs
        const myStats = {
            total: leads.length,
            statusBreakdown: {},
            hotLeads: leads.filter(l => l.qualityScore >= 80).length,
            role: 'Sales Executive'
        };
        leads.forEach(l => {
            myStats.statusBreakdown[l.status] = (myStats.statusBreakdown[l.status] || 0) + 1;
        });
        return res.json(myStats);
    }

    const stats = {
        total: leads.length,
        statusBreakdown: {},
        sourceBreakdown: {},
        revenueEst: 0,
        role: 'Business Manager'
    };

    leads.forEach(l => {
        stats.statusBreakdown[l.status] = (stats.statusBreakdown[l.status] || 0) + 1;
        stats.sourceBreakdown[l.source] = (stats.sourceBreakdown[l.source] || 0) + 1;
    });

    res.json(stats);
};

exports.getActivity = (req, res) => {
    res.json(service.getActivityLog());
};
