from django.urls import path
from . import views

urlpatterns = [
    path("", views.lobby),
    path("get_token/", views.getToken),
    path("room/", views.room),
]
