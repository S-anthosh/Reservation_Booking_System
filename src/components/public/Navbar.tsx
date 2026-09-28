import React from 'react';
import { Calendar, Clock, MapPin, Phone, ShieldCheck, ChevronRight, Menu as MenuIcon, X } from 'lucide-react';
import { RestaurantSettings } from '../../types/database';

interface NavbarProps {
  settings: RestaurantSettings;
  onNavigateToBooking: () => void;
  onNavigateToAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onNavigateToBooking,
  onNavigateToAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <aside aria-label="Restaurant Hours and Contact" className="bg-[#08080a] border-b border-[#20222a] text-[11px] text-[#9ca3af] py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-[#d1d5db]">
              <MapPin className="w-3 h-3 text-[#c59b43]" />
              <span className="truncate max-w-sm">{settings.restaurant_address}</span>
            </span>
            <span className="text-[#374151]">·</span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-[#c59b43]" />
              <span>{settings.restaurant_phone}</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[#c59b43] font-medium tracking-wide uppercase text-[10px]">
              Dinner Service Nightly · Reservations Recommended
            </span>
            <span className="text-[#374151]">·</span>
            <button
              onClick={onNavigateToAdmin}
              className="text-[#9ca3af] hover:text-[#d4a754] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3 h-3 text-[#9ca3af]" />
              <span>Staff Portal</span>
            </button>
          </div>
        </div>
      </aside>

      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0c0d0f]/95 backdrop-blur-md border-b border-[#22252e] shadow-xl py-3.5'
            : 'bg-transparent py-5 border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 group text-left"
          >
            <div className="w-10 h-10 rounded border border-[#c59b43]/40 bg-[#14161c] flex items-center justify-center text-[#d4a754] font-serif text-2xl font-bold tracking-widest shadow-inner group-hover:border-[#c59b43] transition-colors">
              A
            </div>
            <div>
              <span className="block font-serif text-xl sm:text-2xl font-semibold tracking-wider text-[#f5f2eb]">
                {settings.restaurant_name || 'AURELIA'}
              </span>
              <span className="block text-[10px] tracking-[0.24em] text-[#9ca3af] uppercase -mt-0.5">
                Table & Cellar
              </span>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium tracking-wide text-[#cbd5e1]">
            <button
              onClick={() => scrollToSection('atmosphere')}
              className="hover:text-[#d4a754] transition-colors cursor-pointer"
            >
              Atmosphere &amp; Craft
            </button>
            <button
              onClick={() => scrollToSection('menu-highlights')}
              className="hover:text-[#d4a754] transition-colors cursor-pointer"
            >
              Menu Highlights
            </button>
            <button
              onClick={() => scrollToSection('location-hours')}
              className="hover:text-[#d4a754] transition-colors cursor-pointer"
            >
              Hours &amp; Location
            </button>
            <button
              onClick={onNavigateToAdmin}
              className="text-[#9ca3af] hover:text-[#d4a754] transition-colors cursor-pointer flex items-center gap-1.5 text-xs"
            >
              <span>Management</span>
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToBooking}
              className="relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded text-sm font-semibold tracking-wider text-[#0c0d0e] bg-gradient-to-r from-[#d4a754] via-[#e2bd6e] to-[#c59b43] hover:from-[#e2bd6e] hover:to-[#d4a754] shadow-[0_0_20px_rgba(197,155,67,0.25)] hover:shadow-[0_0_25px_rgba(197,155,67,0.4)] transition-all transform active:scale-[0.98] cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#0c0d0e]" />
              <span>Reserve a Table</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#9ca3af] hover:text-white rounded border border-[#262a35] bg-[#12141a]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0e1014] border-b border-[#252834] px-4 pt-4 pb-6 space-y-3 mt-3">
            <button
              onClick={() => scrollToSection('atmosphere')}
              className="block w-full text-left py-2 text-[#cbd5e1] hover:text-[#d4a754] font-medium"
            >
              Atmosphere &amp; Craft
            </button>
            <button
              onClick={() => scrollToSection('menu-highlights')}
              className="block w-full text-left py-2 text-[#cbd5e1] hover:text-[#d4a754] font-medium"
            >
              Menu Highlights
            </button>
            <button
              onClick={() => scrollToSection('location-hours')}
              className="block w-full text-left py-2 text-[#cbd5e1] hover:text-[#d4a754] font-medium"
            >
              Hours &amp; Location
            </button>
            <div className="pt-3 border-t border-[#222530] flex items-center justify-between">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateToAdmin();
                }}
                className="text-xs text-[#9ca3af] hover:text-[#d4a754] flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#c59b43]" />
                <span>Manager Dashboard</span>
              </button>
              <span className="text-[11px] text-[#6b7280]">{settings.restaurant_phone}</span>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
