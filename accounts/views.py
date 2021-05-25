import json
from django.contrib.auth import login, logout, authenticate, tokens
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, redirect, reverse
from django.db.models import Q
from django.contrib.auth.models import User
from accounts.models import Profile
from django.db import transaction

from subscribe.mailhelper import sendResetMail, sendNewUserMail
from accounts.utils import getUserInfo


def clean(string):
    return string.strip().lower()


def getUser(email):
    try:
        return User.objects.get(Q(email=email) | Q(username=email))
    except Exception as e:
        return None


def getUserByEmail(email):
    try:
        return User.objects.get(email=email)
    except Exception as e:
        return None


def getUserByUsername(username):
    try:
        return User.objects.get(username=username)
    except Exception as e:
        return None


def registerView(request):
    if request.method == "POST":
        try:
            JSONbody = json.loads(request.body)
            email = clean(JSONbody.get("email"))
            username = clean(JSONbody.get("username"))
            # check for email
            emailUser = getUserByEmail(email)
            # check for username
            usernameUser = getUserByUsername(username)

            if emailUser is not None:
                return HttpResponse("errorEmail")
            elif usernameUser is not None:
                return HttpResponse("errorUsername")
            else:
                with transaction.atomic():
                    defaultLang = JSONbody.get("defaultLang")
                    new_user = User()
                    new_user.username = username
                    new_user.email = email
                    new_user.is_active = False
                    new_user.set_password(JSONbody.get("password"))
                    new_user.save()

                    new_user.profile.full_name = JSONbody.get(
                        "fullName").strip()
                    new_user.profile.sector = JSONbody.get("sector").strip()
                    new_user.profile.institution = JSONbody.get(
                        "institution").strip()
                    new_user.profile.email = email
                    new_user.profile.default_lang = defaultLang
                    new_user.save()

                    gen = PasswordResetTokenGenerator()
                    token = gen.make_token(new_user)
                    sendNewUserMail(email, token, defaultLang)
                return HttpResponse("")
        except Exception as e:
            print(e)
            return HttpResponse("errorCreating")
    else:
        return render(request, "register.html")


def userAccountView(request):
    user = request.user
    if not(user.is_authenticated):
        return redirect(reverse('login') + '?next=' + request.build_absolute_uri())
    else:
        if request.method == "POST":
            try:
                JSONbody = json.loads(request.body)
                with transaction.atomic():
                    profile = Profile.objects.filter(
                        user=user).first()
                    profile.full_name = clean(JSONbody.get("fullName"))
                    profile.sector = clean(JSONbody.get("sector"))
                    profile.institution = clean(JSONbody.get("institution"))
                    profile.default_lang = JSONbody.get("defaultLang")
                    profile.save()
                    return HttpResponse("")
            except Exception as e:
                print(e)
                return HttpResponse("errorUpdating")
        else:
            return render(request, "user-account.html", getUserInfo(user))


def verifyUserView(request):
    if request.method == "POST":
        JSONbody = json.loads(request.body)
        token = JSONbody.get("token")
        user = getUser(clean(JSONbody.get("email")))
        gen = PasswordResetTokenGenerator()

        if user is None:
            return HttpResponse("errorNotFound")
        elif gen.check_token(user, token):
            user.is_active = True
            user.save()
            return HttpResponse("")
        else:
            return HttpResponse("errorToken")
    else:
        return render(request, "verify-user.html")


def loginView(request):
    if request.method == "POST":
        JSONbody = json.loads(request.body)
        user = authenticate(username=clean(JSONbody.get("username")),
                            password=clean(JSONbody.get("password")))
        if user is not None:
            login(request, user)
            return HttpResponse("")
        else:
            return HttpResponse("errorLogin")
    else:
        return render(request, "login.html")


def logoutView(request):
    logout(request)
    return redirect("home")


def forgotView(request):
    if request.method == "POST":
        JSONbody = json.loads(request.body)
        user = getUser(clean(JSONbody.get("email")))

        if user is not None:
            gen = PasswordResetTokenGenerator()
            token = gen.make_token(user)
            lang = Profile.objects.filter(user=user) \
                .values().first()['default_lang']
            sendResetMail(user.email, token, lang)
            return HttpResponse("")
        else:
            return HttpResponse("errorNotFound")
    else:
        return render(request, "password-forgot.html")


def resetView(request):
    if request.method == "POST":
        JSONbody = json.loads(request.body)
        token = JSONbody.get("token")
        password = JSONbody.get("password")
        user = getUser(clean(JSONbody.get("email")))
        gen = PasswordResetTokenGenerator()

        if user is None:
            return HttpResponse("errorNotFound")
        elif gen.check_token(user, token):
            user.set_password(password)
            user.is_active = True
            user.save()
            login(request, user)
            return HttpResponse("")
        else:
            return HttpResponse("errorToken")
    else:
        return render(request, "password-reset.html")
