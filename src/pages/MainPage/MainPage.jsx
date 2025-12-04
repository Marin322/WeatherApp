import styles from "./MainPage.module.css";
import ApiKey from "../../services/config/apiKey";
import { useEffect, useState } from "react";
import useBrowserGeolocation from "../../hooks/useBrowserGeolocation";

const MainPage = () => {
  // const GetWeather = async () => {
  //     const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Moscow&appid=${ApiKey}`);
  //     const result = response.json();
  //     console.log(result);
  // };

  // useEffect(() => {
  //     GetWeather();
  // }, []);

  const { location, loading, error, permission, getLocation } =
    useBrowserGeolocation();

  const [rainIntensity, setRainIntensity] = useState("medium");
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

  const okak = localStorage.getItem("userLocation");

  return (
    <div className={styles["mainpage-container"]}>
      <div className={styles["mainpage-header"]}></div>
      <div className={styles["mainpage-main"]}>
        <div className={styles["weather-info-container"]}>
          <div className={styles["todayweather-container"]}>
            <div className={styles["todayweather-header"]}>
              <div className={styles["todayweather-header-icon"]}>
                <img src="" alt="" />
              </div>
              <div className={styles["todayweather-header-temperature"]}>
                <p>+10℃</p>
              </div>
            </div>
            <div className={styles["todayweather-precipitation"]}>
              <p>Дождь</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
