import styles from "./MainPage.module.css";
import ApiKey from "../../services/config/apiKey";
import { useEffect, useState } from "react";
import useBrowserGeolocation from "../../hooks/useBrowserGeolocation";
import { weatherService } from "../../services/api/WeatherService";
import CharacteristicWindow from "../../components/ui/СharacteristicWindow/CharacteristicWindow";

const MainPage = () => {
  const { location, loading, error, permission, getLocation } =
    useBrowserGeolocation();

  const [rainIntensity, setRainIntensity] = useState("medium");
  const [dataWeather, setDataWeather] = useState(null);
  const [processedWeatherData, setProcessedWeatherData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [autoDetect, setAutoDetect] = useState(true);

  useEffect(() => {
    const detectOnLoad = async () => {
      const savedLocation = localStorage.getItem("userLocation");
      const savedTimestamp = localStorage.getItem("locationTimestamp");

      const isExpired =
        savedTimestamp &&
        Date.now() - parseInt(savedTimestamp) > 30 * 60 * 1000;

      if (savedLocation && !isExpired && autoDetect) {
        setWeatherData(JSON.parse(savedLocation));
      } else if (autoDetect) {
        try {
          const loc = await getLocation();
          if (loc) {
            localStorage.setItem("userLocation", JSON.stringify(loc.city));
            localStorage.setItem("locationTimestamp", Date.now().toString());
          }
        } catch (err) {
          console.error("Автоопределение не удалось:", err.message);
        }
      }
    };

    detectOnLoad();
  }, [autoDetect, getLocation]);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    const data = await weatherService.GetWeather();
    console.log(data);
    setDataWeather(data);
    ValidationData(data);
  };

  const ValidationData = (rawData) => {
    if (!rawData) return null;

    const processed = {
      city: rawData.name,
      country: rawData.sys?.country || "",
      temperature: Math.round(rawData.main.temp - 273.15),
      feelsLike: Math.round(rawData.main.feels_like - 273.15),
      tempMin: Math.round(rawData.main.temp_min - 273.15),
      tempMax: Math.round(rawData.main.temp_max - 273.15),
      weather: rawData.weather[0]?.main || "",
      description: rawData.weather[0]?.description || "",
      humidity: rawData.main.humidity,
      pressure: rawData.main.pressure,
      windSpeed: Math.round(rawData.wind?.speed * 3.6) || 0,
      windDirection: getWindDirection(rawData.wind?.deg),
      clouds: rawData.clouds?.all || 0,
      visibility: rawData.visibility
        ? (rawData.visibility / 1000).toFixed(1)
        : "0",
      sunrise: rawData.sys?.sunrise
        ? new Date(rawData.sys.sunrise * 1000).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
      sunset: rawData.sys?.sunset
        ? new Date(rawData.sys.sunset * 1000).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
      lastUpdated: rawData.dt
        ? new Date(rawData.dt * 1000).toLocaleTimeString()
        : "",
    };

    setProcessedWeatherData(processed);
    return processed;
  };

  const getWindDirection = (degrees) => {
    const directions = ["С", "СВ", "В", "ЮВ", "Ю", "ЮЗ", "З", "СЗ"];
    const index = Math.round((degrees % 360) / 45);
    return directions[index % 8];
  };

  return (
    <div className={styles["mainpage-container"]}>
      <div className={styles["mainpage-header"]}></div>
      <div className={styles["mainpage-main"]}>
        <div className={styles["todayweather-container"]}>
          <div className={styles["todayweather-ui"]}>
            <div className={styles["todayweather-ui-location"]}>
              <p>
                {processedWeatherData?.country}, {processedWeatherData?.city}
              </p>
            </div>
            <div className={styles["todayweather-ui-maininfo"]}>
              <p>{processedWeatherData?.temperature}°</p>
              <div>
                <p1>{processedWeatherData?.weather}</p1>
                <p2>{processedWeatherData?.description}</p2>
              </div>
              <div className={styles["todayweather-ui-secondinfo"]}>
                <CharacteristicWindow characteristic="FEELS LIKE" meaning={processedWeatherData?.feelsLike}/>
                <CharacteristicWindow />
                <CharacteristicWindow />
                <CharacteristicWindow />
              </div>
            </div>
          </div>
          <div className={styles["weekendweather-ui"]}></div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;

{
  /* <div className={styles["weather-info-container"]}>
          <div className={styles["todayweather-container"]}>
            <div className={styles["todayweather-header"]}>
              <div className={styles["todayweather-header-icon"]}>
                <img src="" alt="" />
              </div>
              <div className={styles["todayweather-header-city"]}>
                <p>
                  {processedWeatherData?.city}
                </p>
              </div>
            </div>
            <div className={styles["todayweather-precipitation"]}>
              <p>{processedWeatherData?.weather}</p>
            </div>
            <div>
              <p>{processedWeatherData?.description}</p>
            </div>
          </div> */
}
