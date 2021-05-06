import json
from django.contrib.auth import login, logout, authenticate, tokens
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, redirect
from django.db.models import Q
from django.contrib.auth.models import User
from .forms import SignUpForm


def getUser(email):
    try:
        return User.objects.get(Q(email=email) | Q(username=email))
    except Exception as e:
        return None

def signupView(request):
    form = SignUpForm(request.POST)
    if form.is_valid():
        user = form.save()
        user.refresh_from_db()
        user.profile.first_name = form.cleaned_data.get('first_name')
        user.profile.middle_name = form.cleaned_data.get('middle_name')
        user.profile.last_name = form.cleaned_data.get('last_name')
        user.profile.second_last_name = form.cleaned_data.get(
            'second_last_name')
        user.profile.sector = form.cleaned_data.get('sector')
        user.profile.institution = form.cleaned_data.get('institution')
        user.profile.idtype = form.cleaned_data.get('idtype')
        user.profile.idnumber = form.cleaned_data.get('idnumber')
        user.profile.email = form.cleaned_data.get('email')
        user.is_active = True
        user.save()
        raw_pass = form.cleaned_data.get('password1')
        user = authenticate(username=user.username, password=raw_pass)
        login(request, user)
        return redirect('home')
    else:
        pass
    return render(request, 'registration/signup.html', {'form': form})


def loginView(request):
    if request.method == "POST":
        JSONbody = json.loads(request.body)
        user = authenticate(username=JSONbody.get('username'),
                            password=JSONbody.get('password'))
        if user is not None:
            login(request, user)
            return redirect('home')
        else:
            return HttpResponse("errorLogin")
    else:
        return render(request, 'login.html')


def logoutView(request):
    logout(request)
    return redirect('home')


def forgotView(request):
    if request.method == "POST":
        JSONbody = json.loads(request.body)
        user = getUser(JSONbody.get('email'))

        if user is not None:
            gen = PasswordResetTokenGenerator()
            token = gen.make_token(user)
            return HttpResponse("")
        else:
            return HttpResponse("errorNotFound")
    else:
        return render(request, 'password-forgot.html')


def resetView(request):
    if request.method == "POST":
        JSONbody = json.loads(request.body)
        token = JSONbody.get('token')
        password = JSONbody.get('password')
        user = getUser(JSONbody.get('username'))
        gen = PasswordResetTokenGenerator()

        if user is None:
            return HttpResponse("errorNotFound")
        elif gen.check_token(user, token):
            user.set_password(password)
            user.save()
            login(request, user)
            return redirect('home')
        else:
            return HttpResponse("errorToken")
    else:
        return render(request, 'password-reset.html')
