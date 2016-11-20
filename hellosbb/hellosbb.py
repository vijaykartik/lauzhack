import argparse
import requests
import pyowm
import csv

class Station(object):

    def __init__(self):
        self.name = ""
        self.code = 0
        self.x = 0
        self.y = 0


class Connection(object):

    def __init__(self):
        self.fromplace = Station()
        self.toplace = Station()
        self.fromrain = 0
        self.torain = 0
        self.routenum = 0
        self.deptime_expected = 0
        self.deptime_real = 0
        self.arrtime_expected = 0
        self.arrtime_real = 0
        self.duration_expected = 0
        # self.duration_real = 0;
        self.delay = 0


def makeservice(api, resource):
    return api + resource


def makepayload(connrequest, fromname, toname, date, time):
    if connrequest == 'connections':
        payload = {"from": fromname, "fromcode":"0", "to":toname, "tocode":"0", "date":date, "time":time, "direct":"1"}
    else:
        payload = {}
    return payload


def getrain(place="Lausanne", date="2016-11-20"):
    apikey = "3d6406ddfff3d1e31b8680bfa9569b32"
    api = "api.openweathermap.org/data/2.5/forecast/daily"
    owm = pyowm.OWM(apikey)
    country = ", ch"
    place += country
    currdate = pyowm.timeutils.now()
    deltadays = int(date[8:10]) - int(currdate.day)
    deltahours = deltadays*24 + 1
    # newdate = pyowm.timeutils._timedelta_days(delta)
    newdate = pyowm.timeutils._timedelta_hours(deltahours)
    forecast = owm.daily_forecast(place)
    raindict = forecast.get_weather_at(newdate)._rain
    if len(raindict) == 0:
        return 0
    elif len(raindict) == 1:
        return raindict["all"]
    else:
        raise


def getdelay(connection, date):
    if date == "2016-11-20":
        day = 7
    elif date == "2016-11-21":
        day = 1
    elif date == "2016-11-22":
        day = 2
    elif date == "2016-11-23":
        day = 3
    elif date == "2016-11-24":
        day = 4
    elif date == "2016-11-25":
        day = 5
    else:
        day = 1

    # predictableroutes1 = [509, 1511, 707, 1513, 709]
    predictableroutes2 = [2520, 1820]
    predictableroutes3 = [2525, 1823]
    if connection.routenum in predictableroutes3:
        csvfile = open("gvalsn.csv")
    elif connection.routenum in predictableroutes2:
        csvfile = open("lsngva.csv")
    else:
        delay = 0
        return delay
    delays = csv.reader(csvfile)
    for row in delays:
        if connection.routenum == row[1] and day == row[2]:
            delay = row[3]/60
            return delay

    return 0

def getconnections(fromname="Lausanne", toname="Geneva", date="2016-11-20", time="12:00"):

    api = 'http://transport.opendata.ch/v1/'
    connrequest = 'connections'

    opendata = makeservice(api, connrequest)
    payload = makepayload(connrequest, fromname, toname, date, time)
    payload["from"] = fromname
    payload["to"] = toname
    return (requests.get(opendata, params=payload)).json()


def getroutes(fromname, toname, date, time):
    s = getconnections(fromname, toname, date, time)

    sbb_from = Station()
    sbb_from.name = s["from"]["name"]
    sbb_from.code = int(s["from"]["id"])
    sbb_from.x = s["from"]["coordinate"]["x"]
    sbb_from.y = s["from"]["coordinate"]["y"]
    sbb_to = Station()
    sbb_to.name = s["to"]["name"]
    sbb_to.code = str(s["to"]["id"])
    sbb_to.x = s["to"]["coordinate"]["x"]
    sbb_to.y = s["to"]["coordinate"]["y"]

    sbb_connections = []
    for currconn in s["connections"]:
        conn = Connection()
        conn.fromplace = sbb_from
        conn.toplace = sbb_to
        conn.fromrain = getrain(fromname, date)
        conn.torain = getrain(toname, date)
        conn.routenum = int(currconn["sections"][0]["journey"]["number"])
        conn.arrtime_expected = currconn["to"]["arrival"]
        conn.arrtime_real = currconn["to"]["prognosis"]["arrival"]
        conn.deptime_expected = currconn["from"]["departure"]
        conn.deptime_real = currconn["from"]["prognosis"]["departure"]
        conn.duration_expected = currconn["duration"]
        conn.delay = getdelay(conn, date)
        sbb_connections.append(conn)
    return sbb_connections


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("fromname")
    parser.add_argument("toname")
    parser.add_argument("date")
    parser.add_argument("time")
    args = parser.parse_args()

    fromname = args.fromname
    toname = args.toname
    date = args.date
    time = args.time

    routes = getroutes(fromname, toname, date, time)
