from django.shortcuts import render
from django.contrib.auth import login, authenticate
from .forms import SignUpForm
from django.shortcuts import render, redirect

def signupView(request):
    form = SignUpForm(request.POST)
    if form.is_valid():
        user = form.save()
        user.refresh_from_db()
        user.profile.first_name = form.cleaned_data.get('first_name')
        user.profile.middle_name = form.cleaned_data.get('middle_name')
        user.profile.last_name = form.cleaned_data.get('last_name')
        user.profile.second_last_name = form.cleaned_data.get('second_last_name')
        user.profile.sector = form.cleaned_data.get('sector')
        user.profile.institution = form.cleaned_data.get('institution')
        user.profile.idtype = form.cleaned_data.get('idtype')
        user.profile.idnumber = form.cleaned_data.get('idnumber')
        user.profile.email = form.cleaned_data.get('email')
        user.is_active = True
        user.save()
        raw_pass = form.cleaned_data.get('password1')
        user = authenticate(username=user.username,password=raw_pass)
        login(request,user)
        return redirect('home')
    else:
        # form = SignUpForm()
        pass
    return render(request, 'registration/signup.html', {'form': form})
