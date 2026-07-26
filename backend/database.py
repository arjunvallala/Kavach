import os
import pandas as pd
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, Text
from sqlalchemy.orm import declarative_base, sessionmaker
import datetime

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
    """Create database tables if they do not exist."""
    Base.metadata.create_all(bind=engine)

def seed_database_if_empty(df, tips_list):
    """Seed generated FIR dataset and citizen tips into database idempotently."""
    init_db()
    db = SessionLocal()
    try:
        count = db.query(FIRRecordModel).count()
        if count == 0:
            print("Seeding synthetic FIR dataset into Database tables...")
            fir_objects = []
            for _, row in df.iterrows():
                fir_objects.append(FIRRecordModel(
                    fir_number=row['fir_number'],
                    district=row['district'],
                    station=row['station'],
                    taluk=row['taluk'],
                    lat=row['lat'],
                    lng=row['lng'],
                    timestamp=row['timestamp'],
                    date=row['date'],
                    hour=int(row['hour']),
                    day_of_week=row['day_of_week'],
                    crime_category=row['crime_category'],
                    modus_operandi=row['modus_operandi'],
                    offender_id=row['offender_id'],
                    offender_name=row['offender_name'],
                    victim_id=row['victim_id'],
                    victim_name=row['victim_name'],
                    victim_repeat=bool(row['victim_repeat']),
                    weapon_extracted=row['weapon_extracted'],
                    vehicle_extracted=row['vehicle_extracted'],
                    fir_narrative=row['fir_narrative'],
                    case_outcome=row['case_outcome'],
                    is_anomaly=bool(row['is_anomaly']),
                    urbanization=float(row['urbanization']),
                    unemployment_rate=float(row['unemployment_rate']),
                    literacy_rate=float(row['literacy_rate']),
                    population_density=int(row['population_density'])
                ))
            db.bulk_save_objects(fir_objects)
            
            tip_objects = []
            for tip in tips_list:
                tip_objects.append(CitizenTipModel(
                    tip_id=tip['tip_id'],
                    district=tip['district'],
                    station=tip['station'],
                    category=tip['category'],
                    description=tip['description'],
                    fuzzed_lat=float(tip['fuzzed_lat']),
                    fuzzed_lng=float(tip['fuzzed_lng']),
                    timestamp=tip['timestamp'],
                    credibility_score=float(tip['credibility_score'])
                ))
            db.bulk_save_objects(tip_objects)
            db.commit()
            print(f"Successfully persisted {len(fir_objects)} FIR records & {len(tip_objects)} Citizen Tips to Database.")
    except Exception as e:
        db.rollback()
        print("Database Seed Error:", e)
    finally:
        db.close()

def query_firs_from_db(district=None):
    """Query FIR records from database."""
    db = SessionLocal()
    try:
        query = db.query(FIRRecordModel)
        if district and district != "All":
            query = query.filter(FIRRecordModel.district == district)
        records = query.all()
        data = [{c.name: getattr(r, c.name) for c in r.__table__.columns} for r in records]
        return pd.DataFrame(data)
    finally:
        db.close()

def query_tips_from_db(district=None):
    """Query citizen tips from database."""
    db = SessionLocal()
    try:
        query = db.query(CitizenTipModel)
        if district and district != "All":
            query = query.filter(CitizenTipModel.district == district)
        records = query.all()
        return [{c.name: getattr(r, c.name) for c in r.__table__.columns} for r in records]
    finally:
        db.close()

def add_tip_to_db(tip_dict):
    """Add new citizen tip to database."""
    db = SessionLocal()
    try:
        tip_obj = CitizenTipModel(**tip_dict)
        db.add(tip_obj)
        db.commit()
        db.refresh(tip_obj)
        return {c.name: getattr(tip_obj, c.name) for c in tip_obj.__table__.columns}
    finally:
        db.close()
