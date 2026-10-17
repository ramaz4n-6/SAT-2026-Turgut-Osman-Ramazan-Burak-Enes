from fastapi import APIRouter, Query
from datetime import datetime
from typing import List, Optional
import math

router = APIRouter()

# Yozgat Eczaneler Veritabanı (Merkez & Kampüs Çevresi)
YOZGAT_PHARMACIES_DB = [
    {
        "id": 1,
        "name": "Bozok Eczanesi",
        "is_on_duty": True,
        "address": "Lise Caddesi No:12, Merkez / Yozgat",
        "neighborhood": "Aşağı Nohutlu Mah.",
        "phone": "0354 212 11 22",
        "latitude": 39.8214,
        "longitude": 34.8089,
        "duty_date": "Bugün (24 Saat Açık)",
        "hours": "7/24 Nöbetçi",
        "notes": "Valilik ve Saat Kulesi civarı, merkezi konum"
    },
    {
        "id": 2,
        "name": "Çamlık Eczanesi",
        "is_on_duty": True,
        "address": "Meydan Çarşısı No:4, Merkez / Yozgat",
        "neighborhood": "Medrese Mah.",
        "phone": "0354 217 33 44",
        "latitude": 39.8198,
        "longitude": 34.8123,
        "duty_date": "Bugün (24 Saat Açık)",
        "hours": "7/24 Nöbetçi",
        "notes": "Cumhuriyet Meydanı Ziraat Bankası karşısı"
    },
    {
        "id": 3,
        "name": "Şifa Eczanesi",
        "is_on_duty": False,
        "address": "Hastane Caddesi No:18, Merkez / Yozgat",
        "neighborhood": "Erdoğan Akdağ Mah.",
        "phone": "0354 212 45 67",
        "latitude": 39.8260,
        "longitude": 34.8250,
        "duty_date": "Yarın Nöbetçi",
        "hours": "08:30 - 19:00",
        "notes": "Şehir Hastanesi yakını"
    },
    {
        "id": 4,
        "name": "Üniversite Eczanesi",
        "is_on_duty": False,
        "address": "Erdoğan Akdağ Kampüsü Karşısı No:6, Yozgat",
        "neighborhood": "Sarıhacılı Mah.",
        "phone": "0354 214 78 90",
        "latitude": 39.8402,
        "longitude": 34.8510,
        "duty_date": None,
        "hours": "08:30 - 19:00",
        "notes": "Bozok Üniversitesi Kampüs Ana Giriş karşısı"
    },
    {
        "id": 5,
        "name": "Hayat Eczanesi",
        "is_on_duty": False,
        "address": "Sivas Caddesi No:24, Merkez / Yozgat",
        "neighborhood": "Köseoğlu Mah.",
        "phone": "0354 212 88 99",
        "latitude": 39.8175,
        "longitude": 34.8050,
        "duty_date": None,
        "hours": "08:30 - 19:00",
        "notes": "Eski Askerlik Şubesi arkası"
    },
    {
        "id": 6,
        "name": "Yeni Merkez Eczanesi",
        "is_on_duty": False,
        "address": "Saat Kulesi Yanı No:2, Merkez / Yozgat",
        "neighborhood": "Çapanoğlu Mah.",
        "phone": "0354 212 55 11",
        "latitude": 39.8205,
        "longitude": 34.8101,
        "duty_date": None,
        "hours": "08:30 - 19:00",
        "notes": "Tarihi Saat Kulesi bitişiği"
    },
    {
        "id": 7,
        "name": "Derman Eczanesi",
        "is_on_duty": False,
        "address": "Terminal Caddesi No:15, Merkez / Yozgat",
        "neighborhood": "Bahçeşehir Mah.",
        "phone": "0354 212 60 70",
        "latitude": 39.8140,
        "longitude": 34.7980,
        "duty_date": None,
        "hours": "08:30 - 19:00",
        "notes": "Otogar yolu üzerinde"
    },
    {
        "id": 8,
        "name": "Sağlık Eczanesi",
        "is_on_duty": False,
        "address": "Atatürk Yolu No:32, Merkez / Yozgat",
        "neighborhood": "Turan Mah.",
        "phone": "0354 217 90 90",
        "latitude": 39.8230,
        "longitude": 34.8150,
        "duty_date": None,
        "hours": "08:30 - 19:00",
        "notes": "1 Nolu Sağlık Ocağı yanı"
    }
]

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def format_distance(dist_km: float) -> str:
    if dist_km < 1.0:
        return f"{int(dist_km * 1000)} m"
    return f"{dist_km:.1f} km"

def build_pharmacy_dict(p: dict, user_lat: Optional[float] = None, user_lon: Optional[float] = None) -> dict:
    # Varsayılan Yozgat Saat Kulesi koordinatı
    base_lat = user_lat if user_lat is not None else 39.8200
    base_lon = user_lon if user_lon is not None else 39.8200
    
    dist_km = haversine_km(base_lat, base_lon, p["latitude"], p["longitude"])
    maps_url = f"https://www.google.com/maps/dir/?api=1&destination={p['latitude']},{p['longitude']}"

    return {
        **p,
        "distance_km": round(dist_km, 2),
        "dist": format_distance(dist_km),
        "maps_url": maps_url,
    }

@router.get("/")
async def get_all_pharmacies(
    lat: Optional[float] = Query(None, description="Kullanıcı Enlem"),
    lon: Optional[float] = Query(None, description="Kullanıcı Boylam")
):
    """Tüm Yozgat eczanelerini döner. Nöbetçi olanlar en başta ve kırmızı vurgulu şekilde gelir."""
    now_dt = datetime.now()
    results = [build_pharmacy_dict(p, lat, lon) for p in YOZGAT_PHARMACIES_DB]
    # Nöbetçi olanlar önce sıralansın
    results.sort(key=lambda x: (not x["is_on_duty"], x["distance_km"]))
    
    return {
        "status": "success",
        "date": now_dt.strftime("%d.%m.%Y"),
        "time": now_dt.strftime("%H:%M"),
        "total_count": len(results),
        "on_duty_count": sum(1 for p in results if p["is_on_duty"]),
        "data": results
    }

@router.get("/on-duty")
async def get_on_duty_pharmacies(
    lat: Optional[float] = Query(None, description="Kullanıcı Enlem"),
    lon: Optional[float] = Query(None, description="Kullanıcı Boylam")
):
    """Sadece bugün nöbetçi olan Yozgat eczanelerini döner."""
    now_dt = datetime.now()
    duty_list = [p for p in YOZGAT_PHARMACIES_DB if p["is_on_duty"]]
    results = [build_pharmacy_dict(p, lat, lon) for p in duty_list]
    results.sort(key=lambda x: x["distance_km"])
    return {
        "status": "success",
        "date": now_dt.strftime("%d.%m.%Y"),
        "time": now_dt.strftime("%H:%M"),
        "data": results
    }
