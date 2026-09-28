import React, { useState } from 'react';
import { Clock, CheckCircle2, Save } from 'lucide-react';
import { BusinessHour } from '../../types/database';

interface BusinessHoursViewProps {
  hours: BusinessHour[];
  onUpdateHour: (hour: BusinessHour) => Promise<boolean>;
}

const WEEKDAYS = [
  { index: 0, label: 'Sunday' },
  { index: 1, label: 'Monday' },
  { index: 2, label: 'Tuesday' },
  { index: 3, label: 'Wednesday' },
  { index: 4, label: 'Thursday' },
  { index: 5, label: 'Friday' },
  { index: 6, label: 'Saturday' },
];

export const BusinessHoursView: React.FC<BusinessHoursViewProps> = ({
  hours,
  onUpdateHour,
}) => {
  const [localHours, setLocalHours] = useState<BusinessHour[]>(hours);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  React.useEffect(() => {
    setLocalHours(hours);
  }, [hours]);

  const handleToggleOpen = (weekday: number) => {
    setLocalHours((prev) =>
      prev.map((h) => (h.weekday === weekday ? { ...h, is_open: !h.is_open } : h))
    );
  };

  const handleTimeChange = (
    weekday: number,
    field: 'start_time' | 'end_time',
    value: string
  ) => {
    setLocalHours((prev) =>
      prev.map((h) => (h.weekday === weekday ? { ...h, [field]: value } : h))
    );
  };

  const handleSaveRow = async (weekday: number) => {
    const row = localHours.find((h) => h.weekday === weekday);
    if (!row) return;

    setSavingIndex(weekday);
    setSuccessMsg(null);
    try {
      const ok = await onUpdateHour(row);
      if (ok) {
        setSuccessMsg(`Hours updated for ${WEEKDAYS.find((w) => w.index === weekday)?.label}.`);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } finally {
      setSavingIndex(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f2230]">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase text-[#d4a754] block mb-1">
            Service Timetable
          </span>
          <h1 className="font-serif text-3xl font-light text-[#fbf9f5]">
            Business Hours Editor
          </h1>
          <p className="text-xs text-[#9ca3af] mt-1">
            Adjust dining service operating hours. Operating windows directly dictate which time
            slots can be reserved on the public booking engine.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="bg-[#12141c] border border-[#232736] rounded-xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-[#1f2230] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider">
            <Clock className="w-4 h-4 text-[#c59b43]" />
            <span>Weekly Dining Service Windows</span>
          </div>
          <span className="text-[11px] text-[#9ca3af]">
            Changes take effect immediately across availability calculations
          </span>
        </div>

        <div className="divide-y divide-[#1e2230]">
          {WEEKDAYS.map((w) => {
            const row = localHours.find((h) => h.weekday === w.index) || {
              id: `h-${w.index}`,
              weekday: w.index,
              is_open: true,
              start_time: '17:00',
              end_time: '23:00',
            };

            const isSaving = savingIndex === w.index;

            return (
              <div
                key={w.index}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#161824] transition-colors"
              >
                <div className="w-44 flex items-center gap-3">
                  <button
                    onClick={() => handleToggleOpen(w.index)}
                    className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      row.is_open ? 'bg-[#c59b43]' : 'bg-[#292e3e]'
                    }`}
                    title={row.is_open ? 'Open day' : 'Closed day'}
                  >
                    <div
                      className={`bg-black w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        row.is_open ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>

                  <div>
                    <span className="font-semibold text-white text-sm block">
                      {w.label}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider ${
                        row.is_open ? 'text-emerald-400' : 'text-[#6b7280]'
                      }`}
                    >
                      {row.is_open ? 'Open for Service' : 'Closed'}
                    </span>
                  </div>
                </div>

                {row.is_open ? (
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[#9ca3af]">Opening Time:</span>
                      <input
                        type="time"
                        value={row.start_time}
                        onChange={(e) =>
                          handleTimeChange(w.index, 'start_time', e.target.value)
                        }
                        className="bg-[#181a26] border border-[#2a2f42] rounded-md px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-[#d4a754] cursor-pointer"
                      />
                    </div>

                    <span className="text-[#6b7280]">to</span>

                    <div className="flex items-center gap-2">
                      <span className="text-[#9ca3af]">Closing Time:</span>
                      <input
                        type="time"
                        value={row.end_time}
                        onChange={(e) =>
                          handleTimeChange(w.index, 'end_time', e.target.value)
                        }
                        className="bg-[#181a26] border border-[#2a2f42] rounded-md px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-[#d4a754] cursor-pointer"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-[#6b7280] italic">
                    Kitchen dark · No reservation slots offered on this weekday
                  </div>
                )}

                <div className="flex items-center justify-end">
                  <button
                    onClick={() => handleSaveRow(w.index)}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#1e2230] text-[#cbd5e1] hover:text-white hover:bg-[#282d3f] border border-[#2c3245] transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5 text-[#d4a754]" />
                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
