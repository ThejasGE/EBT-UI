
from flask import Flask, url_for, request, jsonify, render_template, make_response, send_file
from flask_cors import CORS
import os
import json
import subprocess
import numpy as np
import base64
from db import DB, readConfig, saveConfig, saveConfig1
import db
from datetime import datetime
import os.path
from os import path
import pandas as pd
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import time
import re
from dateutil.parser import isoparse
from datetime import datetime,timedelta

app = Flask(__name__, static_url_path='')
app.config['CORS_HEADERS'] = 'Content-Type'
cors = CORS(app, resources={r"*": {"origins": "*"}})
# CORS(app)

# @app.after_request
# def after_request(response):
#     response.headers.add('Access-Control-Allow-Origin', '*')
#     response.headers.add('Access-Control-Allow-Headers',
#                          'Content-Type,Authorization')
#     response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
#     return response


@app.route('/')
def index():
    return render_template("index.html")

# def liveCameraOff():
#     cmd = "ps -aef | grep liveView.py | awk '{print $2}' | sudo xargs kill -9"
#     subprocess.Popen(cmd, shell=True)

def getLiveAppStatus():
    cmd = "ps -aef | grep liveView.py | awk '{print $2}'"
    # print os.popen("ps -aef | grep demopcamera.py").read()
    pids = os.popen(cmd).read()
    # print os.popen("ps -aef | grep demopcamera.py").read()
    pids = pids.split()
    print(pids)
    if(len(pids) > 2):
        print("true")
        return True
    else:
        print("false")
        return False

def liveCameraOff():
    cmd = "ps -aef | grep liveView.py | awk '{print $2}' | sudo xargs kill -9"
    subprocess.Popen(cmd, shell=True)


def liveCameraOn():
    cmd = "ps -aef | grep liveView.py | awk '{print $2}' | sudo xargs kill -9"
    subprocess.Popen(cmd, shell=True)
    #cmd = "ps -aef | grep yolo_opencv.py | awk '{print $2}' | sudo xargs kill -9"
    #subprocess.Popen(cmd, shell=True)
    cmd = "nohup /home/pi/tf_inference/tflite1-env/bin/python3 /home/pi/tf_inference/liveView.py"
    subprocess.Popen(cmd, shell=True)

@app.route('/login', methods=['POST'])
def login():
    if request.method == 'POST':
        print (request.json)
        # data = json.loads(request.data)
        data = request.json
        status, token = DB().validateLogin(
           data['loginId'].lower(), data['userName'].lower(), data['password'])
        if(status == -1):
            return jsonify(err="User not found"), 401
        elif(status):
            resp = make_response(jsonify(user=data['userName'],auth_token=token))
            print('auth_token')
            resp.set_cookie('user', data['userName'].lower())
            resp.set_cookie('auth_token', token)
            return resp, 200
        else:
            return jsonify(err="Password does not match"), 401
    else:
        return jsonify(err="URL Not found"), 404


@app.route('/logout', methods=['GET'])
def logout():
    if request.method == 'GET':
        resp = make_response(jsonify(msg="logged out"))
        resp.set_cookie('user', '', expires=0)
        resp.set_cookie('auth_token', '', expires=0)
        return resp, 200
    else:
        return jsonify(err="URL Not found"), 404
def updateApp():
    cmd = "nohup /home/pi/tflite1/tflite1-env/bin/python3 /home/pi/tflite1/tf_inference/checkUpdates.py >> /home/pi/tflite1/tf_inference/logs/checkUpdates.log 2>&1 &"
    subprocess.Popen(cmd, shell=True)

def CreateWifiConfig(SSID, password):
  config_lines = [
    '\n',
    'network={',
    '\tssid="{}"'.format(SSID),
    '\tpsk="{}"'.format(password),
    '\tkey_mgmt=WPA-PSK',
    '}'
  ]

  config = '\n'.join(config_lines)
  print(config)

  os.system( "sudo chmod 777 /etc/wpa_supplicant/wpa_supplicant.conf")

  with open("/etc/wpa_supplicant/wpa_supplicant.conf", "a+") as wifi:
    wifi.write(config)

  print("Wifi config added")

@app.route('/startLiveCamera', methods=['GET'])
def startLiveCamera():
    liveCameraOn()
    status = getLiveAppStatus()
    if(status):
        return jsonify(msg="Live view started!"), 200
    else:
        return jsonify(err="Camera busy!!. Please try after 1 minute!"), 400


@app.route('/stopLiveCamera', methods=['GET'])
def stopLiveCamera():
    liveCameraOff()
    status = getLiveAppStatus()
    # if(not status):
    # liveCameraOff()
    return jsonify(msg="Live view stopped!"), 200
    # else:
    # return jsonify(err="Unable to stop live view. Please try again. Else refresh webpage!"), 400


@app.route('/getCameraData', methods=['GET'])
def getCameraData():
    with open("/home/pi/tflite1-env/tf_inference/static/pcImg/pcamera.jpg", "r") as dataUrl:
        image = dataUrl.read()
        encodedImage = base64.encodestring(image)
        return encodedImage


@app.route('/checkUpdates', methods=['GET'])
def checkUpdates():
    updateApp()
    time.sleep(40)
    return jsonify(msg="Application updating wait for 3 minute")

@app.route('/getNetworkInfo', methods=['GET'])
def getNetworkInfo():
	data = os.popen('sudo /usr/bin/autohotspotN').read()
	return jsonify(data)
#    if(data == "Wifi already connected to a network\n"):
#         return jsonify(msg="[INFO] 1. TON Wi-Fi on the device\
#             2. Select d004 from the list of available Wi-Fi network\
#             3. Connect to d004 by entering p2rs2v@d04 as the password"), 200
#     else:
#         return jsonify(msg="[INFO] 1. TON Wi-Fi on the device\
#             2. Select Mac_address/hostanem from the list of available Wi-Fi network\
#             3. Connect to Mac_address/hostanem by entering adappt-pcs@123 as the password"), 200

@app.route('/getScanNetwork', methods=['GET'])
def getScanNetwork():
	with open("/home/pi/tf_inference/logs/networkscan.txt", 'r') as readFile:
		data = readFile.read()
		if(data):
			data=data.split('\n')
			return jsonify(Essid=data[0:-1]), 200
		else:
			return jsonify(err="Address not found"), 404

@app.route('/putScanNetwork', methods=['POST'])
def putScanNetwork():
    data_1 = request.json
    print(data_1)
    CreateWifiConfig(data_1["username"], data_1["password"])
    data_2 = os.popen("cat /etc/wpa_supplicant/wpa_supplicant.conf").read()
    return jsonify(data_2)
    
@app.route('/getCount', methods=['GET'])
def getCount():
    data=DB().readDbLatestData()
    data['timestamp']=datetime.fromtimestamp(float(data['timestamp'])).ctime()
    #data['capacity']=int(data['enter']/data['fill'])
    config_data=db.readConfig()['location']
    data['capacity']=config_data['capacity']
    data['location_name']=config_data['location_name']
    
    config_data1=db.readConfig()['counter']
    data['min_wait_time']=config_data1['min_wait_time']
    return jsonify(data)

@app.route('/getConfig', methods=['GET'])
def getConfig():
    data=db.readConfig()
    return jsonify(data)

@app.route('/getLiveCameraData', methods=['GET'])
def getLiveCameraData():
	with open("/home/pi/tf_inference/static/pcImg/liveCamera.jpg", "rb") as dataUrl:
		imageLive = dataUrl.read()
		encodedLiveImage = base64.encodestring(imageLive)
		encodeimage=encodedLiveImage.decode("utf-8")
		return jsonify(imageData=encodeimage)

@app.route('/liveAppStatus', methods=['GET'])
def liveAppStatus():
    status = getLiveAppStatus()
    return jsonify(status=status)

def pc_off():
    cmd = "ps -aef | grep /home/pi/tflite1/tf_inference/model_tracking.py | awk '{print $2}' | sudo xargs kill -9"
    subprocess.Popen(cmd, shell=True)

def pc_on():
    cmd = "nohup /home/pi/tflite1/tflite1-env/bin/python3 /home/pi/tflite1/tf_inference/model_tracking.py >> /home/pi/tflite1/tf_inference/logs/model_trackingLogs.txt 2>&1 &"
    subprocess.Popen(cmd, shell=True)

def getLiveAppStatus():
    cmd = "ps -aef | grep liveView.py | awk '{print $2}'"
    # print os.popen("ps -aef | grep demopcamera.py").read()
    pids = os.popen(cmd).read()
    # print os.popen("ps -aef | grep demopcamera.py").read()
    pids = pids.split()
    # print pids
    if(len(pids) > 2):
        print("true")
        return True
    else:
        print("false")
        return False

# @app.route('/startLiveCamera', methods=['GET'])
# def startLiveCamera():
#     liveCameraOn()
#     status = getLiveAppStatus()
#     if(status):
#         return jsonify(msg="Live view started!"), 200
#     else:
#         return jsonify(err="Camera busy!!. Please try after 1 minute!"), 400

@app.route('/getBleAddress', methods=['GET'])
def getBleAddress():
    with open("/home/pi/tf_inference/logs/bleAddress.txt", 'r') as readFile:
        data = readFile.read()
    if(data):
        return jsonify(address=data), 200
    else:
        return jsonify(err="Address not found"), 404
    
@app.route('/getSensorName', methods=['GET'])
def getSensorName():
    with open("/etc/hostname", 'r') as readFile:
        data = readFile.read()
    if(data):
        return jsonify(address=data), 200
    else:
        return jsonify(err="Address not found"), 404
    
    
@app.route("/getJsonData", methods=['GET'])
def getJsonData():
    data = db.readConfig()
    print(data)
    if data:
        return jsonify(data), 200
    else:
        return jsonify(err="Data not found"), 404

@app.route("/getAnalyticsData", methods=['GET'])
def getAnalyticsData():
    data = db.readConfigAnalytics()
    print(data)
    if data:
        return jsonify(data), 200
    else:
        return jsonify(err="Data not found"), 404

@app.route("/putJsonData", methods=['POST'])
def putJsonData():
	data = request.get_json()
	saveConfig(data)
	return jsonify(data)

@app.route('/putIndividualData', methods=['POST'])
def putIndividualData():

    data = request.json
    print(data)
    db.saveConfig1(data)
    return jsonify(data)

@app.route('/getSDcardSerialNumber',methods=['GET'])
def getSDcardSerialNumber():
    data=os.popen('cat /sys/block/mmcblk0/device/serial').read()
    if(data):
        return jsonify(address=data), 200
    else:
        return jsonify(err="Data not found"), 404

app.config["UPLOAD_FOLDER"] = "/home/pi/tf_inference/tf_models/new_model/"
@app.route('/uploadNewModel', methods=['POST'])
def uploadNewModel():
	current_model_list = []
	file = request.files['file']
	file.save(os.path.join(app.config['UPLOAD_FOLDER'], file.filename))
	new_model_path = os.listdir(app.config["UPLOAD_FOLDER"])
	for i in new_model_path:
		new_model_name = i
	zip = zipfile.ZipFile(app.config["UPLOAD_FOLDER"] + new_model_name)
	zip.extractall(app.config["UPLOAD_FOLDER"])
	zip.close()
	for j in new_model_path:
		if j.endswith(".zip"):
			os.remove(app.config["UPLOAD_FOLDER"]+j)
	os.system('sudo mv /home/pi/tf_inference/tf_models/current_model/* /home/pi/tf_inference/tf_models/temp_model/')
	time.sleep(0.2)
	os.system('sudo mv /home/pi/tf_inference/tf_models/new_model/* /home/pi/tf_inference/tf_models/current_model/')
	current_path = "/home/pi/tf_inference/tf_models/current_model/"
	current_model_path = os.listdir(current_path)
	for k in current_model_path:
		current_model_name = k
		current_model_list.append(current_model_name)
	current_model_version=current_model_name[-6:]
	current_model_list.append(current_model_version)
	current_model_list.append(current_path+current_model_name)
	model_path = current_path + current_model_name + "/model.tflite"
	label_path = current_path + current_model_name + "/labelmap.txt"
	jsondata = db.readConfig()
	jsondata['model']['model_path'] = model_path	
	jsondata['model']['label_path'] = label_path
	print("jsondata:",jsondata)
	return jsonify(address=current_model_list), 200

@app.route('/getCurrentModel', methods=['GET'])
def getCurrentModel():
	try:
		temp_model_list = []
		path = "/home/pi/tf_inference/tf_models/temp_model/"
		temp_model_path = os.listdir(path)
		for i in temp_model_path:
			temp_model_name = i
			temp_model_list.append(temp_model_name)
		temp_model_version=temp_model_name[-6:]
		temp_model_list.append(temp_model_version)
		temp_model_list.append(path+temp_model_name)
		return jsonify(address=temp_model_list[0]), 200
	except:
		return jsonify("Current model Not avaiable")
        
@app.route('/getTimeSeriesData', methods=['POST'])
def getTSData():
    input_dates=request.json
    print(input_dates)
    min_date=isoparse(input_dates['beginDate']).replace(tzinfo=None)
    max_date=isoparse(input_dates['endDate']).replace(tzinfo=None)
    max_date+=timedelta(hours = 23,minutes=59)
    #db_data, title = DB().readDatabyDate()
    db_data,title=DB().readDatabyDate(min_date,max_date)
    data=pd.DataFrame(db_data,columns=title).drop(['enter','exit','wait'],axis=1)
    #data=data[data['fill']>0]
    data['datetime']=data['timestamp'].astype('float32').apply(datetime.fromtimestamp)
    data['datetime']=data['datetime'].astype('datetime64[ns]')
    data['fill']=data['fill'].astype('float32')
    data['fill_perc']=data['fill_perc'].astype('float32')
    data['date']=data['datetime'].dt.date.astype('datetime64[D]')
    #if data.empty:
        #display(data.reset_index().to_dict(orient='list'))
    #    return jsonify(data.reset_index().to_dict(orient='list'))
    if (max_date-min_date).days>=1:
        index=pd.date_range(min_date, max_date)
        data=data.groupby('date').mean()
        data=data.reindex(index)
        data=data.fillna(0)
        data.index.name='date'
    else:
        data=data.groupby('datetime').mean().resample('H').mean().reset_index()
        data['time']=data['datetime'].dt.strftime('%I %p')
        data=data.groupby('time').mean()
        index=pd.date_range(min_date, max_date,freq='H').strftime('%I %p')
        data=data.reindex(index)
        data=data.fillna(0)
        data.index.name='date'
        data=data.round()#.to_dict()
        data.index=data.index.astype(str)
    data=data.round()#.to_dict()
    data.index=data.index.astype(str)
    #data.reset_index().to_dict(orient='list')
    return jsonify(data.reset_index().to_dict(orient='list'))

# @app.route('/getCameraData', methods=['GET'])
# def getCameraData():    
#     with open("/home/pi/tflite1/tf_inference/web/static/pcImg/image.jpg", "rb") as dataUrl:        
#     image = dataUrl.read()        
#     encodedImage = base64.encodestring(image)        
#     return encodedImage       
    

    

# @app.route('/<page>')
# def main(page):
#     return render_template("../src/index.html")

app.run(port=8001,host="0.0.0.0")


