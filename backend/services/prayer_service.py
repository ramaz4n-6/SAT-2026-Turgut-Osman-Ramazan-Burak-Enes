import math
import httpx
from datetime import datetime

def calculate_qibla_math(lat: float, lon: float):
    kaaba_lat = math.radians(21.4225)
    kaaba_lon = math.radians(39.8262)
    my_lat = math.radians(lat)
    my_lon = math.radians(lon)
    
    delta_lon = kaaba_lon - my_lon
    y = math.sin(delta_lon)
    x = math.cos(my_lat) * math.tan(kaaba_lat) - math.sin(my_lat) * math.cos(delta_lon)
    angle = (math.degrees(math.atan2(y, x)) + 360) % 360
    
    # Kâbe'ye mesafe (Haversine km)
    R = 6371
    dlat = math.radians(21.4225 - lat)
    dlon = math.radians(39.8262 - lon)
    a = math.sin(dlat / 2)**2 + math.cos(my_lat) * math.cos(kaaba_lat) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    dist = round(R * c)
    
    return round(angle, 2), dist

def get_cardinal_direction(deg: float) -> str:
    if 22.5 <= deg < 67.5:
        return "Kuzeydoğu"
    elif 67.5 <= deg < 112.5:
        return "Doğu"
    elif 112.5 <= deg < 157.5:
        return "Güneydoğu"
    elif 157.5 <= deg < 202.5:
        return "Güney-Güneydoğu"
    elif 202.5 <= deg < 247.5:
        return "Güneybatı"
    elif 247.5 <= deg < 292.5:
        return "Batı"
    elif 292.5 <= deg < 337.5:
        return "Kuzeybatı"
    else:
        return "Kuzey"

async def get_qibla_data(lat: float = 39.8181, lon: float = 34.8147, city: str = "Yozgat"):
    """
    Aladhan Kıble API'sini kullanarak koordinata göre kıble açısını çeker,
    hata durumunda jeodezik matematiksel model ile tam açıyı hesaplar.
    """
    direction, distance_km = calculate_qibla_math(lat, lon)
    
    try:
        url = f"https://api.aladhan.com/v1/qibla/{lat}/{lon}"
        async with httpx.AsyncClient() as client:
            res = await client.get(url, timeout=4.0)
            if res.status_code == 200:
                api_data = res.json().get("data", {})
                if "direction" in api_data:
                    direction = round(float(api_data["direction"]), 2)
    except Exception:
        pass
        
    return {
        "direction": direction,
        "degree": round(direction),
        "direction_text": get_cardinal_direction(direction),
        "city": city,
        "coordinates": {"latitude": lat, "longitude": lon},
        "kaaba_distance_km": distance_km,
        "updated_at": datetime.now().strftime("%H:%M:%S")
    }

def parse_time_mins(t_str: str) -> int:
    try:
        h, m = map(int, t_str.split(":")[:2])
        return h * 60 + m
    except Exception:
        return 0

def calculate_prayer_status(timings: dict) -> dict:
    now_dt = datetime.now()
    now_mins = now_dt.hour * 60 + now_dt.minute

    order = [
        ("imsak", "İmsak", parse_time_mins(timings.get("imsak", "05:10"))),
        ("gunes", "Güneş", parse_time_mins(timings.get("gunes", "06:30"))),
        ("ogle", "Öğle", parse_time_mins(timings.get("ogle", "12:45"))),
        ("ikindi", "İkindi", parse_time_mins(timings.get("ikindi", "15:55"))),
        ("aksam", "Akşam", parse_time_mins(timings.get("aksam", "18:40"))),
        ("yatsi", "Yatsı", parse_time_mins(timings.get("yatsi", "20:00"))),
    ]

    current_key, current_label = "yatsi", "Yatsı"
    next_key, next_label = "imsak", "İmsak"

    if now_mins < order[0][2]:  # İmsak öncesi gece
        current_key, current_label = "yatsi", "Yatsı"
        next_key, next_label = order[0][0], order[0][1]
        diff = order[0][2] - now_mins
    elif now_mins >= order[-1][2]:  # Yatsı sonrası gece
        current_key, current_label = "yatsi", "Yatsı"
        next_key, next_label = order[0][0], order[0][1]
        diff = (1440 - now_mins) + order[0][2]
    else:
        for i in range(len(order) - 1):
            if order[i][2] <= now_mins < order[i + 1][2]:
                current_key, current_label = order[i][0], order[i][1]
                next_key, next_label = order[i + 1][0], order[i + 1][1]
                diff = order[i + 1][2] - now_mins
                break

    hours = diff // 60
    mins = diff % 60
    remaining_str = f"{hours} sa {mins} dk" if hours > 0 else f"{mins} dk"

    return {
        "current_prayer": current_key,
        "current_prayer_label": current_label,
        "next_prayer": next_key,
        "next_prayer_label": next_label,
        "time_remaining": remaining_str,
    }

async def get_prayer_times(
    city: str = "Yozgat",
    country: str = "Turkey",
    lat: float = None,
    lon: float = None
):
    """
    Aladhan API kullanarak Yozgat veya kullanıcının GPS koordinatlarına göre
    günlük namaz vakitlerini gerçek zamanlı çeker ve şu anki/sıradaki vakti hesaplar.
    """
    date_str = datetime.now().strftime("%d-%m-%Y")
    if lat is not None and lon is not None:
        url = f"https://api.aladhan.com/v1/timings/{date_str}?latitude={lat}&longitude={lon}&method=13"
    else:
        url = f"https://api.aladhan.com/v1/timingsByCity/{date_str}?city={city}&country={country}&method=13"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=5.0)
            response.raise_for_status()
            data = response.json()
            
            timings = data["data"]["timings"]
            raw_dict = {
                "imsak": timings.get("Imsak"),
                "gunes": timings.get("Sunrise"),
                "ogle": timings.get("Dhuhr"),
                "ikindi": timings.get("Asr"),
                "aksam": timings.get("Maghrib"),
                "yatsi": timings.get("Isha"),
            }
            status_meta = calculate_prayer_status(raw_dict)
            
            return {
                **raw_dict,
                **status_meta,
                "date": date_str,
                "city": city if lat is None else "Konumunuz"
            }
    except Exception:
        # Hata durumunda varsayılan tahmini saatler
        raw_dict = {
            "imsak": "05:10",
            "gunes": "06:30",
            "ogle": "12:45",
            "ikindi": "15:55",
            "aksam": "18:40",
            "yatsi": "20:00",
        }
        status_meta = calculate_prayer_status(raw_dict)
        return {
            **raw_dict,
            **status_meta,
            "date": date_str,
            "city": city
        }


