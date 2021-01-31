
from django.urls import path
from .views import \
    index, recognise_speech, text_to_speech, \
    current_date_view, current_time_view, day_of_the_week_view, remove_temp, get_weather_view, get_temperature_view, \
    get_news_view, get_music_view

urlpatterns = [
    path('', index),
    path('voice', recognise_speech),
    path('tts', text_to_speech),
    path('current_date', current_date_view),
    path('current_time', current_time_view),
    path('current_day', day_of_the_week_view),
    path('delete_temp', remove_temp),
    path('get_temperature', get_temperature_view),
    path('get_weather', get_weather_view),
    path('get_news', get_news_view),
    path('play_music',  get_music_view),
]
