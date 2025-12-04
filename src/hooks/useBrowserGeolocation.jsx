// useBrowserGeolocation.js
import { useState, useEffect } from 'react';

const useBrowserGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState('prompt');

  // Проверяем поддержку геолокации
  const isSupported = 'geolocation' in navigator;

  // Получаем координаты
  const getCoordinates = () => {
    return new Promise((resolve, reject) => {
      if (!isSupported) {
        reject(new Error('Geolocation не поддерживается'));
        return;
      }

      setLoading(true);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (err) => {
          reject(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  // Преобразуем координаты в адрес (обратное геокодирование)
  const reverseGeocode = async (lat, lon) => {
    try {
      // Используем Nominatim (OpenStreetMap) - бесплатно
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      
      return {
        city: data.address.city || data.address.town || data.address.village,
        region: data.address.state || data.address.region,
        country: data.address.country,
        countryCode: data.address.country_code,
        postalCode: data.address.postcode,
        displayName: data.display_name,
        address: data.address
      };
    } catch (error) {
      throw new Error('Ошибка обратного геокодирования');
    }
  };

  // Основная функция получения местоположения
  const getLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Получаем координаты
      const coords = await getCoordinates();
      
      // Преобразуем в адрес
      const address = await reverseGeocode(coords.lat, coords.lon);
      
      setLocation({
        ...coords,
        ...address
      });
      
      return { ...coords, ...address };
      
    } catch (err) {
      let errorMessage = 'Не удалось определить местоположение';
      
      switch(err.code) {
        case 1:
          errorMessage = 'Доступ к геолокации запрещен пользователем';
          setPermission('denied');
          break;
        case 2:
          errorMessage = 'Невозможно определить местоположение';
          break;
        case 3:
          errorMessage = 'Время ожидания истекло';
          break;
      }
      
      setError(errorMessage);
      throw err;
      
    } finally {
      setLoading(false);
    }
  };

  // Проверяем статус разрешения
  useEffect(() => {
    if (!isSupported) return;

    navigator.permissions?.query({ name: 'geolocation' })
      .then((permissionStatus) => {
        setPermission(permissionStatus.state);
        
        permissionStatus.onchange = () => {
          setPermission(permissionStatus.state);
        };
      })
      .catch(() => {
        // Браузер не поддерживает permissions API
      });
  }, [isSupported]);

  return {
    isSupported,
    location,
    loading,
    error,
    permission,
    getLocation,
    requestPermission: getLocation // Для удобства
  };
};

export default useBrowserGeolocation;