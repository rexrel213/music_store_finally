import React, { useState } from 'react';
import { ShoppingCart, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BASE_URL = 'https://ruslik.taruman.ru';

const AddToCartButton = ({ product, quantity = 1 }) => {
  const { currentUser } = useAuth();
  const [cartMessage, setCartMessage] = useState('');
  const [adding, setAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAddToCart = async () => {
    if (!currentUser) {
      setCartMessage('Please sign in to add items to cart');
      setIsSuccess(false);
      setTimeout(() => setCartMessage(''), 3000);
      return;
    }

    setAdding(true);
    setCartMessage('');
    setIsSuccess(false);

    try {
      const response = await fetch(`${BASE_URL}/order/items`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: quantity,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Error adding to cart');
      }

      setIsSuccess(true);
      setCartMessage('Инструмент добавлен в коризну!');
      setTimeout(() => {
        setCartMessage('');
        setIsSuccess(false);
      }, 3000);

    } catch (error) {
      setIsSuccess(false);
      setCartMessage(`Error: ${error.message}`);
      setTimeout(() => setCartMessage(''), 3000);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleAddToCart}
        disabled={adding}
        className={`w-full flex items-center justify-center py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium ${
          adding
            ? 'bg-gray-400 cursor-not-allowed'
            : isSuccess
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-[#1A2238] hover:bg-[#1A2238]/90'
        } text-white`}
      >
        {adding ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            Добавление в корзину...
          </>
        ) : isSuccess ? (
          <>
            <Check className="h-5 w-5 mr-2" />
            Добавлено в корзину!
          </>
        ) : (
          <>
            <ShoppingCart className="h-5 w-5 mr-2" />
            Добавить в корзину
          </>
        )}
      </button>
      
      {cartMessage && (
        <div className={`mt-3 p-3 rounded-lg text-sm font-medium flex items-center ${
          cartMessage.includes('Error') || cartMessage.includes('sign in')
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {cartMessage.includes('Error') || cartMessage.includes('sign in') ? (
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          ) : (
            <Check className="h-4 w-4 mr-2 flex-shrink-0" />
          )}
          {cartMessage}
        </div>
      )}
    </div>
  );
};

export default AddToCartButton;