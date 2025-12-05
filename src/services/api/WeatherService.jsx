import ApiKey from "../config/apiKey";

class WeatherService {
  async GetWeather(city) {
    try {
      // Если город не передан, пытаемся получить из localStorage
      if (!city || city === "undefined" || city === "null") {
        const savedCity = localStorage.getItem("userLocation");
        if (savedCity) {
          try {
            city = JSON.parse(savedCity);
          } catch (e) {
            city = savedCity; // если это просто строка
          }
        } else {
          city = "Moscow"; // город по умолчанию
        }
      }

      console.log("Запрашиваем погоду для города:", city);
      
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${ApiKey}&lang=ru`
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Ответ API:", result);
      return result;
      
    } catch (error) {
      console.error("Error in WeatherService:", error);
      throw error;
    }
  }

  // Альтернативный метод с координатами
  async GetWeatherByCoords(lat, lon) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${ApiKey}&lang=ru`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching weather by coords:", error);
      throw error;
    }
  }
}

export const weatherService = new WeatherService();