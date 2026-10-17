from fastapi import APIRouter, Query
from services.prayer_service import get_prayer_times, get_qibla_data

router = APIRouter()

@router.get("/")
async def get_prayers(
    city: str = Query("Yozgat"),
    country: str = Query("Turkey"),
    lat: float = Query(None, description="Enlem"),
    lon: float = Query(None, description="Boylam")
):
    """Yozgat veya kullanıcının anlık konumuna göre günlük ezan vakitlerini döner."""
    data = await get_prayer_times(city=city, country=country, lat=lat, lon=lon)
    return {"status": "success", "data": data}

@router.get("/qibla")
async def get_qibla(
    lat: float = Query(39.8181, description="Enlem"),
    lon: float = Query(34.8147, description="Boylam"),
    city: str = Query("Yozgat", description="Şehir adı")
):
    """Canlı Kıble yönü, açısı ve Kâbe mesafesini döner."""
    data = await get_qibla_data(lat=lat, lon=lon, city=city)
    return {"status": "success", "data": data}

