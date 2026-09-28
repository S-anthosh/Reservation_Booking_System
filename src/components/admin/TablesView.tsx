import React, { useState } from 'react';
import {
  Grid3X3,
  Plus,
  Edit2,
  Trash2,
  Users,
  MapPin,
  X,
  AlertCircle,
} from 'lucide-react';
import { RestaurantTable } from '../../types/database';

interface TablesViewProps {
  tables: RestaurantTable[];
  onSaveTable: (table: Partial<RestaurantTable>) => Promise<boolean>;
  onDeleteTable: (id: string) => Promise<boolean>;
}

export const TablesView: React.FC<TablesViewProps> = ({
  tables,
  onSaveTable,
  onDeleteTable,
}) => {
  const [editingTable, setEditingTable] = useState<Partial<RestaurantTable> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddNew = () => {
    setEditingTable({
      table_name: '',
      capacity: 4,
      area: 'Main Dining Room',
      is_active: true,
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleEdit = (table: RestaurantTable) => {
    setEditingTable({ ...table });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (table: RestaurantTable) => {
    await onSaveTable({
      id: table.id,
      is_active: !table.is_active,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTable || !editingTable.table_name?.trim()) {
      setErrorMsg('Please enter a valid table name.');
      return;
    }
    if (!editingTable.capacity || editingTable.capacity <= 0) {
      setErrorMsg('Capacity must be at least 1 guest.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const ok = await onSaveTable(editingTable);
      if (ok) {
        setIsModalOpen(false);
        setEditingTable(null);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save restaurant table.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const areas = [
    'Main Dining Room',
    'Hearth Room',
    "Chef's Counter",
    'Terrace Veranda',
    'Private Cellar',
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f2230]">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase text-[#d4a754] block mb-1">
            Seating Infrastructure
          </span>
          <h1 className="font-serif text-3xl font-light text-[#fbf9f5]">
            Restaurant Tables Management
          </h1>
          <p className="text-xs text-[#9ca3af] mt-1">
            Configure tables, capacities, and dining areas. Inactive tables are immediately excluded
            from public booking availability.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#c59b43] text-black hover:bg-[#d4a754] transition-colors cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Table</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tables.map((table) => (
          <div
            key={table.id}
            className={`p-5 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
              table.is_active
                ? 'bg-[#12141c] border-[#252938] hover:border-[#c59b43]/50 shadow-lg'
                : 'bg-[#101117] border-[#1d202b] opacity-70'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-serif text-lg font-medium text-white">
                    {table.table_name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#9ca3af] mt-0.5">
                    <MapPin className="w-3 h-3 text-[#c59b43]" />
                    <span>{table.area}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleActive(table)}
                  title={table.is_active ? 'Click to deactivate' : 'Click to activate'}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border cursor-pointer transition-colors ${
                    table.is_active
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800 hover:bg-emerald-900'
                      : 'bg-[#1c1f2b] text-[#6b7280] border-[#2d3346] hover:text-white'
                  }`}
                >
                  {table.is_active ? 'Active' : 'Inactive'}
                </button>
              </div>

              <div className="p-3 rounded-lg bg-[#161822] border border-[#222635] flex items-center justify-between text-xs text-[#cbd5e1] mb-4">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#d4a754]" />
                  <span>Maximum Capacity</span>
                </span>
                <span className="font-bold text-white">{table.capacity} Guests</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1d212e] flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#6b7280]">
                {table.is_active ? 'Available for booking' : 'Offline / Reserved'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(table)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#1e2230] text-[#cbd5e1] hover:text-white hover:bg-[#282d3f] border border-[#2c3245] transition-colors cursor-pointer text-xs"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#d4a754]" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to remove ${table.table_name}?`)) {
                      onDeleteTable(table.id);
                    }
                  }}
                  className="p-1.5 rounded text-[#9ca3af] hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Delete Table"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && editingTable && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-[#2c3245] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#212534]">
              <div>
                <span className="text-[10px] text-[#d4a754] uppercase tracking-wider block">
                  {editingTable.id ? 'Edit Table Settings' : 'New Table Definition'}
                </span>
                <h3 className="font-serif text-xl text-white font-medium">
                  {editingTable.id ? editingTable.table_name : 'Add Restaurant Table'}
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
                  Table Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Table 05 · Window Promenade"
                  value={editingTable.table_name || ''}
                  onChange={(e) =>
                    setEditingTable({ ...editingTable, table_name: e.target.value })
                  }
                  className="w-full bg-[#161822] border border-[#262a38] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#d4a754]"
                />
              </div>

              <div>
                <label className="block text-[#9ca3af] uppercase text-[10px] font-semibold mb-1">
                  Guest Capacity (Max Covers) *
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  required
                  value={editingTable.capacity || 2}
                  onChange={(e) =>
                    setEditingTable({ ...editingTable, capacity: Number(e.target.value) })
                  }
                  className="w-full bg-[#161822] border border-[#262a38] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#d4a754]"
                />
              </div>

              <div>
                <label className="block text-[#9ca3af] uppercase text-[10px] font-semibold mb-1">
                  Dining Room Area *
                </label>
                <select
                  value={editingTable.area || 'Main Dining Room'}
                  onChange={(e) => setEditingTable({ ...editingTable, area: e.target.value })}
                  className="w-full bg-[#161822] border border-[#262a38] rounded-lg p-2.5 text-white cursor-pointer focus:outline-none focus:border-[#d4a754]"
                >
                  {areas.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingTable.is_active ?? true}
                    onChange={(e) =>
                      setEditingTable({ ...editingTable, is_active: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#c59b43] focus:ring-0 bg-[#161822] border-[#262a38]"
                  />
                  <div>
                    <span className="text-white font-medium block">Active Table Status</span>
                    <span className="text-[11px] text-[#9ca3af]">
                      When active, this table is matched for public online reservations.
                    </span>
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
                  {isSubmitting ? 'Saving Table...' : 'Save Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
