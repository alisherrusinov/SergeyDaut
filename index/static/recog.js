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
recognition.continuous = true;
recognition.maxAlternatives = 1;


recognition.onend = function() {
  recognition.start();
};

// Какой язык будем распознавать?
recognition.lang = 'en-US';

// Используем колбек для обработки результатов
recognition.onresult = function (event) {
  var result = event.results[event.resultIndex];
  if (result.isFinal) {
    console.log('Вы сказали: ' + result[0].transcript);

  } else {
    console.log('Промежуточный результат: ', result[0].transcript);
  }
};

// Начинаем слушать микрофон и распознавать голос
recognition.start();





