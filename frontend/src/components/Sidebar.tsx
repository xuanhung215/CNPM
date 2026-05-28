import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ListTodo,
  ShieldAlert,
  History,
  FileCheck,
  ClipboardList,
  Activity,
  Users,
  Calendar,
  FolderTree,
} from 'lucide-react';
import { Role } from '../constants/role';

export const Sidebar: React.FC = () => {
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : { role: Role.SINHVIEN };

  const menuItems = [
    {
      path: '/dashboard',
      label: 'Trang chủ / Tổng quan',
      icon: <LayoutDashboard size={20} />,
      roles: [Role.ADMIN, Role.CVHT, Role.BCS, Role.SINHVIEN],
    },
    {
      path: '/criteria-management',
      label: 'Quản lý tiêu chí',
      icon: <ListTodo size={20} />,
      roles: [Role.ADMIN],
    },
    {
      path: '/admin/users',
      label: 'Quản lý người dùng',
      icon: <Users size={20} />,
      roles: [Role.ADMIN],
    },
    {
      path: '/admin/semesters',
      label: 'Điều phối kỳ đánh giá',
      icon: <Calendar size={20} />,
      roles: [Role.ADMIN],
    },
    {
      path: '/admin/categories',
      label: 'Quản lý danh mục',
      icon: <FolderTree size={20} />,
      roles: [Role.ADMIN],
    },
    {
      path: '/student-grading',
      label: 'Tự đánh giá điểm',
      icon: <ClipboardList size={20} />,
      roles: [Role.SINHVIEN, Role.BCS],
    },
    {
      path: '/student-history',
      label: 'Lịch sử tự đánh giá',
      icon: <History size={20} />,
      roles: [Role.SINHVIEN, Role.BCS],
    },
    {
      path: '/class-approval',
      label: 'Duyệt điểm lớp học',
      icon: <FileCheck size={20} />,
      roles: [Role.CVHT, Role.BCS],
    },
    {
      path: '/complaints',
      label: 'Khiếu nại sửa điểm',
      icon: <ShieldAlert size={20} />,
      roles: [Role.ADMIN, Role.CVHT, Role.BCS, Role.SINHVIEN],
    },
    {
      path: '/audit-logs',
      label: 'Lịch sử thao tác',
      icon: <Activity size={20} />,
      roles: [Role.ADMIN],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(user.role));

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <h1>PORTAL ĐIỂM RL</h1>
      </div>
      <nav className="sidebar-nav">
        {filteredMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
