import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { CommonTable } from '../../components/CommonTable';
import type { Column } from '../../components/CommonTable';
import { ShieldAlert, CheckCircle, XCircle, Eye } from 'lucide-react';

interface ComplaintItem {
  id: string;
  studentId: string;
  gradingId: string;
  criteriaId: string;
  content: string;
  status: string;
  createdAt: string;
  response?: string;
  newScore?: number;
}

export const ListComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintItem | null>(null);
  const [resolveAction, setResolveAction] = useState<'ACCEPT' | 'REJECT' | null>(null);
  const [response, setResponse] = useState('');
  const [newScore, setNewScore] = useState<number>(0);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleResolve = async () => {
    if (!selectedComplaint || !resolveAction || !response) return;
    try {
      await api.post(`/complaints/resolve/${selectedComplaint.id}`, {
        action: resolveAction,
        response,
        newScore: resolveAction === 'ACCEPT' ? newScore : undefined,
      });
      setSuccessMsg(`Đã ${resolveAction === 'ACCEPT' ? 'chấp nhận' : 'từ chối'} khiếu nại thành công!`);
      setSelectedComplaint(null);
      setResolveAction(null);
      setResponse('');
      fetchComplaints();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Xử lý khiếu nại thất bại');
    }
  };

  const columns: Column<ComplaintItem>[] = [
    { header: 'Sinh viên', accessor: 'studentId', width: '10%' },
    { header: 'Tiêu chí', accessor: 'criteriaId', width: '10%' },
    { header: 'Nội dung', accessor: 'content' },
    {
      header: 'Trạng thái',
      accessor: (item) => (
        <span className={`status-badge status-${item.status.toLowerCase()}`}>
          {item.status === 'PENDING' ? 'Chờ xử lý' : item.status === 'RESOLVED' ? 'Đã giải quyết' : 'Đã từ chối'}
        </span>
      ),
      width: '15%',
    },
    {
      header: 'Thao tác',
      accessor: (item) => (
        <button
          className="btn-action-view"
          onClick={() => {
            setSelectedComplaint(item);
            setNewScore(0);
          }}
        >
          <Eye size={14} />
          <span>Xem chi tiết</span>
        </button>
      ),
      width: '15%',
    },
  ];

  return (
    <div className="complaints-page">
      <div className="page-header-title">
        <ShieldAlert size={22} className="title-icon" />
        <h1>QUẢN LÝ KHIẾU NẠI ĐIỂM RÈN LUYỆN</h1>
      </div>

      {successMsg && <div className="success-alert mb-4">{successMsg}</div>}

      <div className="glass-card">
        <CommonTable data={complaints} columns={columns} loading={loading} />
      </div>

      {selectedComplaint && (
        <div className="modal-overlay">
          <div className="modal-content glass-card" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Chi tiết khiếu nại</h3>
              <button className="btn-close" onClick={() => setSelectedComplaint(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="info-grid mb-4">
                <div className="info-item">
                  <span className="info-label">Mã khiếu nại:</span>
                  <span className="info-value">{selectedComplaint.id}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Sinh viên:</span>
                  <span className="info-value">{selectedComplaint.studentId}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Tiêu chí:</span>
                  <span className="info-value">{selectedComplaint.criteriaId}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Ngày gửi:</span>
                  <span className="info-value">{new Date(selectedComplaint.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="complaint-content-box mb-4">
                <label className="info-label">Nội dung khiếu nại:</label>
                <p className="mt-1 p-3 bg-light rounded">{selectedComplaint.content}</p>
              </div>

              {selectedComplaint.status === 'PENDING' ? (
                <div className="resolve-actions border-top pt-4">
                  <label className="info-label mb-2 d-block">Xử lý khiếu nại:</label>
                  <div className="d-flex gap-2 mb-3">
                    <button
                      className={`btn-outline-success ${resolveAction === 'ACCEPT' ? 'active' : ''}`}
                      onClick={() => setResolveAction('ACCEPT')}
                    >
                      <CheckCircle size={16} /> Chấp nhận
                    </button>
                    <button
                      className={`btn-outline-danger ${resolveAction === 'REJECT' ? 'active' : ''}`}
                      onClick={() => setResolveAction('REJECT')}
                    >
                      <XCircle size={16} /> Từ chối
                    </button>
                  </div>

                  {resolveAction && (
                    <div className="resolve-form animate-fade-in">
                      {resolveAction === 'ACCEPT' && (
                        <div className="form-group mb-3">
                          <label className="form-label">Điểm số mới sau phúc khảo:</label>
                          <input
                            type="number"
                            className="form-control"
                            value={newScore}
                            onChange={(e) => setNewScore(parseInt(e.target.value) || 0)}
                          />
                        </div>
                      )}
                      <div className="form-group">
                        <label className="form-label">Phản hồi cho sinh viên:</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          placeholder="Nhập lý do chấp nhận hoặc từ chối..."
                          value={response}
                          onChange={(e) => setResponse(e.target.value)}
                        ></textarea>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="resolved-info border-top pt-4">
                  <div className={`status-alert ${selectedComplaint.status === 'RESOLVED' ? 'alert-success' : 'alert-danger'}`}>
                    <strong>Trạng thái: {selectedComplaint.status === 'RESOLVED' ? 'Đã chấp nhận' : 'Đã từ chối'}</strong>
                    {selectedComplaint.status === 'RESOLVED' && <p>Điểm mới: {selectedComplaint.newScore} đ</p>}
                    <p className="mt-2">Phản hồi: {selectedComplaint.response}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedComplaint(null)}>Đóng</button>
              {selectedComplaint.status === 'PENDING' && resolveAction && (
                <button className="btn-primary" onClick={handleResolve} disabled={!response}>
                  Xác nhận xử lý
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListComplaints;
