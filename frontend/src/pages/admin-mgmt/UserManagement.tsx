import React, { useEffect, useState, useCallback } from 'react';
import api from '../../config/api';
import { CommonTable } from '../../components/CommonTable';
import { Users, UserPlus, Trash2, Edit, Search, Filter } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const { addNotification } = useNotification();
  
  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : { fullName: 'Khách' };
  
  // Filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [classes, setClasses] = useState<any[]>([]);


  const initialFormData = {
    id: '',
    username: '',
    fullName: '',
    email: '',
    role: 'sinhvien',
    password: '',
    classId: ''
  };
  
  const [formData, setFormData] = useState(initialFormData);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (roleFilter) params.role = roleFilter;
      
      const res = await api.get('/users', { params });
      setUsers(res.data);
    } catch (err) {
      addNotification('Lỗi', 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, roleFilter, addNotification]);

  useEffect(() => {
    fetchUsers();
    fetchClasses();
  }, [fetchUsers]);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/categories/classes');
      setClasses(res.data);
    } catch (err) {
      console.error('Không thể tải danh sách lớp');
    }
  };


  const handleEdit = (user: any) => {
    fetchClasses();
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
        addNotification(currentUser.fullName, 'xóa người dùng');
        fetchUsers();
      } catch (err) {
        addNotification('Thông báo', 'Xóa người dùng thất bại');
      }
    }
  };

  const validateForm = () => {
    if (!formData.username || formData.username.length < 3) {
      addNotification('Thông báo', 'Tên đăng nhập phải ít nhất 3 ký tự');
      return false;
    }
    if (!formData.email.includes('@')) {
      addNotification('Thông báo', 'Email không hợp lệ');
      return false;
    }
    if (!editingUser && (!formData.password || formData.password.length < 6)) {
      addNotification('Thông báo', 'Mật khẩu phải ít nhất 6 ký tự');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Filter out classId if role is not sinhvien, cvht, or bcs
    const payload = { ...formData };
    if (payload.role !== 'sinhvien' && payload.role !== 'cvht' && payload.role !== 'bcs') {
      payload.classId = '';
    }

    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, payload);
        addNotification(currentUser.fullName, 'cập nhật người dùng');
      } else {
        await api.post('/users', payload);
        addNotification(currentUser.fullName, 'thêm người dùng mới');
      }
      setShowModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      addNotification('Thông báo', err.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const columns = [
    { header: 'Username', accessor: 'username' },
    { header: 'Họ tên', accessor: 'fullName' },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Vai trò', 
      accessor: (item: any) => (
        <span className={`badge ${item.role}`}>
          {item.role === 'admin' ? 'Quản trị' : item.role === 'cvht' ? 'Cố vấn HT' : item.role === 'bcs' ? 'Ban cán sự' : 'Sinh viên'}
        </span>
      ) 
    },
    { 
      header: 'Tên lớp', 
      accessor: (item: any) => {
        if (!item.classId) return '';
        const cls = classes.find(c => c.id === item.classId);
        return cls ? cls.name : item.classId;
      }
    },
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
          fetchClasses();
          setEditingUser(null);
          setFormData(initialFormData);
          setShowModal(true);
        }}>
          <UserPlus size={16} />
          <span>Thêm người dùng</span>
        </button>
      </div>

      <div className="filters-container mb-4 flex gap-4" style={{ alignItems: 'center' }}>
        <div className="search-box relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="form-control pl-10"
            placeholder="Tìm kiếm theo tên đăng nhập hoặc họ tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box flex items-center gap-2">
          <Filter size={18} className="text-gray-500" />
          <select 
            className="form-control"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Tất cả vai trò</option>
            <option value="sinhvien">Sinh viên</option>
            <option value="bcs">Ban cán sự</option>
            <option value="cvht">Cố vấn học tập</option>
            <option value="admin">Quản trị viên</option>
          </select>
        </div>
      </div>

      <div className="glass-card">
        <CommonTable data={users} columns={columns} loading={loading} />
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card" style={{ maxWidth: '600px' }}>
            <h2>{editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}</h2>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="form-group">
                  <label>Tên đăng nhập <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Họ và tên <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email <span className="text-danger">*</span></label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Vai trò <span className="text-danger">*</span></label>
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
                    <label>Mật khẩu <span className="text-danger">*</span></label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingUser}
                      placeholder="Tối thiểu 6 ký tự"
                    />
                  </div>
                )}
                {(formData.role === 'sinhvien' || formData.role === 'cvht' || formData.role === 'bcs') && (
                  <div className="form-group">
                    <label>Tên lớp (Tùy chọn)</label>
                    <select
                      value={formData.classId}
                      onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    >
                      <option value="">-- Không chọn --</option>
                      {classes.map((cls: any) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name} ({cls.id})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary">Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
