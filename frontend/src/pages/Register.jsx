import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Music, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-lg w-full p-6 relative max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-[#1A2238]">Условия и Политика конфиденциальности</h2>
        <div className="space-y-4 text-gray-700">
          <h3 className="font-semibold text-lg">Условия использования</h3>
          <p>
            Используя наш сайт, вы соглашаетесь с настоящими условиями и политикой конфиденциальности.
            Для оформления заказов необходимо зарегистрироваться и предоставить достоверные персональные данные.
            Мы не несем ответственности за убытки, возникшие в результате некорректного использования сайта или предоставления недостоверных данных пользователем.
            Мы можем вносить изменения в настоящие условия и политику конфиденциальности. Актуальная версия всегда доступна на сайте.
          </p>
          <h3 className="font-semibold text-lg">Политика конфиденциальности</h3>
          <p>
            Мы собираем и обрабатываем ваши персональные данные для обеспечения работы сайта, выполнения заказов и улучшения качества обслуживания.
            Ваши данные не передаются третьим лицам, за исключением случаев, предусмотренных законом или необходимых для выполнения заказа.
            Вы имеете право на доступ, исправление и удаление своих персональных данных.
            По вопросам обработки персональных данных вы можете связаться с нами по адресу электронной почты supportHarmony@gmail.com.
          </p>
        </div>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Закрыть"
        >
          &#10005;
        </button>
      </div>
    </div>
  );
};

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Введите имя';
    if (!formData.email) newErrors.email = 'Введите email';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Некорректный email';
    if (!formData.password) newErrors.password = 'Введите пароль';
    else if (formData.password.length < 6) newErrors.password = 'Пароль должен быть не менее 6 символов';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Подтвердите пароль';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Пароли не совпадают';
    if (!agreed) newErrors.terms = 'Необходимо согласиться с условиями';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      await register(formData.email, formData.password, formData.name);
      navigate('/');
    } catch (error) {
      setErrors({ form: error.message || 'Не удалось создать аккаунт' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center">
            <Music className="h-10 w-10 text-[#1A2238]" />
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-[#1A2238] font-['Playfair_Display']">Создайте аккаунт</h2>
          <p className="mt-2 text-gray-600">Присоединяйтесь к нам, чтобы исследовать нашу коллекцию инструментов</p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {errors.form && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-sm text-red-700">{errors.form}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Полное имя</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#1A2238] focus:border-[#1A2238] ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Иван Иванов"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email адрес</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#1A2238] focus:border-[#1A2238] ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Пароль</label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#1A2238] focus:border-[#1A2238] ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500"
                  tabIndex={-1}
                >
                  {showPassword ? 'Скрыть' : 'Показать'}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Подтвердите пароль</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#1A2238] focus:border-[#1A2238] ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="h-4 w-4 text-[#1A2238] focus:ring-[#1A2238] border-gray-300 rounded mt-1"
              />
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-700">
                  Я согласен с{' '}
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="text-[#9E1946] hover:text-[#7e1438] underline underline-offset-2"
                  >
                    Условиями
                  </button>{' '}
                  и{' '}
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="text-[#9E1946] hover:text-[#7e1438] underline underline-offset-2"
                  >
                    Политикой конфиденциальности
                  </button>
                </label>
                {errors.terms && <p className="mt-1 text-sm text-red-600">{errors.terms}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1A2238] hover:bg-[#131a2d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1A2238] disabled:opacity-70"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <UserPlus className="mr-2 h-5 w-5" />
              )}
              {loading ? 'Создание аккаунта...' : 'Создать аккаунт'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="font-medium text-[#9E1946] hover:text-[#7e1438]">
              Войти
            </Link>
          </p>
        </div>
      </div>

      <TermsModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default Register;
