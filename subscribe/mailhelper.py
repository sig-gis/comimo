from django.core.mail import send_mail
from subscribe.config import APP_URL, EMAIL_HOST_USER, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD


def sendMail(email, subject, textContent, htmlContent):
    try:
        sendSuccess = send_mail(
            subject,
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


def sendNewUserMail(email, token):
    sendMail(email,
             "Bienvenida a CoMiMo",
             newUserText(email, token),
             newUserHTML(email, token))


def newUserText(email, token):
    return "Bienvenida a CoMiMo\n\n" \
        + "Verifique su correo electrónico haciendo clic en el siguiente enlace: \n\n" \
        + APP_URL + "/verify-user?token=" + token + "&email=" + email


def newUserHTML(email, token):
    return """\
        <html>
        <body>
            <h3>Bienvenida a CoMiMo</h3>
            Verifique su correo electrónico haciendo clic <a href='""" + APP_URL + "/verify-user?token=" + token + "&email=" + email + """'>aquí</a>.
        </html>
    """


def sendAlertMail(email, projurl):
    sendMail(email,
             "COMIMO minera alerta",
             alertText(projurl),
             alertHTML(projurl))


def alertText(projurl):
    return "¡Alerta!\n\n" \
        + "Hemos detectado posibles sitios de explotación minera en las áreas a las cuales se encuentra suscrito.\n\n" \
        + "Puede visualizar estas áreas aquí: " + APP_URL + "'\n\n" \
        + "Para validar esta información, diríjase al panel de validación en la aplicación o acceda directamente a CEO: " \
        + projurl


def alertHTML(projurl):
    return """\
        <html>
        <body>
            <h3>¡Alerta!</h3>
            Hemos detectado posibles sitios de explotación minera en las áreas a las cuales se encuentra suscrito.
            <br/><br/>
            Puede visualizar estas áreas <a href='""" + APP_URL + """'>aquí</a>.
            <br/><br/>
            Para validar esta información, diríjase al panel de validación en la aplicación o acceda directamente a
            <a href='""" + projurl + """'>CEO</a>.
        </html>
    """


def sendResetMail(email, token):
    sendMail(email,
             "COMIMO restablecimiento de contraseña",
             resetText(email, token),
             resetHTML(email, token))


def resetText(email, token):
    return "Restablecimiento de contraseña\n\n" \
        + "Para restablecer su contraseña haga clic en el siguiente enlace e ingrese su nueva contraseña\n\n" \
        + APP_URL + "/password-reset?token=" + token + "&email=" + email


def resetHTML(email, token):
    return """\
        <html>
        <body>
            <h3>Restablecimiento de contraseña</h3>
            Para restablecer su contraseña haga clic <a href='""" + APP_URL + "/password-reset?token=" + token + "&email=" + email + """'>aquí</a> e ingrese su nueva contraseña.
        </html>
    """
