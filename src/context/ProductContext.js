import React, { createContext, useState } from 'react';

export const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([
    { id: '1', name: '5 kg - Pequeño', price: 'C$200', description: 'Tanque pequeño' },
    { id: '2', name: '10 kg - Mediano', price: 'C$480', description: 'Tanque mediano' },
    { id: '3', name: '15 kg - Grande', price: 'C$700', description: 'Tanque grande' },
  ]);

  const addProduct = (product) => {
    setProducts((prev) => [
      ...prev, 
      { 
        id: Date.now().toString(), 
        name: product.name,
        price: product.price,
        description: product.description || ''
      }
    ]);
  };

  const updateProduct = (id, updatedData) => {
    setProducts((prev) =>
      prev.map((item) => 
        item.id === id 
          ? { 
              ...item, 
              name: updatedData.name !== undefined ? updatedData.name : item.name,
              price: updatedData.price !== undefined ? updatedData.price : item.price,
              description: updatedData.description !== undefined ? updatedData.description : item.description 
            } 
          : item
      )
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