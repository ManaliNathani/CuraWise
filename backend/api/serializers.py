from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Consultation, DoctorProfile, Hospital, Message, SymptomCheck, UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["role", "city", "phone"]


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(source="userprofile", read_only=True)
    doctor_approved = serializers.SerializerMethodField()
    doctor_approval_status = serializers.SerializerMethodField()
    doctor_review_note = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "profile",
            "doctor_approved",
            "doctor_approval_status",
            "doctor_review_note",
        ]

    def get_doctor_approved(self, obj):
        profile = getattr(obj, "userprofile", None)
        if not profile or profile.role != UserProfile.ROLE_DOCTOR:
            return None
        doctor_profile = getattr(obj, "doctorprofile", None)
        return bool(doctor_profile and doctor_profile.is_approved)

    def get_doctor_approval_status(self, obj):
        profile = getattr(obj, "userprofile", None)
        if not profile or profile.role != UserProfile.ROLE_DOCTOR:
            return None
        doctor_profile = getattr(obj, "doctorprofile", None)
        if not doctor_profile:
            return None
        return doctor_profile.approval_status

    def get_doctor_review_note(self, obj):
        profile = getattr(obj, "userprofile", None)
        if not profile or profile.role != UserProfile.ROLE_DOCTOR:
            return None
        doctor_profile = getattr(obj, "doctorprofile", None)
        if not doctor_profile or not doctor_profile.review_note:
            return None
        return doctor_profile.review_note


class HospitalSerializer(serializers.ModelSerializer):
    reviewed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Hospital
        fields = [
            "id",
            "name",
            "city",
            "address",
            "specialties",
            "phone",
            "description",
            "is_approved",
            "approval_status",
            "review_note",
            "reviewed_at",
            "reviewed_by_name",
        ]

    def get_reviewed_by_name(self, obj):
        if not obj.reviewed_by:
            return None
        return obj.reviewed_by.get_full_name() or obj.reviewed_by.username


class DoctorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    hospital = HospitalSerializer(read_only=True)
    reviewed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = DoctorProfile
        fields = [
            "id",
            "user",
            "specialty",
            "hospital",
            "bio",
            "is_approved",
            "approval_status",
            "review_note",
            "reviewed_at",
            "reviewed_by_name",
        ]

    def get_reviewed_by_name(self, obj):
        if not obj.reviewed_by:
            return None
        return obj.reviewed_by.get_full_name() or obj.reviewed_by.username


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
