import React from 'react';
import { Calendar, ChevronDown, Sparkles, Flame, Wine, Clock } from 'lucide-react';
import { RESTAURANT_IMAGES } from '../../data/restaurant-images';
import { RestaurantSettings } from '../../types/database';

interface HeroSectionProps {
  settings: RestaurantSettings;
  onReserveClick: () => void;
  onMenuClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  settings,
  onReserveClick,
  onMenuClick,
}) => {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src={RESTAURANT_IMAGES.hero.main}
          alt={RESTAURANT_IMAGES.hero.alt}
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d0e] via-[#0c0d0e]/75 to-[#0c0d0e]/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0d0e]/90 via-[#0c0d0e]/50 to-[#0c0d0e]/90" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#c59b43]/15 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#c59b43]/30 bg-[#15171f]/80 backdrop-blur-md mb-8 text-xs font-medium tracking-widest uppercase text-[#e2bd6e] shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-[#d4a754]" />
          <span>Michelin Guide Recommended · Wood-Fired Hearth &amp; Cellar</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight text-[#fbf9f5] leading-[1.08] mb-6 drop-shadow-sm">
          An Alchemy of <span className="italic font-normal text-[#e8c782]">Live Fire</span>,
          <br className="hidden sm:inline" /> Seasonal Harvest &amp; Gracious Dining.
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#cbd5e1] font-light leading-relaxed mb-10">
          Rooted in Pacific coastal provenance and ancient hearth-fire cooking. Welcome to{' '}
          <span className="text-[#f5f2eb] font-medium">{settings.restaurant_name}</span>, where
          rare cellar vintages meet unforgettable culinary craftsmanship.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 mb-16">
          <button
            onClick={onReserveClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded text-sm sm:text-base font-semibold tracking-wide text-[#0c0d0e] bg-gradient-to-r from-[#d4a754] via-[#e2bd6e] to-[#c59b43] hover:from-[#e2bd6e] hover:to-[#d4a754] shadow-[0_4px_25px_rgba(197,155,67,0.35)] hover:shadow-[0_6px_35px_rgba(197,155,67,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#0c0d0e]" />
            <span>Reserve Your Table</span>
          </button>

          <button
            onClick={onMenuClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded text-sm sm:text-base font-medium tracking-wide text-[#f3f4f6] bg-[#1a1d26]/80 hover:bg-[#232733] border border-[#374151] hover:border-[#c59b43]/50 backdrop-blur-sm transition-all cursor-pointer"
          >
            <span>Explore Seasonal Menu</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-6 border-t border-[#262a36]/80 text-left">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-[#11131a]/60 border border-[#202430]/60 backdrop-blur-xs">
            <div className="p-2 rounded bg-[#1c1f2b] text-[#d4a754]">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-[#f3f4f6] uppercase tracking-wider">White Oak Hearth</h2>
              <p className="text-[12px] text-[#9ca3af] mt-0.5">Ember-grilled prime cuts &amp; seafood</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-[#11131a]/60 border border-[#202430]/60 backdrop-blur-xs">
            <div className="p-2 rounded bg-[#1c1f2b] text-[#d4a754]">
              <Wine className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-[#f3f4f6] uppercase tracking-wider">Curated Cellar</h2>
              <p className="text-[12px] text-[#9ca3af] mt-0.5">850+ rare biodynamic vintages</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-[#11131a]/60 border border-[#202430]/60 backdrop-blur-xs">
            <div className="p-2 rounded bg-[#1c1f2b] text-[#d4a754]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-[#f3f4f6] uppercase tracking-wider">Nightly Service</h2>
              <p className="text-[12px] text-[#9ca3af] mt-0.5">Tasting menu &amp; à la carte seating</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-[#6b7280] flex flex-col items-center">
        <span className="text-[10px] tracking-widest uppercase mb-1">Scroll to explore</span>
        <ChevronDown className="w-4 h-4 animate-bounce text-[#c59b43]/70" />
      </div>
    </section>
  );
};
