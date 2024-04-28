
virtual_env :=  justfile_directory() / ".direnv/python-3.11/bin"

export PATH := virtual_env + ":" + env('PATH')

[private]
prepare:
    pip install --quiet --upgrade pip
    pip install --quiet pip-tools pip-compile-multi

# lock the requirements files
compile: prepare
    pip-compile-multi --use-cache

# install dependencies into local virtual environment
sync: prepare
    pip-sync requirements/dev.txt
    pip install -e .
    tox --notest

# run tests
test:
    pytest

# run all tests
test-all:
    tox

# run lints
lint:
    flake8
    pre-commit run --all-files

# run mypy
mypy:
    mypy

# run the application
serve:
    flask run

# watch for changes and run the application
watch:
    python -m watch
