import base64
import json
import logging
import mimetypes
from pathlib import Path
from typing import Dict, Any, List, Optional
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

SYSTEM_INSPECTION_PROMPT = """
You are Fairhold's expert forensic rental inspection AI. Your role is to inspect and compare BEFORE and AFTER photos of rented items (cameras, drones, high-end electronics, sports gear, designer items).

TASK:
1. Compare the Baseline Condition (Image 1: BEFORE rental) against the Return Condition (Image 2: AFTER rental).
2. Carefully identify any NEW damage that was NOT present in Image 1 (BEFORE):
   - Scratches, chips, dents, cracks, gouges, deep scuffs, lens abrasions, structural bends, broken clips/hinges.
   - Distinguish between normal expected micro-wear vs noticeable damage requiring repair or deposit deduction.
3. For each finding, output strict JSON with:
   - "item_part": Specific component affected (e.g., "Front lens coating", "Right drone propeller", "Rear carbon frame")
   - "damage_type": Scratch, Dent, Crack, Scuff, Chip, or Normal Wear
   - "severity": "Minor", "Moderate", "Severe", or "None"
   - "confidence": Float between 0.0 and 1.0 (e.g. 0.94)
   - "description": Explicit description comparing before vs after appearance
   - "estimated_repair_cost": Dollar amount to restore or replace
   - "proposed_deduction": Recommended fair deduction from security deposit (must not exceed estimated repair cost)
   - "bounding_box": {"x": percentage_x_0_to_100, "y": percentage_y_0_to_100, "width": percentage_w, "height": percentage_h}

OUTPUT FORMAT:
Return ONLY valid JSON matching this structure:
{
  "summary": "Brief executive summary of findings",
  "confidence_overall": 0.95,
  "total_proposed_deduction": 120.00,
  "findings": [
    {
      "item_part": "Front Lens Element",
      "damage_type": "Scratch",
      "severity": "Moderate",
      "confidence": 0.92,
      "description": "Noticeable 1.2cm linear surface scratch on front anti-reflective glass coating, not visible in baseline photo.",
      "estimated_repair_cost": 150.00,
      "proposed_deduction": 120.00,
      "bounding_box": {"x": 45, "y": 40, "width": 18, "height": 18}
    }
  ]
}
If no damage is detected, return an empty "findings" list and total_proposed_deduction = 0.00.
"""

def image_to_base64_data_uri(file_path: Path) -> tuple[str, str]:
    mime_type, _ = mimetypes.guess_type(str(file_path))
    if not mime_type:
        mime_type = "image/jpeg"
    with open(file_path, "rb") as f:
        encoded = base64.b64encode(f.read()).decode("utf-8")
    return mime_type, encoded

class GeminiVisionService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY

    async def inspect_damage(
        self,
        before_image_path: Path,
        after_image_path: Path,
        item_name: str = "Rental Item",
        category: str = "Electronics"
    ) -> Dict[str, Any]:
        """
        Compare before and after photos using Gemini Vision API.
        If API key is not configured, fallback to an intelligent demo inspection.
        """
        if not settings.is_gemini_configured:
            logger.warning("GEMINI_API_KEY not configured or placeholder used. Using high-fidelity demo inspection.")
            return self._generate_fallback_inspection(item_name, category)

        try:
            return await self._call_gemini_api(before_image_path, after_image_path, item_name)
        except Exception as e:
            logger.error(f"Error calling Gemini Vision API: {e}. Falling back to demo inspection.")
            result = self._generate_fallback_inspection(item_name, category)
            result["warning"] = f"Gemini API request note: {str(e)[:120]}. Displaying demo inspection results."
            return result

    async def _call_gemini_api(
        self,
        before_path: Path,
        after_path: Path,
        item_name: str
    ) -> Dict[str, Any]:
        """
        Call Gemini REST API directly with inline base64 image data.
        Supports gemini-1.5-flash / gemini-2.0-flash with JSON mode.
        """
        mime_before, b64_before = image_to_base64_data_uri(before_path)
        mime_after, b64_after = image_to_base64_data_uri(after_path)

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
        
        prompt_text = f"{SYSTEM_INSPECTION_PROMPT}\nItem being inspected: '{item_name}'.\nImage 1 is the baseline BEFORE photo.\nImage 2 is the return AFTER photo."

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt_text},
                        {
                            "inline_data": {
                                "mime_type": mime_before,
                                "data": b64_before
                            }
                        },
                        {
                            "inline_data": {
                                "mime_type": mime_after,
                                "data": b64_after
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "response_mime_type": "application/json"
            }
        }

        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code != 200:
                raise RuntimeError(f"Gemini API HTTP {resp.status_code}: {resp.text}")

            data = resp.json()
            candidates = data.get("candidates", [])
            if not candidates:
                raise ValueError("No response candidate returned by Gemini.")

            raw_text = candidates[0]["content"]["parts"][0]["text"]
            parsed = json.loads(raw_text)
            parsed["is_ai_generated"] = True
            parsed["item_name"] = item_name
            return parsed

    def _generate_fallback_inspection(self, item_name: str, category: str) -> Dict[str, Any]:
        """
        Provides realistic, context-aware damage analysis when Gemini API key is not yet configured.
        Allows immediate interactive demo testing of the settlement and PayPal capture flows.
        """
        name_lower = item_name.lower()
        
        if "camera" in name_lower or "lens" in name_lower or "sony" in name_lower or "canon" in name_lower:
            findings = [
                {
                    "item_part": "Front Lens Element Coating",
                    "damage_type": "Scratch",
                    "severity": "Moderate",
                    "confidence": 0.94,
                    "description": "Visible hairline radial scratch (approx 14mm) across the front anti-reflective coating. Not visible in baseline photo.",
                    "estimated_repair_cost": 160.00,
                    "proposed_deduction": 125.00,
                    "bounding_box": {"x": 48, "y": 42, "width": 16, "height": 16}
                },
                {
                    "item_part": "Lower Magnesium Baseplate",
                    "damage_type": "Scuff",
                    "severity": "Minor",
                    "confidence": 0.88,
                    "description": "Minor surface abrasive rub along tripod mount thread. Normal superficial wear.",
                    "estimated_repair_cost": 30.00,
                    "proposed_deduction": 15.00,
                    "bounding_box": {"x": 62, "y": 74, "width": 14, "height": 10}
                }
            ]
            summary = "Inspection revealed a new moderate scratch on the front optic coating and minor baseplate scuffs."
            total_deduction = 140.00
        elif "drone" in name_lower or "dji" in name_lower:
            findings = [
                {
                    "item_part": "Rear Right Rotor Arm & Propeller",
                    "damage_type": "Crack",
                    "severity": "Severe",
                    "confidence": 0.96,
                    "description": "Structural stress fracture and chipped carbon fiber composite blade from hard landing or obstacle impact.",
                    "estimated_repair_cost": 185.00,
                    "proposed_deduction": 175.00,
                    "bounding_box": {"x": 68, "y": 32, "width": 22, "height": 20}
                }
            ]
            summary = "Critical structural crack detected on rear rotor arm blade requiring assembly replacement."
            total_deduction = 175.00
        else:
            findings = [
                {
                    "item_part": "Outer Housing / Edge Bezel",
                    "damage_type": "Dent",
                    "severity": "Moderate",
                    "confidence": 0.91,
                    "description": "Localized impact indentation on aluminum perimeter frame measuring 6mm, consistent with edge drop.",
                    "estimated_repair_cost": 110.00,
                    "proposed_deduction": 95.00,
                    "bounding_box": {"x": 52, "y": 38, "width": 15, "height": 15}
                }
            ]
            summary = f"New perimeter impact indentation detected on {item_name} that was absent in baseline condition."
            total_deduction = 95.00

        return {
            "item_name": item_name,
            "summary": summary,
            "confidence_overall": 0.93,
            "total_proposed_deduction": total_deduction,
            "findings": findings,
            "is_ai_generated": False,
            "demo_mode": True
        }

gemini_service = GeminiVisionService()
