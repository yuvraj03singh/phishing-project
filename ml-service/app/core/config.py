import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent
WORKSPACE_DIR = BASE_DIR.parent
DEFAULT_MODEL_DIR = WORKSPACE_DIR / "models" / "v1"

class Settings(BaseModel):
    PROJECT_NAME: str = "Phishing Detection ML Microservice"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    MODEL_DIR: Path = Path(os.getenv("MODEL_PATH", str(DEFAULT_MODEL_DIR)))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    CORS_ORIGINS: list = ["*"]
    MAX_URL_LENGTH: int = 2048
    MAX_BATCH_SIZE: int = 500

settings = Settings()
