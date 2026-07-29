import sys

# Several CrewAI Board Panel projects under AI_local_files/Crew_AI/ also
# have a src/main.py or a root-level main.py, all imported under the bare
# name "main". If pytest collects tests from one of those projects before
# this one in the same session (e.g. running `pytest` from a shared parent
# directory), Python's sys.modules cache would return their main.py instead
# of this project's own main.py. Evict any stale entry first so the
# `from main import app, StartupData` in test_main.py resolves fresh.
sys.modules.pop("main", None)
