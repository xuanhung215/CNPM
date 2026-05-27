import React, { useEffect, useState } from 'react';
import { Calendar, CheckCircle, Bell, Award, BarChart3, Download, Users as UsersIcon } from 'lucide-react';
import api from '../../config/api';
import { Role } from '../../constants/role';

export const Dashboard: React.FC = () => {
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : { fullName: 'Khách', role: Role.SINHVIEN };
  const isAdmin = user.role === Role.ADMIN;
  const isBcsOrCvht = user.role === Role.BCS || user.role === Role.CVHT;

  const [stats, setStats] = useState<any>(null);
  const [currentSemester, setCurrentSemester] = useState<any>(null);

  useEffect(() => {
    if (isAdmin) {
      api.get('/grading/stats/overview').then(res => setStats(res.data));
    }
    api.get('/academic-year/semesters').then(res => {
      if (res.data && res.data.length > 0) {
        setCurrentSemester(res.data[0]); // Lấy kỳ mới nhất
      }
    });
  }, [isAdmin]);

  const handleExport = async () => {
    try {
      const res = await api.get('/grading/export/excel/D23_CNTT01');
      window.open(res.data.url, '_blank');
    } catch (err) {
      alert('Xuất báo cáo thất bại');
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-welcome">
        <h1>Chào mừng quay trở lại, {user.fullName}!</h1>
        <p>Cổng thông tin tự động chấm điểm và đánh giá trực tuyến</p>
      </div>

      {isAdmin && stats && (
        <div className="admin-stats-overview mb-4">
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper blue">
                <UsersIcon size={24} />
              </div>
              <div className="stat-info">
                <h3>Tổng sinh viên</h3>
                <p className="stat-value">{stats.totalStudents}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper green">
                <CheckCircle size={24} />
              </div>
              <div className="stat-info">
                <h3>Phiếu hoàn thành</h3>
                <p className="stat-value">{stats.completedSheets}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper gold">
                <BarChart3 size={24} />
              </div>
              <div className="stat-info">
                <h3>Chờ BCS duyệt</h3>
                <p className="stat-value">{stats.pendingBcs}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isBcsOrCvht && (
        <div className="quick-actions-bar mb-4">
          <button className="btn-primary" onClick={handleExport}>
            <Download size={16} />
            <span>Xuất bảng điểm lớp (Excel)</span>
          </button>
        </div>
      )}

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper blue">
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <h3>Học kỳ hiện tại</h3>
            <p className="stat-value">{currentSemester ? currentSemester.name : 'Đang tải...'}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-wrapper green">
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>Trạng thái đợt chấm</h3>
            <p className="stat-value">{currentSemester ? 'Đang mở cổng' : 'Chưa có kỳ đánh giá'}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper gold">
            <Award size={24} />
          </div>
          <div className="stat-info">
            <h3>Hạn cuối nộp phiếu</h3>
            <p className="stat-value">30/06/2026</p>
          </div>
        </div>
      </div>

      <div className="dashboard-announcements">
        <div className="card-header-with-icon">
          <Bell size={20} className="gold-icon" />
          <h2>Thông báo & Công văn của Nhà Trường</h2>
        </div>
        <ul className="announcement-list">
          <li>
            <span className="announcement-date">18/05/2026</span>
            <a href="#link">Quyết định v/v mở cổng tự đánh giá kết quả điểm rèn luyện học kỳ II</a>
          </li>
          <li>
            <span className="announcement-date">10/05/2026</span>
            <a href="#link">Hướng dẫn tải tệp và ảnh minh chứng điểm rèn luyện đúng tiêu chuẩn</a>
          </li>
          <li>
            <span className="announcement-date">01/05/2026</span>
            <a href="#link">Kế hoạch triển khai xét duyệt học bổng rèn luyện & học tập toàn khoá</a>
          </li>
        </ul>
      </div>
    </div>
  );
};
export default Dashboard;
