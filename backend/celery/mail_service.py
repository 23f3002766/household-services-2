import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


#SMTP_SERVER = "localhost"
#SMTP_PORT = 1025
#SENDER_EMAIL = ''
#SENDER_PASSWORD = ''

MAIL_SERVER='smtp.gmail.com'
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME='thanos112357@gmail.com'
MAIL_PASSWORD='kgpp kjze mmsi pmwk'
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