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
    text += "There are some potential illegal mining activities happening in your area. \n Click on the links below to take a look."
    for region in regions:
        (name, level) = region.split('_')
        text += name+" : "+C.APP_URL+"region="+name+"&level="+level


def buildHTMLcontnet(regions):
    html = """\
    <html>
      <body>
        <h3>Alert!</h3>
        There are some potential illegal mining activities happening in your area
        Click on the links below to take a look. <br/>
    """
    for region in regions:
        (name, level) = region.split('_')
        html += """<p><a href="""+C.APP_URL+"region="+name+"&level="+level+""">"""+name+"""</a><p>"""
    html += """
      </body>
    </html>
    """
    return html
