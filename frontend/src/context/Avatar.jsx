import { useState, useEffect } from "react";
import { User } from 'lucide-react';

const Avatar = ({ userId, size = 'md', className = '' }) => {
  const [avatarSrc, setAvatarSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const colors = ['#1A2238', '#9E1946', '#F7B801', '#0E8A71', '#3A506B', '#5BC0BE'];
  const colorIndex = Math.abs(userId) % colors.length;
  const bgColor = colors[colorIndex];

  // Размеры аватара
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-xl'
  };

  // Получение инициалов (заглушка - можно передавать имя пропсом)
  const getInitials = (id) => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return `${letters[id % 26]}${letters[(id + 1) % 26]}`;
  };

  const fetchAvatar = async (userId) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://ruslik.taruman.ru/login/profile/avatar/${userId}?t=${Date.now()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store'
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          // Используем дефолтный аватар с сервера
          setAvatarSrc(`/backend/static/avatars/default.jpg`);
          return;
        }
        throw new Error(`Avatar load failed: ${response.status}`);
      }

      const blob = await response.blob();
      if (blob.size === 0) throw new Error('Empty avatar image');

      const reader = new FileReader();
      reader.onload = () => {
        setAvatarSrc(reader.result);
        setIsLoading(false);
      };
      reader.onerror = () => {
        throw new Error('Avatar image read error');
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Avatar loading error:', err);
      setAvatarSrc(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchAvatar(userId);
    }
  }, [userId]);

  return (
    <div 
      className={`
        relative rounded-full flex items-center justify-center 
        overflow-hidden shadow-md transition-all duration-300
        ${sizeClasses[size]} ${className}
      `}
      style={{ backgroundColor: bgColor }}
      aria-label="User avatar"
    >
      {/* Анимация загрузки */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse rounded-full bg-white bg-opacity-20 w-1/2 h-1/2"></div>
        </div>
      )}

      {/* Загруженное изображение */}
      {avatarSrc && !isLoading ? (
        <img 
          src={avatarSrc} 
          alt="User avatar"
          className="w-full h-full object-cover"
          onError={() => setAvatarSrc(null)}
        />
      ) : (
        /* Заглушка с инициалами */
        !isLoading && (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <User className="w-1/2 h-1/2 text-white opacity-80" />
            <span className="text-white font-medium opacity-90">
              {getInitials(userId)}
            </span>
          </div>
        )
      )}

      {/* Индикатор онлайн-статуса (опционально) */}
      {false && ( // Можно включить, если нужно отображать статус
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
      )}
    </div>
  );
};

export default Avatar;