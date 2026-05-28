import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { ListTodo, Plus, Edit, Trash2, ChevronRight, ChevronDown, Save, X } from 'lucide-react';

interface CriteriaNode {
  id: string;
  name: string;
  maxPoints: number;
  parentId: string | null;
  order: number;
  inputType?: 'fixed' | 'select' | 'count' | 'checkbox';
  options?: any;
  children?: CriteriaNode[];
}

export const CriteriaManagement: React.FC = () => {
  const [criteriaTree, setCriteriaTree] = useState<CriteriaNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingNode, setEditingNode] = useState<CriteriaNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1', '2', '3', '4', '5']));
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNode, setNewNode] = useState<Partial<CriteriaNode>>({ 
    parentId: null, 
    order: 0, 
    maxPoints: 0,
    inputType: 'fixed' 
  });

  useEffect(() => {
    fetchCriteria();
  }, []);

  const fetchCriteria = async () => {
    setLoading(true);
    try {
      const res = await api.get('/criteria/tree');
      setCriteriaTree(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedNodes(newExpanded);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNode) return;
    try {
      await api.put(`/criteria/${editingNode.id}`, editingNode);
      setEditingNode(null);
      fetchCriteria();
    } catch (err) {
      alert('Cập nhật thất bại');
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/criteria', newNode);
      setShowAddModal(false);
      setNewNode({ parentId: null, order: 0, maxPoints: 0, inputType: 'fixed' });
      fetchCriteria();
    } catch (err) {
      alert('Thêm mới thất bại');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tiêu chí này và tất cả tiêu chí con?')) return;
    try {
      await api.delete(`/criteria/${id}`);
      fetchCriteria();
    } catch (err) {
      alert('Xóa thất bại');
    }
  };

  const renderNode = (node: CriteriaNode, level = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="criteria-tree-node">
        <div className={`node-content level-${level} ${editingNode?.id === node.id ? 'editing' : ''}`}>
          <div className="node-main">
            {hasChildren ? (
              <button onClick={() => toggleExpand(node.id)} className="btn-expand">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            ) : (
              <div className="node-spacer" />
            )}
            <span className="node-id">[{node.id}]</span>
            <span className="node-name">{node.name}</span>
            {node.inputType === 'select' && <span className="badge badge-info ml-2 text-xs text-blue-500 bg-blue-100 px-2 py-0.5 rounded">Chọn điểm</span>}
            {node.inputType === 'count' && <span className="badge badge-warning ml-2 text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded">Tính lần</span>}
            {node.inputType === 'checkbox' && <span className="badge badge-success ml-2 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">Tích chọn</span>}
          </div>
          
          <div className="node-meta">
            <span className="node-points">{node.maxPoints} đ</span>
            <div className="node-actions">
              <button onClick={() => setEditingNode({...node, inputType: node.inputType || 'fixed'})} className="btn-icon-small"><Edit size={14} /></button>
              <button onClick={() => { setNewNode({ parentId: node.id, inputType: 'fixed' }); setShowAddModal(true); }} className="btn-icon-small text-primary"><Plus size={14} /></button>
              <button onClick={() => handleDelete(node.id)} className="btn-icon-small text-danger"><Trash2 size={14} /></button>
            </div>
          </div>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="node-children">
            {node.children!.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderOptionsConfig = (
    data: Partial<CriteriaNode>, 
    setter: React.Dispatch<React.SetStateAction<any>>
  ) => {
    if (data.inputType === 'select') {
      const opts = Array.isArray(data.options) ? data.options : [];
      return (
        <div className="form-group mt-3 p-3 bg-gray-50 border rounded">
          <label className="font-semibold mb-2">Cấu hình Tùy chọn (Dropdown):</label>
          {opts.map((opt: any, idx: number) => (
            <div key={idx} className="flex gap-2 mb-2 items-center">
              <input 
                type="text" 
                placeholder="Nhãn (VD: Xuất sắc, Trừ điểm)" 
                className="form-control text-sm" 
                value={opt.label || ''}
                onChange={e => {
                  const newOpts = [...opts];
                  newOpts[idx].label = e.target.value;
                  setter({ ...data, options: newOpts });
                }}
              />
              <input 
                type="number" 
                placeholder="Điểm" 
                className="form-control text-sm w-24" 
                value={opt.points || 0}
                onChange={e => {
                  const newOpts = [...opts];
                  newOpts[idx].points = Number(e.target.value);
                  setter({ ...data, options: newOpts });
                }}
              />
              <button 
                type="button" 
                className="btn-icon-small text-danger"
                onClick={() => {
                  const newOpts = opts.filter((_, i) => i !== idx);
                  setter({ ...data, options: newOpts });
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button 
            type="button" 
            className="text-xs text-blue-500 font-semibold mt-1"
            onClick={() => setter({ ...data, options: [...opts, { label: '', points: 0 }] })}
          >
            + Thêm tùy chọn
          </button>
        </div>
      );
    }
    
    if (data.inputType === 'count') {
      const countOpts = data.options || { unitPoint: 0, label: 'sự kiện' };
      return (
        <div className="form-group mt-3 p-3 bg-gray-50 border rounded">
          <label className="font-semibold mb-2">Cấu hình Tính theo số lượng:</label>
          <div className="flex gap-2 items-center">
            <span className="text-sm">Điểm mỗi đơn vị:</span>
            <input 
              type="number" 
              step="0.1"
              className="form-control text-sm w-24" 
              value={countOpts.unitPoint || 0}
              onChange={e => setter({ ...data, options: { ...countOpts, unitPoint: Number(e.target.value) } })}
            />
            <span className="text-sm">Đơn vị (VD: sự kiện):</span>
            <input 
              type="text" 
              className="form-control text-sm w-32" 
              value={countOpts.label || ''}
              onChange={e => setter({ ...data, options: { ...countOpts, label: e.target.value } })}
            />
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="admin-criteria-page">
      <div className="page-header-actions">
        <div className="page-header-title">
          <ListTodo size={22} className="title-icon" />
          <h1>QUẢN LÝ TIÊU CHÍ ĐÁNH GIÁ</h1>
        </div>
        <button className="btn-primary" onClick={() => { setNewNode({ parentId: null, inputType: 'fixed' }); setShowAddModal(true); }}>
          <Plus size={16} />
          <span>Thêm mục lớn</span>
        </button>
      </div>

      <div className="criteria-container glass-card">
        {loading ? (
          <div className="loading-placeholder">Đang tải cây tiêu chí...</div>
        ) : (
          <div className="criteria-tree-view">
            {criteriaTree.map((root) => renderNode(root))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingNode && (
        <div className="modal-overlay">
          <div className="modal-content glass-card" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>Chỉnh sửa tiêu chí</h3>
              <button className="btn-close" onClick={() => setEditingNode(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdate} className="modal-body">
              <div className="form-group">
                <label>Mã tiêu chí:</label>
                <input type="text" value={editingNode.id} disabled className="form-control" />
              </div>
              <div className="form-group mt-3">
                <label>Tên tiêu chí:</label>
                <textarea 
                  value={editingNode.name} 
                  onChange={(e) => setEditingNode({ ...editingNode, name: e.target.value })}
                  className="form-control"
                  rows={2}
                />
              </div>
              <div className="form-row mt-3">
                <div className="form-group col">
                  <label>Điểm tối đa:</label>
                  <input 
                    type="number" 
                    value={editingNode.maxPoints} 
                    onChange={(e) => setEditingNode({ ...editingNode, maxPoints: parseInt(e.target.value) || 0 })}
                    className="form-control"
                  />
                </div>
                <div className="form-group col">
                  <label>Thứ tự:</label>
                  <input 
                    type="number" 
                    value={editingNode.order} 
                    onChange={(e) => setEditingNode({ ...editingNode, order: parseInt(e.target.value) || 0 })}
                    className="form-control"
                  />
                </div>
              </div>
              
              <div className="form-group mt-3">
                <label>Kiểu nhập điểm:</label>
                <select 
                  className="form-control"
                  value={editingNode.inputType || 'fixed'}
                  onChange={e => setEditingNode({ 
                    ...editingNode, 
                    inputType: e.target.value as any,
                    options: e.target.value === 'select' ? [] : e.target.value === 'count' ? { unitPoint: 1, label: 'lần' } : null
                  })}
                >
                  <option value="fixed">Nhập số trực tiếp (Mặc định)</option>
                  <option value="select">Chọn danh sách (Dropdown)</option>
                  <option value="count">Tính theo số lượng (Phép nhân)</option>
                  <option value="checkbox">Tích chọn để nhận điểm (Checkbox)</option>
                </select>
              </div>

              {renderOptionsConfig(editingNode, setEditingNode)}

              <div className="modal-footer mt-4">
                <button type="button" className="btn-secondary" onClick={() => setEditingNode(null)}>Hủy</button>
                <button type="submit" className="btn-primary"><Save size={16} /> Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>Thêm tiêu chí mới</h3>
              <button className="btn-close" onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAdd} className="modal-body">
              <div className="form-group">
                <label>Mã tiêu chí (VD: 1.1.a):</label>
                <input 
                  type="text" 
                  value={newNode.id || ''} 
                  onChange={(e) => setNewNode({ ...newNode, id: e.target.value })}
                  className="form-control"
                  placeholder="Nhập mã tiêu chí..."
                  required
                />
              </div>
              <div className="form-group mt-3">
                <label>Tên tiêu chí:</label>
                <textarea 
                  value={newNode.name || ''} 
                  onChange={(e) => setNewNode({ ...newNode, name: e.target.value })}
                  className="form-control"
                  rows={2}
                  placeholder="Nhập nội dung tiêu chí..."
                  required
                />
              </div>
              <div className="form-row mt-3">
                <div className="form-group col">
                  <label>Điểm tối đa:</label>
                  <input 
                    type="number" 
                    value={newNode.maxPoints || 0} 
                    onChange={(e) => setNewNode({ ...newNode, maxPoints: parseInt(e.target.value) || 0 })}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group col">
                  <label>Thứ tự:</label>
                  <input 
                    type="number" 
                    value={newNode.order || 0} 
                    onChange={(e) => setNewNode({ ...newNode, order: parseInt(e.target.value) || 0 })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group mt-3">
                <label>Kiểu nhập điểm:</label>
                <select 
                  className="form-control"
                  value={newNode.inputType || 'fixed'}
                  onChange={e => setNewNode({ 
                    ...newNode, 
                    inputType: e.target.value as any,
                    options: e.target.value === 'select' ? [] : e.target.value === 'count' ? { unitPoint: 1, label: 'lần' } : null
                  })}
                >
                  <option value="fixed">Nhập số trực tiếp (Mặc định)</option>
                  <option value="select">Chọn danh sách (Dropdown)</option>
                  <option value="count">Tính theo số lượng (Phép nhân)</option>
                  <option value="checkbox">Tích chọn để nhận điểm (Checkbox)</option>
                </select>
              </div>

              {renderOptionsConfig(newNode, setNewNode)}

              <div className="modal-footer mt-4">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary"><Plus size={16} /> Thêm mới</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CriteriaManagement;
