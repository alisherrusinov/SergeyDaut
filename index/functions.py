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
