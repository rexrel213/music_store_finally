import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ProductAddPage = () => {
  const {currentUser} = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [brandId, setBrandId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [musicTypeId, setMusicTypeId] = useState('');
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [musicTypes, setMusicTypes] = useState([]);
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetch('https://ruslik.taruman.ru/admin/brands')
      .then(res => res.json())
      .then(data => setBrands(data))
      .catch(() => alert('Ошибка загрузки брендов'));
  }, []);

  useEffect(() => {
    fetch('https://ruslik.taruman.ru/admin/categories')
      .then(res => res.json())
      .then(data => setCategories(data.data || []))
      .catch(() => alert('Ошибка загрузки категорий'));
  }, []);

  useEffect(() => {
    fetch('https://ruslik.taruman.ru/admin/music-types')
      .then(res => res.json())
      .then(data => setMusicTypes(data.data || []))
      .catch(() => alert('Ошибка загрузки музыкальных типов'));
  }, []);

  useEffect(() => {
    setMusicTypeId('');
  }, [categoryId]);

  const handleImagesChange = (e) => {
    const filesArray = Array.from(e.target.files);
    console.log('Выбрано файлов:', filesArray.length, filesArray.map(f => f.name));
    setImages(filesArray);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !price || !brandId || !categoryId || !musicTypeId) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('brand_id', brandId);
      formData.append('category_id', categoryId);
      formData.append('music_type_id', musicTypeId);

      if (images.length > 0) {
        formData.append('image', images[0]);
      }

      const productRes = await fetch('https://ruslik.taruman.ru/admin/products', {
        method: 'POST',
        body: formData,
      });

      if (!productRes.ok) {
        const errorData = await productRes.json();
        throw new Error(errorData.detail || 'Ошибка создания продукта');
      }

      const product = await productRes.json();

      if (images.length > 1) {
        const imagesFormData = new FormData();
        for (let i = 1; i < images.length; i++) {
          imagesFormData.append('files', images[i]);
        }

        const uploadRes = await fetch(`https://ruslik.taruman.ru/admin/products/${product.id}/images`, {
          method: 'POST',
          body: imagesFormData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.detail || 'Ошибка загрузки изображений');
        }
      }

      alert('Продукт успешно добавлен!');

      setTitle('');
      setDescription('');
      setPrice('');
      setBrandId('');
      setCategoryId('');
      setMusicTypeId('');
      setImages([]);

    } catch (err) {
      alert(err.message);
    }
  };

  if (!currentUser || currentUser.role_id !== 1) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md border border-gray-200 text-center">
        <h2 className="text-xl font-semibold mb-4">Доступ запрещён</h2>
        <p>У вас нет прав для добавления нового товара.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Добавить новый товар</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-1 font-medium text-gray-700">Бренд</label>
          <select
            value={brandId}
            onChange={e => setBrandId(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="">-- Выберите бренд --</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Категория</label>
          <select
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="">-- Выберите категорию --</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Тип музыкального инструмента</label>
          <select
            value={musicTypeId}
            onChange={e => setMusicTypeId(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:bg-gray-100"
            disabled={!categoryId}
          >
            <option value="">-- Выберите тип инструмента --</option>
            {categoryId && musicTypes
              .filter(mt => mt.category_id === Number(categoryId))
              .map(mt => (
                <option key={mt.id} value={mt.id}>{mt.name}</option>
              ))
            }
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Название</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Описание</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Цена</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={e => setPrice(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Изображения</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImagesChange}
            className="w-full text-gray-700"
          />
        </div>

        {images.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-4">
            {images.map((file, idx) => (
              <img
                key={idx}
                src={URL.createObjectURL(file)}
                alt={`preview-${idx}`}
                className="w-24 h-24 object-cover rounded-md shadow-sm border border-gray-200"
              />
            ))}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold transition-colors mt-6"
        >
          Добавить товар
        </button>
      </form>
    </div>
  );
};

export default ProductAddPage;
