import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { ListTodo, Plus, Edit, Trash2, ChevronRight, ChevronDown, Save, X } from 'lucide-react';

interface CriteriaNode {
  id: string;
  name: string;
  maxPoints: number;
  parentId: string | null;
  order: number;
  children?: CriteriaNode[];
}

export const CriteriaManagement: React.FC = () => {
  const [criteriaTree, setCriteriaTree] = useState<CriteriaNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingNode, setEditingNode] = useState<CriteriaNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1', '2', '3', '4', '5']));
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNode, setNewNode] = useState<Partial<CriteriaNode>>({ parentId: null, order: 0, maxPoints: 0 });

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
      setNewNode({ parentId: null, order: 0, maxPoints: 0 });
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
          </div>
          
          <div className="node-meta">
            <span className="node-points">{node.maxPoints} đ</span>
            <div className="node-actions">
              <button onClick={() => setEditingNode(node)} className="btn-icon-small"><Edit size={14} /></button>
              <button onClick={() => { setNewNode({ parentId: node.id }); setShowAddModal(true); }} className="btn-icon-small text-primary"><Plus size={14} /></button>
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

  return (
    <div className="admin-criteria-page">
      <div className="page-header-actions">
        <div className="page-header-title">
          <ListTodo size={22} className="title-icon" />
          <h1>QUẢN LÝ TIÊU CHÍ ĐÁNH GIÁ</h1>
        </div>
        <button className="btn-primary" onClick={() => { setNewNode({ parentId: null }); setShowAddModal(true); }}>
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
          <div className="modal-content glass-card">
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
                  rows={3}
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
          <div className="modal-content glass-card">
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
                  rows={3}
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
