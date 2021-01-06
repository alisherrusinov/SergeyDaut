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

// Используем колбек для обработки результатов
recognition.onresult = function (event) {
  var result = event.results[event.resultIndex];
  if (result.isFinal) {
    console.log('Вы сказали: ' + result[0].transcript);
    if (result[0].transcript.includes('Assistant')) {
      console.log('Я слушаю');
      start_custom_listen();
    }

  } else {
    console.log('Промежуточный результат: ', result[0].transcript);
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
          type: 'audio/wav'
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

function start_recognition(){
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
    console.log(response.data);
    let audio = document.createElement('audio');
    audio.src = response.data;
    audio.controls = true;
    audio.autoplay = true;
    document.querySelector('#messages').appendChild(audio);
  }
}

// Начинаем слушать микрофон и распознавать голос
start_recognition();