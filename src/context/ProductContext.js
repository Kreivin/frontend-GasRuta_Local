import React, { createContext, useState } from 'react';

export const ProductContext = createContext();

const PRODUCTOS_INICIALES = [
  {
    id: '1',
    pesoKg: 5,
    name: '5 kg - Pequeño',
    presentacion: 'Pequeño',
    price: 'C$200',
    precioNumerico: 200,
    description: 'Cilindro portátil de 5 kg ideal para espacios pequeños y emergencias',
  },
  {
    id: '2',
    pesoKg: 10,
    name: '10 kg - Mediano',
    presentacion: 'Mediano',
    price: 'C$480',
    precioNumerico: 480,
    description: 'Cilindro de 10 kg (25 lbs) para uso doméstico diario',
  },
  {
    id: '3',
    pesoKg: 15,
    name: '15 kg - Grande',
    presentacion: 'Grande',
    price: 'C$700',
    precioNumerico: 700,
    description: 'Cilindro de 15 kg para familias numerosas y alto consumo',
  },
  {
    id: '4',
    pesoKg: 45,
    name: '45 kg - Industrial',
    presentacion: 'Industrial',
    price: 'C$2,100',
    precioNumerico: 2100,
    description: 'Cilindro industrial de 45 kg para negocios y restaurantes',
  },
];

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(PRODUCTOS_INICIALES);

  const addProduct = (product) => {
    const precioClean = String(product.price).replace(/[^\d.]/g, '');
    const num = parseFloat(precioClean) || 200;
    const pesoKg = Number(product.pesoKg) || 10;

    setProducts((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        pesoKg,
        presentacion: product.presentacion || `${pesoKg} kg`,
        name: product.name,
        price: product.price.startsWith('C$') ? product.price : `C$${product.price}`,
        precioNumerico: num,
        description: product.description || '',
      },
    ]);
  };

  const updateProduct = (id, updatedData) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const precioClean = updatedData.price !== undefined
            ? String(updatedData.price).replace(/[^\d.]/g, '')
            : String(item.price).replace(/[^\d.]/g, '');
          const num = parseFloat(precioClean) || item.precioNumerico || 200;
          return {
            ...item,
            name: updatedData.name !== undefined ? updatedData.name : item.name,
            price: updatedData.price !== undefined
              ? (String(updatedData.price).startsWith('C$') ? updatedData.price : `C$${updatedData.price}`)
              : item.price,
            precioNumerico: num,
            description: updatedData.description !== undefined ? updatedData.description : item.description,
            pesoKg: updatedData.pesoKg !== undefined ? Number(updatedData.pesoKg) : item.pesoKg,
          };
        }
        return item;
      })
    );
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  );
}