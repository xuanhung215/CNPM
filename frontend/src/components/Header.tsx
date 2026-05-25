import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Bell } from 'lucide-react';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : { fullName: 'Khách', role: 'guest' };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'cvht': return 'Cố vấn học tập';
      case 'bcs': return 'Ban cán sự lớp';
      case 'sinhvien': return 'Sinh viên';
      default: return 'Khách';
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <h2>HỆ THỐNG QUẢN LÝ ĐIỂM RÈN LUYỆN</h2>
      </div>
      <div className="header-right">
        <div className="header-notification" style={{ position: 'relative', cursor: 'pointer' }}>
          <Bell size={20} className="header-icon" />
          <span className="badge">2</span>
        </div>
        <div className="user-profile">
          <div className="user-avatar">
            <User size={18} />
          </div>
          <div className="user-info">
            <span className="user-name">{user.fullName}</span>
            <span className="user-role">{getRoleLabel(user.role)}</span>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn" title="Đăng xuất">
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  );
};
