import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import { LoginPage, RegisterPage } from './pages/auth';
import { DashboardPage, AddVehiclePage } from './pages/vehicles';
import { HistoryPage, AddServicePage } from './pages/services';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/history/:vehicleId" element={<HistoryPage />} />
          <Route path="/add-service" element={<AddServicePage />} />
          <Route path="/add-service/:vehicleId" element={<AddServicePage />} />
          <Route path="/add-vehicle" element={<AddVehiclePage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
