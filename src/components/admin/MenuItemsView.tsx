import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  X,
  AlertCircle,
} from 'lucide-react';
import { MenuItem } from '../../types/database';

interface MenuItemsViewProps {
  menuItems: MenuItem[];
  onSaveMenuItem: (item: Partial<MenuItem>) => Promise<boolean>;
  onDeleteMenuItem: (id: string) => Promise<boolean>;
}

export const MenuItemsView: React.FC<MenuItemsViewProps> = ({
  menuItems,
  onSaveMenuItem,
  onDeleteMenuItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const categories = ['All', 'Starters', 'Mains', 'Desserts', 'Beverages'];

  const filteredItems =
    selectedCategory === 'All'
      ? menuItems
      : menuItems.filter(
          (item) => item.category.toLowerCase() === selectedCategory.toLowerCase()
        );

  const handleAddNew = () => {
    setEditingItem({
      name: '',
      description: '',
      price: 35.0,
      category: 'Mains',
      is_featured: false,
      is_active: true,
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem({ ...item });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleToggleFeatured = async (item: MenuItem) => {
    await onSaveMenuItem({
      id: item.id,
      is_featured: !item.is_featured,
    });
  };

  const handleToggleActive = async (item: MenuItem) => {
    await onSaveMenuItem({
      id: item.id,
      is_active: !item.is_active,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.name?.trim()) {
      setErrorMsg('Please enter a dish name.');
      return;
    }
    if (editingItem.price === undefined || editingItem.price < 0) {
      setErrorMsg('Please specify a valid price.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const ok = await onSaveMenuItem(editingItem);
      if (ok) {
        setIsModalOpen(false);
        setEditingItem(null);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save menu item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f2230]">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase text-[#d4a754] block mb-1">
            Culinary Offerings
          </span>
          <h1 className="font-serif text-3xl font-light text-[#fbf9f5]">
            Menu Items Management
          </h1>
          <p className="text-xs text-[#9ca3af] mt-1">
            Manage culinary creations, pricing, and showcase flags. Only active featured items
            appear on the public landing page.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#c59b43] text-black hover:bg-[#d4a754] transition-colors cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Menu Item</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#12141c] border border-[#232736] p-3 rounded-xl">
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#c59b43] text-black font-semibold shadow'
                  : 'bg-[#181a24] text-[#9ca3af] hover:text-white border border-[#282d3f]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <span className="text-xs text-[#9ca3af]">
          Showing <span className="text-white font-medium">{filteredItems.length}</span> items
        </span>
      </div>

      <div className="bg-[#12141c] border border-[#232736] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#151722] border-b border-[#232736] text-[#9ca3af] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Dish &amp; Description</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">Price</th>
                <th className="py-3.5 px-4 font-semibold">Featured on Website</th>
                <th className="py-3.5 px-4 font-semibold">Active Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2230]">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#9ca3af]">
                    <UtensilsCrossed className="w-8 h-8 text-[#4b5563] mx-auto mb-2" />
                    <p className="text-sm text-white">No menu items found</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#161824] transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-semibold text-white text-sm">{item.name}</div>
                      <p className="text-[11px] text-[#9ca3af] mt-0.5 line-clamp-2">
                        {item.description}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-[#1a1d28] border border-[#2a2f40] text-[#cbd5e1]">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-serif text-sm font-semibold text-[#f5f2eb]">
                      ${Number(item.price).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleFeatured(item)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-semibold transition-colors cursor-pointer border ${
                          item.is_featured
                            ? 'bg-[#292211] text-[#e8c782] border-[#c59b43]/50 hover:bg-[#382d14]'
                            : 'bg-[#181a24] text-[#6b7280] border-[#292e3d] hover:text-white'
                        }`}
                      >
                        <Sparkles className="w-3 h-3 text-[#d4a754]" />
                        <span>{item.is_featured ? 'Featured' : 'Standard'}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-colors cursor-pointer border ${
                          item.is_active
                            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800 hover:bg-emerald-900'
                            : 'bg-[#181a24] text-[#6b7280] border-[#282d3f] hover:text-white'
                        }`}
                      >
                        {item.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#1e2230] text-[#cbd5e1] hover:text-white border border-[#2c3245] transition-colors cursor-pointer text-xs"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#d4a754]" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Delete menu item "${item.name}"?`)) {
                              onDeleteMenuItem(item.id);
                            }
                          }}
                          className="p-1.5 rounded text-[#9ca3af] hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Delete Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-[#2c3245] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#212534]">
              <div>
                <span className="text-[10px] text-[#d4a754] uppercase tracking-wider block">
                  {editingItem.id ? 'Edit Dish' : 'New Dish Creation'}
                </span>
                <h3 className="font-serif text-xl text-white font-medium">
                  {editingItem.id ? editingItem.name : 'Add Menu Item'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#9ca3af] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded bg-[#201819] border border-[#5c2729] text-xs text-[#e57373] flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#9ca3af] uppercase text-[10px] font-semibold mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wood-Fired Hokkaido Scallops"
                  value={editingItem.name || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full bg-[#161822] border border-[#262a38] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#d4a754]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9ca3af] uppercase text-[10px] font-semibold mb-1">
                    Category *
                  </label>
                  <select
                    value={editingItem.category || 'Mains'}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full bg-[#161822] border border-[#262a38] rounded-lg p-2.5 text-white cursor-pointer focus:outline-none focus:border-[#d4a754]"
                  >
                    {['Starters', 'Mains', 'Desserts', 'Beverages'].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#9ca3af] uppercase text-[10px] font-semibold mb-1">
                    Price ($ USD) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={editingItem.price ?? 0}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-[#161822] border border-[#262a38] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#d4a754]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#9ca3af] uppercase text-[10px] font-semibold mb-1">
                  Description &amp; Key Ingredients *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Hand-dived scallops, preserved Meyer lemon beurre blanc, sturgeon caviar, sea fennel."
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full bg-[#161822] border border-[#262a38] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#d4a754]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg bg-[#161822] border border-[#262a38]">
                  <input
                    type="checkbox"
                    checked={editingItem.is_featured ?? false}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, is_featured: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#c59b43] focus:ring-0 bg-[#12141c] border-[#374151]"
                  />
                  <div>
                    <span className="text-white font-medium block">Featured Dish</span>
                    <span className="text-[10px] text-[#9ca3af]">
                      Shown on website landing highlights
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg bg-[#161822] border border-[#262a38]">
                  <input
                    type="checkbox"
                    checked={editingItem.is_active ?? true}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, is_active: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#c59b43] focus:ring-0 bg-[#12141c] border-[#374151]"
                  />
                  <div>
                    <span className="text-white font-medium block">Active Status</span>
                    <span className="text-[10px] text-[#9ca3af]">Currently being prepared</span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#212534]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded text-xs text-[#9ca3af] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded text-xs font-semibold bg-[#c59b43] text-black hover:bg-[#d4a754] transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Saving Item...' : 'Save Menu Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
