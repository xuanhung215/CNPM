import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGrading } from '../../hooks/useGrading';
import api from '../../config/api';
import { ClipboardList, ArrowLeft, CheckCircle, Save, ExternalLink, Lock, Info, UserCheck } from 'lucide-react';
import { Role } from '../../constants/role';

export const ReviewForm: React.FC = () => {
  const { sheetId } = useParams<{ sheetId: string }>();
  const navigate = useNavigate();
  const { getSheetById, submitBcsReview, submitCvhtApprove, loading, error } = useGrading();
  
  const [criteria, setCriteria] = useState<any[]>([]);
  const [sheet, setSheet] = useState<any>(null);
  const [scores, setScores] = useState<{ [key: string]: number }>({});
  const [reasons, setReasons] = useState<{ [key: string]: string }>({});
  const [successMsg, setSuccessMsg] = useState('');

  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : { role: Role.BCS };
  const isBcs = currentUser.role === Role.BCS;
  const isCvht = currentUser.role === Role.CVHT;

  useEffect(() => {
    const initData = async () => {
      try {
        const cRes = await api.get('/criteria/tree');
        setCriteria(cRes.data);

        if (sheetId) {
          const sheetData = await getSheetById(sheetId);
          setSheet(sheetData);

          const initialScores: { [key: string]: number } = {};
          const initialReasons: { [key: string]: string } = {};
          
          sheetData.details.forEach((d: any) => {
            if (isBcs) {
              initialScores[d.criteriaId] = d.bcsScore !== null && d.bcsScore !== undefined ? d.bcsScore : d.studentScore;
              initialReasons[d.criteriaId] = d.bcsReason || '';
            } else if (isCvht) {
              initialScores[d.criteriaId] = d.cvhtScore !== null && d.cvhtScore !== undefined ? d.cvhtScore : (d.bcsScore !== null && d.bcsScore !== undefined ? d.bcsScore : d.studentScore);
              initialReasons[d.criteriaId] = d.cvhtReason || '';
            }
          });
          
          setScores(initialScores);
          setReasons(initialReasons);
        }
      } catch (err) {
        console.error(err);
      }
    };
    initData();
  }, [sheetId, getSheetById, isBcs, isCvht]);

  const handleScoreChange = (criteriaId: string, value: number, maxPoints: number) => {
    if (sheet?.status === 'HOAN_THANH') return;
    const resolvedValue = Math.min(Math.max(0, value), maxPoints);
    setScores((prev) => ({ ...prev, [criteriaId]: resolvedValue }));
  };

  const handleReasonChange = (criteriaId: string, value: string) => {
    if (sheet?.status === 'HOAN_THANH') return;
    setReasons((prev) => ({ ...prev, [criteriaId]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    if (!sheetId) return;

    try {
      const details = Object.keys(scores).map((key) => ({
        criteriaId: key,
        score: scores[key],
        reason: reasons[key],
      }));

      if (isBcs) {
        const res = await submitBcsReview(sheetId, details);
        setSheet(res);
        setSuccessMsg('Đã lưu điểm thẩm định của Ban cán sự lớp! Phiếu điểm đã được chuyển cho Cố vấn học tập duyệt.');
      } else if (isCvht) {
        const res = await submitCvhtApprove(sheetId, details);
        setSheet(res);
        setSuccessMsg('Cố vấn học tập đã chính thức duyệt và khóa phiếu điểm rèn luyện! Trạng thái: HOÀN THÀNH.');
      }
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
    }
  };

  const calculateTotal = () => {
    return Object.values(scores).reduce((sum, val) => sum + (val || 0), 0);
  };

  const isLocked = sheet?.status === 'HOAN_THANH';

  const renderReviewRows = (nodes: any[], level = 0) => {
    return nodes.map((c) => {
      const isParent = !!c.children && c.children.length > 0;
      const detail = sheet.details.find((d: any) => d.criteriaId === c.id);
      const studentScore = detail?.studentScore || 0;
      const bcsScore = detail?.bcsScore !== null && detail?.bcsScore !== undefined ? detail.bcsScore : studentScore;
      
      const currentScore = scores[c.id] || 0;
      const currentReason = reasons[c.id] || '';
      const proof = detail?.evidenceUrl || '';
      
      const comparisonScore = isBcs ? studentScore : bcsScore;
      const scoreChanged = currentScore !== comparisonScore;

      return (
        <React.Fragment key={c.id}>
          <tr className={isParent ? `parent-row level-${level}` : `child-row level-${level}`}>
            <td className="text-center"><strong>{c.id}</strong></td>
            <td>{c.name}</td>
            <td className="text-center">{c.maxPoints}</td>
            <td className="text-center">{isParent ? '-' : studentScore}</td>
            {isCvht && <td className="text-center">{isParent ? '-' : bcsScore}</td>}
            <td className="text-center">
              {isParent ? (
                <span className="parent-score-display">{currentScore}</span>
              ) : (
                <input
                  type="number"
                  min="0"
                  max={c.maxPoints}
                  value={currentScore}
                  onChange={(e) => handleScoreChange(c.id, parseInt(e.target.value) || 0, c.maxPoints)}
                  className={`score-input-table ${scoreChanged ? 'input-changed' : ''}`}
                  disabled={isLocked}
                />
              )}
            </td>
            <td>
              {!isParent && (
                <input
                  type="text"
                  placeholder="Nhập lý do nếu đổi điểm..."
                  value={currentReason}
                  onChange={(e) => handleReasonChange(c.id, e.target.value)}
                  className={`reason-input-table ${scoreChanged && !currentReason ? 'input-error' : ''}`}
                  required={scoreChanged}
                  disabled={isLocked}
                />
              )}
            </td>
            <td className="text-center">
              {proof ? (
                <a href={proof} target="_blank" rel="noreferrer" className="proof-link-icon">
                  <ExternalLink size={16} />
                </a>
              ) : '-'}
            </td>
          </tr>
          {isParent && renderReviewRows(c.children, level + 1)}
        </React.Fragment>
      );
    });
  };

  if (!sheet) return <div className="loading-spinner">Đang tải thông tin phiếu điểm...</div>;

  return (
    <div className="review-page-container">
      <button onClick={() => navigate('/class-approval')} className="btn-back-link">
        <ArrowLeft size={16} />
        <span>Quay lại danh sách</span>
      </button>

      <div className="review-header mt-4">
        <div className="header-left">
          <UserCheck size={28} className="text-primary" />
          <div>
            <h1>THẨM ĐỊNH PHIẾU ĐIỂM RÈN LUYỆN</h1>
            <p className="text-muted">Sinh viên: Nguyễn Văn A (sv01) | Học kỳ: {sheet.semesterId}</p>
          </div>
        </div>
        <div className="header-right">
          <div className="total-review-display">
            <span className="label">Tổng {isBcs ? 'BCS' : 'CVHT'} chấm:</span>
            <span className="value">{calculateTotal()} đ</span>
          </div>
        </div>
      </div>

      <div className="status-banner glass-card mb-4">
        <div className="banner-item">
          <span className="label">Trạng thái phiếu:</span>
          <span className={`status-pill status-${sheet.status.toLowerCase()}`}>
            {sheet.status === 'HOAN_THANH' ? 'Đã khóa sổ' : sheet.status}
          </span>
        </div>
        <div className="banner-item">
          <span className="label">Tổng SV tự chấm:</span>
          <span className="value-highlight">{sheet.studentSumScore} điểm</span>
        </div>
        {isLocked && <div className="lock-indicator"><Lock size={16} /> Phiếu đã chốt, không thể chỉnh sửa</div>}
      </div>

      {successMsg && <div className="alert alert-success animate-slide-down"><CheckCircle size={18} /> {successMsg}</div>}
      {error && <div className="alert alert-danger animate-slide-down"><Info size={18} /> {error}</div>}

      <form onSubmit={handleSave} className="review-card shadow-sm">
        <div className="table-responsive">
          <table className="modern-grading-table review-mode">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>TT</th>
                <th>Nội dung đánh giá</th>
                <th style={{ width: '60px' }}>Max</th>
                <th style={{ width: '60px' }}>SV</th>
                {isCvht && <th style={{ width: '60px' }}>Lớp</th>}
                <th style={{ width: '100px' }}>{isBcs ? 'BCS chấm' : 'CVHT chấm'}</th>
                <th style={{ width: '200px' }}>Lý do (nếu đổi điểm)</th>
                <th style={{ width: '80px' }}>Minh chứng</th>
              </tr>
            </thead>
            <tbody>
              {renderReviewRows(criteria)}
              <tr className="total-row">
                <td colSpan={2} className="text-right"><strong>TỔNG CỘNG ĐIỂM RÈN LUYỆN</strong></td>
                <td className="text-center"><strong>100</strong></td>
                <td className="text-center"><strong>{sheet.studentSumScore}</strong></td>
                {isCvht && <td className="text-center"><strong>{sheet.bcsSumScore}</strong></td>}
                <td className="text-center"><strong>{calculateTotal()}</strong></td>
                <td colSpan={2}></td>
              </tr>
            </tbody>
          </table>
        </div>

        {!isLocked && (
          <div className="review-actions-footer">
            <div className="info-tip">
              <Info size={16} />
              <span>Vui lòng kiểm tra kỹ minh chứng của sinh viên trước khi điều chỉnh điểm.</span>
            </div>
            <button type="submit" className="btn-primary-filled" disabled={loading}>
              <Save size={18} />
              <span>{loading ? 'Đang lưu...' : (isBcs ? 'Gửi lên Cố vấn' : 'Chốt điểm & Khóa sổ lớp')}</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ReviewForm;
