import React, { useState } from 'react';
import { Sparkles, UtensilsCrossed, Wine, ChefHat } from 'lucide-react';
import { MenuItem } from '../../types/database';
import { MENU_CATEGORY_IMAGES } from '../../data/restaurant-images';

interface MenuHighlightsSectionProps {
  items: MenuItem[];
  loading?: boolean;
}

export const MenuHighlightsSection: React.FC<MenuHighlightsSectionProps> = ({
  items,
  loading = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Starters', 'Mains', 'Desserts', 'Beverages'];

  const filteredItems =
    activeCategory === 'All'
      ? items
      : items.filter((item) => item.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <section id="menu-highlights" className="relative py-24 sm:py-32 bg-[#090a0c] border-y border-[#1e212b]">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#c59b43]/5 blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-[#d4a754] uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#d4a754]" />
            <span>Seasonal Degustation &amp; Hearth Selections</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#fbf9f5] leading-tight">
            Featured Culinary <span className="italic text-[#e8c782]">Creations</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#9ca3af] leading-relaxed">
            A celebration of seasonal micro-harvests, wild-foraged botanicals, and dry-aged cuts
            prepared over glowing white oak embers.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-8 p-1.5 bg-[#12141c] rounded-lg border border-[#232734] max-w-lg mx-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-[#c59b43] to-[#d4a754] text-[#0c0d0e] font-semibold shadow-md'
                    : 'text-[#9ca3af] hover:text-[#f3f4f6] hover:bg-[#1a1c26]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-2 border-[#c59b43] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-[#9ca3af]">Loading seasonal selections from hearth...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-[#13151e] border border-[#232734] rounded-lg max-w-md mx-auto">
            <UtensilsCrossed className="w-8 h-8 text-[#c59b43] mx-auto mb-3 opacity-60" />
            <h3 className="font-serif text-lg text-white font-medium">No dishes in this category</h3>
            <p className="text-xs text-[#9ca3af] mt-1">Please select another category or check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 sticky top-28 hidden lg:block">
              <div className="relative rounded-lg overflow-hidden border border-[#262a37] bg-[#12141c] shadow-2xl p-6">
                <div className="relative h-64 rounded-md overflow-hidden mb-6">
                  <img
                    src={
                      activeCategory !== 'All' && MENU_CATEGORY_IMAGES[activeCategory]
                        ? MENU_CATEGORY_IMAGES[activeCategory]
                        : MENU_CATEGORY_IMAGES.Mains
                    }
                    alt="Plated culinary specialty"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d0e] via-transparent to-transparent opacity-80" />
                  <div className="absolute top-3 left-3 bg-[#0c0d0e]/80 backdrop-blur-md px-2.5 py-1 rounded text-[10px] tracking-wider uppercase font-semibold text-[#e8c782] border border-[#c59b43]/30">
                    Chef's Daily Pairing
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#e8c782] tracking-wider uppercase">
                    <ChefHat className="w-4 h-4 text-[#c59b43]" />
                    <span>Executive Tasting Note</span>
                  </div>
                  <p className="text-xs text-[#9ca3af] leading-relaxed">
                    Our kitchen crafts all demi-glaces, pasta doughs, and cultured butters in-house.
                    Ask your captain for our sommelier reserve wine pairing flight with each course.
                  </p>
                  <div className="pt-4 border-t border-[#232735] flex items-center justify-between text-xs text-[#cbd5e1]">
                    <span className="flex items-center gap-1.5">
                      <Wine className="w-3.5 h-3.5 text-[#c59b43]" />
                      <span>Sommelier Reserve</span>
                    </span>
                    <span className="text-[#e8c782] font-semibold">$95 / Guest</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative p-6 rounded-lg bg-[#11131b] border border-[#202432] hover:border-[#c59b43]/50 transition-all duration-300 shadow-lg hover:shadow-[0_4px_25px_rgba(0,0,0,0.5)] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <span className="text-[10px] font-semibold tracking-widest uppercase text-[#c59b43]/90 block mb-1">
                          {item.category}
                        </span>
                        <h3 className="font-serif text-xl sm:text-2xl text-[#fbf9f5] font-medium group-hover:text-[#e8c782] transition-colors leading-snug">
                          {item.name}
                        </h3>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-serif text-xl font-semibold text-[#f5f2eb]">
                          ${Number(item.price).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="w-full border-b border-dashed border-[#262b3a] my-3.5" />

                    <p className="text-xs sm:text-sm text-[#9ca3af] leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#1c202b] flex items-center justify-between text-[11px] text-[#6b7280]">
                    <span className="text-[#848d9e]">Wood-Fired Preparation</span>
                    {item.is_featured && (
                      <span className="text-[#e8c782] font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#d4a754]" />
                        <span>Signature Dish</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
