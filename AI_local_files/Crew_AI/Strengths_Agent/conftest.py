import importlib.util
import sys
from pathlib import Path

# The sibling Board Panel projects (next-month-roadmap, Weakness_Agent,
# suggestions) all have a src/{models,crew,main}.py with the same names.
# If pytest collects tests from more than one of these projects in a single
# session (e.g. running `pytest` from a shared parent directory), Python's
# sys.modules cache would keep returning whichever project's module got
# imported first - including from *inside* the exec_module() call below,
# where src/main.py does `from crew import BoardPanelCrew`, which in turn
# does `from models import AgentStrengthOutput`. Evict any stale entries
# first so those resolve fresh from THIS project's src/ dir.
for _name in ("models", "crew", "main"):
    sys.modules.pop(_name, None)

# The app's own modules (api.py, main.py, crew.py) use unqualified imports
# like `from models import ...`, which only resolve when `src/` itself is on
# sys.path (that's how it's actually run: `cd src && uvicorn api:app`).
# Mirror that here so tests can import the same modules the same way.
sys.path.insert(0, str(Path(__file__).parent / "src"))

# This project also has a root-level main.py (Render.com deployment shim)
# that shadows src/main.py when pytest adds the test file's own directory
# to sys.path. Pre-load the real src/main.py into sys.modules["main"] so
# `from main import prepare_inputs` in tests resolves to the business logic,
# not the deployment shim.
_spec = importlib.util.spec_from_file_location(
    "main", Path(__file__).parent / "src" / "main.py"
)
_module = importlib.util.module_from_spec(_spec)
sys.modules["main"] = _module
_spec.loader.exec_module(_module)
