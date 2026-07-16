FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (needed for psycopg2, GDAL for geopandas)
RUN apt-get update && apt-get install -y \
    gcc \
    libgdal-dev \
    gdal-bin \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create directory for ML models
RUN mkdir -p models_pkl

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
