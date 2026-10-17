import math
from fastapi import APIRouter, Query
from typing import Optional, List, Dict, Any

router = APIRouter()

# Yozgat ve İlçelerindeki Tüm Orijinal Gezilecek Yerler (Mobilde %100 Yüklenen Yüksek Kaliteli Doğrudan Görseller)
PLACES_DB = [
    {
        "id": 1,
        "title": "Çekerek Şatosu & Seyir Terası",
        "website_url": "https://www.facebook.com/cekerek.soto.9/",
        "category": "Doğa & Macera",
        "icon": "boat-outline",
        "description": "Çekerek Barajı kıyısında masalsı kule mimarisi, seyir terasları ve baraj gölü manzarasıyla yükselen turizm merkezidir.",
        "history": "Çekerek Barajı eko-turizm ve rafting projeleri kapsamında baraj gölüne nazır inşa edilmiş simge yapıdır.",
        "address": "Baraj Mevkii, Çekerek / Yozgat",
        "latitude": 40.0682,
        "longitude": 35.4950,
        "visiting_hours": "09:00 - 21:00",
        "entry_fee": "Ücretsiz",
        "image_url": "/static/places/cekerek_satosu.jpg"
    },
    {
        "id": 2,
        "title": "Çekerek Barajı Lavanta Adası",
        "website_url": "https://www.kulturportali.gov.tr/turkiye/yozgat/gezilecekyer/yozgat-cekerek-lavanta-adasi",
        "category": "Doğa & Park",
        "icon": "flower-outline",
        "description": "Türkiye'nin en büyük lavanta adalarından biri. Baraj gölü ortasında mor lavanta tarlaları, seyir iskeleleri ve fotoğraf parkurları sunar.",
        "history": "Çekerek Barajı içerisinde yer alan ada dönüştürülerek milyonlarca lavanta fidesiyle turizme kazandırılmıştır.",
        "address": "Lavanta Adası, Çekerek Barajı, Çekerek / Yozgat",
        "latitude": 40.0725,
        "longitude": 35.5012,
        "visiting_hours": "08:30 - 20:30",
        "entry_fee": "Ücretsiz",
        "image_url": "/static/places/lavanta_adasi.jpg"
    },
    {
        "id": 4,
        "title": "Çamlık Milli Parkı",
        "category": "Doğa & Park",
        "icon": "leaf-outline",
        "description": "Türkiye'nin 1958 yılında ilan edilen ilk milli parkıdır. Karaçam türü ve temiz havasıyla Yozgat'ın akciğeridir.",
        "history": "1958 yılında Türkiye'nin 1. milli parkı ilan edilmiştir. İçerisinde yalnızca bölgeye özgü relikt karaçam türleri barındırır.",
        "address": "Köseoğlu Mah. Çamlık Cad. Merkez / Yozgat",
        "latitude": 39.8055,
        "longitude": 34.8175,
        "visiting_hours": "08:00 - 22:00",
        "entry_fee": "Ücretsiz",
        "image_url": "/static/places/camlik_milli_parki.jpg"
    },
    {
        "id": 5,
        "title": "Yozgat Saat Kulesi",
        "category": "Tarihi Mekan",
        "icon": "time-outline",
        "description": "Yozgat şehir merkezinin kalbinde yer alan, 1908 yılında Şakir Usta tarafından kesme taşla inşa edilmiş simge kuledir.",
        "history": "1908 yılında Yozgat Belediye Başkanı Tevfikizade Ahmet Bey döneminde inşa edilmiştir. 6 katlı ve çanlıdır.",
        "address": "Medrese Mah. Cumhuriyet Meydanı, Merkez / Yozgat",
        "latitude": 39.8211,
        "longitude": 34.8083,
        "visiting_hours": "7/24 Açık",
        "entry_fee": "Ücretsiz",
        "image_url": "/static/places/saat_kulesi.jpg"
    },
    {
        "id": 6,
        "title": "Çapanoğlu Büyük Camii",
        "category": "Tarihi Mekan",
        "icon": "moon-outline",
        "description": "Osmanlı Barok mimarisinin Anadolu'daki en ihtişamlı örneklerinden biridir. Çapanoğlu Mustafa Bey tarafından yaptırılmıştır.",
        "history": "1779 yılında Mustafa Bey, 1795 yılında ise kardeşi Süleyman Bey tarafından genişletilmiştir.",
        "address": "İstanbulluoğlu Mah. Çapanoğlu Cad. Merkez / Yozgat",
        "latitude": 39.8219,
        "longitude": 34.8091,
        "visiting_hours": "İbadet saatlerinde açık",
        "entry_fee": "Ücretsiz",
        "image_url": "/static/places/capanoglu_camii.jpg"
    },
    {
        "id": 7,
        "title": "Sarıkaya Roma Hamamı (Basilica Therma)",
        "category": "Tarihi Mekan",
        "icon": "sparkles-outline",
        "description": "2000 yıllık geçmişe sahip, şifalı termal suyu hâlâ kaynayan UNESCO Dünya Mirası Geçici Listesi'ndeki antik Roma hamamıdır.",
        "history": "Roma İmparatorluğu döneminde MS 2. yüzyılda inşa edilmiştir.",
        "address": "Kaplıcalar Mah. Sarıkaya / Yozgat",
        "latitude": 39.4952,
        "longitude": 35.3789,
        "visiting_hours": "08:30 - 17:30",
        "entry_fee": "Ücretsiz",
        "image_url": "/static/places/sarikaya_roma_hamami.jpg"
    },
    {
        "id": 8,
        "title": "Nizamoğlu Konağı (Etnografya Müzesi)",
        "category": "Kültür & Müze",
        "icon": "home-outline",
        "description": "19. yüzyıl Osmanlı sivil mimarisini yansıtan konak, Yozgat yöresine ait etnografik eserleri sergilemektedir.",
        "history": "1871 yılında inşa edilen konak, 1979'da kamulaştırılıp müze olarak ziyarete açılmıştır.",
        "address": "İstanbulluoğlu Mah. Nizamoğlu Sok. Merkez / Yozgat",
        "latitude": 39.8234,
        "longitude": 34.8062,
        "visiting_hours": "09:00 - 17:00 (Pazartesi kapalı)",
        "entry_fee": "Ücretsiz / Müzekart",
        "image_url": "/static/places/nizamoglu_konagi.jpg"
    },
    {
        "id": 9,
        "title": "Bozok Üniversitesi Erdoğan Akdağ Kampüsü",
        "category": "Eğitim & Kampüs",
        "icon": "school-outline",
        "description": "Yozgat Bozok Üniversitesi'nin ana yerleşkesidir. Fakülteler, kütüphane, gölet ve öğrenci sosyal alanlarını barındırır.",
        "history": "2006 yılında kurulan Bozok Üniversitesi'nin ana yerleşkesidir.",
        "address": "Atatürk Yolu 7. Km, Merkez / Yozgat",
        "latitude": 39.7892,
        "longitude": 34.7981,
        "visiting_hours": "08:00 - 20:00",
        "entry_fee": "Ücretsiz",
        "image_url": "/static/places/bozok_universitesi.jpg"
    },
    {
        "id": 10,
        "title": "Kazankaya Kanyonu",
        "website_url": "https://www.kulturportali.gov.tr/turkiye/yozgat/gezilecekyer/kazankaya-kanyonu-kazankaya-vadisi",
        "category": "Doğa & Macera",
        "icon": "trail-sign-outline",
        "description": "10 km uzunluğunda, içinden Çekerek Irmağı geçen doğa yürüyüşü ve kanyon tutkunlarının vazgeçilmez rotasıdır.",
        "history": "Kanyon kayalıklarında Helenistik döneme ait Tanrıça Kibele kabartması yer almaktadır.",
        "address": "Kazankaya Köyü, Aydıncık / Yozgat",
        "latitude": 40.2321,
        "longitude": 35.1852,
        "visiting_hours": "Gün boyu açık",
        "entry_fee": "Ücretsiz",
        "image_url": "/static/places/kazankaya_kanyonu.jpg"
    },
    {
        "id": 11,
        "title": "Karslıoğlu Konağı",
        "category": "Kültür & Müze",
        "icon": "business-outline",
        "description": "Atatürk'ün Yozgat'ı ziyaretinde kaldığı tarihi konaktır. Geleneksel ahşap tavan işlemeleri ve mimarisiyle ünlüdür.",
        "history": "1883 yılında inşa edilmiş, Kurtuluş Savaşı döneminde önemli görüşmelere ev sahipliği yapmıştır.",
        "address": "Sungurlu Sokak, Merkez / Yozgat",
        "latitude": 39.8225,
        "longitude": 34.8071,
        "visiting_hours": "09:00 - 17:00",
        "entry_fee": "Ücretsiz",
        "image_url": "/static/places/karslioglu_konagi.jpg"
    },
    {
        "id": 12,
        "title": "Akdağmadeni Tarihi Kilise & Ormanları",
        "website_url": "https://www.kulturportali.gov.tr/turkiye/yozgat/gezilecekyer/akdagmadeni-kilisesi",
        "category": "Tarihi Mekan",
        "icon": "trail-sign-outline",
        "description": "1862 yapımı tarihi taş kilise ve çevresindeki zengin sarıçam ormanları, doğal yürüyüş parkurları.",
        "history": "19. yüzyılda bölgede yaşayan Rum madenciler tarafından inşa edilmiştir.",
        "address": "Yeşildere Mah. Akdağmadeni / Yozgat",
        "latitude": 39.6601,
        "longitude": 35.8821,
        "visiting_hours": "09:00 - 18:00",
        "entry_fee": "Ücretsiz",
        "image_url": "/static/places/akdagmadeni_kilisesi.jpg"
    }
]

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def format_distance(dist_km: float) -> str:
    if dist_km < 1.0:
        return f"{int(dist_km * 1000)} m"
    return f"{dist_km:.1f} km".replace(".", ",")

@router.get("/places")
async def get_explore_places(
    lat: Optional[float] = Query(None, description="Kullanıcının anlık enlemi"),
    lon: Optional[float] = Query(None, description="Kullanıcının anlık boylamı"),
    category: Optional[str] = Query(None, description="Kategori filtresi")
):
    """
    Yozgat gezilecek tüm yerleri eksiksiz görselleri ve mesafeleriyle döner.
    """
    ref_lat = lat if lat is not None else 39.8181
    ref_lon = lon if lon is not None else 34.8147

    results: List[Dict[str, Any]] = []

    for place in PLACES_DB:
        if category and category.lower() not in place["category"].lower():
            continue

        dist_km = calculate_distance(ref_lat, ref_lon, place["latitude"], place["longitude"])
        item = dict(place)
        item["distance_km"] = round(dist_km, 2)
        item["distance_text"] = format_distance(dist_km)
        item["map_url"] = f"https://www.google.com/maps/search/?api=1&query={place['latitude']},{place['longitude']}"
        results.append(item)

    results.sort(key=lambda x: x["distance_km"])

    return {
        "status": "success",
        "user_location": {"latitude": ref_lat, "longitude": ref_lon} if lat is not None else None,
        "count": len(results),
        "data": results
    }
