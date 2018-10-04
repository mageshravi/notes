from django.urls import path
from .views import *

app_name = 'notes'
urlpatterns = [
    path('', Home.as_view(), name='home'),
]
