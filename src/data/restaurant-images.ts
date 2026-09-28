/**
 * Curated high-resolution culinary & architectural photography for Aurelia Table & Cellar.
 * Stored in a centralized structure for clean maintainability and easy customization.
 */
export const RESTAURANT_IMAGES = {
  hero: {
    main: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2000&q=85',
    alt: 'Atmospheric candlelit dining room at Aurelia Table & Cellar with warm amber lighting',
    secondary: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=85',
  },
  atmosphere: {
    interior: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80',
    altInterior: 'Intimate dining room banquettes, polished oak tables and mood lighting',
    hearth: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80',
    altHearth: 'Executive chef finishing an artisanal wood-fired dish over embers',
    cellar: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
    altCellar: 'Private sommelier wine cellar vault featuring curated vintages',
    tableSetting: 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?auto=format&fit=crop&w=1200&q=80',
    altTableSetting: 'Fine crystal glassware and bespoke linen table setting',
    diningGuests: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1200&q=80',
    altDiningGuests: 'Guests enjoying laughter and wine during evening dinner service',
  },
  dishes: {
    scallops: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1000&q=80',
    tartare: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
    duck: 'https://images.unsplash.com/photo-1514944298352-78d167f53f93?auto=format&fit=crop&w=1000&q=80',
    ribeye: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1000&q=80',
    pasta: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?auto=format&fit=crop&w=1000&q=80',
    dessert: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=1000&q=80',
    cocktail: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1000&q=80',
    figTart: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1000&q=80',
  },
};

export const MENU_CATEGORY_IMAGES: Record<string, string> = {
  Starters: RESTAURANT_IMAGES.dishes.scallops,
  Mains: RESTAURANT_IMAGES.dishes.ribeye,
  Desserts: RESTAURANT_IMAGES.dishes.dessert,
  Beverages: RESTAURANT_IMAGES.dishes.cocktail,
};
