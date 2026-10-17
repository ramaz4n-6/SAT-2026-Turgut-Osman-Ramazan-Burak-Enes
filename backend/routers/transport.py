from fastapi import APIRouter, Query
from datetime import datetime
from typing import List, Dict, Any, Optional

router = APIRouter()

# Yozgat Toplu Taşıma / Belediye & Halk Otobüsü Hatları
BUS_ROUTES_DB = [
    {
        "id": 1,
        "line_number": "1",
        "route_name": "Kampüs - Cumhuriyet Meydanı - Otogar",
        "direction": "Kampüs ➔ Otogar",
        "first_departure": "06:30",
        "last_departure": "23:30",
        "interval_mins": 30,
        "stops": ["Erdoğan Akdağ Kampüsü", "Tıp Fakültesi", "Sarıhacılı", "Lise Caddesi", "Saat Kulesi Meydanı", "Otogar"],
        "schedule": [
            "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
            "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00",
            "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
            "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00",
            "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"
        ]
    },
    {
        "id": 2,
        "line_number": "2",
        "route_name": "Şehir Hastanesi - Çamlık - Kent Merkezi",
        "direction": "Şehir Hastanesi ➔ Kent Merkezi",
        "first_departure": "06:45",
        "last_departure": "23:15",
        "interval_mins": 30,
        "stops": ["Yozgat Şehir Hastanesi", "Adliye", "Valilik", "Cumhuriyet Meydanı", "Çamlık Parkı", "Köseoğlu"],
        "schedule": [
            "06:45", "07:15", "07:45", "08:15", "08:45", "09:15", "09:45",
            "10:15", "10:45", "11:15", "11:45", "12:15", "12:45", "13:15",
            "13:45", "14:15", "14:45", "15:15", "15:45", "16:15", "16:45",
            "17:15", "17:45", "18:15", "18:45", "19:15", "19:45", "20:15",
            "20:45", "21:15", "21:45", "22:15", "22:45", "23:15"
        ]
    },
    {
        "id": 3,
        "line_number": "3",
        "route_name": "KYK Yurtları - Bilal Şahin - Rektörlük",
        "direction": "KYK Yurtlar ➔ Rektörlük",
        "first_departure": "07:00",
        "last_departure": "23:00",
        "interval_mins": 30,
        "stops": ["Bozok Kız KYK", "Sürmeli Erkek KYK", "Bilal Şahin İlahiyat", "Kapalı Spor Salonu", "İİBF", "Rektörlük"],
        "schedule": [
            "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00",
            "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
            "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00",
            "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
            "21:00", "21:30", "22:00", "22:30", "23:00"
        ]
    },
    {
        "id": 4,
        "line_number": "4",
        "route_name": "Eski Sanayi - Bilal Şahin Mah. - Üniversite",
        "direction": "Sanayi ➔ Kampüs",
        "first_departure": "07:15",
        "last_departure": "22:45",
        "interval_mins": 30,
        "stops": ["Eski Sanayi Sitesi", "Dörtyol", "Medrese", "Cumhuriyet Meydanı", "Eğitim Fakültesi", "Merkezi Kütüphane"],
        "schedule": [
            "07:15", "07:45", "08:15", "08:45", "09:15", "09:45", "10:15",
            "10:45", "11:15", "11:45", "12:15", "12:45", "13:15", "13:45",
            "14:15", "14:45", "15:15", "15:45", "16:15", "16:45", "17:15",
            "17:45", "18:15", "18:45", "19:15", "19:45", "20:15", "20:45",
            "21:15", "21:45", "22:15", "22:45"
        ]
    }
]

def to_mins(t_str: str) -> int:
    h, m = map(int, t_str.split(":")[:2])
    return h * 60 + m

def get_live_route_status(route: dict, now_dt: datetime) -> dict:
    now_mins = now_dt.hour * 60 + now_dt.minute
    schedule = route["schedule"]

    current_slot = None
    next_departure = None
    diff_next = 9999

    for i, t in enumerate(schedule):
        t_mins = to_mins(t)
        if t_mins <= now_mins:
            # Şu anki veya en son kalkan saat dilimi
            current_slot = t
        elif t_mins > now_mins and next_departure is None:
            # Bir sonraki kalkacak sefer
            next_departure = t
            diff_next = t_mins - now_mins

    # Eğer günün tüm seferleri bittiyse (gece geç saat)
    if current_slot is None:
        current_slot = schedule[-1]
    if next_departure is None:
        next_departure = schedule[0]
        # Yarına kalan dakika
        diff_next = (1440 - now_mins) + to_mins(schedule[0])

    if diff_next <= 5:
        status_text = "Durağa Yaklaşıyor"
    elif diff_next <= 15:
        status_text = "Yolda (Yakında)"
    else:
        status_text = "Seferde"

    return {
        **route,
        "current_slot": current_slot,
        "next_departure": next_departure,
        "eta_minutes": diff_next,
        "eta_text": f"{diff_next} dk sonra" if diff_next < 60 else f"{diff_next // 60} sa {diff_next % 60} dk sonra",
        "status": status_text,
        "is_active_now": now_mins >= to_mins(route["first_departure"]) and now_mins <= to_mins(route["last_departure"]) + 30
    }

@router.get("/buses")
async def get_all_buses():
    """Tüm hatların saatlerini ve anlık canlı saat dilimini döner."""
    now_dt = datetime.now()
    results = [get_live_route_status(r, now_dt) for r in BUS_ROUTES_DB]
    return {
        "status": "success",
        "current_time": now_dt.strftime("%H:%M"),
        "data": results
    }

@router.get("/buses/{line_id}")
async def get_bus_detail(line_id: int):
    """Tek bir hattın detaylı sefer ve durak bilgilerini döner."""
    now_dt = datetime.now()
    route = next((r for r in BUS_ROUTES_DB if r["id"] == line_id), None)
    if not route:
        return {"status": "error", "message": "Hat bulunamadı"}
    return {
        "status": "success",
        "current_time": now_dt.strftime("%H:%M"),
        "data": get_live_route_status(route, now_dt)
    }
