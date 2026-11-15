"""Load edited sibling sources while retaining the original authoring files."""
import importlib.util
from pathlib import Path

def load(name):
    path=Path(__file__).resolve().parent/(name+'.humanized.py')
    spec=importlib.util.spec_from_file_location(name+'_humanized',path)
    module=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module
