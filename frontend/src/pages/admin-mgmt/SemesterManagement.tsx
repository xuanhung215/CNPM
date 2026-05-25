import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { CommonTable } from '../../components/CommonTable';
import { Calendar, Plus, Edit } from 'lucide-react';

export const SemesterManagement: React.FC = () => {
  const [semesters, setSemesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    setLoading(true);
    try {
      const res = await api.get('/academic-year/semesters');
      setSemesters(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
        <button className="btn-icon"><Edit size={14} /></button>
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
        <button className="btn-primary">
          <Plus size={16} />
          <span>Mở kỳ đánh giá mới</span>
        </button>
      </div>

      <div className="glass-card">
        <CommonTable data={semesters} columns={columns} loading={loading} />
      </div>
    </div>
  );
};
