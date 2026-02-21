import os
import multiprocessing

# Bind to the port Render provides
bind = f"0.0.0.0:{os.environ.get('PORT', 5000)}"

# Worker configuration
# Use (2 * CPU cores) + 1 workers for I/O bound apps
workers = int(os.environ.get('GUNICORN_WORKERS', multiprocessing.cpu_count() * 2 + 1))
worker_class = "sync"
worker_connections = 1000

# Timeout settings - increased for cold starts
timeout = 60  # 60 seconds for cold start
graceful_timeout = 30
keepalive = 5

# Request limits
max_requests = 1000
max_requests_jitter = 100

# Preload app to share memory and speed up worker spawning
preload_app = True

# Logging
accesslog = "-"
errorlog = "-"
loglevel = os.environ.get('LOG_LEVEL', 'info')

# Process naming
proc_name = 'easyxpense'

# Security
limit_request_line = 4094
limit_request_fields = 100
limit_request_field_size = 8190
