# schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List

# --- Interaction Schemas ---
class InteractionBase(BaseModel):
    interaction_type: str = "Meeting"
    date: Optional[str] = None
    time: Optional[str] = None
    attendees: Optional[str] = None
    topics_discussed: Optional[str] = None
    materials_shared: Optional[str] = None
    samples_distributed: Optional[str] = None
    sentiment: str = "Neutral"
    outcomes: Optional[str] = None
    follow_up_actions: Optional[str] = None
    ai_suggested_followups: Optional[str] = None

class InteractionCreate(InteractionBase):
    hcp_id: int

class InteractionResponse(InteractionBase):
    id: int
    hcp_id: int

    class Config:
        from_attributes = True

# --- HCP Schemas ---
class HCPBase(BaseModel):
    name: str
    specialty: str
    hospital_affinity: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

class HCPCreate(HCPBase):
    pass

class HCPResponse(HCPBase):
    id: int
    interactions: List[InteractionResponse] = []

    class Config:
        from_attributes = True