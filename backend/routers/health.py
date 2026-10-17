from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

# 1. ACİL ÇAĞRI VE İRTİBAT NUMARALARI
EMERGENCY_CONTACTS = [
    {
        "id": "112",
        "title": "112 Acil Çağrı Merkezi",
        "subtitle": "Ambulans, Polis, İtfaiye, Jandarma",
        "phone": "112",
        "icon": "call",
        "badge": "Ücretsiz / 7/24",
        "is_primary": True
    },
    {
        "id": "114",
        "title": "Zehir Danışma Merkezi",
        "subtitle": "Zehirlenme vakaları ve ilk yardım",
        "phone": "114",
        "icon": "alert-circle",
        "badge": "7/24 Danışma",
        "is_primary": False
    },
    {
        "id": "182",
        "title": "MHRS Randevu Hattı",
        "subtitle": "Merkezi Hekim Randevu Sistemi",
        "phone": "182",
        "icon": "calendar",
        "badge": "Randevu Hattı",
        "is_primary": False
    },
    {
        "id": "sehir-hastanesi",
        "title": "Yozgat Şehir Hastanesi Acil",
        "subtitle": "Erdoğan Akdağ Mah. Viyana Cad.",
        "phone": "03542190010",
        "icon": "medkit",
        "badge": "Acil Servis",
        "is_primary": False
    },
    {
        "id": "bozok-tip",
        "title": "Bozok Üniv. Araştırma Hastanesi",
        "subtitle": "Erdoğan Akdağ Kampüsü İçi",
        "phone": "03542127050",
        "icon": "business",
        "badge": "Üniversite Hastanesi",
        "is_primary": False
    }
]

# 2. HASTANELER VE SAĞLIK KURUMLARI
HOSPITALS_DB = [
    {
        "id": 1,
        "name": "Yozgat Şehir Hastanesi",
        "category": "Şehir Hastanesi",
        "address": "Erdoğan Akdağ Mah. Viyana Cad. No:6 Merkez / Yozgat",
        "phone": "0354 219 00 10",
        "emergency_phone": "0354 219 00 00",
        "mhrs_url": "https://mhrs.gov.tr/",
        "maps_url": "https://maps.google.com/?q=Yozgat+Sehir+Hastanesi",
        "has_emergency": True,
        "bed_capacity": 475,
        "working_hours": "Acil 7/24 Açık | Poliklinik: 08:30 - 17:00"
    },
    {
        "id": 2,
        "name": "Bozok Üniversitesi Araştırma ve Uygulama Hastanesi",
        "category": "Üniversite Hastanesi",
        "address": "Erdoğan Akdağ Kampüsü, Atatürk Yolu 7. Km, Merkez / Yozgat",
        "phone": "0354 212 70 50",
        "emergency_phone": "0354 212 70 60",
        "mhrs_url": "https://mhrs.gov.tr/",
        "maps_url": "https://maps.google.com/?q=Bozok+Universitesi+Arastirma+ve+Uygulama+Hastanesi",
        "has_emergency": True,
        "bed_capacity": 250,
        "working_hours": "Acil 7/24 Açık | Poliklinik: 08:30 - 17:00"
    },
    {
        "id": 3,
        "name": "Yozgat Ağız ve Diş Sağlığı Merkezi",
        "category": "Diş Hastanesi",
        "address": "Medrese Mah. Saat Kulesi Civarı, Merkez / Yozgat",
        "phone": "0354 212 11 00",
        "emergency_phone": "0354 212 11 00",
        "mhrs_url": "https://mhrs.gov.tr/",
        "maps_url": "https://maps.google.com/?q=Yozgat+Agiz+ve+Dis+Sagligi+Merkezi",
        "has_emergency": True,
        "bed_capacity": 40,
        "working_hours": "Nöbetçi Diş Hekimi 7/24 | Poliklinik: 08:30 - 17:00"
    }
]

# 3. KAN BAĞIŞ MERKEZLERİ VE ACİL İHTİYAÇLAR
BLOOD_CENTERS = [
    {
        "id": 1,
        "title": "Türk Kızılay Yozgat Kan Bağış Merkezi",
        "address": "Cumhuriyet Meydanı Kızılay Binası Kat:1, Merkez / Yozgat",
        "phone": "0354 212 18 80",
        "hours": "Hafta içi ve Cumartesi: 09:30 - 18:00",
        "maps_url": "https://maps.google.com/?q=Turk+Kizilay+Yozgat+Kan+Bagis+Merkezi"
    },
    {
        "id": 2,
        "title": "Mobil Kızılay Kan Bağış Aracı",
        "address": "Yozgat Cumhuriyet Meydanı (Saat Kulesi Önü)",
        "phone": "0354 212 18 80",
        "hours": "Her gün: 10:30 - 18:30",
        "maps_url": "https://maps.google.com/?q=Yozgat+Cumhuriyet+Meydani"
    }
]

# Panelden eklenebilen acil kan duyuruları
URGENT_BLOOD_REQUESTS = [
    {
        "id": 1,
        "hospital": "Yozgat Şehir Hastanesi",
        "blood_group": "A Rh(+)",
        "patient_note": "Genel Cerrahi hastası için 2 ünite acil kan",
        "contact_phone": "0354 219 00 10 (Dahili: 114)",
        "created_at": datetime.now().strftime("%d.%m.%Y %H:%M"),
        "is_active": True
    },
    {
        "id": 2,
        "hospital": "Bozok Üni. Tıp Fakültesi Hastanesi",
        "blood_group": "0 Rh(-)",
        "patient_note": "Acil Servis yoğun bakım hastası için kan aranıyor",
        "contact_phone": "0354 212 70 50 (Dahili: 204)",
        "created_at": datetime.now().strftime("%d.%m.%Y %H:%M"),
        "is_active": True
    }
]

# Pydantic Şemaları (Panel için CRUD kontratları)
class UrgentBloodRequestCreate(BaseModel):
    hospital: str
    blood_group: str
    patient_note: str
    contact_phone: str

class UrgentBloodRequestUpdate(BaseModel):
    hospital: Optional[str] = None
    blood_group: Optional[str] = None
    patient_note: Optional[str] = None
    contact_phone: Optional[str] = None
    is_active: Optional[bool] = None

# ENDPOINT'LER

@router.get("/summary")
async def get_health_summary():
    """Mobil Sağlık Ekranı için tüm özet verileri tek istekte döner."""
    active_blood = [r for r in URGENT_BLOOD_REQUESTS if r["is_active"]]
    return {
        "status": "success",
        "emergency_contacts": EMERGENCY_CONTACTS,
        "urgent_blood_count": len(active_blood),
        "urgent_blood_requests": active_blood,
        "hospitals_count": len(HOSPITALS_DB),
        "blood_centers_count": len(BLOOD_CENTERS)
    }

@router.get("/emergency-contacts")
async def get_emergency_contacts():
    """112 ve Yozgat acil irtibat numaraları."""
    return {"status": "success", "data": EMERGENCY_CONTACTS}

@router.get("/hospitals")
async def get_hospitals():
    """Yozgat hastaneleri, poliklinik ve acil servis bilgileri."""
    return {"status": "success", "count": len(HOSPITALS_DB), "data": HOSPITALS_DB}

@router.get("/blood-donation")
async def get_blood_donation():
    """Kızılay kan bağış merkezleri ve aktif acil kan duyuruları."""
    active_blood = [r for r in URGENT_BLOOD_REQUESTS if r["is_active"]]
    return {
        "status": "success",
        "centers": BLOOD_CENTERS,
        "urgent_requests": active_blood
    }

# ================= PANELDEN YÖNETİM ENDPOINT'LERİ (CRUD) =================

@router.post("/blood-donation/urgent-request")
async def create_urgent_blood_request(payload: UrgentBloodRequestCreate):
    """PANEL: Yeni acil kan bağışı duyurusu yayınlar."""
    new_id = max([r["id"] for r in URGENT_BLOOD_REQUESTS], default=0) + 1
    new_item = {
        "id": new_id,
        "hospital": payload.hospital,
        "blood_group": payload.blood_group,
        "patient_note": payload.patient_note,
        "contact_phone": payload.contact_phone,
        "created_at": datetime.now().strftime("%d.%m.%Y %H:%M"),
        "is_active": True
    }
    URGENT_BLOOD_REQUESTS.insert(0, new_item)
    return {"status": "success", "message": "Acil kan duyurusu yayınlandı", "data": new_item}

@router.delete("/blood-donation/urgent-request/{request_id}")
async def delete_urgent_blood_request(request_id: int):
    """PANEL: İhtiyaç tamamlandığında kan duyurusunu kaldırır."""
    global URGENT_BLOOD_REQUESTS
    found = False
    for r in URGENT_BLOOD_REQUESTS:
        if r["id"] == request_id:
            r["is_active"] = False
            found = True
            break
    if not found:
        raise HTTPException(status_code=404, detail="Duyuru bulunamadı")
    return {"status": "success", "message": f"{request_id} nolu kan duyurusu başarıyla kapatıldı"}
