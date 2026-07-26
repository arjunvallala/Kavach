import os
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
import datetime

# PostgreSQL / PostGIS Database URL (configurable via env var, defaults to sqlite for seamless local fallback)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./kavach.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class FIRRecordModel(Base):
    __tablename__ = "fir_records"

    fir_number = Column(String, primary_key=True, index=True)
    district = Column(String, index=True)
    station = Column(String, index=True)
    taluk = Column(String)
    lat = Column(Float)
    lng = Column(Float)
    timestamp = Column(String)
    date = Column(String)
    hour = Column(Integer)
    day_of_week = Column(String)
    crime_category = Column(String, index=True)
    modus_operandi = Column(String)
    offender_id = Column(String, index=True)
    offender_name = Column(String)
    victim_id = Column(String)
    victim_name = Column(String)
    victim_repeat = Column(Boolean)
    weapon_extracted = Column(String)
    vehicle_extracted = Column(String)
    fir_narrative = Column(Text)
    case_outcome = Column(String)
    is_anomaly = Column(Boolean)
    urbanization = Column(Float)
    unemployment_rate = Column(Float)
    literacy_rate = Column(Float)
    population_density = Column(Integer)

class CitizenTipModel(Base):
    __tablename__ = "citizen_tips"

    tip_id = Column(String, primary_key=True, index=True)
    district = Column(String, index=True)
    station = Column(String)
    category = Column(String)
    description = Column(Text)
    fuzzed_lat = Column(Float)
    fuzzed_lng = Column(Float)
    timestamp = Column(String)
    credibility_score = Column(Float)

def init_db():
    """Create tables on startup."""
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
