import os
from pathlib import Path
from datetime import datetime, timedelta
from PIL import Image, ImageDraw, ImageFont
from sqlalchemy.orm import Session
from app.models import Rental, InspectionFinding, ActivityLog
from app.config import settings

def create_sample_images():
    """Generate visual before and after comparison images for rental items."""
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    
    # 1. Sony FX3 Lens Before (Pristine)
    fx3_before_path = settings.UPLOAD_DIR / "sony_fx3_before.jpg"
    if not fx3_before_path.exists():
        img = Image.new("RGB", (800, 600), color=(24, 28, 36))
        draw = ImageDraw.Draw(img)
        # Draw camera body
        draw.rounded_rectangle([150, 100, 650, 500], radius=30, fill=(35, 40, 50), outline=(60, 70, 85), width=4)
        # Draw lens ring
        draw.ellipse([275, 175, 525, 425], fill=(15, 20, 25), outline=(120, 130, 145), width=8)
        draw.ellipse([310, 210, 490, 390], fill=(20, 35, 45), outline=(70, 160, 220), width=4)
        draw.ellipse([345, 245, 455, 355], fill=(10, 18, 25), outline=(40, 100, 160), width=3)
        # Pristine reflection
        draw.arc([330, 230, 470, 370], start=210, end=270, fill=(180, 225, 255), width=4)
        # Labels
        draw.text((180, 130), "SONY FX3 CINEMA LINE // SERIAL #FX3-882194", fill=(140, 155, 175))
        draw.text((320, 440), "G-MASTER 24-70mm F2.8", fill=(100, 115, 135))
        draw.text((40, 40), "[BASELINE CONDITION - BEFORE RENTAL]", fill=(16, 185, 129))
        img.save(fx3_before_path, "JPEG", quality=90)

    # 2. Sony FX3 Lens After (With Scratch & Scuff)
    fx3_after_path = settings.UPLOAD_DIR / "sony_fx3_after.jpg"
    if not fx3_after_path.exists():
        img = Image.new("RGB", (800, 600), color=(24, 28, 36))
        draw = ImageDraw.Draw(img)
        # Draw camera body
        draw.rounded_rectangle([150, 100, 650, 500], radius=30, fill=(35, 40, 50), outline=(60, 70, 85), width=4)
        # Draw lens ring
        draw.ellipse([275, 175, 525, 425], fill=(15, 20, 25), outline=(120, 130, 145), width=8)
        draw.ellipse([310, 210, 490, 390], fill=(20, 35, 45), outline=(70, 160, 220), width=4)
        draw.ellipse([345, 245, 455, 355], fill=(10, 18, 25), outline=(40, 100, 160), width=3)
        # Pristine reflection
        draw.arc([330, 230, 470, 370], start=210, end=270, fill=(180, 225, 255), width=4)
        # VISIBLE NEW SCRATCH on front element
        draw.line([(380, 260), (430, 310)], fill=(244, 63, 94), width=4)
        draw.line([(428, 308), (445, 318)], fill=(244, 63, 94), width=3)
        # Damage highlight box
        draw.rectangle([370, 250, 455, 330], outline=(239, 68, 68), width=2)
        draw.text((375, 230), "DAMAGE: Scratch", fill=(239, 68, 68))
        # Lower scuff
        draw.rectangle([480, 440, 560, 465], fill=(55, 60, 70), outline=(245, 158, 11), width=2)
        draw.text((485, 470), "SCUFF", fill=(245, 158, 11))
        # Labels
        draw.text((180, 130), "SONY FX3 CINEMA LINE // SERIAL #FX3-882194", fill=(140, 155, 175))
        draw.text((320, 440), "G-MASTER 24-70mm F2.8", fill=(100, 115, 135))
        draw.text((40, 40), "[RETURN CONDITION - AFTER RENTAL]", fill=(239, 68, 68))
        img.save(fx3_after_path, "JPEG", quality=90)

    # 3. DJI Mavic 3 Drone Before (Pristine)
    drone_before_path = settings.UPLOAD_DIR / "drone_before.jpg"
    if not drone_before_path.exists():
        img = Image.new("RGB", (800, 600), color=(20, 25, 35))
        draw = ImageDraw.Draw(img)
        # Drone fuselage
        draw.rounded_rectangle([300, 180, 500, 420], radius=40, fill=(45, 52, 65), outline=(75, 85, 105), width=4)
        # Rotor arms
        draw.line([(220, 130), (330, 220)], fill=(65, 75, 95), width=16)
        draw.line([(580, 130), (470, 220)], fill=(65, 75, 95), width=16)
        draw.line([(220, 470), (330, 380)], fill=(65, 75, 95), width=16)
        draw.line([(580, 470), (470, 380)], fill=(65, 75, 95), width=16)
        # Propellers
        draw.ellipse([180, 90, 260, 170], outline=(100, 115, 135), width=4)
        draw.ellipse([540, 90, 620, 170], outline=(100, 115, 135), width=4)
        draw.ellipse([180, 430, 260, 510], outline=(100, 115, 135), width=4)
        draw.ellipse([540, 430, 620, 510], outline=(100, 115, 135), width=4)
        draw.text((40, 40), "[BASELINE CONDITION - BEFORE RENTAL]", fill=(16, 185, 129))
        draw.text((320, 280), "DJI MAVIC 3 PRO", fill=(200, 210, 225))
        img.save(drone_before_path, "JPEG", quality=90)

    # 4. DJI Mavic 3 Drone After (Cracked Rotor Arm)
    drone_after_path = settings.UPLOAD_DIR / "drone_after.jpg"
    if not drone_after_path.exists():
        img = Image.new("RGB", (800, 600), color=(20, 25, 35))
        draw = ImageDraw.Draw(img)
        # Drone fuselage
        draw.rounded_rectangle([300, 180, 500, 420], radius=40, fill=(45, 52, 65), outline=(75, 85, 105), width=4)
        # Rotor arms
        draw.line([(220, 130), (330, 220)], fill=(65, 75, 95), width=16)
        # Broken/bent rotor arm
        draw.line([(580, 150), (470, 220)], fill=(85, 65, 70), width=16)
        # Stress fracture lines
        draw.line([(515, 180), (530, 205)], fill=(239, 68, 68), width=4)
        draw.line([(525, 195), (540, 185)], fill=(239, 68, 68), width=3)
        draw.rectangle([495, 160, 560, 225], outline=(239, 68, 68), width=2)
        draw.text((500, 140), "CRACK / STRESS", fill=(239, 68, 68))
        # Rotor arms lower
        draw.line([(220, 470), (330, 380)], fill=(65, 75, 95), width=16)
        draw.line([(580, 470), (470, 380)], fill=(65, 75, 95), width=16)
        # Propellers
        draw.ellipse([180, 90, 260, 170], outline=(100, 115, 135), width=4)
        draw.ellipse([540, 110, 620, 190], outline=(239, 68, 68), width=4)
        draw.ellipse([180, 430, 260, 510], outline=(100, 115, 135), width=4)
        draw.ellipse([540, 430, 620, 510], outline=(100, 115, 135), width=4)
        draw.text((40, 40), "[RETURN CONDITION - AFTER RENTAL]", fill=(239, 68, 68))
        draw.text((320, 280), "DJI MAVIC 3 PRO", fill=(200, 210, 225))
        img.save(drone_after_path, "JPEG", quality=90)

def seed_database(db: Session):
    """Seed ready-to-demo rentals showcasing each state of the Fairhold pipeline."""
    create_sample_images()
    
    existing = db.query(Rental).first()
    if existing:
        return

    now = datetime.utcnow()

    # Rental 1: Sony FX3 Kit - In OWNER_REVIEW stage (AI findings ready for owner review/approval)
    r1 = Rental(
        id="rent_fx3cinema",
        item_name="Sony FX3 Full-Frame Cinema Camera & 24-70mm GM Lens",
        category="Camera & Cinema Optics",
        renter_name="Alex Mercer",
        renter_email="alex.mercer@filmmakers.io",
        owner_name="Apex Cine Rentals LLC",
        owner_email="rentals@apexcine.com",
        rental_fee=180.00,
        deposit_amount=500.00,
        total_authorized=680.00,
        currency="USD",
        status="OWNER_REVIEW",
        before_image_url="/uploads/sony_fx3_before.jpg",
        after_image_url="/uploads/sony_fx3_after.jpg",
        proposed_deduction=140.00,
        approved_deduction=125.00,
        captured_amount=0.0,
        refunded_amount=0.0,
        owner_notes="Agreed with Gemini AI analysis on the front optic coating scratch ($125). Waived the minor baseplate rub as reasonable production wear.",
        paypal_order_id="ORD-78192038194",
        paypal_authorization_id="AUTH-9X3810294812",
        paypal_auth_status="AUTHORIZED",
        created_at=now - timedelta(days=3),
        updated_at=now - timedelta(hours=2)
    )

    f1 = InspectionFinding(
        rental_id=r1.id,
        item_part="Front Lens Element Coating",
        damage_type="Scratch",
        severity="Moderate",
        confidence=0.94,
        description="Visible 14mm radial surface scratch across front anti-reflective optical coating. Absent in baseline photo.",
        estimated_repair_cost=160.00,
        proposed_deduction=125.00,
        owner_decision="APPROVED",
        owner_adjusted_amount=125.00,
        bounding_box={"x": 48, "y": 42, "width": 16, "height": 16}
    )

    f2 = InspectionFinding(
        rental_id=r1.id,
        item_part="Lower Baseplate Mount",
        damage_type="Scuff",
        severity="Minor",
        confidence=0.88,
        description="Surface rub on tripod quick-release contact edge. Superficial paint wear.",
        estimated_repair_cost=30.00,
        proposed_deduction=15.00,
        owner_decision="REJECTED",
        owner_adjusted_amount=0.0,
        bounding_box={"x": 62, "y": 74, "width": 14, "height": 10}
    )

    log1 = ActivityLog(
        rental_id=r1.id,
        actor="PAYPAL",
        action="AUTHORIZATION_CREATED",
        message="PayPal Sandbox authorization created for $680.00 USD ($180.00 rental fee + $500.00 deposit). Auth ID: AUTH-9X3810294812.",
        timestamp=now - timedelta(days=3)
    )
    log2 = ActivityLog(
        rental_id=r1.id,
        actor="RENTER",
        action="RETURN_PHOTOS_UPLOADED",
        message="Renter Alex Mercer uploaded return condition verification photos.",
        timestamp=now - timedelta(hours=4)
    )
    log3 = ActivityLog(
        rental_id=r1.id,
        actor="GEMINI_AI",
        action="AI_INSPECTION_RUN",
        message="Gemini Vision completed comparative analysis: 2 findings detected with 93% average confidence. Proposed deduction: $140.00.",
        timestamp=now - timedelta(hours=3, minutes=45)
    )
    log4 = ActivityLog(
        rental_id=r1.id,
        actor="OWNER",
        action="DEDUCTION_MODIFIED",
        message="Owner reviewed findings: Approved $125.00 for lens scratch, waived $15.00 baseplate wear. Net approved deduction: $125.00.",
        timestamp=now - timedelta(hours=2)
    )

    db.add(r1)
    db.add(f1)
    db.add(f2)
    db.add(log1)
    db.add(log2)
    db.add(log3)
    db.add(log4)

    # Rental 2: DJI Mavic 3 Pro - In ACTIVE / INSPECTED state ready for Owner Review
    r2 = Rental(
        id="rent_djimavic",
        item_name="DJI Mavic 3 Pro Cine Drone Combo + Fly More Kit",
        category="Drones & Aerial",
        renter_name="Jordan Cole",
        renter_email="jordan.c@skymedia.net",
        owner_name="Elevate Drone Fleet",
        owner_email="fleet@elevatedrones.com",
        rental_fee=220.00,
        deposit_amount=600.00,
        total_authorized=820.00,
        currency="USD",
        status="INSPECTED",
        before_image_url="/uploads/drone_before.jpg",
        after_image_url="/uploads/drone_after.jpg",
        proposed_deduction=175.00,
        approved_deduction=0.0,
        paypal_order_id="ORD-9938102847",
        paypal_authorization_id="AUTH-7V8829104921",
        paypal_auth_status="AUTHORIZED",
        created_at=now - timedelta(days=2),
        updated_at=now - timedelta(hours=1)
    )

    f3 = InspectionFinding(
        rental_id=r2.id,
        item_part="Rear Right Rotor Arm & Propeller",
        damage_type="Crack",
        severity="Severe",
        confidence=0.96,
        description="Structural fracture on composite carbon fiber rotor arm mount and nicked rotor blade edge.",
        estimated_repair_cost=185.00,
        proposed_deduction=175.00,
        owner_decision="PENDING",
        bounding_box={"x": 68, "y": 32, "width": 22, "height": 20}
    )

    log5 = ActivityLog(
        rental_id=r2.id,
        actor="PAYPAL",
        action="AUTHORIZATION_CREATED",
        message="PayPal Sandbox authorization created for $820.00 USD ($220.00 rental fee + $600.00 deposit).",
        timestamp=now - timedelta(days=2)
    )
    log6 = ActivityLog(
        rental_id=r2.id,
        actor="GEMINI_AI",
        action="AI_INSPECTION_RUN",
        message="Gemini Vision detected 1 severe rotor arm crack. Proposed damage deduction: $175.00 USD.",
        timestamp=now - timedelta(hours=1)
    )

    db.add(r2)
    db.add(f3)
    db.add(log5)
    db.add(log6)

    # Rental 3: Settled Rental (Complete Lifecycle demonstration)
    r3 = Rental(
        id="rent_leicamm",
        item_name="Leica M11 Rangefinder Body (Black Finish)",
        category="Luxury Cameras",
        renter_name="Sophia Martinez",
        renter_email="sophia@urbanframes.org",
        owner_name="Collector Vault Studio",
        owner_email="vault@collectorstudio.com",
        rental_fee=250.00,
        deposit_amount=1000.00,
        total_authorized=1250.00,
        currency="USD",
        status="SETTLED",
        before_image_url="/uploads/sony_fx3_before.jpg",
        after_image_url="/uploads/sony_fx3_before.jpg",
        proposed_deduction=0.0,
        approved_deduction=0.0,
        captured_amount=250.00,
        refunded_amount=1000.00,
        owner_notes="Pristine condition upon return! 100% of security deposit released immediately.",
        paypal_order_id="ORD-44829103819",
        paypal_authorization_id="AUTH-3M991827401",
        paypal_capture_id="CAP-5K881920381",
        paypal_void_id="VOID-3M991827401",
        paypal_auth_status="CAPTURED_AND_VOIDED",
        settled_at=now - timedelta(days=1),
        created_at=now - timedelta(days=5),
        updated_at=now - timedelta(days=1)
    )

    log7 = ActivityLog(
        rental_id=r3.id,
        actor="PAYPAL",
        action="SETTLEMENT_EXECUTED",
        message="PayPal Captured $250.00 (Rental Fee). Remaining $1,000.00 deposit authorization VOIDED and released to renter.",
        timestamp=now - timedelta(days=1)
    )
    db.add(r3)
    db.add(log7)

    db.commit()
