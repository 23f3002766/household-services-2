import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

MAIL_SERVER='smtp.gmail.com'
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME='add yours'
MAIL_PASSWORD='add yours'
MAIL_DEFAULT_SENDER='xxx@ds.study.iitm.ac.in'

def send_email(to, subject, content):

    msg = MIMEMultipart()
    msg['To'] = to
    msg['Subject'] = subject
    msg['From'] = MAIL_USERNAME

    msg.attach(MIMEText(content,'html'))
    try:
        with smtplib.SMTP(host=MAIL_SERVER, port=MAIL_PORT) as client:
            ("connected to smtp server")

            client.starttls()
            client.login(MAIL_USERNAME, MAIL_PASSWORD)  # Login before sending email

            client.send_message(msg)
            client.quit()
            print("Email sent successfully!")
    except Exception as e:
        print(f"Error sending email: {e}")

#send_email('xxxx@gmail.com', 'reminder to login', '<h1> hello everyone </h1>')
# send_email('joe@abc.com', 'Test Email', '<h1> Welcome to Household Services </h1>')