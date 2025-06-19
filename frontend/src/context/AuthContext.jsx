import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('https://ruslik.taruman.ru/login/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch user');
          return res.json();
        })
        .then(data => {
          setCurrentUser(data);
          localStorage.setItem('user', JSON.stringify(data));
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setCurrentUser(null);
          setLoading(false);
          navigate('/login')
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Регистрация
  const register = async (email, password, name) => {
    const response = await fetch('https://ruslik.taruman.ru/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Registration failed');
    }

    const data = await response.json();

    // Сохраняем токен и пользователя

    localStorage.setItem('token', data.access_token);

    // Получаем профиль пользователя сразу после регистрации
    const profileRes = await fetch('https://ruslik.taruman.ru/login/profile', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });
    const profileData = await profileRes.json();

    setCurrentUser(profileData);
    localStorage.setItem('user', JSON.stringify(profileData));
    return profileData;
  };

  // Логин
  const login = async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch('https://ruslik.taruman.ru/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('token', data.access_token);

    // Получаем профиль пользователя сразу после логина
    const profileRes = await fetch('https://ruslik.taruman.ru/login/profile', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });
    const profileData = await profileRes.json();

    setCurrentUser(profileData);
    localStorage.setItem('user', JSON.stringify(profileData));
    return profileData;
  };


  // Обновление профиля (например, имя, email, аватар)
  const updateUser = async (userData) => {
    try {
      const response = await fetch('https://ruslik.taruman.ru/login/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-Request-ID': crypto.randomUUID(),
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Profile update failed');
      }

      const updatedUser = await response.json();
      setCurrentUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (err) {
      throw err;
    }
  };

  const uploadAvatar = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const response = await fetch("https://ruslik.taruman.ru/login/profile/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Avatar upload failed");
      }
  
      // После загрузки обновляем профиль
      const profileRes = await fetch("https://ruslik.taruman.ru/login/profile", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const profileData = await profileRes.json();
      setCurrentUser(profileData);
      localStorage.setItem("user", JSON.stringify(profileData));
      return profileData.avatar;
    } catch (err) {
      throw err;
    }
  };
  

  // Выход из аккаунта
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    navigate('/');
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const deleteProfile = async () => {
    if (!window.confirm("Are you sure you want to delete your profile?")) return;
    setIsDeleting(true);
    try {
      const response = await fetch('https://ruslik.taruman.ru/login/profile', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete profile');
      }
      logout();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    register,
    updateUser,
    uploadAvatar,
    deleteProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
