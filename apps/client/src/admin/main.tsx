import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'antd/dist/reset.css';
import { AdminLayout } from './components/AdminLayout';
import { DashboardPage } from './pages/DashboardPage';
import { EquipmentPage } from './pages/EquipmentPage';
import { BorrowRequestsPage } from './pages/BorrowRequestsPage';
import { WarehouseShipPage } from './pages/WarehouseShipPage';
import { WarehouseReturnPage } from './pages/WarehouseReturnPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { NewReservationPage } from './pages/NewReservationPage';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/admin.html">
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="equipment" element={<EquipmentPage />} />
          <Route path="borrow-requests" element={<BorrowRequestsPage />} />
          <Route path="warehouse/ship" element={<WarehouseShipPage />} />
          <Route path="warehouse/return" element={<WarehouseReturnPage />} />
          <Route path="reservations" element={<ReservationsPage />} />
          <Route path="reservations/new" element={<NewReservationPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
