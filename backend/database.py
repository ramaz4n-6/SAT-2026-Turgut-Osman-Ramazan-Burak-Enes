"""
MySQL Veritabanı Bağlantı ve Havuz Katmanı
XAMPP, WampServer veya yerel MySQL sunucusuna direkt bağlanır.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# MySQL Bağlantı Ayarları:
# Varsayılan: root kullanıcısı, şifresiz (XAMPP varsayılanı) ve bozok66 veritabanı.
# Eğer şifreliyse: "mysql+pymysql://root:sifreniz@localhost:3306/bozok66"
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "bozok66")

MYSQL_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"

# Eğer MySQL sunucusu henüz açık değilse projenin çökmemesi için fallback (SQLite) seçeneği de korunur:
DATABASE_URL = os.getenv("DATABASE_URL", MYSQL_DATABASE_URL)

try:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,      # Kopan bağlantıları otomatik yeniler
        pool_recycle=3600,       # MySQL timeout hatalarını önler
    )
except Exception:
    # Geliştiricinin bilgisayarında MySQL henüz başlamadıysa çökme olmasın
    engine = create_engine("sqlite:///./bozok66.db", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
