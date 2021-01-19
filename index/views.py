from django.shortcuts import render, HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from gtts import gTTS
import os
from .converters import speech_to_text
from .functions import current_time, day_of_the_week, current_date, get_temperature, get_description_weather

# Create your views here.


def index(request):
    return render(request, 'index/index.html')

@csrf_exempt
def recognise_speech(request):
    """
    Функция которая распознает речь пользователя
    Приходят blob файлы через POST запрос.
    Возвращается текст.
    """
    if(request.method == 'POST'):
        directory = settings.TEMP_FILES
        filename = f'temp{len(os.listdir(directory))+1}.wav'
        temp_path = os.path.join(directory, filename)
        with open(temp_path, 'wb+') as destination:
            for chunk in request.FILES['voice'].chunks():
                destination.write(chunk)
        text = speech_to_text(temp_path)
        print(text['text'])
        return JsonResponse(dict(text=text['text']))


@csrf_exempt
def text_to_speech(request):
    """
        Функция которая синтезирует речь
        Приходят строки через POST запрос.
        Возвращается название файла в папке MEDIA.
        """
    if(request.method == 'POST'):
        text = request.POST.get('text')
        print(text)
        tts = gTTS(text)
        tts.save(os.path.join(settings.MEDIA_ROOT, f'{text[:10]}.mp3'))
        return HttpResponse(f'{text[:10]}.mp3')
    else: # TODO: На продакшене убрать нужно это
        return render(request, 'index/tts.html')

@csrf_exempt
def remove_temp(request):
    if (request.method == 'POST'):
        text = request.POST.get('text')
        print(f"rm {os.path.join(settings.MEDIA_ROOT, text)}")
        os.popen(f'rm {settings.MEDIA_ROOT}/"{text[:10]}.mp3"')
        return HttpResponse('ok')

def custom_recog(request):# TODO: На продакшене убрать нужно это
    return render(request, 'index/custom.html')


def current_date_view(request):
    return JsonResponse(dict(data=current_date()))


def current_time_view(request):
    return JsonResponse(dict(data=current_time()))


def day_of_the_week_view(request):
    return JsonResponse(dict(data=day_of_the_week()))


@csrf_exempt
def get_weather_view(request):
    """
    :param request:
    :return: описание погоды в городе
    """
    if(request.method == 'POST'):
        city = request.POST.get('city')
        print(city)
        return JsonResponse(dict(data=get_description_weather(city)))

@csrf_exempt
def get_temperature_view(request):
    """
    :param request:
    :return: температуру в городе
    """
    if(request.method == 'POST'):
        city = request.POST.get('city')
        print(city)
        return JsonResponse(dict(data=get_temperature(city)))
