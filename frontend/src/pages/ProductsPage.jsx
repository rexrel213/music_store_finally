import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/products.css'; // Подключаем CSS

function Products() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('https://ruslik.taruman.ru/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Ошибка загрузки:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="products-container">
      <h2>Товары</h2>
      
      {isLoading ? (
        <div className="spinner"></div>
      ) : products.length === 0 ? (
        <p className="no-products">Товары не найдены</p>
      ) : (
        <ul className="products-list fade-in">
          {products.map((product) => (
            <li key={product.id} className="product-card">
              <h3>{product.title}</h3>
              <p>{product.description}</p>
              <p>Цена: {product.price} ₽</p>
              <p>В наличии: {product.quantity} шт.</p>
              <p>Тип музыки: {product.music_type?.name || 'Не указан'}</p>
              <p>Бренд: {product.brand?.name || 'Не указан'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Products;
