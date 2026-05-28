import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Bell, Key } from 'lucide-react';
import api from '../config/api';
import { useNotification } from '../context/NotificationContext';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newPwd, setNewPwd] = useState('');
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : { fullName: 'Khách', role: 'guest' };
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotification();
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
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
        <div className="header-notification" style={{ position: 'relative', cursor: 'pointer' }} ref={notificationRef}>
          <div onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={20} className="header-icon" />
            {unreadCount > 0 && (
              <span className="badge" style={{ position: 'absolute', top: -5, right: -5, minWidth: 18, height: 18, borderRadius: '50%', backgroundColor: '#ef4444', color: 'white', fontSize: 11, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          
          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 8,
              width: 350,
              maxHeight: 400,
              backgroundColor: 'white',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              zIndex: 1000,
              overflow: 'hidden'
            }}>
              <div style={{ overflowY: 'auto', maxHeight: 400 }}>
                {notifications.length === 0 ? (
                  <div style={{
                    padding: '30px 20px',
                    textAlign: 'center',
                    color: '#9ca3af',
                    fontSize: 14
                  }}>
                    Không có thông báo nào
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #f0f0f0',
                        cursor: 'pointer',
                        backgroundColor: notification.isRead ? 'white' : '#f8fafc'
                      }}
                    >
                      <div style={{
                        fontSize: 13,
                        color: '#374151'
                      }}>
                        <strong>{notification.title}</strong> {notification.content}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
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
