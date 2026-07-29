import sys
from pathlib import Path

# The sibling Board Panel projects (next-month-roadmap, Strengths_Agent,
# suggestions) all have a src/{models,crew,main}.py with the same names.
# If pytest collects tests from more than one of these projects in a single
# session (e.g. running `pytest` from a shared parent directory), Python's
# sys.modules cache would keep returning whichever project's module got
# imported first for every later bare `from models import ...` /
# `from main import ...`. Evict any stale entries before this project's own
# modules are imported, so the import below is guaranteed to resolve fresh
# from THIS project's src/ dir.
for _name in ("models", "crew", "main"):
    sys.modules.pop(_name, None)

# The app's own modules (api.py, main.py, crew.py) use unqualified imports
# like `from models import ...`, which only resolve when `src/` itself is on
# sys.path (that's how it's actually run: `cd src && uvicorn api:app`).
# Mirror that here so tests can import the same modules the same way.
sys.path.insert(0, str(Path(__file__).parent / "src"))
