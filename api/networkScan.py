import os

path_1 = "/home/pi/tf_inference/logs/networkscan.txt"
data = os.popen('iwlist wlan0 scan | grep SSID').read()
# [i.strip().split(":")[1].replace('"',"") for i in data]



# print(data)

with open(path_1, 'w') as networkData:
	networkData.write([i.strip().split(":")[1].replace('"',"") for i in data]) 