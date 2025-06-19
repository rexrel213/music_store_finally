import React from "react";
import { useAuth } from "./AuthContext"; 

const UmamiDashboardLink = () => {
  const { currentUser } = useAuth();

  if (!currentUser || currentUser.role_id !== 1) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md border border-gray-200 text-center">
        <h2 className="text-xl font-semibold mb-4">Доступ запрещён</h2>
        <p>У вас нет прав для просмотра статистики.</p>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full overflow-hidden m-0 p-0">
      <iframe
        src="https://cloud.umami.is/share/uFNgsnjCNwDnGJDg/studious-tribble-x54px9gpxjrp2v96v-3000.app.github.dev"
        title="Umami Public Dashboard"
        className="border-0 w-full h-full"
        allowFullScreen
      />
    </div>
  );
};

export default UmamiDashboardLink;