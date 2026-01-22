
export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  imageId: number; // Kept for backward compatibility with existing data
  images?: string[]; // New field for real images
  description?: string;
  is_featured?: boolean;
}

export const PRODUCTS: Product[] = [
  { id: 1, name: 'Banda de Plata Minimalista', category: 'Anillo', price: 45000, imageId: 101, description: 'Una banda de plata pulida y elegante diseñada para el día a día.', is_featured: true },
  { id: 2, name: 'Collar Perla Eclipse', category: 'Collar', price: 75000, imageId: 102, description: 'Una impresionante perla suspendida en un engaste de plata oxidada oscura.' },
  { id: 3, name: 'Aretes Geométricos Oro', category: 'Aretes', price: 28000, imageId: 103, description: 'Formas geométricas modernas elaboradas en oro de 14k para una declaración sutil.' },
  { id: 4, name: 'Anillo Sello Obsidiana', category: 'Anillo', price: 62000, imageId: 104, description: 'Un audaz anillo de sello con una piedra de obsidiana suave y oscura.' },
  { id: 5, name: 'Set Nupcial Medianoche', category: 'Conjunto', price: 230000, imageId: 105, description: 'La colección completa de medianoche, perfecta para la novia moderna.', is_featured: true },
  { id: 6, name: 'Aretes Gota Nova', category: 'Aretes', price: 48000, imageId: 106, description: 'Aretes delicados que atrapan la luz con cada movimiento.' },
  { id: 7, name: 'Cadena Horizonte', category: 'Collar', price: 56000, imageId: 107, description: 'Una cadena de eslabones única inspirada en el horizonte que se asienta perfectamente.' },
  { id: 8, name: 'Banda Clásica de Oro', category: 'Anillo', price: 108000, imageId: 108, description: 'Lujo atemporal. Una banda de oro macizo que nunca pasa de moda.' },
  { id: 9, name: 'Colgante Luz Estelar', category: 'Collar', price: 69000, imageId: 109, description: 'Un pequeño diamante engastado en un patrón de estallido estelar en una cadena delicada.' },
  { id: 10, name: 'Aretes Ónix', category: 'Aretes', price: 34000, imageId: 110, description: 'Piedras de ónix negro profundo engastadas en biseles de plata esterlina.' },
  { id: 11, name: 'Conjunto Duo Tono', category: 'Conjunto', price: 145000, imageId: 111, description: 'Un conjunto de metales mixtos que combina la calidez del oro con la frescura de la plata.' },
  { id: 12, name: 'Anillo Ola', category: 'Anillo', price: 38000, imageId: 112, description: 'Inspirado en el océano, este anillo presenta una forma de ola fluida y orgánica.' },
];
