import { useState } from 'react';
import { User, Mail, Lock, Save } from 'lucide-react';

const ProfileEditForm = ({ currentUser, onSuccess, onError }) => {
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [backendError, setBackendError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendError(null);

    if (passwordData.newPassword) {
      if (!passwordData.oldPassword) {
        onError('Текущий пароль обязателен');
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        onError('Новые пароли не совпадают');
        return;
      }
      if (passwordData.newPassword.length < 6) {
        onError('Пароль должен содержать не менее 6 символов');
        return;
      }
    }

    setLoading(true);

    try {
      const profileUpdate = { 
        name, 
        email,
        ...(passwordData.newPassword && {
          password: {
            oldPassword: passwordData.oldPassword,
            newPassword: passwordData.newPassword
          }
        })
      };

      const res = await fetch('/login/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(profileUpdate),
      });

      const text = await res.text();
      let data;
      
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || 'Неизвестная ошибка сервера');
      }

      if (!res.ok) {
        throw new Error(data.detail || 'Ошибка при обновлении профиля');
      }

      onSuccess(data);
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

    } catch (err) {
      setBackendError(err.message);
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {backendError && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          {backendError}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#1A2238] mb-2">
            <div className="flex items-center">
              <User className="h-4 w-4 text-[#9E1946] mr-2" />
              Полное имя
            </div>
          </label>
          <input
            name="name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#1A2238] focus:border-[#1A2238]"
            placeholder="Введите ваше имя"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A2238] mb-2">
            <div className="flex items-center">
              <Mail className="h-4 w-4 text-[#9E1946] mr-2" />
              Email
            </div>
          </label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#1A2238] focus:border-[#1A2238]"
            placeholder="Введите ваш email"
          />
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-[#1A2238] mb-4 font-['Playfair_Display'] flex items-center">
          <Lock className="h-5 w-5 text-[#9E1946] mr-2" />
          Изменить пароль
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A2238] mb-2">Текущий пароль</label>
            <input
              type="password"
              name="oldPassword"
              value={passwordData.oldPassword}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#1A2238] focus:border-[#1A2238]"
              placeholder="Введите текущий пароль"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A2238] mb-2">Новый пароль</label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-[#1A2238] focus:border-[#1A2238] ${
                passwordData.newPassword && passwordData.newPassword.length < 6
                  ? 'border-[#E54B4B]' 
                  : 'border-gray-300'
              }`}
              placeholder="Введите новый пароль"
            />
            {passwordData.newPassword && passwordData.newPassword.length < 6 && (
              <p className="mt-1 text-sm text-[#E54B4B]">Пароль должен содержать не менее 6 символов</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A2238] mb-2">Подтвердите новый пароль</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-[#1A2238] focus:border-[#1A2238] ${
                passwordData.newPassword !== passwordData.confirmPassword 
                  ? 'border-[#E54B4B]'
                  : 'border-gray-300'
              }`}
              placeholder="Подтвердите новый пароль"
            />
            {passwordData.newPassword !== passwordData.confirmPassword && (
              <p className="mt-1 text-sm text-[#E54B4B]">Пароли не совпадают</p>
            )}
          </div>
        </div>
      </div>

      <div className="pt-6">
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-[#1A2238] hover:bg-[#131a2d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1A2238]'
          }`}
        >
          {loading ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Сохранение изменений...
            </span>
          ) : (
            <span className="flex items-center">
              <Save className="h-4 w-4 mr-2" />
              Сохранить изменения
            </span>
          )}
        </button>
      </div>
    </form>
  );
};

export default ProfileEditForm;
