
from django.urls import path
from .views import index, get_voice, text_to_speech

urlpatterns = [
    path('', index),
    path('voice', get_voice),
    path('tts', text_to_speech,)
]
