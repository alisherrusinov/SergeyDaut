function tts(text, speaker='None', previous_state='IDLE') {
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
                document.getElementById('speaker').src=data; /* В переменной data содержится ответ от index.php. */
                document.getElementById('speaker').play()
                console.log(previous_state)
                PREVIOUS_STATE = previous_state
                CURRENT_STATE = 'SPEAKING'
                document.getElementById('speaker').onended = function() {
                    console.log('ended');
                    CURRENT_STATE = previous_state;
                }
                setTimeout(() => delete_temp_tts(data), 5000);
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
                CURRENT_STATE = 'PLAYING_NEWS'
                setTimeout(() => delete_temp_tts(data), 20000);
            }
        });
    }
}

