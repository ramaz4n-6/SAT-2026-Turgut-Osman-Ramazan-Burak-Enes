"""
Temel SQL Veritabanı Modelleri
Arkadaşların tablo kurarken ve veri çekerken doğrudan kullanabileceği şablon modeller.
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)


class DutyPharmacy(Base):
    __tablename__ = "duty_pharmacies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    address = Column(String(255), nullable=False)
    phone = Column(String(30), nullable=False)
    duty_date = Column(String(20), nullable=True)


class BusRoute(Base):
    __tablename__ = "bus_routes"

    id = Column(Integer, primary_key=True, index=True)
    route_name = Column(String(100), nullable=False)
    departure_times = Column(Text, nullable=True) # JSON veya virgüllü saatler
    current_status = Column(String(50), default="Yolda")
