import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { CommonTable } from '../../components/CommonTable';
import type { Column } from '../../components/CommonTable';
import { Activity, Clock } from 'lucide-react';

interface AuditLogItem {
  id: string;
  username: string;
  action: string;
  timestamp: string;
}

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await api.get('/audit-logs');
        setLogs(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const columns: Column<AuditLogItem>[] = [
    { header: 'Mã số', accessor: 'id', width: '10%' },
    { header: 'Tài khoản', accessor: 'username', width: '20%' },
    { header: 'Hoạt động thao tác', accessor: 'action' },
    {
      header: 'Thời gian thực hiện',
      accessor: (item) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
          <Clock size={12} /> {new Date(item.timestamp).toLocaleString()}
        </span>
      ),
      width: '25%',
    },
  ];

  return (
    <div className="audit-logs-page">
      <div className="page-header-title">
        <Activity size={22} className="title-icon" />
        <h1>NHẬT KÝ THAO TÁC HỆ THỐNG</h1>
      </div>

      <div className="glass-card">
        <CommonTable data={logs} columns={columns} loading={loading} />
      </div>
    </div>
  );
};
export default AuditLogs;
