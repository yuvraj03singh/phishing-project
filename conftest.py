import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
ML_SERVICE_DIR = ROOT_DIR / "ml-service"
ML_TRAINING_DIR = ROOT_DIR / "ml-training"

for p in [ROOT_DIR, ML_SERVICE_DIR, ML_TRAINING_DIR]:
    str_p = str(p)
    if str_p not in sys.path:
        sys.path.insert(0, str_p)
