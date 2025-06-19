import React, { useEffect, useState } from "react";

const BASE_URL = 'https://ruslik.taruman.ru';

const SalesReport = () => {
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Пользователь не авторизован");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`${BASE_URL}/total`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Ошибка загрузки отчёта");
        }
        return res.json();
      })
      .then((data) => {
        setReport(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) {
    return <div className="text-center mt-4">Загрузка...</div>;
  }

  if (error) {
    return (
      <div className="text-red-600 text-center mt-4">
        {error}
        <button
          onClick={fetchReport}
          className="ml-4 px-3 py-1 bg-blue-500 text-white rounded"
        >
          Повторить
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Отчёт по продажам товаров
      </h2>

      <div className="mb-4 text-lg text-gray-700 font-semibold">
        Всего продано единиц:{" "}
        <span className="text-green-600">{report.total_sold}</span>
      </div>

      <table className="w-full border border-gray-300 rounded-md overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-5 border-b border-gray-300 text-left">Название товара</th>
            <th className="py-3 px-5 border-b border-gray-300 text-center">Продано единиц</th>
          </tr>
        </thead>
        <tbody>
          {report.products && report.products.length > 0 ? (
            report.products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="py-3 px-5 border-b border-gray-300">{product.title}</td>
                <td className="py-3 px-5 border-b border-gray-300 text-center">{product.sold_count}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2" className="text-center py-6 text-gray-500">
                Нет данных для отображения
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SalesReport;
