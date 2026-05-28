import React, { useEffect, useState } from 'react';
import { useGrading } from '../../hooks/useGrading';
import api from '../../config/api';
import { ClipboardList, Save, Upload, Check, FileText, AlertCircle, Send, Info } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export const FormGrading: React.FC = () => {
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : { fullName: 'Khách', username: 'N/A', classId: 'N/A' };

  const { getMySheet, submitStudentScore, loading, error } = useGrading();
  const { addNotification } = useNotification();
  const [criteria, setCriteria] = useState<any[]>([]);
  const [scores, setScores] = useState<{ [key: string]: number }>({});
  const [evidence, setEvidence] = useState<{ [key: string]: string }>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [status, setStatus] = useState<string>('');
  const [isLocked, setIsLocked] = useState(false);
  const [sheet, setSheet] = useState<any>(null);

  // Complaint state
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [selectedCriteria, setSelectedCriteria] = useState<any>(null);
  const [complaintContent, setComplaintContent] = useState('');
  const [isWithinComplaintWindow, setIsWithinComplaintWindow] = useState(false);

  useEffect(() => {
    const initData = async () => {
      try {
        const cRes = await api.get('/criteria/tree');
        setCriteria(cRes.data);

        const sheetData = await getMySheet('20252');
        setSheet(sheetData);
        const initialScores: { [key: string]: number } = {};
        const initialEvidence: { [key: string]: string } = {};
        sheetData.details.forEach((d: any) => {
          initialScores[d.criteriaId] = d.studentScore;
          initialEvidence[d.criteriaId] = d.evidenceUrl || '';
        });
        setScores(initialScores);
        setEvidence(initialEvidence);
        setStatus(sheetData.status);
        setIsLocked(sheetData.status !== 'BAN_NHAP');

        if (sheetData.status === 'HOAN_THANH') {
          const updatedAt = new Date(sheetData.updatedAt);
          const now = new Date();
          const diffDays = Math.ceil((now.getTime() - updatedAt.getTime()) / (1000 * 3600 * 24));
          setIsWithinComplaintWindow(diffDays <= 7);
        }
      } catch (err) {
        console.error(err);
      }
    };
    initData();
  }, [getMySheet]);

  const handleScoreChange = (criteriaId: string, value: number, maxPoints: number) => {
    if (isLocked) return;
    const minVal = Math.min(0, maxPoints);
    const maxVal = Math.max(0, maxPoints);
    const resolvedValue = Math.min(Math.max(minVal, value), maxVal);
    setScores((prev) => ({ ...prev, [criteriaId]: resolvedValue }));
  };

  const handleFileUpload = (criteriaId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked) return;
    const file = event.target.files?.[0];
    if (file) {
      // Create a local blob URL so the user can preview the file immediately
      const fileUrl = URL.createObjectURL(file);
      setEvidence((prev) => ({ ...prev, [criteriaId]: fileUrl }));
      setSuccessMsg(`Đã đính kèm tệp: ${file.name}`);
    }
  };

  const handleAction = async (isDraft: boolean) => {
    setSuccessMsg('');
    const details = Object.keys(scores).map((key) => ({
      criteriaId: key,
      score: scores[key],
      evidenceUrl: evidence[key],
    }));

    try {
      const updatedSheet = await submitStudentScore('20252', details, isDraft);
      if (isDraft) {
        setSuccessMsg('Đã lưu tạm dữ liệu thành công!');
      } else {
        setSuccessMsg('Nộp phiếu tự đánh giá thành công! Điểm số đã được chuyển lên Ban Cán Sự lớp phê duyệt.');
        addNotification(user.fullName, 'nộp phiếu tự đánh giá');
        setIsLocked(true);
        setStatus(updatedSheet.status);
      }
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
    }
  };

  const submitComplaint = async () => {
    if (!complaintContent || !selectedCriteria || !sheet) return;
    try {
      await api.post('/complaints/submit', {
        gradingId: sheet.id,
        criteriaId: selectedCriteria.id,
        content: complaintContent,
      });
      setSuccessMsg(`Đã gửi khiếu nại cho tiêu chí ${selectedCriteria.id} thành công!`);
      setShowComplaintModal(false);
      setComplaintContent('');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Gửi khiếu nại thất bại');
    }
  };

  const calculateTotal = () => {
    return Object.values(scores).reduce((sum, val) => sum + (val || 0), 0);
  };

  const renderScoreInput = (c: any, currentScore: number) => {
    if (c.inputType === 'select') {
      const opts = Array.isArray(c.options) ? c.options : [];
      return (
        <select 
          value={currentScore} 
          onChange={e => handleScoreChange(c.id, Number(e.target.value), c.maxPoints)}
          className="form-control text-sm w-full"
          disabled={isLocked}
        >
          <option value={0}>-- Chọn --</option>
          {opts.map((o: any, idx: number) => (
            <option key={idx} value={o.points}>{o.label} ({o.points > 0 ? `+${o.points}` : o.points}đ)</option>
          ))}
        </select>
      );
    }

    if (c.inputType === 'count') {
      const unit = c.options?.unitPoint || 1;
      const count = currentScore / unit;
      const maxCount = c.maxPoints > 0 ? Math.floor(c.maxPoints / unit) : 100;
      return (
        <div className="flex items-center justify-center gap-1">
          <input 
            type="number" 
            min="0"
            max={maxCount}
            value={count || ''}
            onChange={e => {
              const val = Number(e.target.value) || 0;
              handleScoreChange(c.id, val * unit, c.maxPoints);
            }}
            className="score-input-table w-16"
            disabled={isLocked}
          />
          <span className="text-xs text-gray-500 whitespace-nowrap">x{unit}đ</span>
        </div>
      );
    }

    if (c.inputType === 'checkbox') {
      return (
        <div className="flex items-center justify-center">
          <input 
            type="checkbox"
            checked={currentScore !== 0}
            onChange={e => handleScoreChange(c.id, e.target.checked ? c.maxPoints : 0, c.maxPoints)}
            disabled={isLocked}
            style={{ width: '20px', height: '20px', cursor: isLocked ? 'default' : 'pointer' }}
          />
        </div>
      );
    }

    // Default 'fixed'
    return (
      <input
        type="number"
        min="0"
        max={c.maxPoints}
        value={currentScore === 0 ? '' : currentScore}
        onChange={(e) => handleScoreChange(c.id, parseInt(e.target.value) || 0, c.maxPoints)}
        className="score-input-table"
        disabled={isLocked}
      />
    );
  };

  const renderCriteriaRows = (nodes: any[], level = 0) => {
    return nodes.map((c) => {
      const isParent = !!c.children && c.children.length > 0;
      const currentScore = scores[c.id] || 0;
      const proof = evidence[c.id] || '';

      return (
        <React.Fragment key={c.id}>
          <tr className={isParent ? `parent-row level-${level}` : `child-row level-${level}`}>
            <td className="text-center"><strong>{c.id}</strong></td>
            <td>
              <div className="criteria-content">
                <span className="criteria-name">{c.name}</span>
                {status === 'HOAN_THANH' && isWithinComplaintWindow && !isParent && (
                  <button
                    type="button"
                    className="btn-complaint-small"
                    onClick={() => {
                      setSelectedCriteria(c);
                      setShowComplaintModal(true);
                    }}
                  >
                    <AlertCircle size={12} />
                    <span>Khiếu nại</span>
                  </button>
                )}
              </div>
            </td>
            <td className="text-center">{c.maxPoints} điểm</td>
            <td className="text-center">
              {isParent ? (
                <span className="parent-score-display">{currentScore}</span>
              ) : (
                renderScoreInput(c, currentScore)
              )}
            </td>
            <td className="text-center">
              {!isParent && (
                <div className="evidence-action">
                  {proof ? (
                    <a href={proof} target="_blank" rel="noreferrer" className="proof-link-badge">
                      Đã có minh chứng
                    </a>
                  ) : (
                    !isLocked && (
                      <label className="btn-upload-table" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <input 
                          type="file" 
                          style={{ display: 'none' }}
                          onChange={(e) => handleFileUpload(c.id, e)}
                        />
                        <Upload size={12} />
                      </label>
                    )
                  )}
                </div>
              )}
            </td>
          </tr>
          {isParent && renderCriteriaRows(c.children, level + 1)}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="grading-page-container">
      <div className="grading-header">
        <div className="header-left">
          <ClipboardList size={28} className="text-primary" />
          <div>
            <h1>PHIẾU ĐÁNH GIÁ ĐIỂM RÈN LUYỆN</h1>
            <p className="text-muted">Mã SV: {user.username} | Họ tên: {user.fullName} | Lớp: {user.classId || 'N/A'}</p>
          </div>
        </div>
        <div className="header-right">
          <div className={`status-pill status-${status.toLowerCase()}`}>
            {status === 'BAN_NHAP' ? 'Đang thực hiện' : 'Đã nộp phiếu'}
          </div>
          <div className="total-points-display">
            <span className="label">Tổng cộng:</span>
            <span className="value">{calculateTotal()} / 100</span>
          </div>
        </div>
      </div>

      {successMsg && <div className="alert alert-success animate-slide-down"><Check size={18} /> {successMsg}</div>}
      {error && <div className="alert alert-danger animate-slide-down"><Info size={18} /> {error}</div>}

      <div className="grading-card shadow-sm">
        <div className="table-responsive">
          <table className="modern-grading-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>TT</th>
                <th>Nội dung đánh giá</th>
                <th style={{ width: '120px' }}>Điểm quy định</th>
                <th style={{ width: '120px' }}>SV tự chấm</th>
                <th style={{ width: '150px' }}>Minh chứng</th>
              </tr>
            </thead>
            <tbody>
              {renderCriteriaRows(criteria)}
              <tr className="total-row">
                <td colSpan={2} className="text-right"><strong>TỔNG CỘNG ĐIỂM RÈN LUYỆN</strong></td>
                <td className="text-center"><strong>100 điểm</strong></td>
                <td className="text-center"><strong>{calculateTotal()} điểm</strong></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        {!isLocked && (
          <div className="grading-actions-footer">
            <div className="info-tip">
              <Info size={16} />
              <span>Dữ liệu sẽ được tự động lưu khi bạn thay đổi điểm. Nhấn "Nộp phiếu" để gửi lên lớp.</span>
            </div>
            <div className="buttons">
              <button 
                type="button" 
                className="btn-outline" 
                onClick={() => handleAction(true)}
                disabled={loading}
              >
                <Save size={18} />
                <span>Lưu bản nháp</span>
              </button>
              <button 
                type="button" 
                className="btn-primary-filled" 
                onClick={() => handleAction(false)}
                disabled={loading}
              >
                <FileText size={18} />
                <span>Nộp phiếu chính thức</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {showComplaintModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <div className="modal-header">
              <h3>Gửi khiếu nại điểm rèn luyện</h3>
              <button className="btn-close" onClick={() => setShowComplaintModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Tiêu chí: <strong>{selectedCriteria?.id} - {selectedCriteria?.name}</strong></p>
              <div className="form-group mt-3">
                <label>Nội dung khiếu nại:</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Mô tả chi tiết lý do bạn khiếu nại và các minh chứng bổ sung (nếu có)..."
                  value={complaintContent}
                  onChange={(e) => setComplaintContent(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowComplaintModal(false)}>Hủy</button>
              <button className="btn-primary" onClick={submitComplaint} disabled={!complaintContent}>
                <Send size={16} />
                <span>Gửi khiếu nại</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormGrading;
