import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { RestaurantSettings } from '../../types/database';

interface FooterProps {
  settings: RestaurantSettings;
  onNavigateToAdmin: () => void;
  onNavigateToBooking: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onNavigateToAdmin,
  onNavigateToBooking,
}) => {
  const [emailSub, setEmailSub] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailSub.trim()) {
      setSubscribed(true);
      setEmailSub('');
    }
  };

  return (
    <footer className="bg-[#07080a] border-t border-[#181a24] text-[#9ca3af] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded border border-[#c59b43]/40 bg-[#12141c] flex items-center justify-center text-[#d4a754] font-serif text-xl font-bold">
                A
              </div>
              <div>
                <span className="block font-serif text-xl font-semibold tracking-wider text-[#f5f2eb]">
                  {settings.restaurant_name}
                </span>
                <span className="block text-[9px] tracking-[0.22em] text-[#6b7280] uppercase">
                  Table &amp; Cellar
                </span>
              </div>
            </div>

            <p className="text-xs text-[#9ca3af] leading-relaxed max-w-sm">
              Live hearth cooking, seasonal California agricultural provenance, and an 850-label
              sommelier cellar vault. Celebrating memorable moments through gracious hospitality.
            </p>

            <div className="pt-2 text-[11px] text-[#6b7280]">
              <span>Michelin Guide Selection · Two Star Dining Craft</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">The Experience</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#atmosphere" className="hover:text-[#d4a754] transition-colors">
                  Wood-Fired Hearth
                </a>
              </li>
              <li>
                <a href="#menu-highlights" className="hover:text-[#d4a754] transition-colors">
                  Seasonal Degustation
                </a>
              </li>
              <li>
                <button
                  onClick={onNavigateToBooking}
                  className="hover:text-[#d4a754] transition-colors cursor-pointer text-left"
                >
                  Table Reservations
                </button>
              </li>
              <li>
                <a href="#location-hours" className="hover:text-[#d4a754] transition-colors">
                  Valet &amp; Hours
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Concierge</h4>
            <div className="space-y-2 text-xs text-[#9ca3af]">
              <p>{settings.restaurant_address}</p>
              <p className="text-[#d1d5db]">{settings.restaurant_phone}</p>
              <p>{settings.restaurant_email}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              Cellar Allocations
            </h4>
            <p className="text-xs text-[#9ca3af]">
              Receive private invitations for rare vintage cellar dinners and seasonal tasting menu
              openings.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 text-xs text-[#4ade80] bg-[#142318] p-2.5 rounded border border-[#23422a]">
                <CheckCircle2 className="w-4 h-4" />
                <span>You are on our private guest list.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={emailSub}
                    onChange={(e) => setEmailSub(e.target.value)}
                    className="w-full bg-[#12141c] border border-[#252938] rounded px-3 py-2 text-xs text-white placeholder-[#525969] focus:outline-none focus:border-[#d4a754]"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe to cellar allocations"
                    className="absolute right-1 top-1 bottom-1 px-2.5 bg-[#c59b43] text-black hover:bg-[#d4a754] rounded flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-[#161822] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#6b7280]">
          <div>
            &copy; {new Date().getFullYear()} {settings.restaurant_name}. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={onNavigateToAdmin}
              className="text-[#9ca3af] hover:text-[#d4a754] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#c59b43]" />
              <span>Manager &amp; Staff Login</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
