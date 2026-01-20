export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  imageId: number; // Kept for backward compatibility with existing data
  images?: string[]; // New field for real images
  description?: string;
}

export const PRODUCTS: Product[] = [
  { id: 1, name: 'Minimalist Silver Band', category: 'Ring', price: 45000, imageId: 101, description: 'A sleek, polished silver band designed for everyday elegance.' },
  { id: 2, name: 'Eclipse Pearl Necklace', category: 'Necklace', price: 75000, imageId: 102, description: 'A stunning pearl suspended in a dark, oxidized silver setting.' },
  { id: 3, name: 'Geometric Gold Studs', category: 'Earrings', price: 28000, imageId: 103, description: 'Modern geometric shapes crafted in 14k gold for a subtle statement.' },
  { id: 4, name: 'Obsidian Signet Ring', category: 'Ring', price: 62000, imageId: 104, description: 'A bold signet ring featuring a smooth, dark obsidian stone.' },
  { id: 5, name: 'Midnight Bridal Set', category: 'Set', price: 230000, imageId: 105, description: 'The complete midnight collection, perfect for the modern bride.' },
  { id: 6, name: 'Nova Drop Earrings', category: 'Earrings', price: 48000, imageId: 106, description: 'Delicate drop earrings that catch the light with every movement.' },
  { id: 7, name: 'Horizon Chain', category: 'Necklace', price: 56000, imageId: 107, description: 'A unique horizon-inspired link chain that sits perfectly on the collarbone.' },
  { id: 8, name: 'Classic Gold Band', category: 'Ring', price: 108000, imageId: 108, description: 'Timeless luxury. A solid gold band that never goes out of style.' },
  { id: 9, name: 'Starlight Pendant', category: 'Necklace', price: 69000, imageId: 109, description: 'A small diamond set in a starburst pattern on a delicate chain.' },
  { id: 10, name: 'Onyx Studs', category: 'Earrings', price: 34000, imageId: 110, description: 'Deep black onyx stones set in sterling silver bezels.' },
  { id: 11, name: 'Duo Tone Set', category: 'Set', price: 145000, imageId: 111, description: 'A mixed metal set combining the warmth of gold with the cool of silver.' },
  { id: 12, name: 'Wave Ring', category: 'Ring', price: 38000, imageId: 112, description: 'Inspired by the ocean, this ring features a fluid, organic wave shape.' },
];