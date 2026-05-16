from django.contrib.auth.models import User

from .models import DoctorProfile, Hospital, UserProfile


def run():
    # Keep data minimal as requested: only one admin, one doctor, one user.
    keep_usernames = {"admin", "dr_arjun", "user_aisha"}
    User.objects.exclude(username__in=keep_usernames).delete()
    Hospital.objects.all().delete()

    admin, _ = User.objects.get_or_create(username="admin")
    admin.set_password("admin123")
    admin.save()
    admin.userprofile.role = UserProfile.ROLE_ADMIN
    admin.userprofile.save()

    doctor, _ = User.objects.get_or_create(username="dr_arjun", defaults={"first_name": "Arjun"})
    doctor.set_password("doctor123")
    doctor.first_name = doctor.first_name or "Arjun"
    doctor.save()
    doctor.userprofile.role = UserProfile.ROLE_DOCTOR
    doctor.userprofile.save()
    DoctorProfile.objects.update_or_create(
        user=doctor,
        defaults={
            "specialty": "General Medicine",
            "hospital": None,
            "is_approved": True,
            "approval_status": DoctorProfile.STATUS_APPROVED,
            "review_note": "Seed approved",
        },
    )

    user, _ = User.objects.get_or_create(username="user_aisha", defaults={"first_name": "Aisha"})
    user.set_password("user123")
    user.first_name = user.first_name or "Aisha"
    user.save()
    user.userprofile.role = UserProfile.ROLE_USER
    user.userprofile.save()

    print("Minimal seed ready: admin, one doctor, one user. No seeded hospitals.")
