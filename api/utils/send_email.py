import os
import re
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


EMAIL_SENDER_USER = os.getenv("EMAIL_SENDER_USER")
EMAIL_SENDER_PASSWORD = os.getenv("EMAIL_SENDER_PASSWORD")

WEBSITE_URL = os.getenv("WEBSITE_URL")


def send_email(email_obj, auth_url):
    ''' Send email to the user with the login link

    Args:
        email_obj: The email object.
                   Must contain "email", "subject" and "message"
        auth_url: The authentication URL

    Returns:
        The response from the email server

    Example:
        send_email(email_obj, "https://page.com/auth***")
        email_obj = {
            "email": "test@test.com",
            "subject": "Test Subject",
            "message": "Test Message"
        }
    '''
    # crete message
    msg = MIMEMultipart()

    msg['From'] = EMAIL_SENDER_USER
    msg['To'] = email_obj["email"]

    # message content
    msg['Subject'] = email_obj["subject"]
    body = email_obj["message"] + \
        "\tYour login link: {}\n".format(auth_url)

    # SEND
    msg.attach(MIMEText(body, 'plain'))
    if validate_email(email_obj["email"]):
        try:
            # use gmail with port
            session = smtplib.SMTP('smtp.gmail.com', 587)
            session.ehlo()
            # enable security
            session.starttls()
            session.ehlo()
            # login with mail_id and password
            session.login(EMAIL_SENDER_USER,
                          EMAIL_SENDER_PASSWORD)
            text = msg.as_string()
            session.sendmail(EMAIL_SENDER_USER,
                             email_obj["email"],
                             text)
            session.quit()
            response = {"success": True,
                        "message": "Email sent"}
            return response

        except smtplib.SMTPException:
            response = {"success": False,
                        "message": "Email sending failed!"}
            return response
    else:
        response = {"success": False,
                    "message": "No email address was provided"}
        return response


def validate_email(s):
    pat = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"  # noqa: W605
    if re.match(pat, s):
        return True
    return False