
virtual_env :=  justfile_directory() / ".direnv/python-3.11/bin"

export PATH := virtual_env + ":" + env('PATH')

[private]
prepare:
    pip install --quiet --upgrade pip
    pip install --quiet pip-tools pip-compile-multi

compile: prepare
    pip-compile-multi --use-cache

sync: prepare
    pip-sync requirements/dev.txt
    pip install -e .
    tox --notest

# Run tests
test:
    pytest

# Run all tests
test-all:
    tox

# Run lints
lint:
    flake8

# Run mypy
mypy:
    mypy

# Run the application
serve:
    flask run

# Watch for changes and run the application
watch:
    python -m watch
