# models.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
import datetime
from database import Base

class HCPProfile(Base):
    __tablename__ = "hcp_profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    specialty = Column(String, index=True)
    hospital_affinity = Column(String)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    
    interactions = relationship("Interaction", back_populates="hcp", cascade="all, delete-orphan")

class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    hcp_id = Column(Integer, ForeignKey("hcp_profiles.id"), nullable=False)
    interaction_type = Column(String, default="Meeting") # Meeting, Call, Email, etc.
    date = Column(String, nullable=True)                  # e.g., "19-04-2025"
    time = Column(String, nullable=True)                  # e.g., "19:36"
    attendees = Column(Text, nullable=True)               # Comma-separated names
    topics_discussed = Column(Text, nullable=True)
    materials_shared = Column(Text, nullable=True)        # JSON or string representation
    samples_distributed = Column(Text, nullable=True)
    sentiment = Column(String, default="Neutral")         # Positive, Neutral, Negative
    outcomes = Column(Text, nullable=True)
    follow_up_actions = Column(Text, nullable=True)
    ai_suggested_followups = Column(Text, nullable=True)  # Populated via LangGraph agent tool

    hcp = relationship("HCPProfile", back_populates="interactions")