from fastapi import FastAPI
from routers import home, prayer, news, explore, transport, pharmacies, health, auth
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Bozok 66 Süper Uygulama API Gateway",
    description="Yozgat şehir dinamiklerini birleştiren merkezi API Geçidi.",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


import os
from fastapi.staticfiles import StaticFiles

# Yeni klasör mimarisine uygun rotaları (routers) ekliyoruz
app.include_router(home.router, prefix="/api/home", tags=["Home"])
app.include_router(prayer.router, prefix="/api/prayer", tags=["Namaz Vakitleri"])
app.include_router(news.router, prefix="/api/news", tags=["Üniversite Duyuruları"])
app.include_router(explore.router, prefix="/api/explore", tags=["Keşfet Rehberi"])
app.include_router(transport.router, prefix="/api/transport", tags=["Ulaşım & Otobüsler"])
app.include_router(pharmacies.router, prefix="/api/pharmacies", tags=["Eczaneler & Nöbetçi Eczaneler"])
app.include_router(health.router, prefix="/api/health", tags=["Sağlık & Acil Durum"])
app.include_router(auth.router, prefix="/api/auth", tags=["Yetkilendirme & Kullanıcı"])

static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.get("/")
def read_root():
    return {"message": "Bozok 66 Süper Uygulama API Gateway Aktif!"}

@app.get("/api/campus/menu")
def get_campus_menu():
    return {"date": "Bugün", "menu": ["Ezogelin Çorbası", "Orman Kebabı", "Pirinç Pilavı", "Ayran"]}

@app.get("/api/merchants/discounts")
def get_discounts():
    return [{"id": 1, "merchant_name": "Çamlık Kafe", "discount": "%15 Öğrenci İndirimi"}]

