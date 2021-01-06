from django.shortcuts import render, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from gtts import gTTS
import os
# Create your views here.

def index(request):
    return render(request, 'index/index.html')


@csrf_exempt
def get_voice(request):
    if(request.method == 'POST'):
        print(request.FILES['voice'])
        filename = 'demo.wav'
        with open(filename, 'wb+') as destination:
            for chunk in request.FILES['voice'].chunks():
                destination.write(chunk)
        return HttpResponse('ok')


@csrf_exempt
def text_to_speech(request):
    if(request.method == 'POST'):
        text = request.POST.get('text')
        print(text)
        tts = gTTS(text)
        tts.save(os.path.join(settings.MEDIA_ROOT, f'{text}.mp3'))
        return HttpResponse(f'{text}.mp3')
    else:
        return render(request, 'index/tts.html')

def custom_recog(request):
    return render(request, 'index/custom.html')

