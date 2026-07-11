from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import engine, get_db
from agent import crm_agent_app

# Create database tables automatically
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI CRM for HCP Backend")

# CORS middleware initialization to unlock the React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "AI CRM HCP Backend is up and running successfully!"}

# --- THE MISSING ROUTE THAT FIXES THE 404 ERROR ---
@app.post("/agent/chat")
def run_crm_ai_agent(message: str, hcp_id: int = 1):
    initial_state = {
        "user_message": message,
        "chat_history": [],
        "extracted_data": {},
        "agent_response": "",
        "current_hcp_id": hcp_id
    }
    output = crm_agent_app.invoke(initial_state)
    return {
        "response": output["agent_response"],
        "extracted_fields": output["extracted_data"]
    }