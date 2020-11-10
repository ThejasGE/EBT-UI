from picamera.array import PiRGBArray
from picamera import PiCamera
from db import readConfig,saveConfig
import time
import cv2
# initialize the camera and grab a reference to the raw camera capture
camera = PiCamera()
camera.resolution = (160,120)
camera.framerate = 15
rawCapture = PiRGBArray(camera, size=(160,120))
# allow the camera to warmup
time.sleep(0.1)
#Reading Line points from data_cfg.json file
config = readConfig()
line_points = config["counter"]["line_points"]
line_points[0][0] *= 160
line_points[1][0] *= 160
line_points[0][1] *= 120
line_points[1][1] *= 120
# capture frames from the camera
for frame in camera.capture_continuous(rawCapture, format="bgr", use_video_port=True):
	image = frame.array

	#Drawing the tracking line on the image
	cv2.line(image, tuple([int(line_points[0][0]),int(line_points[0][1])]),tuple([int(line_points[1][0]),int(line_points[1][1])]), (255, 255, 255), 1)
	# show the frame
	cv2.imwrite("/home/pi/tf_inference/static/pcImg/liveCamera.jpg", image)
	# cv2.imshow("frame",image)
	key = cv2.waitKey(1) & 0xFF
	# clear the stream in preparation for the next frame
	rawCapture.truncate(0)
	# if the `q` key was pressed, break from the loop
	# if key == ord("q"):
	# 	break
