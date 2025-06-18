import { Link } from 'react-router-dom';
import { Music, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto text-center">
        <Music className="h-16 w-16 text-[#1A2238] mx-auto" />
        <h2 className="mt-6 text-4xl font-bold text-[#1A2238] font-['Playfair_Display']">404</h2>
        <p className="mt-2 text-lg text-gray-600">Страница не найдена :/</p>
        <p className="mt-4 text-gray-500">
          Страница, которую вы ищете, не существует или была перемещена.
        </p>
        <div className="mt-8">
          <Link 
            to="/" 
            className="btn btn-primary inline-flex items-center"
          >
            <Home className="mr-2 h-4 w-4" />
            Вернуться на главную страницу
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;