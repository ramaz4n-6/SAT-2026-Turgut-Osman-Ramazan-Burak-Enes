from fastapi import APIRouter
from services.news_service import get_university_news, get_live_general_news

router = APIRouter()

@router.get("/")
async def get_all_news():
    """Günün canlı haberleri ve Bozok Üniversitesi duyurularını birlikte döner."""
    general = await get_live_general_news()
    university = await get_university_news()
    return {
        "status": "success",
        "general_news": general,
        "university_news": university,
        "data": university  # Geriye dönük uyumluluk için
    }

@router.get("/general")
async def get_general_news():
    """Günün son dakika canlı haberlerini döner."""
    data = await get_live_general_news()
    return {"status": "success", "data": data}

@router.get("/university")
async def get_university():
    """Yozgat Bozok Üniversitesi güncel canlı duyurularını döner."""
    data = await get_university_news()
    return {"status": "success", "data": data}
