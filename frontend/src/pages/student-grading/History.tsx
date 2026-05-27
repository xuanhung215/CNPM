import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { CommonTable } from '../../components/CommonTable';
import type { Column } from '../../components/CommonTable';
import { History, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface HistoryItem {
  id: string;
  semesterName: string;
  studentSumScore: number;
  bcsSumScore?: number;
  cvhtSumScore?: number;
  status: string;
  classification?: string;
}

export const StudentHistory: React.FC = () => {
  const [data, setData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/grading/history');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'HOAN_THANH':
        return <span className="status-badge success"><CheckCircle size={12} /> Hoàn thành</span>;
      case 'CHO_BCS':
      case 'CHO_CVHT':
        return <span className="status-badge warning"><Clock size={12} /> Đang duyệt</span>;
      default:
        return <span className="status-badge info"><AlertCircle size={12} /> Bản nháp</span>;
    }
  };

  const columns: Column<HistoryItem>[] = [
    { header: 'Học kỳ', accessor: 'semesterName' },
    { header: 'Điểm tự chấm', accessor: 'studentSumScore', width: '15%' },
    { header: 'Điểm BCS lớp chấm', accessor: (item) => item.bcsSumScore ?? '-', width: '15%' },
    { header: 'Điểm Cố vấn duyệt', accessor: (item) => item.cvhtSumScore ?? '-', width: '15%' },
    { header: 'Phân loại', accessor: (item) => item.classification ?? '-', width: '15%' },
    {
      header: 'Trạng thái',
      accessor: (item) => getStatusBadge(item.status),
      width: '15%',
    },
  ];

  return (
    <div className="history-page">
      <div className="page-header-title">
        <History size={22} className="title-icon" />
        <h1>LỊCH SỬ ĐÁNH GIÁ CỦA BẢN THÂN</h1>
      </div>

      <div className="glass-card">
        <CommonTable data={data} columns={columns} loading={loading} />
      </div>
    </div>
  );
};
export default StudentHistory;
