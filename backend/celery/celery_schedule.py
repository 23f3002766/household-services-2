from celery.schedules import crontab
from flask import current_app as app
from backend.celery.tasks import email_reminder,email_customer_report,email_admin_report,email_professional_report


celery_app = app.extensions['celery']

@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    
    #customer and professional need their id

    #tests
    #sender.add_periodic_task(10.0, email_customer_report.s('student@gmail.com', 'report', '3') )
    #sender.add_periodic_task(20.0, email_admin_report.s('student@gmail.com', 'report') )
    #sender.add_periodic_task(30.0, email_professional_report.s('student@gmail.com', 'report', '4') )
    sender.add_periodic_task(crontab(minute="*/1"), email_reminder.s('student@gmail.com', 'reminder to login', '<h1> hello everyone </h1>'), name='quick reminder')

    # daily message at 6:55 pm, everyday
    sender.add_periodic_task(crontab(hour=18, minute=55), email_professional_report.s('student@gmail.com', 'report', '4') ,name='weekly reminder')

    # weekly messages
    sender.add_periodic_task(crontab(hour=18, minute=55, day_of_week='monday'), email_customer_report.s('student@gmail.com', 'report', '3') ,name='monthlyy reminder')


