from subscribe.config import EMAIL_HOST_USER, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD
from django.core.mail import send_mail


def sendmail(email, projurl):
    try:
        textContent = build_text_content(projurl)
        htmlContent = build_HTML_contnet(projurl)
        sendSuccess = send_mail(
            'COMIMO ha detectado posibles sitios de explotación minera',
            textContent,
            EMAIL_HOST_USER,
            [email],
            fail_silently=False,
            auth_user=EMAIL_HOST_USER,
            auth_password=EMAIL_HOST_PASSWORD,
            html_message=htmlContent
        )
        print(sendSuccess)
    except Exception as e:
        print(e)


def build_text_content(projurl):
    return "¡Alerta!\n\n" \
        + "Hemos detectado posibles sitios de explotación minera en las áreas a las cuales se encuentra suscrito.\n\n" \
        + "Puede visualizar estas áreas aquí: http://comimo.sig-gis.com'\n\n" \
        + "Para validar esta información, diríjase al panel de validación en la aplicación o acceda directamente a CEO: " \
        + projurl


def build_HTML_contnet(projurl):
    return """\
        <html>
        <body>
            <h3>¡Alerta!</h3>
            Hemos detectado posibles sitios de explotación minera en las áreas a las cuales se encuentra suscrito.
            <br/><br/>
            Puede visualizar estas áreas <a href='http://comimo.sig-gis.com'>aquí</a>.
            <br/><br/>
            Para validar esta información, diríjase al panel de validación en la aplicación o acceda directamente a
            <a href='"""+projurl+"""'>CEO</a>.
        </html>
    """
