from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Consultation, DoctorProfile, Hospital, Message, SymptomCheck, UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["role", "city", "phone"]


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(source="userprofile", read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "profile"]


class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields = ["id", "name", "city", "address", "specialties", "phone"]


class DoctorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    hospital = HospitalSerializer(read_only=True)

    class Meta:
        model = DoctorProfile
        fields = ["id", "user", "specialty", "hospital", "bio", "is_approved"]


class SymptomCheckSerializer(serializers.ModelSerializer):
    class Meta:
        model = SymptomCheck
        fields = ["id", "symptoms", "severity", "city", "predicted_condition", "created_at"]
        read_only_fields = ["predicted_condition", "created_at"]


class ConsultationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    doctor = UserSerializer(read_only=True)
    symptom_check = SymptomCheckSerializer(read_only=True)

    class Meta:
        model = Consultation
        fields = ["id", "user", "doctor", "symptom_check", "status", "created_at"]


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ["id", "sender", "content", "created_at"]
