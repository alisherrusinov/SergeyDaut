from bs4 import BeautifulSoup
import requests
import datetime
import calendar


def current_time():
    time = datetime.datetime.today().strftime("%H:%M").split(':')
    hours = int(time[0])
    minutes = int(time[1])
    if(hours<12):
        answer = f"it's {hours}:{minutes} am"
    else:
        answer = f"it's {hours-12}:{minutes} pm"
    return answer


def day_of_the_week():
    my_date = datetime.date.today()
    answer = f"it's {calendar.day_name[my_date.weekday()]}"
    return answer


def current_date():
    date = datetime.date.today()
    month = date.month
    day = date.day
    year = date.year
    print(day)
    month = calendar.month_name[int(month)]
    if(day in range(1,4)):
        if(day == 1):
            day = 'first'
        elif(day == 2):
            day = 'second'
        elif(day == 3):
            day = 'third'
    else:
        day = f"{day}th"

    answer = f"it's the {day} of {month} {year}"

    return answer


def get_city_name(city: str):
    """
    Функция, которая получает айди города на сайте погоды ббс
    :param city: Название города
    :return: Айди города, Название города
    """
    URL = f"https://locator-service.api.bbci.co.uk/" \
          f"locations?api_key=AGbFAKx58hyjQScCXIYrxuEwJh2W2cmv" \
          f"&stack=aws" \
          f"&locale=en" \
          f"&filter=international" \
          f"&place-types=settlement%2Cairport%2Cdistrict" \
          f"&order=importance" \
          f"&s={city}" \
          f"&a=true" \
          f"&format=json"

    request = requests.get(URL)
    answer = request.json()

    count = answer['response']['results']['totalResults']

    if(count >0):
        city = answer['response']['results']['results'][0]
        print(city['name'])
        print(city)
        return city['id'], city['name']
    else:
        return None, None


def get_description_weather(city):
    """
    Функция которая определяет описание погоды в городе
    :param city: Название города
    :return: Описание погоды
    """
    id, name = get_city_name(city)
    if(id is None):
        print('Нет города')
        return False
    request = requests.get(f'https://www.bbc.com/weather/{id}')

    soup = BeautifulSoup(request.text, 'html.parser')

    temps = soup.find_all('span', {'class': 'wr-value--temperature'})
    current_temp = temps[0].span.text
    tomorrow_temp = temps[1].span.text

    decsription = soup.find('div', {'class':'wr-day__weather-type-description wr-js-day-content-weather-type-description wr-day__content__weather-type-description--opaque'}).text
    print(decsription)

    return decsription


def get_weather(city):
    """
        Функция которая определяет температуру в городе
        :param city: Название города
        :return: Температуру в формате: сегодня в городе 228 градусов
        """
    id, name = get_city_name(city)
    if (id is None):
        print('Нет города')
        return False
    request = requests.get(f'https://www.bbc.com/weather/{id}')

    soup = BeautifulSoup(request.text, 'html.parser')

    temps = soup.find_all('span', {'class': 'wr-value--temperature'})
    current_temp = temps[0].span.text
    tomorrow_temp = temps[1].span.text


    date = soup.find_all('span', {'class': 'wr-date'})[0].text

    return f'{date} in {name} {current_temp}'

