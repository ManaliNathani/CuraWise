from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Consultation, DoctorProfile, Hospital, Message, SymptomCheck, UserProfile
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
    text = symptoms.lower()
    if "chest" in text or "breath" in text:
        return "Possible cardiac/respiratory concern"
    if "fever" in text and "cough" in text:
        return "Likely viral infection"
    if "headache" in text or "migraine" in text:
        return "Migraine or tension headache"
    if "stomach" in text or "nausea" in text:
        return "Gastrointestinal discomfort"
    return "General consultation recommended"


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
        if username_lower.startswith("dr") or "doctor" in username_lower or first_name_lower.startswith("dr") or "doctor" in first_name_lower:
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
    qs = Hospital.objects.all()
    serializer = HospitalSerializer(qs, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def doctors(request):
    qs = DoctorProfile.objects.select_related("user", "hospital").filter(is_approved=True)
    serializer = DoctorProfileSerializer(qs, many=True)
    return Response(serializer.data)


@api_view(["POST"])
def symptom_checks(request):
    serializer = SymptomCheckSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    condition = predict_condition(serializer.validated_data["symptoms"])
    check = SymptomCheck.objects.create(
        user=request.user,
        symptoms=serializer.validated_data["symptoms"],
        severity=serializer.validated_data["severity"],
        city=serializer.validated_data["city"],
        predicted_condition=condition,
    )
    return Response(SymptomCheckSerializer(check).data, status=status.HTTP_201_CREATED)


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


@api_view(["GET"])
@permission_classes([IsAdmin])
def admin_stats(request):
    patient_count = UserProfile.objects.filter(role=UserProfile.ROLE_USER).count()
    doctors_qs = DoctorProfile.objects.select_related("user", "hospital").order_by("is_approved", "user__username")
    hospitals_qs = Hospital.objects.all().order_by("city", "name")

    approved_doctor_count = DoctorProfile.objects.filter(is_approved=True).count()
    data = {
        "users_count": patient_count,
        "doctors_count": approved_doctor_count,
        "doctors_pending_count": DoctorProfile.objects.filter(is_approved=False).count(),
        "hospitals_count": hospitals_qs.count(),
        "consultations_count": Consultation.objects.count(),
        "doctors_directory": DoctorProfileSerializer(doctors_qs, many=True).data,
        "hospitals_directory": HospitalSerializer(hospitals_qs, many=True).data,
        "active_users": patient_count,
        "doctors_online": approved_doctor_count,
        "hospitals": hospitals_qs.count(),
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
    qs = DoctorProfile.objects.filter(is_approved=False).select_related("user", "hospital")
    return Response(DoctorProfileSerializer(qs, many=True).data)


@api_view(["POST"])
@permission_classes([IsAdmin])
def approve_doctor(request, doctor_id: int):
    profile = DoctorProfile.objects.filter(id=doctor_id).select_related("user").first()
    if not profile:
        return Response({"detail": "Doctor not found."}, status=status.HTTP_404_NOT_FOUND)
    profile.is_approved = True
    profile.save()
    return Response({"detail": f"Approved {profile.user.username}."})
