function tts(text, speaker='None') {
    if(speaker == 'None'){
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
    else if(speaker == 'News'){
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
                document.getElementById('news-speaker').src=data; /* В переменной data содержится ответ от index.php. */
                document.getElementById('news-speaker').play()
                console.log('reading news')
                IS_PLAYING_NEWS = true
                setTimeout(() => delete_temp_tts(data), 20000);
            }
        });
    }
}

