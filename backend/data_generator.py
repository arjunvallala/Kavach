import random
import datetime
import math
import pandas as pd
import numpy as np

# Karnataka Districts & Stations Data Mapping
DISTRICTS = {
    "Bengaluru Urban": {
        "center": [12.9716, 77.5946],
        "stations": [
            {"name": "Majestic PS", "lat": 12.9774, "lng": 77.5708, "taluk": "Gandhinagar"},
            {"name": "Indiranagar PS", "lat": 12.9784, "lng": 77.6408, "taluk": "Bengaluru East"},
            {"name": "Whitefield PS", "lat": 12.9698, "lng": 77.7500, "taluk": "Mahadevapura"},
            {"name": "Jayanagar PS", "lat": 12.9250, "lng": 77.5938, "taluk": "Bengaluru South"},
            {"name": "Koramangala PS", "lat": 12.9352, "lng": 77.6245, "taluk": "Bengaluru South"},
            {"name": "Peenya PS", "lat": 13.0329, "lng": 77.5274, "taluk": "Bengaluru North"},
        ],
        "urbanization": 0.95,
        "unemployment_rate": 0.082,
        "literacy_rate": 0.88,
        "population_density": 4381
    },
    "Mysuru": {
        "center": [12.2958, 76.6394],
        "stations": [
            {"name": "Devaraja PS", "lat": 12.3081, "lng": 76.6508, "taluk": "Mysuru Town"},
            {"name": "Saraswathipuram PS", "lat": 12.3045, "lng": 76.6265, "taluk": "Mysuru South"},
            {"name": "Nazarbad PS", "lat": 12.3112, "lng": 76.6661, "taluk": "Mysuru East"},
            {"name": "Vontikoppal PS", "lat": 12.3275, "lng": 76.6372, "taluk": "Mysuru North"},
        ],
        "urbanization": 0.72,
        "unemployment_rate": 0.095,
        "literacy_rate": 0.82,
        "population_density": 1210
    },
    "Mangaluru": {
        "center": [12.9141, 74.8560],
        "stations": [
            {"name": "Pandeshwar PS", "lat": 12.8622, "lng": 74.8391, "taluk": "Mangaluru South"},
            {"name": "Barke PS", "lat": 12.8770, "lng": 74.8366, "taluk": "Mangaluru Central"},
            {"name": "Urwa PS", "lat": 12.8901, "lng": 74.8335, "taluk": "Mangaluru West"},
            {"name": "Kadri PS", "lat": 12.8795, "lng": 74.8598, "taluk": "Mangaluru East"},
        ],
        "urbanization": 0.78,
        "unemployment_rate": 0.076,
        "literacy_rate": 0.90,
        "population_density": 1050
    },
    "Hubballi-Dharwad": {
        "center": [15.3647, 75.1240],
        "stations": [
            {"name": "Suburban PS", "lat": 15.3524, "lng": 75.1388, "taluk": "Hubballi Central"},
            {"name": "Vidyagiri PS", "lat": 15.4412, "lng": 75.0089, "taluk": "Dharwad Town"},
            {"name": "Town PS", "lat": 15.3611, "lng": 75.1211, "taluk": "Hubballi West"},
            {"name": "APMC PS", "lat": 15.3789, "lng": 75.1480, "taluk": "Hubballi East"},
        ],
        "urbanization": 0.65,
        "unemployment_rate": 0.110,
        "literacy_rate": 0.80,
        "population_density": 850
    },
    "Belagavi": {
        "center": [15.8497, 74.4977],
        "stations": [
            {"name": "Market PS", "lat": 15.8565, "lng": 74.5123, "taluk": "Belagavi Central"},
            {"name": "Camp PS", "lat": 15.8421, "lng": 74.4988, "taluk": "Belagavi Cantonment"},
            {"name": "Tilakwadi PS", "lat": 15.8350, "lng": 74.5050, "taluk": "Belagavi South"},
            {"name": "Khade Bazar PS", "lat": 15.8580, "lng": 74.5080, "taluk": "Belagavi North"},
        ],
        "urbanization": 0.58,
        "unemployment_rate": 0.105,
        "literacy_rate": 0.77,
        "population_density": 710
    },
    "Kalaburagi": {
        "center": [17.3297, 76.8343],
        "stations": [
            {"name": "Station Bazar PS", "lat": 17.3211, "lng": 76.8205, "taluk": "Kalaburagi Town"},
            {"name": "MBNagar PS", "lat": 17.3450, "lng": 76.8510, "taluk": "Kalaburagi East"},
            {"name": "Chowk PS", "lat": 17.3310, "lng": 76.8320, "taluk": "Kalaburagi Central"},
        ],
        "urbanization": 0.48,
        "unemployment_rate": 0.138,
        "literacy_rate": 0.68,
        "population_density": 520
    },
    "Shivamogga": {
        "center": [13.9299, 75.5681],
        "stations": [
            {"name": "Doddapete PS", "lat": 13.9325, "lng": 75.5712, "taluk": "Shivamogga Town"},
            {"name": "Tunga Nagar PS", "lat": 13.9450, "lng": 75.5890, "taluk": "Shivamogga North"},
            {"name": "Kote PS", "lat": 13.9210, "lng": 75.5610, "taluk": "Shivamogga South"},
        ],
        "urbanization": 0.52,
        "unemployment_rate": 0.092,
        "literacy_rate": 0.81,
        "population_density": 460
    },
    "Tumakuru": {
        "center": [13.3379, 77.1173],
        "stations": [
            {"name": "Town PS", "lat": 13.3412, "lng": 77.1021, "taluk": "Tumakuru Central"},
            {"name": "New Extension PS", "lat": 13.3520, "lng": 77.1180, "taluk": "Tumakuru North"},
            {"name": "Kyatsandra PS", "lat": 13.3280, "lng": 77.1420, "taluk": "Tumakuru East"},
        ],
        "urbanization": 0.45,
        "unemployment_rate": 0.088,
        "literacy_rate": 0.79,
        "population_density": 390
    },
    "Ballari": {
        "center": [15.1394, 76.9214],
        "stations": [
            {"name": "Brucepet PS", "lat": 15.1450, "lng": 76.9280, "taluk": "Ballari City"},
            {"name": "Cowl Bazar PS", "lat": 15.1310, "lng": 76.9150, "taluk": "Ballari South"},
            {"name": "Gandhinagar PS", "lat": 15.1520, "lng": 76.9380, "taluk": "Ballari North"},
        ],
        "urbanization": 0.51,
        "unemployment_rate": 0.125,
        "literacy_rate": 0.71,
        "population_density": 480
    },
    "Udupi": {
        "center": [13.3409, 74.7421],
        "stations": [
            {"name": "Town PS", "lat": 13.3420, "lng": 74.7470, "taluk": "Udupi Central"},
            {"name": "Manipal PS", "lat": 13.3525, "lng": 74.7870, "taluk": "Manipal"},
            {"name": "Malpe PS", "lat": 13.3580, "lng": 74.7040, "taluk": "Malpe Coastal"},
        ],
        "urbanization": 0.68,
        "unemployment_rate": 0.065,
        "literacy_rate": 0.92,
        "population_density": 620
    }
}

CRIME_TYPES = [
    {"type": "Chain Snatching", "peak_hours": [17, 18, 19, 20], "mo": ["Pillion rider snatching", "Gold chain targeted", "Black Pulsar bike used"]},
    {"type": "Cyber Crime / Online Fraud", "peak_hours": [10, 11, 14, 15, 16], "mo": ["Apk malware link", "OTP phishing", "Part-time job scam"]},
    {"type": "NDPS / Drug Trafficking", "peak_hours": [21, 22, 23, 0, 1], "mo": ["Synthetic MDMA packets", "Commercial quantity ganja", "College campus delivery"]},
    {"type": "Two-Wheeler Theft", "peak_hours": [1, 2, 3, 4, 22, 23], "mo": ["Master key bypass", "Handle lock forced", "Parked near metro station"]},
    {"type": "Commercial Burglary", "peak_hours": [2, 3, 4, 5], "mo": ["Shutter lock cutter", "CCTV wire tampered", "Jewellery & cash targeted"]},
    {"type": "Aggravated Assault", "peak_hours": [20, 21, 22, 23], "mo": ["Knife/Machete used", "Alchohol fueled altercation", "Group clash"]},
    {"type": "Domestic Violence / Harassment", "peak_hours": [19, 20, 21, 22], "mo": ["Dowry demand harassment", "Physical battery", "Repeated intimidation"]},
    {"type": "Extortion / Gang Activity", "peak_hours": [12, 13, 18, 19], "mo": ["Protection money threat", "Phone extortion call", "Weapons brandished"]}
]

# Named Gangs / Embedded Criminal Networks
CRIMINAL_NETWORKS = [
    {
        "gang_name": "Garuda Syndicate",
        "leader": "Ramesh @ Kali Ramesh",
        "members": ["Suresh @ Bullet", "Vicky @ Chotta", "Deepak @ Snake", "Mansoor @ Tiger"],
        "primary_mo": "Pillion rider snatching",
        "primary_districts": ["Bengaluru Urban", "Mysuru"]
    },
    {
        "gang_name": "Coastal Narcotics Ring",
        "leader": "Mohammed @ Don Raza",
        "members": ["Feroz @ Kutta", "Prashanth @ Jack", "Samson @ Darko"],
        "primary_mo": "Synthetic MDMA packets",
        "primary_districts": ["Mangaluru", "Udupi"]
    },
    {
        "gang_name": "Northern Shutter Busters",
        "leader": "Basavaraj @ Shutter Basu",
        "members": ["Yallappa @ Cutter", "Mallikarjun @ Chaddi", "Ganesh @ Iron"],
        "primary_mo": "Shutter lock cutter",
        "primary_districts": ["Hubballi-Dharwad", "Belagavi", "Kalaburagi"]
    }
]

# Bilingual FIR Text Templates
BILINGUAL_FIR_TEMPLATES = [
    "Complainant reported that on {date} at around {time}, while walking near {landmark}, two unknown miscreants arrived on a {vehicle} bearing fake registration plates. The pillion rider forcibly snatched gold chain weighing {weight} grams valued at Rs {amount}. Weapon seen: {weapon}. आरोपीಗಳ ವಿರುದ್ಧ KSP Section 304B/392 record clear.",
    "ಫಿರ್ಯಾದುದಾರರು {landmark} ಹತ್ತಿರ ಹೋಗುತ್ತಿದ್ದಾಗ {vehicle} ವಾಹನದಲ್ಲಿ ಬಂದ ಆರೋಪಿ {offender} ಅವರು {weapon} ತೋರಿಸಿ {amount} ರೂ ಮೌಲ್ಯದ ಚಿನ್ನದ ಸರ ಕಸಿದುಕೊಂಡು ಪರಾರಿಯಾಗಿದ್ದಾರೆ. Case registered under IPC 392/397 at {station}.",
    "Cyber fraud alert: Complainant received a phone call pretending to be KSP police officer. Sent fake APK file asking for bank OTP. Fradulent transfer of Rs {amount} executed to account belonging to {offender}. MO: {mo}.",
    "During night patrolling near {landmark}, police team intercepted suspect {offender} found carrying {weight} grams of {substance} stored in plastic covers. Co-accused {co_accused} escaped on a two-wheeler. NDPS Act case registered.",
    "Night commercial burglary at shop near {landmark}. Shutter lock broken using {weapon}. Cash of Rs {amount} and goods stolen. CCTV footage shows suspects identified as {offender} and {co_accused}. MO: {mo}."
]

WEAPONS = ["Machete (Long Knife)", "Iron Rod", "Pocket Knife", "Desi Katta Pistol", "None / Unarmed"]
VEHICLES = ["Black Pulsar 220", "Yamaha FZ Red", "Activa 6G White", "Auto Rickshaw", "No Vehicle"]
SUBSTANCES = ["MDMA Crystals", "Commercial Ganja", "Heroin Packets", "Ketamine Injection"]
LANDMARKS = ["Central Bus Stand", "Railway Station Road", "Industrial Area Gate 2", "Market Circle", "Main Highway Toll", "Residential 4th Cross"]
FIRST_NAMES = ["Ramesh", "Suresh", "Manjunath", "Venkatesh", "Abhishek", "Mohammed", "Pradeep", "Kiran", "Nagaraj", "Santosh", "Ganesh", "Syed"]
LAST_NAMES = ["Gowda", "Patil", "Shetty", "Kumar", "Rao", "Naik", "Khan", "Kulkarni", "Pujari", "Reddy", "Bhat"]

def generate_synthetic_firs(num_records=5500):
    np.random.seed(42)
    random.seed(42)
    
    start_date = datetime.datetime(2025, 1, 1)
    firs = []
    offenders_db = {}
    victims_db = {}
    
    # Generate pool of offenders
    for i in range(1, 400):
        offender_id = f"OFF-{1000 + i}"
        name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
        alias = f"{name.split()[0]} @ {random.choice(['Kali', 'Bullet', 'Snake', 'Don', 'Shorty', 'Chaddi', 'Machine', 'Tiger'])}"
        offenders_db[offender_id] = {
            "id": offender_id,
            "name": name,
            "alias": alias,
            "age": random.randint(20, 52),
            "prior_cases": random.randint(1, 14),
            "primary_mo": random.choice(CRIME_TYPES)["mo"][0]
        }
        
    # Generate pool of victims
    for i in range(1, 600):
        victim_id = f"VIC-{2000 + i}"
        name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
        victims_db[victim_id] = {
            "id": victim_id,
            "name": name,
            "gender": random.choice(["Male", "Female"]),
            "age": random.randint(19, 74),
            "is_repeat": random.random() < 0.12 # 12% repeat victims
        }

    # Generate FIR Records
    for i in range(1, num_records + 1):
        fir_no = f"FIR/KSP/{2025}/{10000 + i}"
        
        # Pick District based on realistic weight (Bengaluru Urban gets ~35%)
        district_names = list(DISTRICTS.keys())
        district_weights = [0.35, 0.12, 0.10, 0.09, 0.08, 0.07, 0.06, 0.05, 0.04, 0.04]
        district = np.random.choice(district_names, p=district_weights)
        dist_meta = DISTRICTS[district]
        station_info = random.choice(dist_meta["stations"])
        
        # Pick Crime Category
        crime = random.choice(CRIME_TYPES)
        crime_type = crime["type"]
        mo_tag = random.choice(crime["mo"])
        
        # Date & Time (simulate temporal peaks)
        days_offset = random.randint(0, 550) # last ~1.5 years
        if random.random() < 0.65: # 65% fall in peak hours
            hour = random.choice(crime["peak_hours"])
        else:
            hour = random.randint(0, 23)
        minute = random.randint(0, 59)
        incident_time = start_date + datetime.timedelta(days=days_offset, hours=hour, minutes=minute)
        
        # Coordinates jittered around station center
        # Embedded Hotspot Spikes for Peenya (Bengaluru) & Devaraja (Mysuru)
        if station_info["name"] == "Peenya PS" and random.random() < 0.40:
            lat = 13.0329 + np.random.normal(0, 0.003)
            lng = 77.5274 + np.random.normal(0, 0.003)
        elif station_info["name"] == "Devaraja PS" and random.random() < 0.35:
            lat = 12.3081 + np.random.normal(0, 0.002)
            lng = 76.6508 + np.random.normal(0, 0.002)
        else:
            lat = station_info["lat"] + np.random.normal(0, 0.015)
            lng = station_info["lng"] + np.random.normal(0, 0.015)

        # Offender assignment (Gang association vs random)
        gang_hit = None
        for gang in CRIMINAL_NETWORKS:
            if district in gang["primary_districts"] and random.random() < 0.25:
                gang_hit = gang
                break
                
        if gang_hit:
            offender_name = gang_hit["leader"]
            co_accused_list = random.sample(gang_hit["members"], k=random.randint(1, min(2, len(gang_hit["members"]))))
            offender_id = f"OFF-GANG-{gang_hit['gang_name'].replace(' ', '')}"
        else:
            off_key = random.choice(list(offenders_db.keys()))
            offender_name = offenders_db[off_key]["alias"]
            offender_id = off_key
            if random.random() < 0.30:
                co_key = random.choice(list(offenders_db.keys()))
                co_accused_list = [offenders_db[co_key]["name"]]
            else:
                co_accused_list = []
                
        vic_key = random.choice(list(victims_db.keys()))
        victim = victims_db[vic_key]
        
        weapon = random.choice(WEAPONS)
        vehicle = random.choice(VEHICLES)
        substance = random.choice(SUBSTANCES)
        landmark = random.choice(LANDMARKS)
        amount = random.randint(5000, 450000)
        weight = random.randint(10, 150)
        
        template = random.choice(BILINGUAL_FIR_TEMPLATES)
        narrative = template.format(
            date=incident_time.strftime("%Y-%m-%d"),
            time=incident_time.strftime("%H:%M"),
            landmark=landmark,
            vehicle=vehicle,
            weapon=weapon,
            amount=amount,
            weight=weight,
            offender=offender_name,
            co_accused=", ".join(co_accused_list) if co_accused_list else "Unknown",
            station=station_info["name"],
            mo=mo_tag,
            substance=substance
        )
        
        # Case Outcome Feedback Loop status
        outcomes = ["Under Investigation", "Charge Sheeted", "Convicted", "Acquitted / Closed"]
        outcome = np.random.choice(outcomes, p=[0.35, 0.40, 0.15, 0.10])
        
        # Anomaly score flag (unusual time or location pairing)
        is_anomaly = (hour in [3, 4] and crime_type == "Cyber Crime / Online Fraud") or \
                     (hour in [11, 12] and crime_type == "Commercial Burglary")
                     
        firs.append({
            "fir_number": fir_no,
            "district": district,
            "station": station_info["name"],
            "taluk": station_info["taluk"],
            "lat": round(float(lat), 6),
            "lng": round(float(lng), 6),
            "timestamp": incident_time.isoformat(),
            "date": incident_time.strftime("%Y-%m-%d"),
            "hour": hour,
            "day_of_week": incident_time.strftime("%A"),
            "crime_category": crime_type,
            "modus_operandi": mo_tag,
            "offender_id": offender_id,
            "offender_name": offender_name,
            "co_accused": co_accused_list,
            "victim_id": victim["id"],
            "victim_name": victim["name"],
            "victim_repeat": victim["is_repeat"],
            "weapon_extracted": weapon,
            "vehicle_extracted": vehicle,
            "fir_narrative": narrative,
            "case_outcome": outcome,
            "is_anomaly": is_anomaly,
            "urbanization": dist_meta["urbanization"],
            "unemployment_rate": dist_meta["unemployment_rate"],
            "literacy_rate": dist_meta["literacy_rate"],
            "population_density": dist_meta["population_density"]
        })
        
    df = pd.DataFrame(firs)
    return df, list(offenders_db.values()), list(victims_db.values()), CRIMINAL_NETWORKS

def generate_citizen_tips(num_tips=150):
    random.seed(42)
    np.random.seed(42)
    tips = []
    tip_categories = ["Suspicious Group Gathering", "Illicit Drug Sale", "Frequent Chain Snatching Spot", "Illegal Liquor Storage", "Unclaimed Vehicle"]
    
    district_list = list(DISTRICTS.keys())
    for i in range(1, num_tips + 1):
        dist = random.choice(district_list)
        st = random.choice(DISTRICTS[dist]["stations"])
        # Geo-fuzzed (rounded to 2 decimals or jittered) for privacy compliance
        fuzzed_lat = round(st["lat"] + np.random.uniform(-0.02, 0.02), 3)
        fuzzed_lng = round(st["lng"] + np.random.uniform(-0.02, 0.02), 3)
        
        tips.append({
            "tip_id": f"TIP-2025-{1000 + i}",
            "district": dist,
            "station": st["name"],
            "category": random.choice(tip_categories),
            "description": f"Anonymous citizen report of {random.choice(tip_categories).lower()} near {st['name']} jurisdiction.",
            "fuzzed_lat": fuzzed_lat,
            "fuzzed_lng": fuzzed_lng,
            "timestamp": (datetime.datetime.now() - datetime.timedelta(days=random.randint(0, 30))).isoformat(),
            "credibility_score": round(random.uniform(0.6, 0.98), 2)
        })
    return tips

if __name__ == "__main__":
    df, offenders, victims, gangs = generate_synthetic_firs(1000)
    print(f"Generated {len(df)} synthetic FIR records across {df['district'].nunique()} districts.")
    print("Sample FIR:\n", df.head(1).to_dict(orient="records")[0])
