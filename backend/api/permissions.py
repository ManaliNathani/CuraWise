from rest_framework.permissions import BasePermission


class IsRole(BasePermission):
    allowed_roles = []

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        profile = getattr(request.user, "userprofile", None)
        if not profile:
            return False
        return profile.role in self.allowed_roles


class IsDoctor(IsRole):
    allowed_roles = ["doctor", "admin"]

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        profile = getattr(request.user, "userprofile", None)
        if not profile:
            return False
        if profile.role == "admin":
            return True
        doctor_profile = getattr(request.user, "doctorprofile", None)
        return bool(doctor_profile and doctor_profile.is_approved)


class IsAdmin(IsRole):
    allowed_roles = ["admin"]
