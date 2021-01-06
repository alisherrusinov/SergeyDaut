
from django.urls import path
from .views import index, get_voice, text_to_speech, custom_recog

urlpatterns = [
    path('', index),
    path('voice', get_voice),
    path('tts', text_to_speech,),
    path('custom', custom_recog)
]
