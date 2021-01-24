// Создаем распознаватель
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;

var grammar = '#JSGF V1.0;'

var recognition = new SpeechRecognition();
var speechRecognitionList = new SpeechGrammarList();
speechRecognitionList.addFromString(grammar, 1);
recognition.grammars = speechRecognitionList;
recognition.lang = 'en-US';
// Ставим опцию, чтобы распознавание началось ещё до того, как пользователь закончит говорить
recognition.interimResults = true;
recognition.continuous = false;
recognition.maxAlternatives = 1;

// Какой язык будем распознавать?
recognition.lang = 'en-US';

ACTIVATION_PHASES = ['system', 'assistant']

STOP_PHRASES = ['stop']

// Используем колбек для обработки результатов
recognition.onresult = function (event) {
  var result = event.results[event.resultIndex];
  if (result.isFinal) {
    console.log('Вы сказали: ' + result[0].transcript);
    text = result[0].transcript
    text = text.toLowerCase()
    if (contains(text, ACTIVATION_PHASES) == 'ok') {
      setTimeout(() => start_custom_listen(), 500);
      new Audio("templates/hi1.mp3").play()
    }
    else if(contains(text, STOP_PHRASES) == 'ok'){
      if(IS_PLAYING_NEWS){
        document.getElementById('news-speaker').pause()
        IS_PLAYING_NEWS = false
      }
    }

  }
};


function start_custom_listen() {
  navigator.mediaDevices.getUserMedia({
      audio: true
    })
    .then(stream => {
      const mediaRecorder = new MediaRecorder(stream);
      let audioChunks = [];

      mediaRecorder.addEventListener("dataavailable", function (event) {
        audioChunks.push(event.data);
      });

      mediaRecorder.addEventListener("stop", function () {
        const audioBlob = new Blob(audioChunks, {
          type: 'audio/wav',
          codecs: 'PCMA'
        });

        let fd = new FormData();
        fd.append('voice', audioBlob);
        sendVoice(fd);
        audioChunks = [];
      });
      setTimeout(() => mediaRecorder.stop(), 5000);
      setTimeout(() => start_recognition(), 5000);
      recognition.onend = undefined;
      recognition.stop();
      mediaRecorder.start();

    });
}


function start_recognition() {
  recognition.onend = function () {
    recognition.start();
  };
  recognition.start();
}


async function sendVoice(form) {
  const URL = 'voice';
  let promise = await fetch(URL, {
    method: 'POST',
    body: form
  });
  if (promise.ok) {
    let response = await promise.json();
    console.log(response.text);
    work(response.text.toLowerCase())
  }

}



function contains(text, variants) {
  status = false
  variants.forEach(function (item, i, variants) {
    if (text.includes(item)) {
      status = 'ok'
    }
  });
  return status
}


function delete_temp_tts(name){
  $.ajax({
    url: 'delete_temp',
    method: 'post',
    dataType: 'html',
    data:{text:name}
  })
}


TIME_VARIANTS = ['time is it now', 'time is now']

DAY_OF_THE_WEEK_VARIANTS = ['day of the week', ]

DATE_VARIANTS = ['what date is it today']

WEATHER_TEMPERATURE_VARIANTS = ["what's the temperature in",]

WEATHER_VARIANTS = ["what's the weather in",]

NEWS_VARIANTS = ["what's going on in the world", 'show me the latest news', 'read the news for me']

TIMER_VARIANTS = ['set timer for',]

CHANGE_TIMER_VARIANTS = ['change timer time to']

CANCEL_TIMER_VARIANTS = ['remove timer']

ALARM_VARIANTS = ['set alarm for', 'set  alarm at']

REMINDER_VARIANTS = ['remind me to do']

IS_PLAYING_NEWS = false

function work(text) {
  if (contains(text, TIME_VARIANTS) == 'ok') {
    $.ajax({
      url: 'current_time',
      method: 'get',
      success: function (data) {
        /* функция которая будет выполнена после успешного запроса.  */
        tts(data.data)
      }
    })
  } else if (contains(text, DAY_OF_THE_WEEK_VARIANTS) == 'ok') {
    $.ajax({
      url: 'current_day',
      method: 'get',
      success: function (data) {
        /* функция которая будет выполнена после успешного запроса.  */
        tts(data.data)
      }
    })
  }
  else if (contains(text, DATE_VARIANTS) == 'ok') {
    $.ajax({
      url: 'current_date',
      method: 'get',
      success: function (data) {
        /* функция которая будет выполнена после успешного запроса.  */
        tts(data.data)
      }
    })
  }
  else if (contains(text, WEATHER_TEMPERATURE_VARIANTS) == 'ok') {
    $.ajax({
      url: 'get_temperature',
      method: 'post',
      data: {
        city: get_city_name(text, WEATHER_TEMPERATURE_VARIANTS) 
      },
      success: function (data) {
        /* функция которая будет выполнена после успешного запроса.  */
        tts(data.data)
      }
    })
  }
  else if (contains(text, WEATHER_VARIANTS) == 'ok') {
    $.ajax({
      url: 'get_weather',
      method: 'post',
      data: {
        city: get_city_name(text, WEATHER_VARIANTS) 
      },
      success: function (data) {
        /* функция которая будет выполнена после успешного запроса.  */
        tts(data.data)
      }
    })
  }
  else if (contains(text, NEWS_VARIANTS) == 'ok') {
    $.ajax({
      url: 'get_news',
      method: 'get',
      success: function (data) {
        /* функция которая будет выполнена после успешного запроса.  */
        tts(data.data, speaker='News')
      }
    })
  }
  else if (contains(text, TIMER_VARIANTS) == 'ok') {
    TIMER_VARIANTS.forEach(function (item, i, TIMER_VARIANTS) {
      if (text.includes(item)) {
        text = text.replace(item, '')
      }
    });

    console.log(text)

    if(text.includes('minute')){
      text = text.replace('minutes','')
      text = text.replace('minute','')
      delay = Number(text)*60
    }
    
    else if(text.includes('seconds')){
      text = text.replace('seconds','')
      delay = Number(text)
    }
    else if(text.includes('hour')){
      text = text.replace('hours','')
      text = text.replace('hour','')
      delay = Number(text)*3600
    }
    console.log(delay)
    timer = setTimeout(() => alarm(), delay*1000);
    timer_clearing = setTimeout(()=>timer = null, delay*1000);
  }
  else if (contains(text, CHANGE_TIMER_VARIANTS) == 'ok') {
    try{
      if(timer){
        CHANGE_TIMER_VARIANTS.forEach(function (item, i, CHANGE_TIMER_VARIANTS) {
          if (text.includes(item)) {
            text = text.replace(item, '')
          }
        });
    
        console.log(text)
    
        if(text.includes('minute')){
          text = text.replace('minutes','')
          text = text.replace('minute','')
          delay = Number(text)*60
        }
        
        else if(text.includes('seconds')){
          text = text.replace('seconds','')
          delay = Number(text)
        }
        else if(text.includes('hour')){
          text = text.replace('hours','')
          text = text.replace('hour','')
          delay = Number(text)*3600
        }
        console.log(delay)
        clearTimeout(timer)
        timer = setTimeout(() => alarm(), delay*1000);
        timer_clearing = setTimeout(()=>timer = null, delay*1000);
      }
      else{
        console.log('Нету будильника')
      }
    }
    catch(e){
      console.log('Нету будильника')
    }
  }
  else if (contains(text, CANCEL_TIMER_VARIANTS) == 'ok') {
    try{
      clearTimeout(timer)
      timer = null
      tts('Removed timer')
    }
    catch(e){
      tts('There is no timers')
    }
  }
}

function alarm(){
  new Audio('templates/alarm.mp3').play()
}


function get_city_name(text, variants){
  variants.forEach(function (item, i, variants) {
    if (text.includes(item)) {
      text = text.replace(item, '')
    }
  });
  return text
}

// Начинаем слушать микрофон и распознавать голос
start_recognition()