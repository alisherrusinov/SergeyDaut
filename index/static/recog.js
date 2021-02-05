// Создаем распознаватель
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;

var grammar = '#JSGF V1.0;'

voice = ''

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

CURRENT_STATE = 'IDLE' // PLAYING_NEWS PLAYING_MUSIC 

PREVIOUS_STATE = ''

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
    else if (contains(text, STOP_PHRASES) == 'ok') {
      if (CURRENT_STATE == 'PLAYING_NEWS') {
        document.getElementById('news-speaker').pause()
        CURRENT_STATE = 'IDLE'
      }
      else if (CURRENT_STATE == 'PLAYING_MUSIC') {
        document.getElementById('music-speaker').pause()
        CURRENT_STATE = 'IDLE'
      }
      else if(CURRENT_STATE == 'SPEAKING'){
        document.getElementById('speaker').pause()
        CURRENT_STATE = PREVIOUS_STATE
      }
    }
    else if(contains(text, NEXT_PRODUCT_VARIANTS) == 'ok'){
      if(CURRENT_STATE == 'SEARCHING_PRODUCTS'){
        // READ THE NEXT ONE
        current_product+=1
        tts(text=products[current_product], speaker='None', previous_state='SEARCHING_PRODUCTS');
        console.log(products_urls[current_product])
      }
    }
    else if(contains(text, PREV_PRODUCT_VARIANTS) == 'ok'){
      if(CURRENT_STATE == 'SEARCHING_PRODUCTS'){
        // READ THE PREV ONE
        if(current_product == 0){
          tts("it's the first product")
        }
        else{
        current_product-=1
        tts(text=products[current_product], speaker='None', previous_state='SEARCHING_PRODUCTS');
        console.log(products_urls[current_product])
        }
      }
    }
    else if(contains(text, DESCRIPTION_VARIANTS) == 'ok'){
      if(CURRENT_STATE == 'SEARCHING_PRODUCTS'){
        $.ajax({
          url: '/get_decs_ebay',
          /* Куда пойдет запрос */
          method: 'post',
          /* Метод передачи (post или get) */ /* Тип данных в ответе (xml, json, script, html). */
          data: {
              text: products_urls[current_product]
          },
          /* Параметры передаваемые в запросе. */
          success: function (data) {
              tts(data)
          }
      });
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
    let text;
    let response = await promise.text();
    text = response
    console.log(text.toLowerCase())
    work(text.toLowerCase())
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


function delete_temp_tts(name) {
  $.ajax({
    url: 'delete_temp',
    method: 'post',
    dataType: 'html',
    data: { text: name }
  })
}


TIME_VARIANTS = ['time is it now', 'time is now', 'what is the time now']

DAY_OF_THE_WEEK_VARIANTS = ['day of the week',]

DATE_VARIANTS = ['what date is it today']

WEATHER_TEMPERATURE_VARIANTS = ["what's the temperature in",]

WEATHER_VARIANTS = ["what's the weather in", "what is the weather like in", "what is the weather in"]

NEWS_VARIANTS = ["what's going on in the world", 'show me the latest news', 'read the news for me']

TIMER_VARIANTS = ['set timer for',]

CHANGE_TIMER_VARIANTS = ['change timer time to']

CANCEL_TIMER_VARIANTS = ['remove timer']

ALARM_VARIANTS = ['set alarm for', 'set  alarm at']

NOTIFICATION_ADDING_VARIANTS = ['new notification', 'add new notification', 'notification', 'add new reminder']

MUSIC_PLAY_VARIANTS = ['play ']

EBAY_SEARCHING_VARIANTS = ['ebay']

NEXT_PRODUCT_VARIANTS = ['next']

PREV_PRODUCT_VARIANTS = ['go back']

EXIT_EBAY_VARIANTS = ['exit from ebay']

DESCRIPTION_VARIANTS = ['description', 'read the description']


// Переменные которые нужны в глобальной видимости
notification_label = ''
notification_date = ''
products = []
products_urls = []
products_prices = []
current_product = 0

function work(text) {
  if (CURRENT_STATE == 'IDLE') {
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
          tts(data)
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
          tts(data.data, speaker = 'News')
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

      if (text.includes('minute')) {
        text = text.replace('minutes', '')
        text = text.replace('minute', '')
        delay = Number(text) * 60
      }

      else if (text.includes('seconds')) {
        text = text.replace('seconds', '')
        delay = Number(text)
      }
      else if (text.includes('hour')) {
        text = text.replace('hours', '')
        text = text.replace('hour', '')
        delay = Number(text) * 3600
      }
      console.log(delay)
      timer = setTimeout(() => alarm(), delay * 1000);
      timer_clearing = setTimeout(() => timer = null, delay * 1000);
    }
    else if (contains(text, CHANGE_TIMER_VARIANTS) == 'ok') {
      try {
        if (timer) {
          CHANGE_TIMER_VARIANTS.forEach(function (item, i, CHANGE_TIMER_VARIANTS) {
            if (text.includes(item)) {
              text = text.replace(item, '')
            }
          });

          console.log(text)

          if (text.includes('minute')) {
            text = text.replace('minutes', '')
            text = text.replace('minute', '')
            delay = Number(text) * 60
          }

          else if (text.includes('seconds')) {
            text = text.replace('seconds', '')
            delay = Number(text)
          }
          else if (text.includes('hour')) {
            text = text.replace('hours', '')
            text = text.replace('hour', '')
            delay = Number(text) * 3600
          }
          console.log(delay)
          clearTimeout(timer)
          timer = setTimeout(() => alarm(), delay * 1000);
          timer_clearing = setTimeout(() => timer = null, delay * 1000);
        }
        else {
          console.log('Нету будильника')
        }
      }
      catch (e) {
        console.log('Нету будильника')
      }
    }
    else if (contains(text, CANCEL_TIMER_VARIANTS) == 'ok') {
      try {
        clearTimeout(timer)
        timer = null
        tts('Removed timer')
      }
      catch (e) {
        tts('There is no timers')
      }
    }
    else if (contains(text, MUSIC_PLAY_VARIANTS) == 'ok') {
      text = text.replace('play ', "")
      $.ajax({
        url: '/play_music',
        /* Куда пойдет запрос */
        method: 'post',
        /* Метод передачи (post или get) */ /* Тип данных в ответе (xml, json, script, html). */
        data: {
          text: text
        },
        /* Параметры передаваемые в запросе. */
        success: function (data) {
          /* функция которая будет выполнена после успешного запроса.  */
          document.getElementById('music-speaker').src = data; /* В переменной data содержится ответ от index.php. */
          document.getElementById('music-speaker').play()
          console.log('playing music')
          CURRENT_STATE = 'PLAYING_MUSIC'
        }
      });
    }
    else if (contains(text, NOTIFICATION_ADDING_VARIANTS) == 'ok') {
      tts('tell me what should I remind')
      CURRENT_STATE = 'ADDING_NOTIFICATION'
      start_custom_listen();
    }
    else if (contains(text, EBAY_SEARCHING_VARIANTS) == 'ok') {
      text = text.replace('find me', '')
      text = text.replace('on ebay', '')
      text = text.replace('ebay', '')
      console.log(text)

      $.ajax({
        url: '/get_products',
        /* Куда пойдет запрос */
        method: 'post',
        /* Метод передачи (post или get) */ /* Тип данных в ответе (xml, json, script, html). */
        data: {
          text: text
        },
        /* Параметры передаваемые в запросе. */
        success: function (data) {
          products = data.data
          products_urls = data.links
          products_prices = data.prices
          console.log(products[current_product])
          СURRENT_STATE = 'SEARCHING_PRODUCTS'
          tts(text=products[current_product], speaker='None', previous_state='SEARCHING_PRODUCTS');
          console.log(products_urls[current_product])
        }
      });

    }
    
  }
  else if (CURRENT_STATE == 'ADDING_NOTIFICATION') {
    notification_label = text
    tts('tell me when should I remind')
    CURRENT_STATE = 'ADDING_DATE_NOTIFICATION'
    start_custom_listen()
  }
  else if (CURRENT_STATE == 'ADDING_DATE_NOTIFICATION') {
    notification_date = text

    $.ajax({
      url: '/get_timedelta',
      /* Куда пойдет запрос */
      method: 'post',
      /* Метод передачи (post или get) */ /* Тип данных в ответе (xml, json, script, html). */
      data: {
        text: text
      },
      /* Параметры передаваемые в запросе. */
      success: function (data) {
        timer = setTimeout(function () {
          tts(notification_label)
          notification_date = ''
          notification_label = ''
        }, data * 1000);
      }
    });

    console.log(notification_date, notification_label)
    CURRENT_STATE = 'IDLE'
  }
  else if(CURRENT_STATE == 'SEARCHING_PRODUCTS'){
    if(contains(text, EXIT_EBAY_VARIANTS) == 'ok'){
      CURRENT_STATE = 'IDLE'
      tts(text='Ok',speaker='None' ,previous_state='IDLE')
    }
  }
}

function alarm() {
  new Audio('templates/alarm.mp3').play()
}


function get_city_name(text, variants) {
  variants.forEach(function (item, i, variants) {
    if (text.includes(item)) {
      text = text.replace(item, '')
    }
  });
  return text
}

// Начинаем слушать микрофон и распознавать голос
start_recognition()