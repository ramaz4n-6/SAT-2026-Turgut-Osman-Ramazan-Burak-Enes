import httpx

async def get_current_weather(lat: float = 39.8181, lon: float = 34.8147):
    """
    Open-Meteo API'den Yozgat için ücretsiz canlı hava durumu çeker.
    API anahtarı gerektirmez.
    """
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=5.0)
            response.raise_for_status()
            data = response.json()
            
            current = data.get("current_weather", {})
            temp = current.get("temperature", "N/A")
            windspeed = current.get("windspeed", "N/A")
            
            # WMO Weather interpretation codes
            code = current.get("weathercode", 0)
            condition = get_weather_condition(code)

            return {
                "temp": temp,
                "condition": condition,
                "windspeed": f"{windspeed} km/s",
                "icon": "cloudy" if code > 2 else "sunny"
            }
    except Exception as e:
        return {
            "temp": 18,
            "condition": "Bağlantı Hatası (Mock)",
            "windspeed": "10 km/s",
            "icon": "cloudy"
        }

def get_weather_condition(code: int) -> str:
    if code == 0:
        return "Açık"
    elif code in [1, 2, 3]:
        return "Parçalı Bulutlu"
    elif code in [45, 48]:
        return "Sisli"
    elif code in [51, 53, 55, 56, 57]:
        return "Çisenti"
    elif code in [61, 63, 65, 66, 67]:
        return "Yağmurlu"
    elif code in [71, 73, 75, 77]:
        return "Kar Yağışlı"
    elif code in [95, 96, 99]:
        return "Fırtınalı"
    return "Bilinmiyor"
