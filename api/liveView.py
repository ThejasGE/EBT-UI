#Date: 01 November 2019
#Functionality: Code activates and captures image from USB Webcamera
#This code works for ELP camera and platforms supported are Raspberry Pi 3B+ and Raspberry Pi 0  
import time
import cv2

vs=cv2.VideoCapture(0)   #source set to 0, USB Webcam

time.sleep(2.0)          #Wakeup time

while True:
	ret,frame = vs.read()

	frame = cv2.resize(frame,(160,120)) #160,120 resolution so that the image loads fast
	cv2.imwrite("web/static/pcImg/pcamera.jpg",frame)
        key = cv2.waitKey(1) & 0xFF

