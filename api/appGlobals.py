import os

app_path = os.path.dirname(os.path.abspath(__file__))

rootPath = app_path
dbPath = app_path + "/database/peopleCountingDb.db"
certificatePath = app_path + "/certs/"

sensorPortName = "/dev/ttymxc2"
cardPortName = "/dev/ttymxc1"
baudRate = 115200
REMOTE_SERVER = 'www.google.com'