function tts() {
    text = document.getElementById('word').value
    alert(text)
    $.ajax({
        url: '/tts',
        /* Куда пойдет запрос */
        method: 'post',
        /* Метод передачи (post или get) */ /* Тип данных в ответе (xml, json, script, html). */
        data: {
            text: text
        },
        /* Параметры передаваемые в запросе. */
        success: function (data) {
            /* функция которая будет выполнена после успешного запроса.  */
            new Audio(data).play() /* В переменной data содержится ответ от index.php. */
        }
    });
}

function speak(text) {
    const message = new SpeechSynthesisUtterance();
    txtMessage = document.getElementById('message').value
    message.lang = "en-US";
    message.text = txtMessage;
    window.speechSynthesis.speak(message);
}
speechSynthesis.speak(new SpeechSynthesisUtterance('Hello World'));