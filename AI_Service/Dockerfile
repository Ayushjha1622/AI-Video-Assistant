# ── AI Video Assistant — AI_Service ────────────────────────────────────────────
# Base: Python 3.11 slim (matches runtime.txt)
FROM python:3.11-slim

# ── System dependencies ─────────────────────────────────────────────────────────
# ffmpeg   : required by pydub / ffmpeg-python for audio processing
# git      : needed by some pip packages that install from GitHub
# build-essential / gcc : required to compile some native Python extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    git \
    build-essential \
    gcc \
    libgomp1 \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# ── Working directory ───────────────────────────────────────────────────────────
WORKDIR /app

# ── Install CPU-only PyTorch FIRST ──────────────────────────────────────────────
# We install the CPU wheel from the official PyTorch index before everything else
# to avoid pip pulling the massive CUDA wheel from PyPI (saves ~4 GB).
RUN pip install --no-cache-dir \
    torch>=2.2.0 \
    torchaudio>=2.2.0 \
    --index-url https://download.pytorch.org/whl/cpu

# ── Install Python dependencies ─────────────────────────────────────────────────
COPY requirements.txt .

# Install remaining packages (torch/torchaudio already satisfied above,
# so pip will skip re-downloading them)
RUN pip install --no-cache-dir -r requirements.txt

# ── Copy application source ─────────────────────────────────────────────────────
COPY . .

# ── Runtime directories ─────────────────────────────────────────────────────────
# Create mount-point directories so Docker volumes attach cleanly
RUN mkdir -p downloads vector_db

# ── Expose port ────────────────────────────────────────────────────────────────
EXPOSE 8000

# ── Healthcheck ────────────────────────────────────────────────────────────────
# Docker will mark the container unhealthy if FastAPI stops responding
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/docs')" || exit 1

# ── Start server ────────────────────────────────────────────────────────────────
# --host 0.0.0.0  : bind to all interfaces so Docker port-mapping works
# --workers 1     : single worker (Whisper model is large; multiple workers = OOM)
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
