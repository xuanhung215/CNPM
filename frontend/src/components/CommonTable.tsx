import React from 'react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  width?: string;
}

interface CommonTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
}

export function CommonTable<T>({ data, columns, loading }: CommonTableProps<T>) {
  return (
    <div className="table-responsive">
      <table className="common-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} style={{ width: col.width }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-4" style={{ color: 'var(--text-secondary)' }}>
                Đang tải dữ liệu...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-4" style={{ color: 'var(--text-secondary)' }}>
                Không tìm thấy dữ liệu phù hợp.
              </td>
            </tr>
          ) : (
            data.map((item, rowIdx) => (
              <tr key={rowIdx}>
                {columns.map((col, colIdx) => {
                  const content =
                    typeof col.accessor === 'function'
                      ? col.accessor(item)
                      : (item[col.accessor] as React.ReactNode);
                  return <td key={colIdx}>{content}</td>;
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
