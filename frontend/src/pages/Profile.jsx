import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, Edit, Key, LogOut, Trash2, Camera, Heart, Settings, Shield } from 'lucide-react';
import ProfileEditForm from './ProfileEditForm';
import Avatar from '../context/Avatar';
import Wishlist from '../favorite/Wishlist';

const BASE_URL = 'https://ruslik.taruman.ru';

const Profile = () => {
  const { currentUser, loading, logout, updateUser, uploadAvatar, deleteProfile } = useAuth();
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: '',
  });
  const [avatarPreview, setAvatarPreview] = useState('');

  const fetchProfile = async () => {
    try {
      const response = await fetch('https://ruslik.taruman.ru/login/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Error loading profile');
      }
      const data = await response.json();
      setFormData({
        name: data.name || '',
        email: data.email || '',
        avatar: data.avatar || '',
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await fetch(`${BASE_URL}/favorites`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Error loading wishlist');
      }
      const data = await response.json();
      setFavorites(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, []);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        avatar: currentUser.avatar || '',
      });
      setAvatarPreview('');
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, avatar: file }));
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSuccess = (updatedUser) => {
    setIsEditing(false);
    setError(null);
    setFormData({
      name: updatedUser.name || '',
      email: updatedUser.email || '',
      avatar: updatedUser.avatar || '',
    });
    setAvatarPreview('');
  };

  const handleError = (msg) => {
    setError(msg);
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Доступ запрещен
            </h2>
            <p className="text-gray-600 mb-6">Пожалуйста, войдите, чтобы увидеть ваш профиль</p>
            <a 
              href="/login" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors inline-block"
            >
              Войти
            </a>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Профиль', icon: User },
    { id: 'wishlist', label: 'Избранное', icon: Heart },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                <Avatar userId={currentUser.id} />
              </div>
              <input
                type="file"
                id="avatar"
                accept="image/*"
                onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    try {
                      const newAvatarUrl = await uploadAvatar(file);
                      setFormData(prev => ({ ...prev, avatar: newAvatarUrl }));
                      setAvatarPreview(URL.createObjectURL(file));
                    } catch (err) {
                      setError(err.message);
                    }
                  }
                }}
                className="hidden"
              />
              <label 
                htmlFor="avatar" 
                className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer transition-colors shadow-lg"
              >
                <Camera className="w-4 h-4" />
              </label>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {currentUser.name || 'User Profile'}
              </h1>
              <p className="text-gray-600 mt-1">
                {currentUser.email}
              </p>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                Участник с {new Date(currentUser.created_at || Date.now()).toLocaleDateString()}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={logout}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Выйти
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 rounded-md text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>

              {/* Account Stats */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Общая информация</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Тип аккаунта</span>
                    <span className="text-sm font-medium text-gray-900 flex items-center">
                      <Shield className="w-4 h-4 mr-1 text-blue-600" />
                      {currentUser?.role_id === 1
                        ? 'Admin'
                        : currentUser?.role_id === 4
                          ? 'Поставщик'
                          : 'User'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Избранные товары</span>
                    <span className="text-sm font-medium text-gray-900">{favorites.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Ваша информация профиля</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Полное имя</label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-md">
                        <User className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{currentUser.name || 'Not provided'}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-md">
                        <Mail className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{currentUser.email}</span>
                      </div>
                    </div>
                  </div>
      
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Дата регистрации</label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-md">
                        <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">
                        {new Date(currentUser.created_at || Date.now()).toLocaleDateString()}
                        </span>
                    </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ваша роль</label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-md">
                      <Key className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-900">{currentUser.role_name || 'User'}</span>
                    </div>
                  </div>
                </div>
              </div>
          )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <Heart className="w-6 h-6 text-red-500 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Избранное</h2>
                </div>
                <Wishlist />
                
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <Settings className="w-6 h-6 text-gray-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Настройки</h2>
                </div>

                {isEditing ? (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Редактировать профиль</h2>
                    <ProfileEditForm
                      currentUser={{ ...formData }}
                      onSuccess={handleSuccess}
                      onError={handleError}
                    />
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                    >
                      Отменить
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Приватность и безопасность</h3>
                      <div className="space-y-4">
                        <button
                          onClick={() => setIsEditing(true)}
                          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Редактировать информацию профиля
                        </button>
                      </div>
                    </div>
                    
                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Действия с аккаунтом</h3>
                      <div className="space-y-3">
                          <button
                            onClick={logout}
                            className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                          Выйти
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-red-600 mb-4">Удалить аккаунт</h3>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-700 mb-4">
                        После удаления аккаунта восстановить его будет невозможно. Пожалуйста, убедитесь в своём решении.
                        </p>
                        <button
                          onClick={deleteProfile}
                          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Удалить аккаунт
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
