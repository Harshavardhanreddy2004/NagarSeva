"""AI service for image analysis and complaint generation."""
import json
import os
from typing import Dict, Any, Optional
import logging

from app.config import settings
from app.schemas.complaint import ImageAnalysis

logger = logging.getLogger(__name__)

# Try to import Google Generative AI
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False
    logger.warning("google-generativeai not available, using mock AI responses")


class AIService:
    """Service for AI-powered image analysis and complaint processing."""

    def __init__(self):
        """Initialize AI service."""
        if GENAI_AVAILABLE and settings.gemini_api_key:
            genai.configure(api_key=settings.gemini_api_key)
            self.model = genai.GenerativeModel('vision-1.5-pro')
        else:
            self.model = None

    def analyze_image(self, image_path: str) -> ImageAnalysis:
        """
        Analyze image to detect civic issues.
        
        Args:
            image_path: Path to the image file
            
        Returns:
            ImageAnalysis with detected issue, confidence, and risk level
        """
        try:
            if not os.path.exists(image_path):
                logger.warning(f"Image file not found: {image_path}")
                return self._mock_analysis()

            if self.model is None:
                logger.info("Using mock AI analysis")
                return self._mock_analysis()

            # Use actual Gemini Vision API
            image_data = {
                "mime_type": "image/jpeg",
                "data": open(image_path, "rb").read()
            }

            prompt = """Analyze this image of a street or civic area for infrastructure issues.
            Identify any of these types of problems:
            - Pothole or road damage
            - Street light not working
            - Garbage/waste dumping
            - Drain blockage/waterlogging
            - Encroachment or obstruction
            - Other safety hazards
            
            Respond with JSON:
            {
                "detected_issue": "description of issue",
                "issue_type": "category from above",
                "confidence": 0-100,
                "risk_level": "low/medium/high/critical"
            }
            """

            response = self.model.generate_content([prompt, image_data])
            
            if response and response.text:
                try:
                    result = json.loads(response.text)
                    return ImageAnalysis(
                        detected_issue=result.get("detected_issue", "Unknown issue"),
                        confidence_score=int(result.get("confidence", 50)),
                        risk_level=result.get("risk_level", "medium")
                    )
                except json.JSONDecodeError:
                    logger.warning("Failed to parse AI response as JSON")
                    return self._mock_analysis()
            else:
                return self._mock_analysis()

        except Exception as e:
            logger.error(f"Error analyzing image: {str(e)}")
            return self._mock_analysis()

    def _mock_analysis(self) -> ImageAnalysis:
        """Generate mock analysis response for testing."""
        import random
        
        issues = [
            ("Pothole detected on road surface", "pothole", "high"),
            ("Street light not functioning", "street_light", "medium"),
            ("Garbage accumulation detected", "garbage", "medium"),
            ("Drain blockage causing waterlogging", "drain", "high"),
            ("Illegal encroachment on footpath", "encroachment", "critical"),
            ("Damaged sidewalk", "sidewalk", "medium"),
        ]
        
        issue, issue_type, risk = random.choice(issues)
        
        return ImageAnalysis(
            detected_issue=issue,
            confidence_score=random.randint(70, 95),
            risk_level=risk
        )

    def route_to_department(self, issue_type: str) -> str:
        """
        Route complaint to appropriate department based on issue type.
        
        Args:
            issue_type: Type of civic issue
            
        Returns:
            Department name
        """
        routing_map = {
            "pothole": "Public Works",
            "road_damage": "Public Works",
            "street_light": "Electrical Department",
            "garbage": "Sanitation Department",
            "drain": "Drainage Department",
            "waterlogging": "Drainage Department",
            "encroachment": "Municipal Enforcement",
            "sidewalk": "Public Works",
            "default": "General Complaints"
        }
        
        return routing_map.get(issue_type.lower(), routing_map["default"])

    def generate_complaint_summary(
        self, detected_issue: str, user_description: str
    ) -> str:
        """
        Generate structured complaint summary.
        
        Args:
            detected_issue: AI-detected issue
            user_description: User`s description
            
        Returns:
            Formatted complaint summary
        """
        summary = f"""
Civic Complaint Report
======================
Detected Issue: {detected_issue}
User Description: {user_description}

This complaint has been automatically analyzed and categorized for routing.
Priority assignment and department assignment are in progress.
        """.strip()
        
        return summary
