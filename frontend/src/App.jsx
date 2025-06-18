import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import NotFound from './pages/NotFound.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import { useAuth } from './context/AuthContext.jsx';
import Profile from './pages/Profile.jsx';
import { Admin, Resource } from 'react-admin';
import ProductsList from './products/ProductsList.jsx';
import ProductShow from './products/ProductShow.jsx';
import CommentForm from './products/comm/CommentForm.jsx';
import Order from './order/Order.jsx';
import ProductCreate from './context/ProductCreate.jsx';
import OrderHistory from './order/OrderHistory.jsx';
import SearchResults from './context/SearchResult.jsx';
import TopProduct from './pages/TopProduct.jsx';
import CommentItem from './products/comm/CommentItem.jsx';
import CommentRating from './products/comm/CommentRatingForm.jsx';
import BrandPage from './pages/BrandPage.jsx';
import BrandsPage from './pages/BrandsPage.jsx';
import SuppliesCreate from './context/SuppliesCreate.jsx';  
import CategoryPage from './pages/CategoryPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import UmamiDashboard from './context/Static.jsx'

// Конфигурация Umami
const UMAMI_SCRIPT_URL = 'https://cloud.umami.is/script.js';
const UMAMI_WEBSITE_ID = '782ec8a2-570f-4128-9e14-85aaadec4626'; // Замените на свой ID

// Хук для отслеживания страниц
function useUmamiTracker() {
  const location = useLocation();

  useEffect(() => {
    const trackPageView = () => {
      if (window.umami && typeof window.umami.trackView === 'function') {
        window.umami.trackView(location.pathname);
      }
    };

    if (window.umami) {
      trackPageView();
    } else {
      const interval = setInterval(() => {
        if (window.umami) {
          trackPageView();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [location]);
}

// Основной компонент приложения
function App() {
  const { loading } = useAuth();

  // Добавление скрипта Umami
  useEffect(() => {
    if (!document.querySelector(`script[src="${UMAMI_SCRIPT_URL}"]`)) {
      const script = document.createElement('script');
      script.src = UMAMI_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.setAttribute('data-website-id', UMAMI_WEBSITE_ID);
      document.head.appendChild(script);
    }
  }, []);

  useUmamiTracker(); // Активируем отслеживание страниц

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/products" element={<ProductsList />} />
          <Route path="/products/:productId" element={<ProductShow />} />
          <Route path="/brands/:brandId" element={<BrandPage />} />
          <Route path="/brands" element={<BrandsPage />} />
          <Route path="/supplies/create" element={<SuppliesCreate />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/static" element={<UmamiDashboard />} />
          <Route path="/products/:productId/commenttools/:commentId" element={<CommentItem />} />
          <Route path="/products/:productId/commenttools/:commentId/rating" element={<CommentRating />} />
          <Route path="/order" element={<Order />} />
          <Route path="/order/history" element={<OrderHistory />} />
          <Route path="/products/create" element={<ProductCreate />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/top" element={<TopProduct />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;