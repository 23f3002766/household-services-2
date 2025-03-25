from celery import shared_task
import time
import flask_excel
from backend.models import ServiceRequest
from backend.celery.mail_service import send_email
from backend.models import db, Professional, ServiceRequest

import urllib.request

@shared_task(ignore_result = False)
def add(x,y):
    time.sleep(10)
    return x+y
    

@shared_task(bind = True, ignore_result = False)
def create_csv(self):
    resource = ServiceRequest.query.all()

    task_id = self.request.id
    filename = f'service_req_data_{task_id}.csv'
    column_names = [column.name for column in ServiceRequest.__table__.columns]
    print(column_names)
    csv_out = flask_excel.make_response_from_query_sets(resource, column_names = column_names, file_type='csv' )

    with open(f'./backend/celery/user-downloads/{filename}', 'wb') as file:
        file.write(csv_out.data)
    
    return filename

@shared_task(ignore_result = True)
def email_reminder(to, subject, content):
    send_email(to, subject, content)

@shared_task(ignore_result = True)
def email_professional_report(to, subject, id):
    url = "http://127.0.0.1:5000/professional/summary/" + id
    with urllib.request.urlopen(url) as response:
        content = response.read().decode()
    send_email(to, subject, content) 

@shared_task(ignore_result = True)
def email_customer_report(to, subject, id):
    url = "http://127.0.0.1:5000/customer/summary/" + id 
    with urllib.request.urlopen(url) as response:
        content = response.read().decode()
    send_email(to, subject, content)

@shared_task(ignore_result = True)
def email_admin_report(to, subject):
    url = "http://127.0.0.1:5000/admin/summary" 
    with urllib.request.urlopen(url) as response:
        content = response.read().decode()
    send_email(to, subject, content)

from celery.schedules import crontab
from flask import current_app as app
from backend.celery.tasks import email_reminder
from backend.models import db, Professional, ServiceRequest



@shared_task(ignore_result = True)
def send_pending_request_reminders():
        accepted_requests = (
            db.session.query(ServiceRequest.id, Professional.name, Professional.email)
                .join(Professional, ServiceRequest.professional_id == Professional.id)
                .filter(ServiceRequest.service_status == 'accepted')
                .all()
        )
        for request_id , name, email in accepted_requests:

            print(f"Sending reminder for Request ID: {request_id}, Professional: {name}, Email: {email}")

            email_reminder.delay(email, 'You have Pending Requests', 
                                 f'<h1>You have pending task: {request_id} ,{name}</h1>')

