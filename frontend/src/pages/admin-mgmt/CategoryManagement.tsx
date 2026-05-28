import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { CommonTable } from '../../components/CommonTable';
import { FolderTree, Plus, Trash2, Edit } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

type TabType = 'faculties' | 'programs' | 'classes';

export const CategoryManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('faculties');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const { addNotification } = useNotification();
  
  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : { fullName: 'Khách' };
  
  const [faculties, setFaculties] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);

  useEffect(() => {
    fetchData(activeTab);
    if (activeTab === 'programs') {
      fetchFaculties();
    } else if (activeTab === 'classes') {
      fetchPrograms();
    }
  }, [activeTab]);

  const fetchFaculties = async () => {
    try {
      const res = await api.get('/categories/faculties');
      setFaculties(res.data);
    } catch (err) {}
  };

  const fetchPrograms = async () => {
    try {
      const res = await api.get('/categories/programs');
      setPrograms(res.data);
    } catch (err) {}
  };

  const fetchData = async (tab: TabType) => {
    setLoading(true);
    try {
      const res = await api.get(`/categories/${tab}`);
      setData(res.data);
    } catch (err) {
      addNotification('Thông báo', 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    let nextId = '';
    const items = data;
    if (items && items.length > 0) {
      let max = 0;
      let prefix = '';
      if (activeTab === 'faculties') prefix = 'khoa_';
      else if (activeTab === 'programs') prefix = 'prog_';
      else if (activeTab === 'classes') prefix = 'class_';
      
      items.forEach(item => {
        if (item.id) {
          const match = item.id.match(new RegExp(`^${prefix}(\\d+)$`));
          if (match) {
            max = Math.max(max, parseInt(match[1]));
          }
        }
      });
      nextId = `${prefix}${(max + 1).toString().padStart(2, '0')}`;
    } else {
      if (activeTab === 'faculties') nextId = 'khoa_01';
      else if (activeTab === 'programs') nextId = 'prog_01';
      else if (activeTab === 'classes') nextId = 'class_01';
    }
    
    setEditingItem(null);
    setFormData({ id: nextId });
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ ...item });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mục này?')) {
      try {
        await api.delete(`/categories/${activeTab}/${id}`);
        addNotification(currentUser.fullName, 'xóa mục');
        fetchData(activeTab);
      } catch (err) {
        addNotification('Thông báo', 'Xóa thất bại');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/categories/${activeTab}/${editingItem.id}`, formData);
        addNotification(currentUser.fullName, 'cập nhật mục');
      } else {
        await api.post(`/categories/${activeTab}`, formData);
        addNotification(currentUser.fullName, 'thêm mục mới');
      }
      setShowModal(false);
      setEditingItem(null);
      fetchData(activeTab);
    } catch (err) {
      addNotification('Thông báo', 'Thao tác thất bại');
    }
  };

  const getColumns = () => {
    const actionsColumn = {
      header: 'Thao tác',
      accessor: (item: any) => (
        <div className="flex gap-2">
          <button className="btn-icon" onClick={() => handleEdit(item)}><Edit size={14} /></button>
          <button className="btn-icon text-danger" onClick={() => handleDelete(item.id)}><Trash2 size={14} /></button>
        </div>
      )
    };

    switch (activeTab) {
      case 'faculties':
        return [
          { header: 'ID Khoa', accessor: 'id' },
          { header: 'Tên Khoa', accessor: 'name' },
          { header: 'Mô tả', accessor: 'description' },
          actionsColumn
        ];
      case 'programs':
        return [
          { header: 'ID Khóa học', accessor: 'id' },
          { header: 'Tên Khóa học', accessor: 'name' },
          { header: 'ID Khoa', accessor: 'facultyId' },
          { header: 'Năm bắt đầu', accessor: 'startYear' },
          { header: 'Năm kết thúc', accessor: 'endYear' },
          actionsColumn
        ];
      case 'classes':
        return [
          { header: 'ID Lớp', accessor: 'id' },
          { header: 'Tên Lớp', accessor: 'name' },
          { header: 'ID Khóa học', accessor: 'academicProgramId' },
          { header: 'ID CVHT', accessor: 'cvhtId' },
          { header: 'Sĩ số', accessor: 'capacity' },
          actionsColumn
        ];
    }
  };

  const renderFormFields = () => {
    switch (activeTab) {
      case 'faculties':
        return (
          <>
            <div className="form-group">
              <label>ID Khoa</label>
              <input type="text" value={formData.id || ''} disabled />
            </div>
            <div className="form-group">
              <label>Tên Khoa</label>
              <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Mô tả</label>
              <input type="text" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
          </>
        );
      case 'programs':
        return (
          <>
            <div className="form-group">
              <label>ID Khóa học</label>
              <input type="text" value={formData.id || ''} disabled />
            </div>
            <div className="form-group">
              <label>Tên Khóa học</label>
              <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Khoa quản lý</label>
              <input 
                list="faculties-list"
                value={formData.facultyId || ''} 
                onChange={e => setFormData({...formData, facultyId: e.target.value})} 
                required 
                className="form-control"
                placeholder="Chọn hoặc nhập ID Khoa"
              />
              <datalist id="faculties-list">
                {faculties.map(f => (
                  <option key={f.id} value={f.id}>{f.id} - {f.name}</option>
                ))}
              </datalist>
            </div>
            <div className="form-group">
              <label>Năm bắt đầu</label>
              <input type="number" value={formData.startYear || ''} onChange={e => setFormData({...formData, startYear: Number(e.target.value)})} required />
            </div>
            <div className="form-group">
              <label>Năm kết thúc</label>
              <input type="number" value={formData.endYear || ''} onChange={e => setFormData({...formData, endYear: Number(e.target.value)})} required />
            </div>
          </>
        );
      case 'classes':
        return (
          <>
            <div className="form-group">
              <label>ID Lớp</label>
              <input type="text" value={formData.id || ''} disabled />
            </div>
            <div className="form-group">
              <label>Tên Lớp</label>
              <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Khóa học</label>
              <input 
                list="programs-list"
                value={formData.academicProgramId || ''} 
                onChange={e => setFormData({...formData, academicProgramId: e.target.value})} 
                required 
                className="form-control"
                placeholder="Chọn hoặc nhập ID Khóa học"
              />
              <datalist id="programs-list">
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                ))}
              </datalist>
            </div>
            <div className="form-group">
              <label>ID CVHT (Nếu có)</label>
              <input type="text" value={formData.cvhtId || ''} onChange={e => setFormData({...formData, cvhtId: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Sĩ số</label>
              <input type="number" value={formData.capacity || ''} onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} required />
            </div>
          </>
        );
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header-actions">
        <div className="page-header-title">
          <FolderTree size={22} className="title-icon" />
          <h1>QUẢN LÝ DANH MỤC</h1>
        </div>
        <button className="btn-primary" onClick={handleAddNew}>
          <Plus size={16} />
          <span>Thêm mới</span>
        </button>
      </div>

      <div className="tabs mb-4 flex gap-4">
        <button className={`btn-tab ${activeTab === 'faculties' ? 'active' : ''}`} onClick={() => setActiveTab('faculties')}>Khoa</button>
        <button className={`btn-tab ${activeTab === 'programs' ? 'active' : ''}`} onClick={() => setActiveTab('programs')}>Khóa học</button>
        <button className={`btn-tab ${activeTab === 'classes' ? 'active' : ''}`} onClick={() => setActiveTab('classes')}>Lớp học</button>
      </div>

      <div className="glass-card">
        <CommonTable data={data} columns={getColumns()} loading={loading} />
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <h2>{editingItem ? 'Chỉnh sửa' : 'Thêm mới'}</h2>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                {renderFormFields()}
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
