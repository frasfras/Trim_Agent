"""
SMS Agent Tool
Google ADK sub-agent that sends SMS notifications via UniSMS API.
Designed to be used as an AgentTool by the root Gate_Agent in agent.py.
"""

import os
import requests
from requests.auth import HTTPBasicAuth

from google.adk.agents import LlmAgent
from google.adk.tools import FunctionTool
from dotenv import load_dotenv

load_dotenv()

# ─────────────────────────── SMS TOOL ─────────────────────────────────────────

UNISMS_API_KEY = os.getenv(
    "UNISMS_API_KEY",
    "sk_NN9DfsDtlOMYijDmym2t2LydeAMeJixm85fmRWT2gHULcLkUqgpWn4BGd38rntzIk2IZ70GSpoz-vcmA65rjJg-1486",
)
UNISMS_SENDER_ID = os.getenv("UNISMS_SENDER_ID", "YardOS")


def send_sms(recipient: str, message: str) -> dict:
    """Send an SMS message to a phone number via UniSMS.

    Args:
        recipient: Phone number in E.164 format, e.g. '+639531071359'.
        message:   Text content of the SMS (max 160 chars per segment).

    Returns:
        dict with keys:
          - success (bool): True if the SMS was accepted by the API.
          - status_code (int): HTTP status code from UniSMS.
          - response (dict): Raw API response body.
          - error (str): Error message if success is False.
    """
    try:
        resp = requests.post(
            "https://unismsapi.com/api/sms",
            json={
                "recipient": recipient,
                "content": message,
                "sender_id": UNISMS_SENDER_ID,
            },
            auth=HTTPBasicAuth(UNISMS_API_KEY, ""),
            headers={"Content-Type": "application/json"},
            timeout=10,
        )
        body = resp.json() if resp.content else {}
        return {
            "success": resp.status_code in (200, 201, 202),
            "status_code": resp.status_code,
            "response": body,
            "error": "" if resp.ok else body.get("message", resp.text),
        }
    except requests.RequestException as exc:
        return {
            "success": False,
            "status_code": 0,
            "response": {},
            "error": str(exc),
        }


# ─────────────────────────── SMS AGENT ────────────────────────────────────────

sms_agent = LlmAgent(
    name="SMS_Agent",
    model="gemini-2.5-flash",
    description=(
        "Agent that sends SMS notifications to drivers, dispatchers, or "
        "operations staff via UniSMS. Use this agent whenever a notification "
        "needs to be sent by text message, such as gate-in confirmation, dock "
        "assignment, incident alert, or rerouting instruction."
    ),
    instruction="""You are an SMS Notification Agent for YardOS yard operations.

Your only job is to send SMS messages using the send_sms tool.

## When to Send SMS

You will be called by the Gate Agent or other agents when they need to notify:
- Drivers   — gate-in confirmation, dock assignment, parking slot, wait time
- Dispatchers — incidents, congestion alerts, rerouting decisions
- Operations staff — critical alerts, vehicle breakdown, hazmat flag

## Message Formatting Rules

Keep messages short and operational (under 160 characters when possible).


## Rules
- Always call send_sms with the exact recipient number and composed message.
- If recipient number is missing, report it and do not send.
- Confirm the result: "SMS sent to {recipient}" or "SMS failed: {error}".
- Never include sensitive data (passwords, keys) in SMS content.
- Database / collection access is NOT your responsibility — only SMS sending.
""",
    tools=[FunctionTool(func=send_sms)],
)
