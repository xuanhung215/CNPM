import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Role } from '../../constants/role';
import { Lock, User } from 'lucide-react';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<Role>(Role.SINHVIEN);
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    const res = await login(username, role);
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
          <label className="form-label">Vai trò truy cập</label>
          <div className="input-with-icon">
            <Lock size={18} className="input-icon" />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="form-select"
            >
              <option value={Role.SINHVIEN}>Sinh viên (sv01)</option>
              <option value={Role.BCS}>Ban cán sự lớp (bcs01)</option>
              <option value={Role.CVHT}>Cố vấn học tập (cvht01)</option>
              <option value={Role.ADMIN}>Quản trị viên (admin)</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading} className="login-submit-btn">
          {loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP'}
        </button>
      </form>
    </div>
  );
};
