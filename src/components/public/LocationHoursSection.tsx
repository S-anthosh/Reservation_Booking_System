import React from 'react';
import { MapPin, Phone, Mail, Clock, Car, Sparkles } from 'lucide-react';
import { RestaurantSettings, BusinessHour } from '../../types/database';
import { RESTAURANT_IMAGES } from '../../data/restaurant-images';

interface LocationHoursSectionProps {
  settings: RestaurantSettings;
  hours: BusinessHour[];
}

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const LocationHoursSection: React.FC<LocationHoursSectionProps> = ({
  settings,
  hours,
}) => {
  const todayWeekday = new Date().getDay();
  const todayHour = hours.find((h) => h.weekday === todayWeekday);

  return (
    <section id="location-hours" className="relative py-24 sm:py-32 bg-[#0a0b0d] border-t border-[#1a1d27]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-6 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-[#d4a754] uppercase mb-3">
                <Clock className="w-3.5 h-3.5 text-[#d4a754]" />
                <span>Service Schedule</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#fbf9f5]">
                Dinner &amp; Cellar <span className="italic text-[#e8c782]">Hours</span>
              </h2>
              <p className="mt-3 text-sm text-[#9ca3af]">
                We welcome guests for seated dinner tasting menus, à la carte service, and cellar
                tastings.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#141620] border border-[#252938] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    todayHour?.is_open ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                  }`}
                />
                <div>
                  <span className="text-xs font-semibold text-white block">
                    {todayHour?.is_open ? 'Service Open Tonight' : 'Kitchen Dark Tonight'}
                  </span>
                  <span className="text-[11px] text-[#9ca3af]">
                    {todayHour?.is_open
                      ? `Seating from ${todayHour.start_time} to ${todayHour.end_time}`
                      : 'Closed for private cellar aging & kitchen prep'}
                  </span>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#d4a754] uppercase tracking-wider">
                {WEEKDAY_NAMES[todayWeekday]}
              </span>
            </div>

            <div className="bg-[#11131a] rounded-lg border border-[#202330] p-5 shadow-xl">
              <div className="space-y-3">
                {hours
                  .sort((a, b) => a.weekday - b.weekday)
                  .map((h) => {
                    const isToday = h.weekday === todayWeekday;
                    return (
                      <div
                        key={h.weekday}
                        className={`flex items-center justify-between py-2 px-3 rounded text-xs transition-colors ${
                          isToday
                            ? 'bg-[#1e2332] text-white font-medium border border-[#c59b43]/30'
                            : 'text-[#9ca3af] hover:text-[#d1d5db]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={isToday ? 'text-[#d4a754] font-semibold' : ''}>
                            {WEEKDAY_NAMES[h.weekday]}
                          </span>
                          {isToday && (
                            <span className="text-[10px] text-[#d4a754] bg-[#2a271c] px-1.5 py-0.5 rounded">
                              Today
                            </span>
                          )}
                        </div>

                        <div>
                          {h.is_open ? (
                            <span>
                              {h.start_time} – {h.end_time}
                            </span>
                          ) : (
                            <span className="text-[#6b7280] italic">Closed for service</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-[#11131a] border border-[#202330]">
                <div className="flex items-center gap-2 text-[#d4a754] font-semibold mb-1">
                  <Car className="w-3.5 h-3.5" />
                  <span>Valet &amp; Parking</span>
                </div>
                <p className="text-[#9ca3af] leading-relaxed">
                  Complimentary valet parking commences 30 minutes prior to evening dinner service at
                  our main entrance.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#11131a] border border-[#202330]">
                <div className="flex items-center gap-2 text-[#d4a754] font-semibold mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Attire &amp; Ambiance</span>
                </div>
                <p className="text-[#9ca3af] leading-relaxed">
                  Smart casual to elegant evening attire requested. We celebrate intentional dining
                  and gracious conviviality.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="relative rounded-lg overflow-hidden border border-[#252a38] shadow-2xl group">
              <div className="relative h-80 sm:h-96">
                <img
                  src={RESTAURANT_IMAGES.atmosphere.diningGuests}
                  alt={RESTAURANT_IMAGES.atmosphere.altDiningGuests}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d0f] via-transparent to-transparent opacity-90" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="p-4 rounded-lg bg-[#12141d]/90 backdrop-blur-md border border-[#2c3245]">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded bg-[#202433] text-[#d4a754] shrink-0 mt-0.5">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium text-sm">
                          {settings.restaurant_name}
                        </h4>
                        <p className="text-xs text-[#9ca3af] mt-0.5">
                          {settings.restaurant_address}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href={`tel:${settings.restaurant_phone.replace(/\s+/g, '')}`}
                className="p-5 rounded-lg bg-[#11131a] border border-[#202330] hover:border-[#c59b43]/50 transition-all block group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded bg-[#191c28] text-[#d4a754] group-hover:bg-[#c59b43] group-hover:text-black transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6b7280] uppercase tracking-wider block">
                      Concierge Desk
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {settings.restaurant_phone}
                    </span>
                  </div>
                </div>
              </a>

              <a
                href={`mailto:${settings.restaurant_email}`}
                className="p-5 rounded-lg bg-[#11131a] border border-[#202330] hover:border-[#c59b43]/50 transition-all block group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded bg-[#191c28] text-[#d4a754] group-hover:bg-[#c59b43] group-hover:text-black transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] text-[#6b7280] uppercase tracking-wider block">
                      Inquiries &amp; Events
                    </span>
                    <span className="text-sm font-semibold text-white truncate block">
                      {settings.restaurant_email}
                    </span>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
