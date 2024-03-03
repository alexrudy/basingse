
virtual_env :=  justfile_directory() / ".direnv/python-3.11/bin"

# Sync python dependencies
sync:
    {{virtual_env}}/pip install --upgrade pip
    {{virtual_env}}/pip install pip-tools pip-compile-multi
    {{virtual_env}}/pip-compile-multi --use-cache
    {{virtual_env}}/pip-sync requirements/dev.txt
    {{virtual_env}}/pip install -e .
    {{virtual_env}}/tox --notest

# Run tests
test:
    {{virtual_env}}/pytest

# Run all tests
test-all:
    {{virtual_env}}/tox

# Run lints
lint:
    {{virtual_env}}/flake8

# Run mypy
mypy:
    {{virtual_env}}/mypy

# Run the application
serve:
    {{virtual_env}}/flask run

# Watch for changes and run the application
watch:
    {{virtual_env}}/python -m watch
