import json
import re
import os  # Added to prevent the environment crash
from typing import TypedDict, Optional
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, END

# CRITICAL FIX: Paste your copied Groq key here to prevent the GroqError on reload
os.environ["GROQ_API_KEY"] = "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"

# 1. Define the Graph State Structure
class AgentState(TypedDict):
    user_message: str
    current_hcp_id: int
    agent_response: Optional[str]
    extracted_data: Optional[dict]

# 2. Main Structured Extraction Tool
def tool_1_log_interaction(user_text: str):
    """Parses user input using an explicit systemic JSON template format."""
    # Using the active, fully supported Llama 3.1 model
    llm = ChatGroq(model_name="llama-3.1-8b-instant", temperature=0.0)
    
    prompt = f"""
    You are an AI assistant designed to extract structured data from a medical representative's field notes.
    Analyze the following user input and extract the relevant CRM fields.
    
    CRITICAL: You must return ONLY a valid, raw JSON object. Do not include markdown code block syntax (like ```json), intro text, or conversational explanations.
    
    Required JSON Format: {{
        "interaction_type": "Meeting",
        "attendees": "Names of clinicians/doctors found",
        "topics_discussed": "Summary of products/details discussed",
        "materials_shared": "Any pamphlets, trials brochures mentioned",
        "samples_distributed": "Samples mentioned",
        "sentiment": "Positive",
        "outcomes": "Action items or summary of agreement details"
    }}
    
    User Note: "{user_text}"
    """
    
    try:
        ai_msg = llm.invoke(prompt)
        text_content = ai_msg.content.strip()
        
        # Strip away markdown wrappers if the model returns them
        text_content = re.sub(r"^```json\s*", "", text_content)
        text_content = re.sub(r"^```\s*", "", text_content)
        text_content = re.sub(r"\s*```$", "", text_content)
        
        extracted_fields = json.loads(text_content)
        return {
            "status": "success",
            "data": extracted_fields
        }
    except Exception as e:
        print(f"Extraction processing mismatch: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

# 3. Graph Orchestrator Node
def agent_orchestrator(state: AgentState):
    """The brain node evaluating user chats and mapping actions."""
    user_input = state["user_message"]

    # Call our extraction engine
    log_result = tool_1_log_interaction(user_input)
    
    if log_result["status"] == "success":
        extracted = log_result["data"]
        
        response_msg = (
            f"Successfully Logged via LangGraph!\n\n"
            f"• Type: {extracted.get('interaction_type')}\n"
            f"• Sentiment: {extracted.get('sentiment')}\n"
            f"• Outcomes: {extracted.get('outcomes')}"
        )
        
        return {
            **state,
            "agent_response": response_msg,
            "extracted_data": extracted
        }
    
    return {
        **state, 
        "agent_response": "I couldn't parse the details securely. Please try again with more details.",
        "extracted_data": {}
    }

# 4. Build and Compile the LangGraph Workflow
workflow = StateGraph(AgentState)
workflow.add_node("agent_node", agent_orchestrator)
workflow.set_entry_point("agent_node")
workflow.add_edge("agent_node", END)

crm_agent_app = workflow.compile()