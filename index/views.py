from django.shortcuts import render, HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from gtts import gTTS
import os
from .converters import speech_to_text
from .functions import current_time, day_of_the_week, current_date, get_temperature, get_description_weather, \
    get_news, get_youtube_music, get_seconds_from_date, search_ebay, get_description_ebay


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
    if (request.method == 'POST'):
        directory = settings.TEMP_FILES
        filename = f'temp{len(os.listdir(directory)) + 1}.wav'
        temp_path = os.path.join(directory, filename)
        with open(temp_path, 'wb+') as destination:
            for chunk in request.FILES['voice'].chunks():
                destination.write(chunk)
        text = speech_to_text(temp_path)

        os.popen(f'rm {temp_path}')

        print(text['text'])
        return HttpResponse(text['text'])


@csrf_exempt
def text_to_speech(request):
    """
        Функция которая синтезирует речь
        Приходят строки через POST запрос.
        Возвращается название файла в папке MEDIA.
    """
    if (request.method == 'POST'):
        text = request.POST.get('text')
        print(text)
        tts = gTTS(text)
        directory = settings.MEDIA_ROOT
        response = f"{len(os.listdir(directory)) + 1}.mp3"
        filename = os.path.join(settings.MEDIA_ROOT, response)
        tts.save(filename)
        return HttpResponse(response)


@csrf_exempt
def remove_temp(request):
    if (request.method == 'POST'):
        text = request.POST.get('text')
        print(f"rm {os.path.join(settings.MEDIA_ROOT, text)}")
        directory = settings.MEDIA_ROOT
        os.popen(f'rm {settings.MEDIA_ROOT}/{text}')
        return HttpResponse('ok')


def current_date_view(request):
    return HttpResponse(current_date())


def current_time_view(request):
    return JsonResponse(dict(data=current_time()))


def day_of_the_week_view(request):
    return JsonResponse(dict(data=day_of_the_week()))


@csrf_exempt
def get_weather_view(request):
    """
    :param request: пост запрос с переменной city - название города
    :return: описание погоды в городе
    """
    if (request.method == 'POST'):
        city = request.POST.get('city')
        print(city)
        return JsonResponse(dict(data=get_description_weather(city)))


@csrf_exempt
def get_temperature_view(request):
    """
    :param request: пост запрос с переменной city - название города
    :return: температуру в городе
    """
    if (request.method == 'POST'):
        city = request.POST.get('city')
        print(city)
        return JsonResponse(dict(data=get_temperature(city)))


@csrf_exempt
def get_news_view(request):
    """
    :param request:
    :return: Список первых десяти новостей
    """
    response, ids = get_news()

    answer = ""

    for i in response[:10]:
        answer += f"{i}. "
    return JsonResponse(dict(data=answer))


@csrf_exempt
def get_music_view(request):
    if (request.method == 'POST'):
        query = request.POST.get('text')
        print(query)

        song_name = get_youtube_music(query)

        return HttpResponse(song_name)


@csrf_exempt
def get_timedelta_view(request):
    if (request.method == 'POST'):
        query = request.POST.get('text')
        delta = get_seconds_from_date(query)

        return HttpResponse(delta)


@csrf_exempt
def get_products_view(request):
    if (request.method == 'POST'):
        query = request.POST.get('text')
        response, links, prices = search_ebay(query)

        return JsonResponse(dict(data=response, links=links, prices=prices, ))


@csrf_exempt
def det_decs_view(request):
    if (request.method == 'POST'):
        query = request.POST.get('text')
        response = get_description_ebay(query)

        return HttpResponse(response)
