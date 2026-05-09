FROM python:3.12-slim
WORKDIR /app

COPY pyproject.toml uv.lock ./
COPY design_system/ design_system/
COPY main.py api.py ./

RUN pip install --no-cache-dir uv && uv sync --frozen

EXPOSE 8000
CMD ["uv", "run", "uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
