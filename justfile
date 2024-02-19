# Sync python dependencies
sync:
    pip-compile-multi
    pip-sync requirements/dev.txt
    pip install -e .
