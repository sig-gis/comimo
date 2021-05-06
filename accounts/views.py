import json
from django.contrib.auth import login, logout, authenticate, tokens
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, redirect
from django.db.models import Q
from django.contrib.auth.models import User
from accounts.models import Profile
from django.db import transaction


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
            email = JSONbody.get("email").strip()
            username = JSONbody.get("username").strip()
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
                    new_user = User()
                    new_user.username = username
                    new_user.email = email
                    new_user.set_password = JSONbody.get("password")
                    new_user.save()

                    new_user.profile.full_name = JSONbody.get(
                        "fullName").strip()
                    new_user.profile.sector = JSONbody.get("sector").strip()
                    new_user.profile.institution = JSONbody.get(
                        "institution").strip()
                    new_user.profile.email = email
                    new_user.save()

                    login(request, new_user)
                return HttpResponse("")
        except Exception as e:
            print(e)
            return HttpResponse("errorCreating")
    else:
        return render(request, "register.html")


def loginView(request):
    if request.method == "POST":
        JSONbody = json.loads(request.body)
        user = authenticate(username=JSONbody.get("username"),
                            password=JSONbody.get("password"))
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
        user = getUser(JSONbody.get("email"))

        if user is not None:
            gen = PasswordResetTokenGenerator()
            token = gen.make_token(user)
            # Email the token to the user
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
        user = getUser(JSONbody.get("username"))
        gen = PasswordResetTokenGenerator()

        if user is None:
            return HttpResponse("errorNotFound")
        elif gen.check_token(user, token):
            user.set_password(password)
            user.save()
            login(request, user)
            return HttpResponse("")
        else:
            return HttpResponse("errorToken")
    else:
        return render(request, "password-reset.html")
