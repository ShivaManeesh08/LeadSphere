const express = require('express');
const router = express.Router();
const controller = require('../controllers/leadController');

// Users
router.get('/users', controller.getUsers);

// Analytics & Activity
router.get('/analytics/dashboard', controller.getAnalytics);
router.get('/activity', controller.getActivity);

// Bulk operations MUST come before /:id routes
router.post('/leads/bulk/status', controller.bulkUpdate);
router.post('/leads/bulk/delete', controller.bulkDelete);

// Leads CRUD
router.get('/leads', controller.getAllLeads);
router.post('/leads', controller.createLead);
router.patch('/leads/:id', controller.updateLead);
router.delete('/leads/:id', controller.deleteLead);

module.exports = router;
