import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { CommonTable } from '../../components/CommonTable';
import { Calendar, Plus, Edit } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export const SemesterManagement: React.FC = () => {
  const [semesters, setSemesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const { addNotification } = useNotification();
  
  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : { fullName: 'Khách' };

  const initialForm = {
    id: '',
    name: '',
    startDate: '',
    endDate: '',
    han_sv_tu_cham: '',
    han_bcs_cham: '',
    han_cvht_cham: ''
  };

  const [formData, setFormData] = useState<any>(initialForm);

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    setLoading(true);
    try {
      const res = await api.get('/academic-year/semesters');
      setSemesters(res.data);
    } catch (err) {
      addNotification('Thông báo', 'Không thể tải danh sách kỳ đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    // Format dates for input type="date"
    const format = (dateStr: string) => dateStr ? new Date(dateStr).toISOString().split('T')[0] : '';
    setFormData({
      id: item.id,
      name: item.name,
      startDate: format(item.startDate),
      endDate: format(item.endDate),
      han_sv_tu_cham: format(item.han_sv_tu_cham),
      han_bcs_cham: format(item.han_bcs_cham),
      han_cvht_cham: format(item.han_cvht_cham)
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/academic-year/semesters/${editingItem.id}`, formData);
        addNotification(currentUser.fullName, 'cập nhật kỳ đánh giá');
      } else {
        await api.post('/academic-year/semesters', formData);
        addNotification(currentUser.fullName, 'thêm kỳ đánh giá mới');
      }
      setShowModal(false);
      setEditingItem(null);
      fetchSemesters();
    } catch (err) {
      addNotification('Thông báo', 'Thao tác thất bại');
    }
  };

  const columns = [
    { header: 'Học kỳ', accessor: 'name' },
    { header: 'Bắt đầu', accessor: (item: any) => new Date(item.startDate).toLocaleDateString() },
    { header: 'Hạn SV', accessor: (item: any) => new Date(item.han_sv_tu_cham).toLocaleDateString() },
    { header: 'Hạn BCS', accessor: (item: any) => new Date(item.han_bcs_cham).toLocaleDateString() },
    { header: 'Hạn CVHT', accessor: (item: any) => new Date(item.han_cvht_cham).toLocaleDateString() },
    {
      header: 'Thao tác',
      accessor: (item: any) => (
        <button className="btn-icon" onClick={() => handleEdit(item)}><Edit size={14} /></button>
      )
    }
  ];

  return (
    <div className="admin-page">
      <div className="page-header-actions">
        <div className="page-header-title">
          <Calendar size={22} className="title-icon" />
          <h1>QUẢN LÝ KỲ ĐÁNH GIÁ</h1>
        </div>
        <button className="btn-primary" onClick={() => {
          setEditingItem(null);
          setFormData(initialForm);
          setShowModal(true);
        }}>
          <Plus size={16} />
          <span>Mở kỳ đánh giá mới</span>
        </button>
      </div>

      <div className="glass-card">
        <CommonTable data={semesters} columns={columns} loading={loading} />
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card" style={{ maxWidth: '600px' }}>
            <h2>{editingItem ? 'Chỉnh sửa kỳ đánh giá' : 'Mở kỳ đánh giá mới'}</h2>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {!editingItem && (
                  <div className="form-group">
                    <label>Mã ID</label>
                    <input type="text" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} required placeholder="Ví dụ: hk2_2526" />
                  </div>
                )}
                <div className="form-group">
                  <label>Tên học kỳ</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Ví dụ: Học kỳ II (2025 - 2026)" />
                </div>
                <div className="form-group">
                  <label>Ngày bắt đầu</label>
                  <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Ngày kết thúc</label>
                  <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Hạn chót Sinh viên (SV)</label>
                  <input type="date" value={formData.han_sv_tu_cham} onChange={e => setFormData({...formData, han_sv_tu_cham: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Hạn chót Ban cán sự (BCS)</label>
                  <input type="date" value={formData.han_bcs_cham} onChange={e => setFormData({...formData, han_bcs_cham: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Hạn chót Cố vấn học tập (CVHT)</label>
                  <input type="date" value={formData.han_cvht_cham} onChange={e => setFormData({...formData, han_cvht_cham: e.target.value})} required />
                </div>
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
