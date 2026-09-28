import React from 'react';
import { Flame, Wine, Compass, Award, Users } from 'lucide-react';
import { RESTAURANT_IMAGES } from '../../data/restaurant-images';

export const AboutAtmosphereSection: React.FC = () => {
  return (
    <section id="atmosphere" className="relative py-24 sm:py-32 bg-[#0c0d0e] overflow-hidden">
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-[#c59b43]/5 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-[#d4a754] uppercase mb-3">
            <span className="w-8 h-px bg-[#d4a754]/60" />
            <span>The Aurelia Experience</span>
            <span className="w-8 h-px bg-[#d4a754]/60" />
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#fbf9f5] leading-tight">
            Crafted at the Intimate Intersection of <span className="italic text-[#e8c782]">Fire, Soil &amp; Vine</span>.
          </h2>
          <p className="mt-4 text-base text-[#9ca3af] leading-relaxed">
            Every evening, our open hearth comes alive with California white oak embers. We honor
            sustainable coastal fisheries, heritage ranches, and small-lot biodynamic growers in a
            setting curated for convivial celebration.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-20">
          <div className="lg:col-span-7 relative group">
            <div className="relative h-[420px] sm:h-[500px] rounded-lg overflow-hidden border border-[#262a36] shadow-2xl">
              <img
                src={RESTAURANT_IMAGES.atmosphere.hearth}
                alt={RESTAURANT_IMAGES.atmosphere.altHearth}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d0e] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#d4a754] block mb-1">
                  Executive Hearth Craft
                </span>
                <p className="font-serif text-xl sm:text-2xl text-white font-medium">
                  Cooking over white oak coals preserves natural juices and infuses deep, fragrant smoke.
                </p>
              </div>
            </div>

            <div className="hidden sm:flex absolute -bottom-6 -right-6 bg-[#161821] border border-[#c59b43]/40 rounded-lg p-5 shadow-2xl items-center gap-4 max-w-xs">
              <div className="w-12 h-12 rounded-full bg-[#202432] flex items-center justify-center text-[#d4a754] shrink-0 border border-[#c59b43]/30">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white uppercase tracking-wider block">
                  100% Live Fire Cooking
                </span>
                <span className="text-[11px] text-[#9ca3af]">No gas grills or steam ovens</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="relative h-60 rounded-lg overflow-hidden border border-[#262a36] shadow-xl group">
              <img
                src={RESTAURANT_IMAGES.atmosphere.interior}
                alt={RESTAURANT_IMAGES.atmosphere.altInterior}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d0e] via-[#0c0d0e]/30 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#d4a754]">
                  The Main Dining Room
                </span>
                <h4 className="font-serif text-lg text-white font-medium">
                  Leather banquettes, ambient brass sconces, and acoustic warmth.
                </h4>
              </div>
            </div>

            <div className="relative h-60 rounded-lg overflow-hidden border border-[#262a36] shadow-xl group">
              <img
                src={RESTAURANT_IMAGES.atmosphere.cellar}
                alt={RESTAURANT_IMAGES.atmosphere.altCellar}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d0e] via-[#0c0d0e]/30 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#d4a754]">
                  Sommelier Cellar Vault
                </span>
                <h4 className="font-serif text-lg text-white font-medium">
                  Grand Cru allocations and artisanal grower Champagnes.
                </h4>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-lg bg-[#12141c]/60 border border-[#202430] hover:border-[#c59b43]/40 transition-all group">
            <div className="w-12 h-12 rounded bg-[#1b1e2b] flex items-center justify-center text-[#d4a754] mb-6 group-hover:bg-[#c59b43] group-hover:text-black transition-colors">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl text-[#f3f4f6] font-medium mb-3">
              Hyper-Local Provenance
            </h3>
            <p className="text-sm text-[#9ca3af] leading-relaxed">
              We partner directly with sustainable purveyors along the Pacific coast and Central Valley
              organic biodynamic family farms. Ingredients arrive within hours of harvest.
            </p>
          </div>

          <div className="p-8 rounded-lg bg-[#12141c]/60 border border-[#202430] hover:border-[#c59b43]/40 transition-all group">
            <div className="w-12 h-12 rounded bg-[#1b1e2b] flex items-center justify-center text-[#d4a754] mb-6 group-hover:bg-[#c59b43] group-hover:text-black transition-colors">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl text-[#f3f4f6] font-medium mb-3">
              Culinary Artistry
            </h3>
            <p className="text-sm text-[#9ca3af] leading-relaxed">
              Led by veteran culinary directors from three-star kitchens in San Francisco and Lyon.
              Uncompromising standards from hand-extruded pasta to 45-day dry aging.
            </p>
          </div>

          <div className="p-8 rounded-lg bg-[#12141c]/60 border border-[#202430] hover:border-[#c59b43]/40 transition-all group">
            <div className="w-12 h-12 rounded bg-[#1b1e2b] flex items-center justify-center text-[#d4a754] mb-6 group-hover:bg-[#c59b43] group-hover:text-black transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl text-[#f3f4f6] font-medium mb-3">
              Bespoke Seating &amp; Care
            </h3>
            <p className="text-sm text-[#9ca3af] leading-relaxed">
              Every reservation is individually paced to ensure intimacy. Our dedicated table
              concierge caters to dietary choices, milestones, and bespoke wine pairings.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
