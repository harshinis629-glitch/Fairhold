from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

# ----------------- Findings Schemas -----------------
class FindingBase(BaseModel):
    item_part: str
    damage_type: str
    severity: str
    confidence: float
    description: str
    estimated_repair_cost: float
    proposed_deduction: float
    bounding_box: Optional[Dict[str, Any]] = None

class FindingCreate(FindingBase):
    pass

class FindingDecisionUpdate(BaseModel):
    finding_id: int
    owner_decision: str = Field(..., description="APPROVED, ADJUSTED, or REJECTED")
    owner_adjusted_amount: Optional[float] = None

class FindingResponse(FindingBase):
    id: int
    rental_id: str
    owner_decision: str
    owner_adjusted_amount: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Activity Log Schemas -----------------
class ActivityLogResponse(BaseModel):
    id: int
    rental_id: str
    actor: str
    action: str
    message: str
    metadata_json: Optional[Dict[str, Any]] = None
    timestamp: datetime

    class Config:
        from_attributes = True

# ----------------- Rental Schemas -----------------
class RentalCreate(BaseModel):
    item_name: str
    category: Optional[str] = "Electronics & Gear"
    renter_name: str
    renter_email: str
    owner_name: str
    owner_email: str
    rental_fee: float = Field(..., gt=0)
    deposit_amount: float = Field(..., gt=0)
    currency: Optional[str] = "USD"
    before_image_url: Optional[str] = None
    after_image_url: Optional[str] = None

class RentalResponse(BaseModel):
    id: str
    item_name: str
    category: str
    renter_name: str
    renter_email: str
    owner_name: str
    owner_email: str
    rental_fee: float
    deposit_amount: float
    total_authorized: float
    currency: str
    status: str
    before_image_url: Optional[str] = None
    after_image_url: Optional[str] = None
    proposed_deduction: float
    approved_deduction: float
    captured_amount: float
    refunded_amount: float
    owner_notes: Optional[str] = None
    renter_notes: Optional[str] = None
    
    # PayPal tracking
    paypal_order_id: Optional[str] = None
    paypal_authorization_id: Optional[str] = None
    paypal_capture_id: Optional[str] = None
    paypal_void_id: Optional[str] = None
    paypal_auth_status: Optional[str] = None
    paypal_raw_auth: Optional[Dict[str, Any]] = None
    paypal_raw_capture: Optional[Dict[str, Any]] = None
    paypal_raw_void: Optional[Dict[str, Any]] = None
    
    created_at: datetime
    updated_at: datetime
    settled_at: Optional[datetime] = None
    
    findings: List[FindingResponse] = []
    activity_logs: List[ActivityLogResponse] = []

    class Config:
        from_attributes = True

# ----------------- Review & Settlement -----------------
class OwnerReviewSubmission(BaseModel):
    finding_decisions: List[FindingDecisionUpdate]
    owner_notes: Optional[str] = ""

class SettlementExecuteRequest(BaseModel):
    confirm_settlement: bool = True
    renter_notes: Optional[str] = None

class DisputeRequest(BaseModel):
    renter_notes: str
    dispute_reason: str

# ----------------- System & AI Status -----------------
class SystemStatusResponse(BaseModel):
    paypal_configured: bool
    gemini_configured: bool
    paypal_mode: str
    paypal_base_url: str
    project_name: str
    version: str

class InspectionAnalysisResult(BaseModel):
    item_name: str
    findings: List[FindingCreate]
    total_proposed_deduction: float
    summary: str
    confidence_overall: float
    is_ai_generated: bool
