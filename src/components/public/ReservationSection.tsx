import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Mail,
  Phone,
  User,
  MessageSquare,
  ShieldCheck,
  Download,
  Share2,
} from 'lucide-react';
import { RestaurantSettings, TimeSlot, Reservation } from '../../types/database';
import { getAvailableTimeSlots, createReservation } from '../../lib/data-service';

interface ReservationSectionProps {
  settings: RestaurantSettings;
  onReservationComplete?: (reservation: Reservation) => void;
}

export const ReservationSection: React.FC<ReservationSectionProps> = ({
  settings,
  onReservationComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [partySize, setPartySize] = useState<number>(2);

  const getInitialDateStr = () => {
    const d = new Date();
    if (d.getHours() >= 21) {
      d.setDate(d.getDate() + 1);
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getInitialDateStr());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [slotError, setSlotError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchSlots() {
      if (!selectedDate || partySize <= 0) return;
      setLoadingSlots(true);
      setSlotError(null);
      setSelectedSlot(null);

      try {
        const available = await getAvailableTimeSlots(selectedDate, partySize);
        if (isMounted) {
          setSlots(available);
          if (available.length === 0) {
            setSlotError(
              'No tables available for this date and party size. The restaurant may be closed, fully committed, or the date is reserved.'
            );
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setSlotError('Unable to calculate table availability. Please try another date.');
        }
      } finally {
        if (isMounted) setLoadingSlots(false);
      }
    }

    fetchSlots();
    return () => {
      isMounted = false;
    };
  }, [selectedDate, partySize]);

  const maxParty = settings.max_party_size || 10;
  const partySizeOptions = Array.from({ length: maxParty }, (_, i) => i + 1);

  const quickDates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
    const weekdayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { dateStr, label: weekdayName, formattedDate };
  });

  const handleSubmitReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setSubmitError('Please select a reservation time slot.');
      return;
    }
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setSubmitError('Please complete all contact details.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const startTimeStr = selectedSlot.label;
      const endHours = String(selectedSlot.end.getHours()).padStart(2, '0');
      const endMins = String(selectedSlot.end.getMinutes()).padStart(2, '0');
      const endTimeStr = `${endHours}:${endMins}`;

      const { data, error } = await createReservation({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        party_size: partySize,
        table_id: selectedSlot.tableId,
        reservation_date: selectedDate,
        start_time: startTimeStr,
        end_time: endTimeStr,
        special_requests: specialRequests.trim() || null,
      });

      if (error || !data) {
        throw error || new Error('Reservation could not be recorded.');
      }

      setConfirmedReservation(data);
      setCurrentStep(4);
      if (onReservationComplete) {
        onReservationComplete(data);
      }
    } catch (err: any) {
      setSubmitError(err?.message || 'An error occurred while confirming your reservation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadCalendar = () => {
    if (!confirmedReservation || !selectedSlot) return;
    const startIso = selectedSlot.start.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endIso = selectedSlot.end.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Aurelia Table & Cellar//Reservation//EN',
      'BEGIN:VEVENT',
      `UID:${confirmedReservation.id}@aurelia-dining.com`,
      `DTSTAMP:${new Date().toISOString().replace(/-|:|\.\d\d\d/g, '')}`,
      `DTSTART:${startIso}`,
      `DTEND:${endIso}`,
      `SUMMARY:Dinner Reservation at ${settings.restaurant_name}`,
      `DESCRIPTION:Table Reservation for party of ${confirmedReservation.party_size}. Reference: ${confirmedReservation.id}`,
      `LOCATION:${settings.restaurant_address}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Aurelia-Reservation-${confirmedReservation.id.slice(0, 8)}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFlow = () => {
    setCurrentStep(1);
    setConfirmedReservation(null);
    setSelectedSlot(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setSpecialRequests('');
    setSubmitError(null);
  };

  return (
    <section id="reservations" className="relative py-24 sm:py-32 bg-[#0c0d0f] overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#c59b43]/5 blur-[180px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-[#d4a754] uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#d4a754]" />
            <span>Table Booking Service</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#fbf9f5] leading-tight">
            Reserve Your <span className="italic text-[#e8c782]">Evening</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#9ca3af]">
            Real-time table assignment with instant confirmation.
          </p>
        </div>

        <div className="mb-10">
          <div className="flex items-center justify-between max-w-xl mx-auto text-xs font-medium">
            <div
              className={`flex items-center gap-2 ${
                currentStep >= 1 ? 'text-[#e8c782]' : 'text-[#6b7280]'
              }`}
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border ${
                  currentStep >= 1
                    ? 'border-[#c59b43] bg-[#c59b43] text-black'
                    : 'border-[#374151] bg-[#1a1d26] text-[#9ca3af]'
                }`}
              >
                1
              </span>
              <span className="hidden sm:inline">Party Size</span>
            </div>

            <div className={`h-px flex-1 mx-3 ${currentStep >= 2 ? 'bg-[#c59b43]' : 'bg-[#262a37]'}`} />

            <div
              className={`flex items-center gap-2 ${
                currentStep >= 2 ? 'text-[#e8c782]' : 'text-[#6b7280]'
              }`}
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border ${
                  currentStep >= 2
                    ? 'border-[#c59b43] bg-[#c59b43] text-black'
                    : 'border-[#374151] bg-[#1a1d26] text-[#9ca3af]'
                }`}
              >
                2
              </span>
              <span className="hidden sm:inline">Date &amp; Time</span>
            </div>

            <div className={`h-px flex-1 mx-3 ${currentStep >= 3 ? 'bg-[#c59b43]' : 'bg-[#262a37]'}`} />

            <div
              className={`flex items-center gap-2 ${
                currentStep >= 3 ? 'text-[#e8c782]' : 'text-[#6b7280]'
              }`}
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border ${
                  currentStep >= 3
                    ? 'border-[#c59b43] bg-[#c59b43] text-black'
                    : 'border-[#374151] bg-[#1a1d26] text-[#9ca3af]'
                }`}
              >
                3
              </span>
              <span className="hidden sm:inline">Guest Details</span>
            </div>

            <div className={`h-px flex-1 mx-3 ${currentStep >= 4 ? 'bg-[#c59b43]' : 'bg-[#262a37]'}`} />

            <div
              className={`flex items-center gap-2 ${
                currentStep === 4 ? 'text-[#e8c782]' : 'text-[#6b7280]'
              }`}
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border ${
                  currentStep === 4
                    ? 'border-[#c59b43] bg-[#c59b43] text-black'
                    : 'border-[#374151] bg-[#1a1d26] text-[#9ca3af]'
                }`}
              >
                4
              </span>
              <span className="hidden sm:inline">Confirmation</span>
            </div>
          </div>
        </div>

        <div className="bg-[#12141c] border border-[#232735] rounded-xl shadow-2xl p-6 sm:p-10 backdrop-blur-md">
          {currentStep === 1 && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h3 className="font-serif text-2xl text-[#f3f4f6] font-medium mb-1">
                  How many guests will be dining?
                </h3>
                <p className="text-xs sm:text-sm text-[#9ca3af]">
                  Select your party size to view matching table allocations. For groups larger than{' '}
                  {settings.max_party_size}, please contact private dining.
                </p>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5">
                {partySizeOptions.map((num) => (
                  <button
                    key={num}
                    onClick={() => setPartySize(num)}
                    className={`py-3.5 rounded-lg text-sm font-semibold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 border ${
                      partySize === num
                        ? 'border-[#d4a754] bg-gradient-to-b from-[#c59b43] to-[#a67c2c] text-[#0c0d0e] shadow-lg shadow-[#c59b43]/20 scale-105'
                        : 'border-[#262a38] bg-[#171a24] text-[#cbd5e1] hover:border-[#c59b43]/50 hover:bg-[#1e2230]'
                    }`}
                  >
                    <span>{num}</span>
                    <span className="text-[10px] opacity-75 font-normal">
                      {num === 1 ? 'Guest' : 'Guests'}
                    </span>
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-lg bg-[#181b26] border border-[#262a38] flex items-center justify-between text-xs text-[#9ca3af]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-[#202433] text-[#d4a754]">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[#f3f4f6] font-medium block">
                      Party of {partySize} {partySize === 1 ? 'Guest' : 'Guests'} Selected
                    </span>
                    <span>
                      {partySize <= 2
                        ? "Optimal seating at Chef's Counter or Window banquettes"
                        : partySize <= 4
                        ? 'Spacious Hearthside Booth seating'
                        : 'Grand Dining Room round table or Sommelier Vault'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#232735]">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded text-sm font-semibold text-[#0c0d0e] bg-gradient-to-r from-[#d4a754] to-[#c59b43] hover:from-[#e2bd6e] hover:to-[#d4a754] shadow-md transition-all cursor-pointer"
                >
                  <span>Select Date &amp; Time</span>
                  <ChevronRight className="w-4 h-4 text-[#0c0d0e]" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-2xl text-[#f3f4f6] font-medium mb-1">
                    Select Date &amp; Available Time
                  </h3>
                  <p className="text-xs sm:text-sm text-[#9ca3af]">
                    Table duration is {settings.default_reservation_duration_minutes} minutes. Slots
                    reflect real live table capacity.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-[#9ca3af] hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change party ({partySize})</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9ca3af] mb-2.5">
                  Select Evening
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-3">
                  {quickDates.map((q) => (
                    <button
                      key={q.dateStr}
                      onClick={() => setSelectedDate(q.dateStr)}
                      className={`p-3 rounded-lg text-left transition-all border cursor-pointer ${
                        selectedDate === q.dateStr
                          ? 'border-[#d4a754] bg-[#1f2330] shadow-md text-white'
                          : 'border-[#262a38] bg-[#161822] text-[#9ca3af] hover:border-[#3b4154] hover:text-white'
                      }`}
                    >
                      <span className="block text-xs font-medium text-[#d4a754]">{q.label}</span>
                      <span className="block text-sm font-semibold mt-0.5">{q.formattedDate}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xs text-[#6b7280]">Or choose custom date:</span>
                  <div className="relative">
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-[#171a24] border border-[#2a2f40] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#d4a754] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#d4a754]" />
                    <span>Available Seating Times</span>
                  </label>
                  {selectedSlot && (
                    <span className="text-xs text-[#e8c782] font-medium">
                      Assigned: {selectedSlot.tableName} ({selectedSlot.tableArea})
                    </span>
                  )}
                </div>

                {loadingSlots ? (
                  <div className="py-12 text-center bg-[#151722] rounded-lg border border-[#242836]">
                    <div className="inline-block w-6 h-6 border-2 border-[#c59b43] border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-xs text-[#9ca3af]">Checking table availability in real time...</p>
                  </div>
                ) : slotError ? (
                  <div className="p-4 rounded-lg bg-[#201819] border border-[#5c2729] text-xs text-[#e57373] flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 shrink-0 text-[#ef5350] mt-0.5" />
                    <div>
                      <p className="font-semibold">{slotError}</p>
                      <p className="mt-1 text-[#bcaaa4]">
                        Try choosing another evening, or change party size.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                    {slots.map((slot) => (
                      <button
                        key={`${slot.label}-${slot.tableId}`}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-3 rounded-lg text-center transition-all border cursor-pointer ${
                          selectedSlot?.label === slot.label && selectedSlot?.tableId === slot.tableId
                            ? 'border-[#d4a754] bg-[#d4a754] text-black font-bold shadow-lg shadow-[#c59b43]/30 scale-105'
                            : 'border-[#262a38] bg-[#161822] text-[#e2e8f0] hover:border-[#c59b43]/60 hover:bg-[#1f2330]'
                        }`}
                      >
                        <span className="block text-sm font-semibold">{slot.label}</span>
                        <span className="block text-[10px] opacity-75 mt-0.5 truncate">
                          {slot.tableArea || 'Seating'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-[#232735]">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-2.5 rounded text-xs font-medium text-[#9ca3af] hover:text-white transition-colors cursor-pointer"
                >
                  Back to Party Size
                </button>

                <button
                  disabled={!selectedSlot}
                  onClick={() => setCurrentStep(3)}
                  className={`inline-flex items-center gap-2 px-7 py-3 rounded text-sm font-semibold transition-all cursor-pointer ${
                    selectedSlot
                      ? 'text-[#0c0d0e] bg-gradient-to-r from-[#d4a754] to-[#c59b43] hover:from-[#e2bd6e] hover:to-[#d4a754] shadow-md'
                      : 'bg-[#232734] text-[#6b7280] cursor-not-allowed'
                  }`}
                >
                  <span>Continue to Guest Details</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <form onSubmit={handleSubmitReservation} className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-[#232735]">
                <div>
                  <h3 className="font-serif text-2xl text-[#f3f4f6] font-medium mb-1">
                    Guest Information
                  </h3>
                  <p className="text-xs sm:text-sm text-[#9ca3af]">
                    We will send your reservation confirmation and arrival guidelines here.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-[#9ca3af] hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change time</span>
                </button>
              </div>

              <div className="p-4 rounded-lg bg-[#171a25] border border-[#272c3d] flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2 text-[#cbd5e1]">
                  <CalendarIcon className="w-4 h-4 text-[#d4a754]" />
                  <span>
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[#cbd5e1]">
                  <Clock className="w-4 h-4 text-[#d4a754]" />
                  <span>
                    {selectedSlot?.label} (Duration {settings.default_reservation_duration_minutes}m)
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[#cbd5e1]">
                  <Users className="w-4 h-4 text-[#d4a754]" />
                  <span>
                    Party of {partySize} ({selectedSlot?.tableName})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-[#6b7280]" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Evelyn Vance"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#161822] border border-[#262a38] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-[#d4a754]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-[#6b7280]" />
                    <input
                      type="email"
                      required
                      placeholder="evelyn@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#161822] border border-[#262a38] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-[#d4a754]"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">
                    Phone Number (for SMS confirmation) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-[#6b7280]" />
                    <input
                      type="tel"
                      required
                      placeholder="+1 (415) 555-0192"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#161822] border border-[#262a38] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-[#d4a754]"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">
                    Special Requests &amp; Dietary Requirements (Optional)
                  </label>
                  <div className="relative">
                    <MessageSquare className="w-4 h-4 absolute left-3 top-3 text-[#6b7280]" />
                    <textarea
                      rows={3}
                      placeholder="Milestone celebration (anniversary, birthday), allergies (gluten, shellfish), or seating preference..."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="w-full bg-[#161822] border border-[#262a38] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-[#d4a754]"
                    />
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-[#6b7280] leading-relaxed pt-2">
                By submitting this reservation, you confirm your attendance. Please provide at least
                24 hours notice for cancellations or modifications. Valet parking is available at our
                front courtyard.
              </div>

              {submitError && (
                <div className="p-3.5 rounded bg-[#201819] border border-[#5c2729] text-xs text-[#e57373] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#ef5350]" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-[#232735]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 rounded text-xs font-medium text-[#9ca3af] hover:text-white transition-colors cursor-pointer"
                >
                  Back to Time Slots
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded text-sm font-semibold text-[#0c0d0e] bg-gradient-to-r from-[#d4a754] via-[#e2bd6e] to-[#c59b43] hover:from-[#e2bd6e] hover:to-[#d4a754] shadow-lg shadow-[#c59b43]/25 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Confirming Table...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-black" />
                      <span>Complete Reservation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {currentStep === 4 && confirmedReservation && (
            <div className="text-center py-6 animate-fadeIn space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#1b251d] border border-[#2d5236] flex items-center justify-center text-[#4ade80] mx-auto shadow-xl">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-[#d4a754] block mb-1">
                  Table Confirmed
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl text-[#f3f4f6] font-medium">
                  We Look Forward to Welcoming You
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#9ca3af] max-w-md mx-auto">
                  A confirmation email has been dispatched to{' '}
                  <span className="text-[#f3f4f6] font-medium">{confirmedReservation.email}</span>.
                </p>
              </div>

              <div className="max-w-lg mx-auto bg-[#171a25] border border-[#2b3144] rounded-lg p-6 text-left shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#c59b43] via-[#e2bd6e] to-[#c59b43]" />

                <div className="flex items-center justify-between pb-4 border-b border-[#262b3c] mb-4">
                  <div>
                    <span className="text-[10px] text-[#9ca3af] uppercase tracking-wider block">
                      Reservation Code
                    </span>
                    <span className="font-mono text-base font-bold text-[#e8c782] tracking-wider">
                      AUR-{confirmedReservation.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-[#1a2d1d] text-[#4ade80] border border-[#2d5236]">
                    Status: {confirmedReservation.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                  <div>
                    <span className="text-[#6b7280] block text-[10px] uppercase">Guest</span>
                    <span className="text-white font-medium text-sm">
                      {confirmedReservation.full_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6b7280] block text-[10px] uppercase">Party Size</span>
                    <span className="text-white font-medium text-sm">
                      {confirmedReservation.party_size} Guests
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6b7280] block text-[10px] uppercase">Date</span>
                    <span className="text-white font-medium">
                      {new Date(confirmedReservation.reservation_date + 'T00:00:00').toLocaleDateString(
                        'en-US',
                        { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6b7280] block text-[10px] uppercase">Seating Time</span>
                    <span className="text-white font-medium">
                      {confirmedReservation.start_time} - {confirmedReservation.end_time}
                    </span>
                  </div>
                </div>

                {confirmedReservation.restaurant_tables && (
                  <div className="p-2.5 rounded bg-[#10121a] border border-[#212534] text-[11px] text-[#cbd5e1] mb-4">
                    <span className="text-[#d4a754] font-medium">Allocated Seating: </span>
                    {confirmedReservation.restaurant_tables.table_name} (
                    {confirmedReservation.restaurant_tables.area})
                  </div>
                )}

                {confirmedReservation.special_requests && (
                  <div className="text-[11px] text-[#9ca3af] italic border-t border-[#232736] pt-3">
                    Special notes: "{confirmedReservation.special_requests}"
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleDownloadCalendar}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded text-xs font-semibold text-white bg-[#1e2230] hover:bg-[#282d3f] border border-[#353b4e] transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#d4a754]" />
                  <span>Add to Calendar (.ics)</span>
                </button>

                <button
                  onClick={resetFlow}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded text-xs font-semibold text-[#0c0d0e] bg-gradient-to-r from-[#d4a754] to-[#c59b43] hover:from-[#e2bd6e] hover:to-[#d4a754] transition-all cursor-pointer"
                >
                  <span>Book Another Reservation</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
