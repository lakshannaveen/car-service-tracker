import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import Register from './pages/register';
import History from './pages/history';
import AddService from './pages/add-service';
import AddVehicle from './pages/add-vehicle';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/history/:vehicleId" element={<History />} />
          <Route path="/add-service" element={<AddService />} />
          <Route path="/add-service/:vehicleId" element={<AddService />} />
          <Route path="/add-vehicle" element={<AddVehicle />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
