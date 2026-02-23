import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LeadListing from './pages/LeadListing';
import LeadDetails from './pages/LeadDetails';
import LeadManagement from './pages/LeadManagement';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="leads" element={<LeadListing />} />
          <Route path="leads/:id" element={<LeadDetails />} />
          <Route path="board" element={<LeadManagement />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
