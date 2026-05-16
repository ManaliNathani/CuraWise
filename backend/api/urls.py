from django.urls import re_path
from django.views.decorators.csrf import csrf_exempt

from . import views

urlpatterns = [
    re_path(r"^csrf/?$", views.csrf),
    # SPA via Next.js proxy: CSRF cookie/header often misalign; session auth still applies after login.
    re_path(r"^auth/login/?$", csrf_exempt(views.login_view)),
    re_path(r"^auth/signup/?$", csrf_exempt(views.signup_view)),
    re_path(r"^auth/logout/?$", views.logout_view),
    re_path(r"^auth/me/?$", views.me),
    re_path(r"^profile/update/?$", views.update_profile),
    re_path(r"^hospitals/?$", views.hospitals),
    re_path(r"^hospitals/register/?$", views.hospital_register),
    re_path(r"^doctors/?$", views.doctors),
    re_path(r"^doctor/me/?$", views.doctor_profile),
    re_path(r"^symptom-checks/?$", views.symptom_checks),
    re_path(r"^symptom-report/?$", views.symptom_report),
    re_path(r"^consultations/?$", views.my_consultations),
    re_path(r"^consultations/create/?$", views.create_consultation),
    re_path(r"^consultations/(?P<consultation_id>\d+)/messages/?$", views.messages),
    re_path(r"^consultations/(?P<consultation_id>\d+)/close/?$", views.close_consultation),
    re_path(r"^doctor/queue/?$", views.doctor_queue),
    re_path(r"^admin/doctors/pending/?$", views.pending_doctors),
    re_path(r"^admin/doctors/(?P<doctor_id>\d+)/approve/?$", views.approve_doctor),
    re_path(r"^admin/doctors/(?P<doctor_id>\d+)/reject/?$", views.reject_doctor),
    re_path(r"^admin/hospitals/pending/?$", views.pending_hospitals),
    re_path(r"^admin/hospitals/(?P<hospital_id>\d+)/approve/?$", views.approve_hospital),
    re_path(r"^admin/hospitals/(?P<hospital_id>\d+)/reject/?$", views.reject_hospital),
    re_path(r"^admin/users/(?P<user_id>\d+)/delete/?$", views.delete_user),
    re_path(r"^admin/doctors/(?P<doctor_id>\d+)/delete/?$", views.delete_doctor),
    re_path(r"^admin/hospitals/(?P<hospital_id>\d+)/delete/?$", views.delete_hospital),
    re_path(r"^admin/stats/?$", views.admin_stats),
]
