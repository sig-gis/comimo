from django.core.mail import send_mail
from . import config as C

def sendmails(mailobj):
    try:
        for ad in mailobj:
            regions = mailobj[ad].split(',')
            textContent = buildTextcontent(regions)
            htmlContent = buildHTMLcontnet(regions)
            sendSuccess = send_mail(
                'Illegal mining activity detected in subscribed region',
                textContent,
                C.EMAIL_HOST_USER,
                [ad],
                fail_silently=False,
                auth_user=C.EMAIL_HOST_USER,
                auth_password=C.EMAIL_HOST_PASSWORD,
                html_message=htmlContent
            )
            print(sendSuccess, ad)
    except Exception as e:
        print(e)

def buildTextcontent(regions):
    text = "Alert! \n\n"
    text += "There are some potential illegal mining activities happening in the area that you are subscribed to.\n\n"
    text += "Take a look at those area here : http://216.218.220.160'\n\n"
    text += "To validate the data, navigate to the validation control on the application above or directly\
            go to the CEO project : https://collect.earth/collection?projectId=5439"
    return text

def buildHTMLcontnet(regions):
    html = """\
    <html>
      <body>
        <h3>Alert!</h3>
        There are some potential illegal mining activities happening in the area that you are subscribed to.
        <br/><br/>
        Take a look at those area <a href='http://216.218.220.160'>here</a>.
        <br/><br/>
        To validate the data, navigate to the validation control on the application above or directly go to the
        <a href='https://collect.earth/collection?projectId=5439'>CEO project</a>.
    </html>
    """
    return html
