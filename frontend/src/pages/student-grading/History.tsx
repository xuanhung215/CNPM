import { CommonTable } from '../../components/CommonTable';
import type { Column } from '../../components/CommonTable';
import { History, CheckCircle } from 'lucide-react';

interface HistoryItem {
  semester: string;
  studentScore: number;
  bcsScore: number;
  cvhtScore: number;
  status: string;
  classification: string;
}

export const StudentHistory: React.FC = () => {
  const data: HistoryItem[] = [
    { semester: 'Học kỳ I (2025 - 2026)', studentScore: 85, bcsScore: 82, cvhtScore: 82, status: 'HOAN_THANH', classification: 'Tốt' },
    { semester: 'Học kỳ II (2024 - 2025)', studentScore: 78, bcsScore: 78, cvhtScore: 78, status: 'HOAN_THANH', classification: 'Khá' },
    { semester: 'Học kỳ I (2024 - 2025)', studentScore: 92, bcsScore: 90, cvhtScore: 90, status: 'HOAN_THANH', classification: 'Xuất sắc' },
  ];

  const columns: Column<HistoryItem>[] = [
    { header: 'Học kỳ', accessor: 'semester' },
    { header: 'Điểm tự chấm', accessor: 'studentScore', width: '15%' },
    { header: 'Điểm BCS lớp chấm', accessor: 'bcsScore', width: '15%' },
    { header: 'Điểm Cố vấn duyệt', accessor: 'cvhtScore', width: '15%' },
    { header: 'Phân loại', accessor: 'classification', width: '15%' },
    {
      header: 'Trạng thái',
      accessor: () => (
        <span className="status-badge success">
          <CheckCircle size={12} /> Hoàn thành
        </span>
      ),
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
        <CommonTable data={data} columns={columns} />
      </div>
    </div>
  );
};
export default StudentHistory;
