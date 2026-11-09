import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

def generate_rental_id():
    return f"rent_{uuid.uuid4().hex[:8]}"

class Rental(Base):
    __tablename__ = "rentals"
    
    id = Column(String(32), primary_key=True, default=generate_rental_id)
    item_name = Column(String(255), nullable=False)
    category = Column(String(100), default="Electronics & Gear")
    renter_name = Column(String(255), nullable=False)
    renter_email = Column(String(255), nullable=False)
    owner_name = Column(String(255), nullable=False)
    owner_email = Column(String(255), nullable=False)
    
    # Financial terms
    rental_fee = Column(Float, nullable=False, default=0.0)
    deposit_amount = Column(Float, nullable=False, default=0.0)
    total_authorized = Column(Float, nullable=False, default=0.0)
    currency = Column(String(10), default="USD")
    
    # Status progression:
    # DRAFT -> AUTHORIZED -> ACTIVE -> RETURNED -> INSPECTED -> OWNER_REVIEW -> SETTLED (or DISPUTED)
    status = Column(String(50), default="AUTHORIZED")
    
    # Photo proofs
    before_image_url = Column(String(500), nullable=True)
    after_image_url = Column(String(500), nullable=True)
    
    # Settlement financial outcomes
    proposed_deduction = Column(Float, default=0.0)     # Calculated by Gemini Vision
    approved_deduction = Column(Float, default=0.0)     # Decided/Edited by Owner
    captured_amount = Column(Float, default=0.0)        # Rental Fee + Approved Deduction
    refunded_amount = Column(Float, default=0.0)        # Deposit - Approved Deduction (Released)
    
    owner_notes = Column(Text, nullable=True)
    renter_notes = Column(Text, nullable=True)
    
    # PayPal Sandbox tracking
    paypal_order_id = Column(String(100), nullable=True)
    paypal_authorization_id = Column(String(100), nullable=True)
    paypal_capture_id = Column(String(100), nullable=True)
    paypal_void_id = Column(String(100), nullable=True)
    paypal_auth_status = Column(String(50), nullable=True)
    paypal_raw_auth = Column(JSON, nullable=True)
    paypal_raw_capture = Column(JSON, nullable=True)
    paypal_raw_void = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    settled_at = Column(DateTime, nullable=True)
    
    # Relationships
    findings = relationship("InspectionFinding", back_populates="rental", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="rental", order_by="ActivityLog.timestamp.desc()", cascade="all, delete-orphan")

class InspectionFinding(Base):
    __tablename__ = "inspection_findings"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    rental_id = Column(String(32), ForeignKey("rentals.id"), nullable=False)
    
    item_part = Column(String(150), nullable=False)        # e.g., "Front Lens Element", "Body Chassis"
    damage_type = Column(String(100), nullable=False)      # "Scratch", "Dent", "Crack", "Scuff", "Wear and Tear"
    severity = Column(String(50), nullable=False)          # "None", "Minor", "Moderate", "Severe"
    confidence = Column(Float, nullable=False, default=0.85) # 0.0 - 1.0
    description = Column(Text, nullable=False)
    
    # Monetary estimates
    estimated_repair_cost = Column(Float, default=0.0)
    proposed_deduction = Column(Float, default=0.0)
    
    # Owner adjudication
    owner_decision = Column(String(50), default="PENDING") # PENDING, APPROVED, ADJUSTED, REJECTED
    owner_adjusted_amount = Column(Float, nullable=True)
    
    # Coordinates / visual locator (normalized 0-100% or bounding box)
    bounding_box = Column(JSON, nullable=True) # {x: 42, y: 35, width: 20, height: 15}
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    rental = relationship("Rental", back_populates="findings")

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    rental_id = Column(String(32), ForeignKey("rentals.id"), nullable=False)
    
    actor = Column(String(50), nullable=False)  # "SYSTEM", "RENTER", "OWNER", "PAYPAL", "GEMINI_AI"
    action = Column(String(100), nullable=False) # e.g., "AUTHORIZATION_CREATED", "AI_INSPECTION_RUN", etc.
    message = Column(Text, nullable=False)
    metadata_json = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    rental = relationship("Rental", back_populates="activity_logs")
