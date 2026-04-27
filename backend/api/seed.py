from django.contrib.auth.models import User

from .models import DoctorProfile, Hospital, UserProfile


def run():
    hospital, _ = Hospital.objects.get_or_create(
        name="CityCare Medical Center",
        defaults={
            "city": "Mumbai",
            "address": "24 Health Avenue",
            "specialties": "Cardiology, General Medicine, Neurology",
            "phone": "+91-90000-00000",
        },
    )
    Hospital.objects.get_or_create(
        name="GreenCross Clinic",
        defaults={
            "city": "Mumbai",
            "address": "18 Bandra West",
            "specialties": "Neurology, Pediatrics",
            "phone": "+91-90000-00001",
        },
    )
    Hospital.objects.get_or_create(
        name="Harbor Hospital",
        defaults={
            "city": "Mumbai",
            "address": "Dock Road, Colaba",
            "specialties": "Emergency, General Medicine",
            "phone": "+91-90000-00002",
        },
    )
    Hospital.objects.get_or_create(
        name="Delhi Medical Institute",
        defaults={
            "city": "New Delhi",
            "address": "Connaught Place",
            "specialties": "Multi-specialty, Oncology",
            "phone": "+91-90000-00003",
        },
    )

    if not User.objects.filter(username="admin").exists():
        admin = User.objects.create_user(username="admin", password="admin123")
        admin.userprofile.role = UserProfile.ROLE_ADMIN
        admin.userprofile.save()

    if not User.objects.filter(username="dr_arjun").exists():
        doctor = User.objects.create_user(username="dr_arjun", password="doctor123", first_name="Arjun")
        doctor.userprofile.role = UserProfile.ROLE_DOCTOR
        doctor.userprofile.save()
        DoctorProfile.objects.create(user=doctor, specialty="Cardiology", hospital=hospital, is_approved=True)

    if not User.objects.filter(username="user_aisha").exists():
        user = User.objects.create_user(username="user_aisha", password="user123", first_name="Aisha")
        user.userprofile.role = UserProfile.ROLE_USER
        user.userprofile.save()

    print("Seed data ready.")
