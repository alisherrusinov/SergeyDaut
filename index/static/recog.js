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

// Используем колбек для обработки результатов
recognition.onresult = function (event) {
  var result = event.results[event.resultIndex];
  if (result.isFinal) {
    console.log('Вы сказали: ' + result[0].transcript);
    text = result[0].transcript
    text = text.toLowerCase()
    if (contains(text, ACTIVATION_PHASES) == 'ok') {
      setTimeout(() => start_custom_listen(), 500);
      new Audio("templates/I'm listening.mp3").play()
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

function work(text) {
  if (contains(text, TIME_VARIANTS) == 'ok') {
    $.ajax({
      url: 'current_time',
      method: 'get',
      success: function (data) {
        /* функция которая будет выполнена после успешного запроса.  */
        tts(data.data) /* В переменной data содержится ответ от index.php. */
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
        setTimeout(() => delete_temp_tts(data.data), 5000);
      }
    })
  }

}


// Начинаем слушать микрофон и распознавать голос
start_recognition()