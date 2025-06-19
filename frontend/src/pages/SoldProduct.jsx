import React, { useEffect, useState } from "react";

const BASE_URL = 'https://ruslik.taruman.ru';

const SalesReport = () => {
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${BASE_URL}/sold/total`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Ошибка загрузки отчёта");
        return res.json();
      })
      .then((data) => {
        console.log("Sales report data:", data);
        setReport(data);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div className="text-red-600 text-center mt-4">{error}</div>;
  }

  if (!report) {
    return <div className="text-center mt-4">Загрузка...</div>;
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
            <th className="py-3 px-5 border-b border-gray-300 text-center">Общая сумма</th>
          </tr>
        </thead>
        <tbody>
          {report.items && report.items.length > 0 ? (
            report.items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="py-3 px-5 border-b border-gray-300">{item.name}</td>
                <td className="py-3 px-5 border-b border-gray-300 text-center">{item.sold_count}</td>
                <td className="py-3 px-5 border-b border-gray-300 text-center">
                  {item.total_revenue.toLocaleString("ru-RU", {
                    style: "currency",
                    currency: "RUB",
                  })}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center py-6 text-gray-500">
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
