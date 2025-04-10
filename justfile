# Common Flask project tasks

# Set up the virtual environment based on the direnv convention
# https://direnv.net/docs/legacy.html#virtualenv
python_version := env('PYTHON_VERSION', "3.12")
virtual_env :=  justfile_directory() / ".venv/bin"
export PATH := virtual_env + ":" + env('PATH')




# Install dependencies
sync:
    uv sync --all-packages --group dev

alias install := sync
alias develop := sync

# Sort imports
isort:
    -pre-commit run reorder-python-imports --all-files

# Run tests
test:
    uv run --group testing pytest -q -n 4 --cov-report=html

# Run all tests
test-all:
    tox -p auto

alias tox := test-all
alias t := test-all

# Run lints
lint:
    pre-commit run --all-files

# Run mypy
mypy:
    uv run --group typing mypy

# run the flask application
serve:
    uv run flask run

alias s := serve
alias run := serve

# Build docs
docs:
    cd docs && uv run --group docs make html

# Clean up
clean:
    rm -rf dist/* *.egg-info
    rm -rf docs/_build

# Clean up docs
clean-docs:
    rm -rf docs/_build
    rm -rf docs/api

# Clean aggressively
clean-all: clean clean-docs
    rm -rf .direnv
    rm -rf .venv
    rm -rf .tox
    rm -rf .mypy_cache .pytest_cache
    rm -rf docs/api
    rm -rf .coverage htmlcov
