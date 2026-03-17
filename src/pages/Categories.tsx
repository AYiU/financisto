import { useState, type Dispatch } from 'react';
import { useApp } from '../context/AppContext';
import type { Category, CategoryType, AppAction } from '../types';
import Modal from '../components/Modal';
import './Categories.css';

const CATEGORY_COLORS = [
  '#e74c3c', '#e67e22', '#f39c12', '#2ecc71', '#1abc9c',
  '#3498db', '#2980b9', '#9b59b6', '#8e44ad', '#e91e63',
  '#607d8b', '#795548', '#ff5722', '#00bcd4', '#4caf50',
];

type CatModal =
  | { mode: 'add' }
  | { mode: 'edit'; category: Category };

export default function Categories() {
  const { state, dispatch } = useApp();
  const { categories, transactions } = state;

  const [modal, setModal]                 = useState<CatModal | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);

  const rootCategories = categories.filter((c) => !c.parentId);

  function txCount(catId: number) {
    return transactions.filter((t) => t.categoryId === catId).length;
  }

  function confirmDelete() {
    if (!deleteConfirm) return;
    dispatch({ type: 'DELETE_CATEGORY', payload: deleteConfirm.id });
    setDeleteConfirm(null);
  }

  return (
    <div className="categories-page">
      <div className="page-header">
        <div>
          <h1>Categories</h1>
          <p className="page-subtitle">Organize your transactions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ mode: 'add' })}>
          + Add Category
        </button>
      </div>

      <div className="category-groups">
        {(['EXPENSE', 'INCOME'] as CategoryType[]).map((type) => {
          const group = rootCategories.filter((c) => c.type === type);
          return (
            <div key={type} className="category-group">
              <h2 className={`group-title ${type.toLowerCase()}`}>
                {type === 'EXPENSE' ? '📤 Expenses' : '📥 Income'}
              </h2>
              {group.length === 0 ? (
                <p className="empty-state">No {type.toLowerCase()} categories.</p>
              ) : (
                <div className="cat-grid">
                  {group.map((cat) => (
                    <div key={cat.id} className="cat-card">
                      <span className="cat-dot" style={{ background: cat.color }} />
                      <div className="cat-info">
                        <span className="cat-name">{cat.name}</span>
                        <span className="cat-count">{txCount(cat.id)} transactions</span>
                      </div>
                      <div className="cat-actions">
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => setModal({ mode: 'edit', category: cat })}
                        >Edit</button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => setDeleteConfirm(cat)}
                        >Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modal && (
        <CategoryFormModal
          modal={modal}
          onClose={() => setModal(null)}
          dispatch={dispatch}
        />
      )}

      {deleteConfirm && (
        <Modal title="Delete Category" onClose={() => setDeleteConfirm(null)} size="sm">
          <p>Delete <strong>{deleteConfirm.name}</strong>?</p>
          <p className="text-muted">Transactions in this category will not be deleted.</p>
          <div className="form-actions">
            <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

interface CategoryFormModalProps {
  modal: CatModal;
  onClose: () => void;
  dispatch: Dispatch<AppAction>;
}

interface CatFormState {
  name: string;
  type: CategoryType;
  color: string;
}

function CategoryFormModal({ modal, onClose, dispatch }: CategoryFormModalProps) {
  const category = modal.mode === 'edit' ? modal.category : undefined;

  const [form, setForm] = useState<CatFormState>({
    name:  category?.name  ?? '',
    type:  category?.type  ?? 'EXPENSE',
    color: category?.color ?? CATEGORY_COLORS[0],
  });

  function set<K extends keyof CatFormState>(key: K, value: CatFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, parentId: null as null };
    if (modal.mode === 'add') {
      dispatch({ type: 'ADD_CATEGORY', payload });
    } else {
      dispatch({ type: 'UPDATE_CATEGORY', payload: { ...modal.category, ...payload } });
    }
    onClose();
  }

  return (
    <Modal title={modal.mode === 'add' ? 'Add Category' : 'Edit Category'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label className="form-label">Name *</label>
          <input
            className="form-control"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
            placeholder="e.g. Groceries"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Type</label>
          <div className="type-tabs">
            {(['EXPENSE', 'INCOME'] as CategoryType[]).map((t) => (
              <button
                key={t}
                type="button"
                className={`type-tab${form.type === t ? ' active' : ''}`}
                onClick={() => set('type', t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Color</label>
          <div className="color-picker">
            {CATEGORY_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`color-swatch${form.color === c ? ' selected' : ''}`}
                style={{ background: c }}
                onClick={() => set('color', c)}
                aria-label={c}
              />
            ))}
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">
            {modal.mode === 'add' ? 'Add Category' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
