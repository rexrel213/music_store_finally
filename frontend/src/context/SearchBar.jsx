import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const BASE_URL = "https://ruslik.taruman.ru";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const controller = new AbortController();

    setLoading(true);
    fetch(`${BASE_URL}/products?q=${encodeURIComponent(query)}&skip=0&limit=5`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        setResults(data);
        setShowDropdown(true);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Ошибка загрузки:", err);
          setResults([]);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [query]);

  // Закрыть список при клике вне поля
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative w-full max-w-md" ref={wrapperRef}>
      <form onSubmit={onSubmit} className="relative">
        <input
          type="text"
          className="w-full border rounded px-3 py-2 pr-10"
          placeholder="Поиск товаров..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length) setShowDropdown(true);
          }}
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label="Очистить поиск"
          >
            ×
          </button>
        )}
      </form>

      {showDropdown && (
        <ul className="absolute z-10 w-full bg-white border rounded mt-1 max-h-60 overflow-auto shadow-lg">
          {loading && <li className="p-2 text-gray-500">Загрузка...</li>}
          {!loading && results.length === 0 && (
            <li className="p-2 text-gray-500">Ничего не найдено</li>
          )}
          {!loading &&
            results.map((product) => (
              <li
                key={product.id}
                className="hover:bg-gray-100 cursor-pointer flex items-center gap-2 px-4 py-2"
              >
                <img
                  src={
                    product.image
                      ? `${BASE_URL}${product.image.startsWith('/') ? '' : '/'}${product.image}`
                      : product.images && product.images.length > 0
                        ? `${BASE_URL}${product.images[0].url.startsWith('/') ? '' : '/'}${product.images[0].url}`
                        : "/placeholder.png"
                  }
                  alt={product.title}
                  className="w-10 h-10 object-contain"
                />
                <Link
                  to={`/products/${product.id}`}
                  className="flex-grow"
                  onClick={() => setShowDropdown(false)}
                >
                  {product.title}
                </Link>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
