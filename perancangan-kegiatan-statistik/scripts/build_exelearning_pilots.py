"""Build only the two explicitly requested scene-based eXeLearning pilots."""
from pathlib import Path
import build_exelearning_sources as builder

builder.PILOT=True
builder.OUT=builder.BASE/'exelearning/pilot/sources'
builder.main(['C01','C12','S01'])
