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

### New User ###


def sendNewUserMail(email, token, lang):
    if lang == "es":
        sendMail(email,
                 "Bienvenida a CoMiMo",
                 newUserTextES(email, token),
                 newUserHTMLES(email, token))
    else:
        sendMail(email,
                 "Welcome to CoMiMo",
                 newUserTextEN(email, token),
                 newUserHTMLEN(email, token))


def newUserTextEN(email, token):
    return "Welcome to CoMiMo\n\n" \
        + "Please verify your email by clicking the following link: \n\n" \
        + APP_URL + "/verify-user?token=" + token + "&email=" + email


def newUserHTMLEN(email, token):
    return """\
        <html>
        <body>
            <h3>Welcome to CoMiMo</h3>
            Please verify your email by clicking <a href='""" + APP_URL + "/verify-user?token=" + token + "&email=" + email + """'>here</a>.
        </html>
    """


def newUserTextES(email, token):
    return "Bienvenida a CoMiMo\n\n" \
        + "Verifique su correo electrónico haciendo clic en el siguiente enlace: \n\n" \
        + APP_URL + "/verify-user?token=" + token + "&email=" + email


def newUserHTMLES(email, token):
    return """\
        <html>
        <body>
            <h3>Bienvenida a CoMiMo</h3>
            Verifique su correo electrónico haciendo clic <a href='""" + APP_URL + "/verify-user?token=" + token + "&email=" + email + """'>aquí</a>.
        </html>
    """

### Alerts ###


def sendAlertMail(email, projurl, lang):
    if lang == "es":
        sendMail(email,
                 "CoMiMo minera alerta",
                 alertTextES(projurl),
                 alertHTMLES(projurl))
    else:
        sendMail(email,
                 "CoMiMo Mine alert",
                 alertTextEN(projurl),
                 alertHTMLEN(projurl))


def alertTextEN(projurl):
    return "Mine Alert\n\n" \
        + "We have detected possible mining sites in the areas to which it is subscribed.\n\n" \
        + "You can see the new validations listed in CoMiMo here: " + APP_URL + "'\n\n" \
        + "To validate this information, go to the validation panel in the application or go directly to CEO: " \
        + projurl + "&locale=en"


def alertHTMLEN(projurl):
    return """\
        <html>
        <body>
            <h3>Mine Alert</h3>
            We have detected possible mining sites in the areas to which it is subscribed.
            <br/><br/>
            You can see the new validations listed in CoMiMo <a href='""" + APP_URL + """'>here.</a>.
            <br/><br/>
            To validate this information, go to the validation panel in the application or go directly to
            <a href='""" + projurl + "&locale=en" + """'>CEO</a>.
        </html>
    """


def alertTextES(projurl):
    return "¡Alerta!\n\n" \
        + "Hemos detectado posibles sitios de explotación minera en las áreas a las cuales se encuentra suscrito.\n\n" \
        + "Puede visualizar estas áreas aquí: " + APP_URL + "'\n\n" \
        + "Para validar esta información, diríjase al panel de validación en la aplicación o acceda directamente a CEO: " \
        + projurl + "&locale=en"


def alertHTMLES(projurl):
    return """\
        <html>
        <body>
            <h3>¡Alerta!</h3>
            Hemos detectado posibles sitios de explotación minera en las áreas a las cuales se encuentra suscrito.
            <br/><br/>
            Puede visualizar estas áreas <a href='""" + APP_URL + """'>aquí</a>.
            <br/><br/>
            Para validar esta información, diríjase al panel de validación en la aplicación o acceda directamente a
            <a href='""" + projurl + "&locale=en" + """'>CEO</a>.
        </html>
    """

### Reset Password ###


def sendResetMail(email, token, lang):
    if lang == "es":
        sendMail(email,
                 "CoMiMo restablecimiento de contraseña",
                 resetTextES(email, token),
                 resetHTMLES(email, token))
    else:
        sendMail(email,
                 "CoMiMo password reset",
                 resetTextEN(email, token),
                 resetHTMLEN(email, token))


def resetTextEN(email, token):
    return "Password Reset\n\n" \
        + "To reset your password, click the link below and enter your new password:\n\n" \
        + APP_URL + "/password-reset?token=" + token + "&email=" + email


def resetHTMLEN(email, token):
    return """\
        <html>
        <body>
            <h3>Password reset</h3>
            To reset your password, click <a href='""" + APP_URL + "/password-reset?token=" + token + "&email=" + email + """'>here</a>
            and enter your new password.
        </html>
    """


def resetTextES(email, token):
    return "Restablecimiento de contraseña\n\n" \
        + "Para restablecer su contraseña haga clic en el siguiente enlace e ingrese su nueva contraseña\n\n" \
        + APP_URL + "/password-reset?token=" + token + "&email=" + email


def resetHTMLES(email, token):
    return """\
        <html>
        <body>
            <h3>Restablecimiento de contraseña</h3>
            Para restablecer su contraseña haga clic <a href='""" + APP_URL + "/password-reset?token=" + token + "&email=" + email + """'>aquí</a> e ingrese su nueva contraseña.
        </html>
    """
