import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const BASE_URL = 'https://ruslik.taruman.ru';

const SearchResults = () => {
  const query = useQuery();
  const search = query.get("q") || "";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const url = search
      ? `${BASE_URL}/products?q=${encodeURIComponent(search)}&skip=0&limit=20`
      : `${BASE_URL}/products?skip=0&limit=20`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Ошибка загрузки:", err))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-[#1A2238]">
        {search ? `Результаты поиска: "${search}"` : "Все инструменты"}
      </h2>

      {loading && (
        <p className="text-center text-gray-600 text-lg py-10">Загрузка...</p>
      )}
      {!loading && products.length === 0 && (
        <p className="text-center text-gray-500 text-lg py-10">Ничего не найдено</p>
      )}

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <li
            key={product.id}
            className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col"
          >
            <div className="relative overflow-hidden rounded-t-2xl h-56 bg-gray-50 flex items-center justify-center">
              <img
                src={
                  BASE_URL +
                  (product.image ||
                    (product.images && product.images[0]?.url) ||
                    "/placeholder.png")
                }
                alt={product.title}
                className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
              />
            </div>

            <div className="p-6 flex flex-col flex-grow">
              <h3 className="font-semibold text-xl text-[#1A2238] mb-2 line-clamp-2">
                {product.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
                {product.description || "Описание отсутствует"}
              </p>

              <p className="font-bold text-2xl text-[#9E1946] mb-3">
                {product.price.toLocaleString("ru-RU")} ₽
              </p>

              <div className="text-sm text-gray-500 space-y-1 mb-4">
                <p>Бренд: {product.brand?.name || "Не указан"}</p>
                <p>Тип музыки: {product.music_type?.name || "Не указан"}</p>
                <p>В наличии: {product.quantity}</p>
              </div>

              <Link
                to={`/products/${product.id}`}
                className="mt-auto inline-block text-center bg-[#1A2238] hover:bg-[#9E1946] text-white py-3 rounded-xl font-semibold transition-colors"
              >
                Подробнее
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchResults;
