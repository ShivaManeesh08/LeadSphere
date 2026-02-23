import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LeadContext = createContext();

// In production: served from same origin, use relative path
// In local dev: fallback to localhost:5000
const API_BASE = import.meta.env.VITE_API_URL
    || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api');

export const LeadProvider = ({ children }) => {
    const [leads, setLeads] = useState([]);
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [activityLog, setActivityLog] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial Load
    useEffect(() => {
        const loadUsers = async () => {
            try {
                const res = await fetch(`${API_BASE}/users`);
                const data = await res.json();
                setUsers(data);
                // Default to Manager for initial view
                const manager = data.find(u => u.role === 'Business Manager');
                setCurrentUser(manager || data[0]);
            } catch (err) {
                console.error('Failed to load users:', err);
            }
        };
        loadUsers();
    }, []);

    const refreshData = useCallback(async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const headers = { 'x-user-id': currentUser.id };
            const [leadsRes, activityRes] = await Promise.all([
                fetch(`${API_BASE}/leads`, { headers }),
                fetch(`${API_BASE}/activity`, { headers })
            ]);
            const leadsData = await leadsRes.json();
            const activityData = await activityRes.json();

            setLeads(leadsData);
            setActivityLog(activityData);
        } catch (err) {
            console.error('Failed to sync with backend:', err);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        refreshData();
    }, [refreshData, currentUser]);

    const addLead = async (form) => {
        try {
            const res = await fetch(`${API_BASE}/leads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                refreshData();
            }
        } catch (err) {
            console.error('Error adding lead:', err);
        }
    };

    const updateLead = async (id, data) => {
        try {
            await fetch(`${API_BASE}/leads/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
                body: JSON.stringify(data)
            });
            refreshData();
        } catch (err) {
            console.error('Error updating lead:', err);
        }
    };

    const deleteLead = async (id) => {
        try {
            await fetch(`${API_BASE}/leads/${id}`, {
                method: 'DELETE',
                headers: { 'x-user-id': currentUser.id }
            });
            refreshData();
        } catch (err) {
            console.error('Error deleting lead:', err);
        }
    };

    const bulkDelete = async (ids) => {
        try {
            await fetch(`${API_BASE}/leads/bulk/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
                body: JSON.stringify({ ids })
            });
            refreshData();
        } catch (err) {
            console.error('Bulk deletion failed:', err);
        }
    };

    const bulkStatusUpdate = async (ids, status) => {
        try {
            await fetch(`${API_BASE}/leads/bulk/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
                body: JSON.stringify({ ids, status })
            });
            refreshData();
        } catch (err) {
            console.error('Bulk status update failed:', err);
        }
    };

    const switchUser = (id) => {
        const user = users.find(u => u.id === id);
        if (user) setCurrentUser(user);
    };

    return (
        <LeadContext.Provider value={{
            leads, users, currentUser, activityLog, notifications, loading,
            addLead, updateLead, deleteLead,
            bulkDelete, bulkStatusUpdate, switchUser, refreshData
        }}>
            {children}
        </LeadContext.Provider>
    );
};

export const useLeads = () => useContext(LeadContext);
