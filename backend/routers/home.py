from fastapi import APIRouter
from services.weather_service import get_current_weather
from services.finance_service import get_market_rates
from routers.pharmacies import YOZGAT_PHARMACIES_DB, build_pharmacy_dict

router = APIRouter()

@router.get("/summary")
async def get_home_summary():
    # Yozgat koordinatları: 39.8181, 34.8147
    weather_data = await get_current_weather(39.8181, 34.8147)
    market_data = await get_market_rates()
    
    # Nöbetçi eczaneler
    duty_pharmacies = [build_pharmacy_dict(p) for p in YOZGAT_PHARMACIES_DB if p["is_on_duty"]]
    
    return {
        "weather": weather_data,
        "markets": market_data,
        "active_alert": { "type": "warning", "msg": "Su Kesintisi: Çapanoğlu Mah." },
        "pharmacies": duty_pharmacies,
        "latest_news": [ { "id": 45, "title": "Çamlık Milli Parkı Yenileniyor", "img": "url" } ]
    }

