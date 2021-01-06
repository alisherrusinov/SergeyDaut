
from django.urls import path
from .views import index, recognise_speech, text_to_speech, custom_recog

urlpatterns = [
    path('', index),
    path('voice', recognise_speech),
    path('tts', text_to_speech,),
    path('custom', custom_recog)
]
