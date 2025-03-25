from celery.schedules import crontab
from flask import current_app as app
from backend.celery.tasks import email_reminder,email_customer_report,email_admin_report,email_professional_report,send_pending_request_reminders


celery_app = app.extensions['celery']

@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    
    #customer and professional need their id
    sender.add_periodic_task(crontab(hour=18, minute=55), send_pending_request_reminders.s(), name='fetch and notify')

    #tests
    #sender.add_periodic_task(10.0, email_customer_report.s('xxxx@gmail.com', 'report', '5') )
    #sender.add_periodic_task(20.0, email_admin_report.s('xxxx@gmail.com', 'report') )
    #sender.add_periodic_task(30.0, email_professional_report.s('xxxx@gmail.com', 'report', '4') )
    #sender.add_periodic_task(crontab(minute="*/1"), 
                             #email_reminder.s('xxxx@gmail.com', 'reminder to login', '<h1> hello everyone </h1>'),
                             # name='quick reminder')

    # daily message at 6:55 pm, everyday
    sender.add_periodic_task(crontab(hour=18, minute=55),
                              email_professional_report.s('student@gmail.com', 'report', '4') ,
                              name='daily reminder')

    # monthly messages
    sender.add_periodic_task(crontab(hour=8, minute=0, day_of_month=1), 
                             email_customer_report.s('student@gmail.com', 'report', '3') ,
                             name='monthly report')


