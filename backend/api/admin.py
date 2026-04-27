from django.contrib import admin

from .models import Consultation, DoctorProfile, Hospital, Message, SymptomCheck, UserProfile

admin.site.register(UserProfile)
admin.site.register(Hospital)
admin.site.register(DoctorProfile)
admin.site.register(SymptomCheck)
admin.site.register(Consultation)
admin.site.register(Message)
