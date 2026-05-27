import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Bell, Key } from 'lucide-react';
import api from '../config/api';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [newPwd, setNewPwd] = useState('');
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : { fullName: 'Khách', role: 'guest' };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users/change-password', { newPassword: newPwd });
      alert('Đổi mật khẩu thành công');
      setShowPwdModal(false);
      setNewPwd('');
    } catch (err) {
      alert('Đổi mật khẩu thất bại');
    }
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
        <div className="user-profile" onClick={() => setShowPwdModal(true)} style={{ cursor: 'pointer' }} title="Đổi mật khẩu">
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

      {showPwdModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>ĐỔI MẬT KHẨU</h3>
              <button className="btn-close" onClick={() => setShowPwdModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleChangePassword} className="modal-body">
              <div className="form-group">
                <label className="form-label">Mật khẩu mới</label>
                <div className="input-with-icon">
                  <Key size={18} className="input-icon" />
                  <input
                    type="password"
                    className="form-input"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowPwdModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary">Cập nhật</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
