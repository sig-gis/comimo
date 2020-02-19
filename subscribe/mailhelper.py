from django.core.mail import send_mail
from . import config as C

def sendmail(email, projurl):
    try:
        textContent = buildTextcontent(projurl)
        htmlContent = buildHTMLcontnet(projurl)
        sendSuccess = send_mail(
            'Illegal mining activity detected in subscribed region',
            textContent,
            C.EMAIL_HOST_USER,
            [email],
            fail_silently=False,
            auth_user=C.EMAIL_HOST_USER,
            auth_password=C.EMAIL_HOST_PASSWORD,
            html_message=htmlContent
        )
        print(sendSuccess)
    except Exception as e:
        print(e)

def buildTextcontent(projurl):
    text = "Alert! \n\n"
    text += "There are some potential illegal mining activities happening in the area that you are subscribed to.\n\n"
    text += "Take a look at those area here : http://comimo.sig-gis.com'\n\n"
    text += "To validate the data, navigate to the validation control on the application above or directly\
            go to the CEO project : "+projurl
    return text

def buildHTMLcontnet(projurl):
    html = """\
    <html>
      <body>
        <h3>Alert!</h3>
        There are some potential illegal mining activities happening in the area that you are subscribed to.
        <br/><br/>
        Take a look at those area <a href='http://comimo.sig-gis.com'>here</a>.
        <br/><br/>
        To validate the data, navigate to the validation control on the application above or directly go to the
        <a href='"""+projurl+"""'>CEO project</a>.
    </html>
    """
    return html
