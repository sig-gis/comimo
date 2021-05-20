from accounts.models import Profile


def getUserInfo(user):
    try:
        profile = Profile.objects.filter(user=user).first()
        return {
            "defaultLang": profile.default_lang,
            "username": user.username,
            "email": profile.email,
            "fullName": profile.full_name,
            "institution": profile.institution,
            "sector": profile.sector
        }
    except Exception as e:
        print(e)
        return None
