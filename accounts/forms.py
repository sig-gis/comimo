from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

class SignUpForm(UserCreationForm):
    first_name = forms.CharField(max_length=30, help_text='Enter your name.')
    middle_name = forms.CharField(max_length=30, required=False, help_text='Enter your middle name. Optional')
    last_name = forms.CharField(max_length=30, required=False, help_text='Enter your last name. Optional.')
    second_last_name = forms.CharField(max_length=30, required=False, help_text='Enter your second last name. Optional.')
    email = forms.EmailField(max_length=254, help_text='Required. Inform a valid email address.')
    sector = forms.CharField(label="Which Sector Are you from?",
        widget=forms.Select(choices=[('academic','Academic'),('government','Government'),('ngo','NGO')]),
        required=False,
        help_text='Optional.')
    institution = forms.CharField(label="Institution", help_text='Which institution are you from?');
    idtype = forms.CharField(label="ID type",
        widget=forms.Select(choices=[('citizenship','citizenship'),('passport','Passport')]),
        required=False,
        help_text='Optional.')
    idnumber = forms.CharField(label="ID Number",
        required=False,
        help_text='Optional.')

    class Meta:
        model = User
        fields = ('username',
            'email',
            'first_name',
            'middle_name',
            'last_name',
            'second_last_name',
            'sector',
            'institution',
            'idtype',
            'idnumber',
            'password1',
            'password2')

    def clean_email(self):
        email = self.cleaned_data.get('email')
        try:
            match = User.objects.get(email=email)
        except User.DoesNotExist:
            return email

        raise forms.ValidationError('This email address is already in use.')
