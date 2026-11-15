"""Build the IT Enterprise scene-based eXeLearning course."""
from pathlib import Path
import build_exelearning_sources as builder

builder.PILOT=True
builder.OUT=builder.BASE/'exelearning/pilot/sources'
builder.main(['ITE'])
