"use client";

export const getUserLocation = async () => {
  let hasGrantedPermission = false;
  if (navigator.permissions && navigator.permissions.query) {
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      hasGrantedPermission = result.state === 'granted';
    } catch (e) {
        //ignore
    }
  }

  const cachedLocationStr = sessionStorage.getItem("userLocation");
  if (cachedLocationStr) {
    const cachedLocation = JSON.parse(cachedLocationStr);
    
    if (hasGrantedPermission && cachedLocation.source !== "gps") {
      sessionStorage.removeItem("userLocation");
    } else {
      return cachedLocation;
    }
  }

  const processAndCache = (city, state, source) => {
    const locationData = { city, state: state.toLowerCase(), source };
    sessionStorage.setItem("userLocation", JSON.stringify(locationData));
    return locationData;
  };

  const fallbackToIp = async () => {
    try {
      const response = await fetch("https://get.geojs.io/v1/ip/geo.json");
      const data = await response.json();
      return processAndCache(
        data.city || "Unknown City",
        data.region || "unknown",
      );
    } catch (error) {
      return processAndCache("Unknown City", "unknown");
    }
  };

  if ("geolocation" in navigator) {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
            );
            const data = await res.json();

            const city = data.city || data.locality || "Unknown City";
            const state = data.principalSubdivision || "unknown";

            resolve(processAndCache(city, state, "gps"));
          } catch (err) {
            resolve(fallbackToIp());
          }
        },
        (error) => {
          resolve(fallbackToIp());
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: Infinity },
      );
    });
  } else {
    return fallbackToIp();
  }
};
