import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Role } from '../../constants/role';
import { Lock, User } from 'lucide-react';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    const res = await login(username, password);
    if (res.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="login-card">
      <div className="login-header">
        <h2>PORTAL ĐIỂM RÈN LUYỆN</h2>
        <p>Vui lòng đăng nhập hệ thống để tiếp tục</p>
      </div>
      <form onSubmit={handleSubmit} className="login-form">
        {error && <div className="error-alert">{error}</div>}
        
        <div className="form-group">
          <label className="form-label">Tên đăng nhập</label>
          <div className="input-with-icon">
            <User size={18} className="input-icon" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tài khoản (vd: admin, sv01, bcs01)"
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Mật khẩu</label>
          <div className="input-with-icon">
            <Lock size={18} className="input-icon" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className="form-input"
              required
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="login-submit-btn">
          {loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP'}
        </button>
      </form>
    </div>
  );
};
