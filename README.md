proj initiated

Important commands 
Start redis Server - redis-server
Start celery worker - celery -A app.celery worker --loglevel=info
Start app - python3 app.py
Start Scheduled tasks - celery -A app.celery beat --loglevel=info

Clear Celery beat schedule - rm celerybeat-schedule

Run celery beat in debug mode - celery -A app.celery beat --loglevel=debug
