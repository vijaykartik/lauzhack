import requests
import pyowm

apikey = "3d6406ddfff3d1e31b8680bfa9569b32"

api = "api.openweathermap.org/data/2.5/forecast/daily"

owm = pyowm.OWM(apikey)

# infuture = 1
newdate = pyowm.timeutils._timedelta_days(2)
forecast = owm.daily_forecast("Lausanne, ch")
rain = forecast.get_weather_at(newdate)._rain["all"]
print len(forecast)