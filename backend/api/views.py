from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
import re
from django.utils import timezone
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Consultation, DoctorProfile, Hospital, Message, SymptomCheck, UserProfile
from .diagnosis_engine import infer_conditions
from .permissions import IsAdmin, IsDoctor
from .serializers import (
    ConsultationSerializer,
    DoctorProfileSerializer,
    HospitalSerializer,
    MessageSerializer,
    SymptomCheckSerializer,
    UserSerializer,
)


def predict_condition(symptoms: str) -> str:
    result = infer_conditions(symptoms)
    return result["primary"]


CONDITION_SPECIALTY_MAP = {
    "Common cold": ["General Medicine", "Pulmonology", "ENT"],
    "Influenza (flu)": ["General Medicine", "Pulmonology", "Infectious Disease"],
    "COVID-19": ["General Medicine", "Pulmonology", "Infectious Disease"],
    "Migraine": ["Neurology", "General Medicine"],
    "Gastroenteritis": ["Gastroenterology", "General Medicine"],
    "Urinary tract infection": ["Urology", "General Medicine", "Nephrology"],
    "Asthma exacerbation": ["Pulmonology", "General Medicine"],
    "Possible cardiac concern": ["Cardiology", "Emergency Medicine", "General Medicine"],
    "Acute bronchitis": ["Pulmonology", "General Medicine"],
    "Pneumonia": ["Pulmonology", "General Medicine"],
    "Hypertensive urgency possibility": ["Cardiology", "General Medicine"],
    "Tension headache": ["Neurology", "General Medicine"],
    "Sinusitis": ["ENT", "General Medicine"],
    "Food poisoning": ["Gastroenterology", "General Medicine"],
    "Acid reflux / GERD": ["Gastroenterology", "General Medicine"],
    "Peptic ulcer possibility": ["Gastroenterology", "General Medicine"],
    "Irritable bowel syndrome (IBS)": ["Gastroenterology", "General Medicine"],
    "Kidney infection possibility": ["Nephrology", "Urology", "General Medicine"],
    "Dengue possibility": ["Infectious Disease", "General Medicine"],
    "Malaria possibility": ["Infectious Disease", "General Medicine"],
    "Typhoid fever possibility": ["Infectious Disease", "General Medicine"],
    "Allergic rhinitis": ["ENT", "General Medicine"],
    "Conjunctivitis": ["Ophthalmology", "General Medicine"],
    "Otitis media possibility": ["ENT", "General Medicine"],
    "Pharyngitis / tonsillitis": ["ENT", "General Medicine"],
    "Anxiety-related episode possibility": ["Psychiatry", "General Medicine"],
    "Diabetes hyperglycemia possibility": ["Endocrinology", "General Medicine"],
    "Dehydration": ["General Medicine", "Emergency Medicine"],
    "Jaundice / hepatitis possibility": ["Gastroenterology", "Hepatology", "General Medicine"],
}


def _recommended_specialties(primary_condition: str, top_matches: list) -> list:
    specialties = []
    candidates = [primary_condition] + [m.get("condition") for m in top_matches]
    for condition in candidates:
        for specialty in CONDITION_SPECIALTY_MAP.get(condition, ["General Medicine"]):
            if specialty not in specialties:
                specialties.append(specialty)
    return specialties[:4]


def _recommend_hospitals(city: str, specialties: list, limit: int = 5):
    city_qs = Hospital.objects.all()
    if city:
        city_qs = city_qs.filter(city__iexact=city)
    hospitals = list(city_qs)
    if not hospitals:
        hospitals = list(Hospital.objects.all())

    ranked = []
    for hospital in hospitals:
        score = 0
        text = (hospital.specialties or "").lower()
        for specialty in specialties:
            key = specialty.lower()
            if key in text:
                score += 2
        if city and hospital.city.lower() == city.lower():
            score += 1
        ranked.append((score, hospital))
    ranked.sort(key=lambda x: x[0], reverse=True)

    output = []
    for score, hospital in ranked[:limit]:
        output.append(
            {
                "id": hospital.id,
                "name": hospital.name,
                "city": hospital.city,
                "address": hospital.address,
                "specialties": hospital.specialties,
                "phone": hospital.phone,
                "match_score": score,
            }
        )
    return output


def _recommend_doctors(city: str, specialties: list, limit: int = 5):
    doctors = list(DoctorProfile.objects.select_related("user", "hospital").filter(is_approved=True))
    ranked = []
    for doctor in doctors:
        score = 0
        doctor_specialty = (doctor.specialty or "").lower()
        for specialty in specialties:
            if specialty.lower() in doctor_specialty:
                score += 3
        if city and doctor.hospital and doctor.hospital.city.lower() == city.lower():
            score += 1
        ranked.append((score, doctor))
    ranked.sort(key=lambda x: x[0], reverse=True)

    output = []
    for score, doctor in ranked[:limit]:
        output.append(
            {
                "id": doctor.id,
                "doctor_name": doctor.user.get_full_name() or doctor.user.username,
                "specialty": doctor.specialty,
                "hospital": doctor.hospital.name if doctor.hospital else None,
                "hospital_city": doctor.hospital.city if doctor.hospital else None,
                "is_approved": doctor.is_approved,
                "match_score": score,
            }
        )
    return output


@api_view(["GET"])
@permission_classes([AllowAny])
def csrf(request):
    return JsonResponse({"csrfToken": get_token(request)})


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    login(request, user)
    # Ensure session is saved to database before response
    request.session.save()
    response = Response(UserSerializer(user).data)
    # Ensure CSRF cookie is set
    from django.middleware.csrf import get_token
    get_token(request)
    return response


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def signup_view(request):
    username = request.data.get("username")
    password = request.data.get("password")
    first_name = request.data.get("first_name", "")
    last_name = request.data.get("last_name", "")
    role = request.data.get("role", "user")
    specialty = request.data.get("specialty", "")
    hospital_id = request.data.get("hospital_id")

    if not username or not password:
        return Response({"detail": "Username and password are required."}, status=status.HTTP_400_BAD_REQUEST)

    username_lower = username.lower()
    first_name_lower = first_name.lower()
    if role not in ["user", "doctor", "admin"]:
        role = "user"

    if role == "user":
        # Promote to doctor registration when the name indicates Dr./Doctor.
        if (
            re.search(r"\bdr\.?\b", first_name_lower)
            or "doctor" in first_name_lower
            or re.search(r"\bdr\.?\b", username_lower)
            or "doctor" in username_lower
        ):
            role = "doctor"

    if User.objects.filter(username=username).exists():
        return Response({"detail": "Username already exists."}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, password=password, first_name=first_name, last_name=last_name)
    user.userprofile.role = role
    user.userprofile.save()

    if role == "doctor":
        hospital = Hospital.objects.filter(id=hospital_id).first() if hospital_id else None
        DoctorProfile.objects.create(
            user=user,
            specialty=specialty or "General Medicine",
            hospital=hospital,
            is_approved=False,
            approval_status=DoctorProfile.STATUS_PENDING,
        )

    login(request, user)
    # Ensure session is saved to database before response
    request.session.save()
    response = Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    # Ensure CSRF cookie is set
    from django.middleware.csrf import get_token
    get_token(request)
    return response


@api_view(["POST"])
def logout_view(request):
    logout(request)
    return Response({"detail": "Logged out"})


@api_view(["GET"])
def me(request):
    user = request.user
    if not hasattr(user, 'userprofile'):
        UserProfile.objects.create(user=user, role=UserProfile.ROLE_USER)
    return Response(UserSerializer(user).data)


@api_view(["POST"])
def update_profile(request):
    profile = request.user.userprofile
    profile.city = request.data.get("city", profile.city)
    profile.phone = request.data.get("phone", profile.phone)
    profile.save()

    if profile.role == "doctor":
        specialty = request.data.get("specialty")
        bio = request.data.get("bio")
        hospital_id = request.data.get("hospital_id")
        doctor_profile = DoctorProfile.objects.filter(user=request.user).first()
        if doctor_profile:
            if specialty:
                doctor_profile.specialty = specialty
            if bio is not None:
                doctor_profile.bio = bio
            if hospital_id is not None:
                doctor_profile.hospital = Hospital.objects.filter(id=hospital_id).first()
            doctor_profile.save()

    return Response(UserSerializer(request.user).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def hospitals(request):
    qs = Hospital.objects.filter(is_approved=True)
    serializer = HospitalSerializer(qs, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([AllowAny])
def hospital_register(request):
    name = (request.data.get("name") or "").strip()
    city = (request.data.get("city") or "").strip()
    address = (request.data.get("address") or "").strip()
    specialties = (request.data.get("specialties") or "").strip()
    phone = (request.data.get("phone") or "").strip()
    description = (request.data.get("description") or "").strip()
    if not all([name, city, address, specialties, description]):
        return Response({"detail": "Name, city, address, specialties and description are required."}, status=status.HTTP_400_BAD_REQUEST)
    hospital = Hospital.objects.create(
        name=name,
        city=city,
        address=address,
        specialties=specialties,
        phone=phone,
        description=description,
        is_approved=False,
        approval_status=Hospital.STATUS_PENDING,
    )
    return Response({"detail": "Hospital registration submitted for admin approval.", "id": hospital.id}, status=status.HTTP_201_CREATED)


@api_view(["GET"])
def doctors(request):
    qs = DoctorProfile.objects.select_related("user", "hospital").filter(is_approved=True)
    serializer = DoctorProfileSerializer(qs, many=True)
    return Response(serializer.data)


@api_view(["POST"])
def symptom_checks(request):
    serializer = SymptomCheckSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    inference = infer_conditions(serializer.validated_data["symptoms"])
    condition = inference["primary"]
    check = SymptomCheck.objects.create(
        user=request.user,
        symptoms=serializer.validated_data["symptoms"],
        severity=serializer.validated_data["severity"],
        city=serializer.validated_data["city"],
        predicted_condition=condition,
    )
    payload = SymptomCheckSerializer(check).data
    specialties = _recommended_specialties(inference["primary"], inference["suggestions"])
    recommended_hospitals = _recommend_hospitals(serializer.validated_data["city"], specialties)
    recommended_doctors = _recommend_doctors(serializer.validated_data["city"], specialties)
    payload["prediction"] = {
        "primary_condition": inference["primary"],
        "confidence_percent": inference["confidence"],
        "triage": inference["triage"],
        "red_flags": inference["red_flags"],
        "recommended_specialties": specialties,
        "recommended_doctors": recommended_doctors,
        "recommended_hospitals": recommended_hospitals,
        "top_matches": inference["suggestions"],
        "sources": inference["sources"],
        "disclaimer": "This is a decision-support estimate, not a medical diagnosis.",
    }
    return Response(payload, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def symptom_report(request):
    serializer = SymptomCheckSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    symptoms = serializer.validated_data["symptoms"]
    severity = serializer.validated_data["severity"]
    city = serializer.validated_data["city"]

    inference = infer_conditions(symptoms)
    specialties = _recommended_specialties(inference["primary"], inference["suggestions"])
    recommended_hospitals = _recommend_hospitals(city, specialties)
    recommended_doctors = _recommend_doctors(city, specialties)

    report = {
        "report_type": "clinical_decision_support",
        "patient_input": {
            "symptoms": symptoms,
            "severity": severity,
            "city": city,
        },
        "clinical_summary": {
            "primary_condition": inference["primary"],
            "confidence_percent": inference["confidence"],
            "triage": inference["triage"],
            "red_flags": inference["red_flags"],
            "recommended_specialties": specialties,
        },
        "differential_diagnosis": inference["suggestions"],
        "doctor_recommendations": recommended_doctors,
        "hospital_recommendations": recommended_hospitals,
        "medical_sources": inference["sources"],
        "safety_note": "Emergency warning signs require immediate in-person care.",
        "disclaimer": "This report supports decisions and does not replace diagnosis by a licensed doctor.",
    }
    return Response(report, status=status.HTTP_200_OK)


@api_view(["GET"])
def my_consultations(request):
    if request.user.userprofile.role == "doctor":
        qs = Consultation.objects.filter(doctor=request.user).select_related("user", "doctor", "symptom_check")
    else:
        qs = Consultation.objects.filter(user=request.user).select_related("user", "doctor", "symptom_check")
    return Response(ConsultationSerializer(qs, many=True).data)


@api_view(["POST"])
def create_consultation(request):
    doctor_id = request.data.get("doctor_id")
    check_id = request.data.get("symptom_check_id")
    doctor = User.objects.get(id=doctor_id)
    if doctor.userprofile.role != "doctor":
        return Response({"detail": "Selected user is not a doctor."}, status=status.HTTP_400_BAD_REQUEST)
    doctor_profile = DoctorProfile.objects.filter(user=doctor).first()
    if not doctor_profile or not doctor_profile.is_approved:
        return Response({"detail": "Doctor is not approved yet."}, status=status.HTTP_400_BAD_REQUEST)
    check = SymptomCheck.objects.filter(id=check_id).first()
    consultation = Consultation.objects.create(user=request.user, doctor=doctor, symptom_check=check, status="active")
    return Response(ConsultationSerializer(consultation).data, status=status.HTTP_201_CREATED)


@api_view(["GET", "POST"])
def messages(request, consultation_id):
    consultation = get_object_or_404(Consultation, id=consultation_id)
    if consultation.user_id != request.user.id and consultation.doctor_id != request.user.id:
        return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "GET":
        qs = Message.objects.filter(consultation_id=consultation_id).select_related("sender").order_by("created_at")
        return Response(MessageSerializer(qs, many=True).data)

    content = (request.data.get("content") or "").strip()
    if not content:
        return Response({"detail": "Content is required."}, status=status.HTTP_400_BAD_REQUEST)

    message = Message.objects.create(consultation=consultation, sender=request.user, content=content)
    serialized = MessageSerializer(message).data

    channel_layer = get_channel_layer()
    if channel_layer:
        async_to_sync(channel_layer.group_send)(
            f"consultation_{consultation_id}",
            {"type": "chat_message", "message": serialized},
        )

    return Response(serialized, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsDoctor])
def close_consultation(request, consultation_id: int):
    consultation = Consultation.objects.filter(id=consultation_id).select_related("doctor").first()
    if not consultation:
        return Response({"detail": "Consultation not found."}, status=status.HTTP_404_NOT_FOUND)
    if consultation.doctor_id != request.user.id and request.user.userprofile.role != UserProfile.ROLE_ADMIN:
        return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
    consultation.status = "closed"
    consultation.save(update_fields=["status"])
    return Response({"detail": f"Consultation {consultation_id} marked done."})


@api_view(["GET"])
@permission_classes([IsAdmin])
def admin_stats(request):
    patient_count = UserProfile.objects.filter(role=UserProfile.ROLE_USER).count()
    doctors_qs = DoctorProfile.objects.select_related("user", "hospital").order_by("is_approved", "user__username")
    users_qs = User.objects.select_related("userprofile").filter(userprofile__role=UserProfile.ROLE_USER).order_by("username")
    hospitals_qs = Hospital.objects.all().order_by("city", "name")

    approved_doctor_count = DoctorProfile.objects.filter(is_approved=True).count()
    approved_hospital_count = Hospital.objects.filter(is_approved=True).count()
    data = {
        "users_count": patient_count,
        "doctors_count": approved_doctor_count,
        "doctors_pending_count": DoctorProfile.objects.filter(is_approved=False).count(),
        "hospitals_count": approved_hospital_count,
        "hospitals_pending_count": Hospital.objects.filter(approval_status=Hospital.STATUS_PENDING).count(),
        "consultations_count": Consultation.objects.count(),
        "doctors_directory": DoctorProfileSerializer(doctors_qs, many=True).data,
        "users_directory": UserSerializer(users_qs, many=True).data,
        "hospitals_directory": HospitalSerializer(hospitals_qs, many=True).data,
        "active_users": patient_count,
        "doctors_online": approved_doctor_count,
        "hospitals": approved_hospital_count,
        "consultations_today": Consultation.objects.count(),
    }
    return Response(data)


@api_view(["GET"])
@permission_classes([IsDoctor])
def doctor_queue(request):
    profile = DoctorProfile.objects.filter(user=request.user).first()
    if not profile or not profile.is_approved:
        return Response({"detail": "Doctor not approved."}, status=status.HTTP_403_FORBIDDEN)
    qs = Consultation.objects.filter(doctor=request.user, status__in=["open", "active"]).select_related(
        "user", "doctor", "symptom_check"
    )
    return Response(ConsultationSerializer(qs, many=True).data)


@api_view(["GET"])
@permission_classes([IsDoctor])
def doctor_profile(request):
    profile = DoctorProfile.objects.filter(user=request.user).select_related("hospital").first()
    if not profile:
        return Response({"detail": "Doctor profile not found."}, status=status.HTTP_404_NOT_FOUND)
    return Response(DoctorProfileSerializer(profile).data)


@api_view(["GET"])
@permission_classes([IsAdmin])
def pending_doctors(request):
    qs = DoctorProfile.objects.filter(approval_status=DoctorProfile.STATUS_PENDING).select_related("user", "hospital")
    return Response(DoctorProfileSerializer(qs, many=True).data)


@api_view(["POST"])
@permission_classes([IsAdmin])
def approve_doctor(request, doctor_id: int):
    profile = DoctorProfile.objects.filter(id=doctor_id).select_related("user").first()
    if not profile:
        return Response({"detail": "Doctor not found."}, status=status.HTTP_404_NOT_FOUND)
    review_note = (request.data.get("review_note") or "").strip()
    profile.is_approved = True
    profile.approval_status = DoctorProfile.STATUS_APPROVED
    profile.review_note = review_note
    profile.reviewed_at = timezone.now()
    profile.reviewed_by = request.user
    profile.save()
    return Response({"detail": f"Approved {profile.user.username}."})


@api_view(["POST"])
@permission_classes([IsAdmin])
def reject_doctor(request, doctor_id: int):
    profile = DoctorProfile.objects.filter(id=doctor_id).select_related("user").first()
    if not profile:
        return Response({"detail": "Doctor not found."}, status=status.HTTP_404_NOT_FOUND)
    review_note = (request.data.get("review_note") or "").strip()
    if not review_note:
        return Response({"detail": "Review note is required for rejection."}, status=status.HTTP_400_BAD_REQUEST)
    profile.is_approved = False
    profile.approval_status = DoctorProfile.STATUS_REJECTED
    profile.review_note = review_note
    profile.reviewed_at = timezone.now()
    profile.reviewed_by = request.user
    profile.save()
    return Response({"detail": f"Rejected {profile.user.username}."})


@api_view(["GET"])
@permission_classes([IsAdmin])
def pending_hospitals(request):
    qs = Hospital.objects.filter(approval_status=Hospital.STATUS_PENDING).order_by("name")
    return Response(HospitalSerializer(qs, many=True).data)


@api_view(["POST"])
@permission_classes([IsAdmin])
def approve_hospital(request, hospital_id: int):
    hospital = Hospital.objects.filter(id=hospital_id).first()
    if not hospital:
        return Response({"detail": "Hospital not found."}, status=status.HTTP_404_NOT_FOUND)
    review_note = (request.data.get("review_note") or "").strip()
    hospital.is_approved = True
    hospital.approval_status = Hospital.STATUS_APPROVED
    hospital.review_note = review_note
    hospital.reviewed_at = timezone.now()
    hospital.reviewed_by = request.user
    hospital.save()
    return Response({"detail": f"Approved {hospital.name}."})


@api_view(["POST"])
@permission_classes([IsAdmin])
def reject_hospital(request, hospital_id: int):
    hospital = Hospital.objects.filter(id=hospital_id).first()
    if not hospital:
        return Response({"detail": "Hospital not found."}, status=status.HTTP_404_NOT_FOUND)
    review_note = (request.data.get("review_note") or "").strip()
    if not review_note:
        return Response({"detail": "Review note is required for rejection."}, status=status.HTTP_400_BAD_REQUEST)
    hospital.is_approved = False
    hospital.approval_status = Hospital.STATUS_REJECTED
    hospital.review_note = review_note
    hospital.reviewed_at = timezone.now()
    hospital.reviewed_by = request.user
    hospital.save()
    return Response({"detail": f"Rejected {hospital.name}."})


@api_view(["POST"])
@permission_classes([IsAdmin])
def delete_user(request, user_id: int):
    if request.user.id == user_id:
        return Response({"detail": "You cannot delete your own admin account."}, status=status.HTTP_400_BAD_REQUEST)
    user = User.objects.filter(id=user_id).first()
    if not user:
        return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    username = user.username
    user.delete()
    return Response({"detail": f"Deleted user {username}."})


@api_view(["POST"])
@permission_classes([IsAdmin])
def delete_doctor(request, doctor_id: int):
    profile = DoctorProfile.objects.filter(id=doctor_id).select_related("user").first()
    if not profile:
        return Response({"detail": "Doctor not found."}, status=status.HTTP_404_NOT_FOUND)
    if profile.user_id == request.user.id:
        return Response({"detail": "You cannot delete your own admin account."}, status=status.HTTP_400_BAD_REQUEST)
    username = profile.user.username
    profile.user.delete()
    return Response({"detail": f"Deleted doctor account {username}."})


@api_view(["POST"])
@permission_classes([IsAdmin])
def delete_hospital(request, hospital_id: int):
    hospital = Hospital.objects.filter(id=hospital_id).first()
    if not hospital:
        return Response({"detail": "Hospital not found."}, status=status.HTTP_404_NOT_FOUND)
    name = hospital.name
    hospital.delete()
    return Response({"detail": f"Deleted hospital {name}."})
