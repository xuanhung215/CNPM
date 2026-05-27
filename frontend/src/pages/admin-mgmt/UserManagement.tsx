import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { CommonTable } from '../../components/CommonTable';
import { Users, UserPlus, Trash2, Edit } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    id: '',
    username: '',
    fullName: '',
    email: '',
    role: 'sinhvien',
    password: '',
    classId: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      password: '', // Don't show password
      classId: user.classId || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert('Xóa thất bại');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, formData);
      } else {
        await api.post('/users', formData);
      }
      setShowModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert('Thao tác thất bại');
    }
  };

  const columns = [
    { header: 'Username', accessor: 'username' },
    { header: 'Họ tên', accessor: 'fullName' },
    { header: 'Email', accessor: 'email' },
    { header: 'Vai trò', accessor: 'role' },
    {
      header: 'Thao tác',
      accessor: (item: any) => (
        <div className="flex gap-2">
          <button className="btn-icon" onClick={() => handleEdit(item)}><Edit size={14} /></button>
          <button className="btn-icon text-danger" onClick={() => handleDelete(item.id)}><Trash2 size={14} /></button>
        </div>
      )
    }
  ];

  return (
    <div className="admin-page">
      <div className="page-header-actions">
        <div className="page-header-title">
          <Users size={22} className="title-icon" />
          <h1>QUẢN LÝ NGƯỜI DÙNG</h1>
        </div>
        <button className="btn-primary" onClick={() => {
          setEditingUser(null);
          setFormData({ id: '', username: '', fullName: '', email: '', role: 'sinhvien', password: '', classId: '' });
          setShowModal(true);
        }}>
          <UserPlus size={16} />
          <span>Thêm người dùng</span>
        </button>
      </div>

      <div className="glass-card">
        <CommonTable data={users} columns={columns} loading={loading} />
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <h2>{editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}</h2>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Tên đăng nhập</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Họ và tên</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Vai trò</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="sinhvien">Sinh viên</option>
                    <option value="bcs">Ban cán sự</option>
                    <option value="cvht">Cố vấn học tập</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                </div>
                {!editingUser && (
                  <div className="form-group">
                    <label>Mật khẩu</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingUser}
                    />
                  </div>
                )}
                <div className="form-group">
                  <label>Mã lớp (nếu có)</label>
                  <input
                    type="text"
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
