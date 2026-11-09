import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend or root directory
env_path = Path(__file__).parent.parent / ".env"
if not env_path.exists():
    env_path = Path(__file__).parent.parent.parent / ".env"

load_dotenv(dotenv_path=env_path)

class Settings:
    PROJECT_NAME: str = "Fairhold - AI-Powered Rental Deposit Protection"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # SQLite Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./fairhold.db")
    
    # Uploads directory
    BASE_DIR: Path = Path(__file__).parent.parent
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    
    # Gemini AI
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # PayPal Sandbox REST API
    PAYPAL_CLIENT_ID: str = os.getenv("PAYPAL_CLIENT_ID", "")
    PAYPAL_CLIENT_SECRET: str = os.getenv("PAYPAL_CLIENT_SECRET", "")
    PAYPAL_MODE: str = os.getenv("PAYPAL_MODE", "sandbox").lower()  # sandbox or live
    
    @property
    def is_gemini_configured(self) -> bool:
        return bool(self.GEMINI_API_KEY and not self.GEMINI_API_KEY.startswith("YOUR_"))
    
    @property
    def is_paypal_configured(self) -> bool:
        return bool(
            self.PAYPAL_CLIENT_ID 
            and self.PAYPAL_CLIENT_SECRET 
            and not self.PAYPAL_CLIENT_ID.startswith("YOUR_")
            and not self.PAYPAL_CLIENT_SECRET.startswith("YOUR_")
        )
    
    @property
    def paypal_base_url(self) -> str:
        if self.PAYPAL_MODE == "live":
            return "https://api-m.paypal.com"
        return "https://api-m.sandbox.paypal.com"

settings = Settings()
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
