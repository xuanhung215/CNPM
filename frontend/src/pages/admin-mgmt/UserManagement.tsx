import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { CommonTable } from '../../components/CommonTable';
import { Users, UserPlus, Trash2, Edit } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  const columns = [
    { header: 'Username', accessor: 'username' },
    { header: 'Họ tên', accessor: 'fullName' },
    { header: 'Email', accessor: 'email' },
    { header: 'Vai trò', accessor: 'role' },
    {
      header: 'Thao tác',
      accessor: (item: any) => (
        <div className="flex gap-2">
          <button className="btn-icon"><Edit size={14} /></button>
          <button className="btn-icon text-danger"><Trash2 size={14} /></button>
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
        <button className="btn-primary">
          <UserPlus size={16} />
          <span>Thêm người dùng</span>
        </button>
      </div>

      <div className="glass-card">
        <CommonTable data={users} columns={columns} loading={loading} />
      </div>
    </div>
  );
};
