import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

import StockEntry from './pages/StockEntry';
import Sales from './pages/Sales';
import Expenses from './pages/Expenses';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route Wrapper
const ProtectedRoute = () => {
  const { currentUser } = useAuth();
  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="stock" element={<StockEntry />} />
                <Route path="sales" element={<Sales />} />
                <Route path="expenses" element={<Expenses />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
