# MediGuide Backend - Production Container
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

WORKDIR /app

# Dépendances système minimales
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Installation des dépendances Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie du code applicatif et du dataset RDC
COPY api.py .
COPY donnees/ donnees/
COPY modele/ modele/
COPY services/ services/
COPY traitement/ traitement/
COPY configuration/ configuration/

EXPOSE 8000

# Démarrage avec port dynamique (Render / Cloud Run / Hugging Face / Docker)
CMD ["sh", "-c", "uvicorn api:app --host 0.0.0.0 --port ${PORT:-8000}"]
