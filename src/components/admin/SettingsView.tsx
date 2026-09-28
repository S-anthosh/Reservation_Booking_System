import React, { useState } from 'react';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Building2,
  Mail,
  Phone,
  MapPin,
  Timer,
} from 'lucide-react';
import { RestaurantSettings } from '../../types/database';

interface SettingsViewProps {
  settings: RestaurantSettings;
  onUpdateSettings: (settings: Partial<RestaurantSettings>) => Promise<boolean>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [formData, setFormData] = useState<RestaurantSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (field: keyof RestaurantSettings, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMsg(null);

    try {
      const ok = await onUpdateSettings(formData);
      if (ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      } else {
        throw new Error('Could not persist settings changes.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update restaurant settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f2230]">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase text-[#d4a754] block mb-1">
            System Configuration
          </span>
          <h1 className="font-serif text-3xl font-light text-[#fbf9f5]">
            Restaurant Settings
          </h1>
          <p className="text-xs text-[#9ca3af] mt-1">
            Configure restaurant identity, contact channels, and table reservation scheduling
            algorithms.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>
            Restaurant settings successfully saved and updated across all public booking views.
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-[#201819] border border-[#5c2729] text-xs text-[#e57373] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#ef5350]" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#12141c] border border-[#232736] rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1e2230] text-sm font-semibold text-white">
            <Building2 className="w-4 h-4 text-[#c59b43]" />
            <span>Brand Identity &amp; Contact Concierge</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#9ca3af] uppercase text-[10px] font-semibold mb-1">
                Restaurant Name *
              </label>
              <input
                type="text"
                required
                value={formData.restaurant_name}
                onChange={(e) => handleChange('restaurant_name', e.target.value)}
                className="w-full bg-[#161822] border border-[#262a38] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#d4a754]"
              />
            </div>

            <div>
              <label className="block text-[#9ca3af] uppercase text-[10px] font-semibold mb-1">
                Restaurant Email (Reservations Desk) *
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-[#6b7280]" />
                <input
                  type="email"
                  required
                  value={formData.restaurant_email}
                  onChange={(e) => handleChange('restaurant_email', e.target.value)}
                  className="w-full bg-[#161822] border border-[#262a38] rounded-lg pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-[#d4a754]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#9ca3af] uppercase text-[10px] font-semibold mb-1">
                Restaurant Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-[#6b7280]" />
                <input
                  type="text"
                  required
                  value={formData.restaurant_phone}
                  onChange={(e) => handleChange('restaurant_phone', e.target.value)}
                  className="w-full bg-[#161822] border border-[#262a38] rounded-lg pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-[#d4a754]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#9ca3af] uppercase text-[10px] font-semibold mb-1">
                Physical Street Address *
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-[#6b7280]" />
                <input
                  type="text"
                  required
                  value={formData.restaurant_address}
                  onChange={(e) => handleChange('restaurant_address', e.target.value)}
                  className="w-full bg-[#161822] border border-[#262a38] rounded-lg pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-[#d4a754]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#12141c] border border-[#232736] rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1e2230] text-sm font-semibold text-white">
            <Timer className="w-4 h-4 text-[#c59b43]" />
            <span>Table Booking Availability Algorithm Parameters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-[#161822] border border-[#242837] space-y-2">
              <label className="block text-[#f3f4f6] font-semibold">
                Slot Interval (Minutes)
              </label>
              <p className="text-[11px] text-[#9ca3af]">
                Step size between available reservation start times (e.g. 17:00, 17:30, 18:00).
              </p>
              <select
                value={formData.slot_interval_minutes}
                onChange={(e) =>
                  handleChange('slot_interval_minutes', parseInt(e.target.value, 10))
                }
                className="w-full bg-[#1c202d] border border-[#2a2f42] rounded-md p-2 text-white font-mono cursor-pointer"
              >
                <option value={15}>15 minutes (High density)</option>
                <option value={30}>30 minutes (Standard fine dining)</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes (Hourly seatings)</option>
              </select>
            </div>

            <div className="p-4 rounded-lg bg-[#161822] border border-[#242837] space-y-2">
              <label className="block text-[#f3f4f6] font-semibold">
                Minimum Booking Notice (Hours)
              </label>
              <p className="text-[11px] text-[#9ca3af]">
                Prevents last-minute bookings. Slots within this window from now are hidden.
              </p>
              <select
                value={formData.booking_notice_hours}
                onChange={(e) =>
                  handleChange('booking_notice_hours', parseInt(e.target.value, 10))
                }
                className="w-full bg-[#1c202d] border border-[#2a2f42] rounded-md p-2 text-white font-mono cursor-pointer"
              >
                <option value={1}>1 hour notice</option>
                <option value={2}>2 hours notice (Recommended)</option>
                <option value={4}>4 hours notice</option>
                <option value={12}>12 hours notice</option>
                <option value={24}>24 hours notice</option>
              </select>
            </div>

            <div className="p-4 rounded-lg bg-[#161822] border border-[#242837] space-y-2">
              <label className="block text-[#f3f4f6] font-semibold">
                Default Reservation Duration (Minutes)
              </label>
              <p className="text-[11px] text-[#9ca3af]">
                Duration each party holds their table. Used to calculate end_time and prevent overlaps.
              </p>
              <select
                value={formData.default_reservation_duration_minutes}
                onChange={(e) =>
                  handleChange(
                    'default_reservation_duration_minutes',
                    parseInt(e.target.value, 10)
                  )
                }
                className="w-full bg-[#1c202d] border border-[#2a2f42] rounded-md p-2 text-white font-mono cursor-pointer"
              >
                <option value={60}>60 minutes (Quick lunch)</option>
                <option value={90}>90 minutes (Standard dinner)</option>
                <option value={120}>120 minutes (Tasting experience)</option>
                <option value={150}>150 minutes (Grand degustation)</option>
              </select>
            </div>

            <div className="p-4 rounded-lg bg-[#161822] border border-[#242837] space-y-2">
              <label className="block text-[#f3f4f6] font-semibold">
                Maximum Online Party Size
              </label>
              <p className="text-[11px] text-[#9ca3af]">
                Parties exceeding this size must call private dining rather than self-booking online.
              </p>
              <input
                type="number"
                min={2}
                max={30}
                required
                value={formData.max_party_size}
                onChange={(e) =>
                  handleChange('max_party_size', parseInt(e.target.value, 10) || 10)
                }
                className="w-full bg-[#1c202d] border border-[#2a2f42] rounded-md p-2 text-white font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-lg text-sm font-semibold bg-[#c59b43] text-black hover:bg-[#d4a754] transition-all cursor-pointer shadow-lg shadow-[#c59b43]/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Restaurant Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
