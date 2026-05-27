import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGrading } from '../../hooks/useGrading';
import { CommonTable } from '../../components/CommonTable';
import type { Column } from '../../components/CommonTable';
import { Users, FileEdit, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface StudentApprovalRow {
  id: string; // sheet ID
  studentId: string;
  fullName: string;
  status: string;
  studentSumScore: number;
  bcsSumScore?: number;
  cvhtSumScore?: number;
}

export const ListStudents: React.FC = () => {
  const { getClassStudents, loading } = useGrading();
  const [students, setStudents] = useState<StudentApprovalRow[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Lấy thông tin user từ localStorage để lấy classId
        const userJson = localStorage.getItem('user');
        const user = userJson ? JSON.parse(userJson) : null;
        const classId = user?.classId || 'CNPM-K45-A';
        
        const data = await getClassStudents(classId);
        setStudents(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStudents();
  }, [getClassStudents]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'BAN_NHAP':
        return <span className="status-badge draft"><Clock size={12} /> Bản nháp</span>;
      case 'CHO_BCS':
        return <span className="status-badge warning"><AlertCircle size={12} /> Chờ BCS lớp duyệt</span>;
      case 'CHO_CVHT':
        return <span className="status-badge info"><Clock size={12} /> Chờ CVHT duyệt</span>;
      case 'HOAN_THANH':
        return <span className="status-badge success"><CheckCircle size={12} /> Hoàn thành</span>;
      default:
        return <span className="status-badge draft">{status}</span>;
    }
  };

  const columns: Column<StudentApprovalRow>[] = [
    { header: 'Mã sinh viên', accessor: 'studentId', width: '15%' },
    { header: 'Họ và tên', accessor: 'fullName' },
    {
      header: 'Trạng thái',
      accessor: (item) => getStatusBadge(item.status),
      width: '25%',
    },
    {
      header: 'Điểm tự chấm',
      accessor: (item) => `${item.studentSumScore} đ`,
      width: '15%',
    },
    {
      header: 'Thao tác',
      accessor: (item) => (
        <button
          onClick={() => navigate(`/class-approval/review/${item.id}`)}
          className="btn-action-view"
          disabled={item.status === 'BAN_NHAP'}
        >
          <FileEdit size={12} />
          <span>Duyệt điểm</span>
        </button>
      ),
      width: '15%',
    },
  ];

  return (
    <div className="class-approval-page">
      <div className="page-header-title">
        <Users size={22} className="title-icon" />
        <h1>DANH SÁCH DUYỆT ĐIỂM RÈN LUYỆN LỚP</h1>
      </div>

      <div className="glass-card">
        <CommonTable data={students} columns={columns} loading={loading} />
      </div>
    </div>
  );
};
export default ListStudents;
