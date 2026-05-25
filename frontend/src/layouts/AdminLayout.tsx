import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

export const AdminLayout: React.FC = () => {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <Header />
        <main className="main-content-panel">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
