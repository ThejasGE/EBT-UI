# import the necessary packages
from scipy.spatial import distance as dist
from collections import OrderedDict
import numpy as np
import cv2
from datetime import datetime
from db import DB
import dlib

class Tracking:
    def __init__(self,resolution,centroid_list_size=60):
        #scale the line to resolution

        
        self.resolution=resolution
        self.centroid_list_size=centroid_list_size
        
        
        self.line_points=[]
        self.x_range=()
        self.y_range=()
        
        self.ct = CentroidTracker()
                
        self.totalUp=0
        self.totalDown=0
        
        self.wait_times=[]
        
        self.trackableObjects={}
        self.objects=None

        self.on_line_update=False
        
    def scale_line(self,line_points):
        resolution=self.resolution
        return [(int(line_points[0][0]*resolution[0]),int(line_points[0][1]*resolution[1])),
                (int(line_points[1][0]*resolution[0]),int(line_points[1][1]*resolution[1]))]
        
        
    def count_reset(self,enter,exit,thresh,last_movement,minutes_inactive=120,percent_cap=2.0,reset=False):
        
        if reset:
            enter,exit=0,0


        if minutes_inactive and last_movement/60>=minutes_inactive:
            enter,exit=0,0
            
        if percent_cap is not None:
            #if percentage of exits exceeds the acceptable cap then counter is reset
            if (enter-exit)/thresh < (-percent_cap):
                enter,exit=0,0
            #if percentage of entrance exceeds the acceptable cap then counter is capped to the threshold  
            if (enter-exit)/thresh > percent_cap:
                enter=thresh
                exit=0
                
        return enter,exit

    def get_fill_values(self,enter,exit,thresh):

        fill_rate= max(0,enter-exit)
        fill_perc=fill_rate/thresh
        
        return fill_perc,fill_rate

    def get_wait_time(self,fill_perc,wait_times,min_wait=15,max_wait=3600):
        
        wait_time=0
        
        if fill_perc>=1 and len(wait_times)>1:
            time_diff=np.diff([i[0] for i in wait_times])
            wait_time=np.median(np.vectorize(lambda x:x.total_seconds())(time_diff))
            wait_time=max(wait_time,min_wait)
            wait_time=round(wait_time,0)

        wait_time=min(wait_time,max_wait)
        return wait_time

    def x_to_y_scaler(self,x,x_range=(0,300),y_range=(144,184)):
        x_scaled = (x - x_range[0]) / ( x_range[1] -  x_range[0])
        return x_scaled * (y_range[1] - y_range[0]) + y_range[0]


    def draw_tracking(self,image):
            h,w=image.shape[:2]

            cv2.line(image, self.line_points[0],self.line_points[1], (0, 255, 255), 2)

            for (objectID, centroid) in self.objects.items():
                text = "ID {}".format(objectID)
                cv2.putText(image, text, (centroid[0] - 10, centroid[1] - 10),cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
                cv2.circle(image, (centroid[0], centroid[1]), 4, (0, 255, 0), -1)

            # loop over the info tuples and draw them on our frame
            info = [("Up", self.totalUp),("Down", self.totalDown)]
            for (i, (k, v)) in enumerate(info):
                text = "{} {}".format(k, v)
                #cv2.putText(image, text, (10, h - ((i * 20) + 20)),cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
                cv2.putText(image, text, (10,  ((i * 20) + 20)),cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

            return image

    def update_counter(self,capacity,entrance='up',minutes_inactive=120,percent_cap=2.0,min_wait_time=15,max_wait_time=1800,reset=False):
        timestamp=datetime.now()
            
        last_movement=(timestamp-self.wait_times[-1][0]).total_seconds() if len(self.wait_times)>0 else 0
               
        if entrance=='up':
            enter,exit=self.totalUp,self.totalDown
            enter,exit=self.count_reset(enter,exit,capacity,last_movement,minutes_inactive,percent_cap,reset)
            self.totalUp,self.totalDown= enter,exit
        else:
            exit,enter=self.totalUp,self.totalDown    
            enter,exit=self.count_reset(enter,exit,capacity,last_movement, minutes_inactive,percent_cap,reset)
            self.totalUp,self.totalDown=exit,enter
            
        data={}
        if self.on_line_update: 
                
            self.wait_times.append([timestamp,self.totalUp,self.totalDown])
            self.wait_times=self.wait_times[-50:]
            
            fill_perc,fill_rate=self.get_fill_values(enter,exit,capacity)

            wait_time=self.get_wait_time(fill_perc,self.wait_times,min_wait_time,max_wait_time)
           
            print('UP: {} DOWN: {}'.format(self.totalUp,self.totalDown))
            print( 'wait_time {}  fill% {}  occup {}/{}'.format(wait_time,fill_perc,fill_rate,capacity))
            
            data={'in':enter , 'out':exit ,'fill':fill_rate,'fill_perc':int(fill_perc*100),'wait':wait_time, 'pidatetime':timestamp.timestamp()}
            
            
        return self.on_line_update,data
    
    def track_objects(self,boxes,line_points,buffer_frames=5,max_disappeared=20,max_distance=50):
        
        line_points=self.scale_line(line_points)
        self.line_points=line_points
        
        #print(line_points,x_range,y_range )
        self.on_line_update=False
        
        self.objects = self.ct.update(boxes,max_disappeared=max_disappeared,max_distance=max_distance)
        
        #if x>y its a horizontal line else its a vertical
        horizontal= True if line_points[0][0]<line_points[0][1] else False
        if horizontal:
            line_idx=[0,1]
        else:
            line_idx=[1,0]
        
        self.line_range=(line_points[0][line_idx[0]],line_points[1][line_idx[0]])
        self.move_range=(line_points[0][line_idx[1]],line_points[1][line_idx[1]])
            
        
        for (objectID, centroid) in self.objects.items():
            # check to see if a trackable object exists for the current
            # object ID
            to = self.trackableObjects.get(objectID, None)

            if to is None:
                to = TrackableObject(objectID, centroid)
            else:
                movement = [c[line_idx[1]] for c in to.centroids[-5:]]
                direction = centroid[line_idx[1]] - np.mean(movement)
                
                to.centroids=to.centroids[-self.centroid_list_size:]
                to.centroids.append(centroid)
                
                if to.buffer>0:
                    to.buffer-=1
                
                line_dir=centroid[line_idx[0]]
                move_dir=centroid[line_idx[1]]
                
                betweenLine=(self.line_range[0]<=line_dir<=self.line_range[1])
                
                if to.buffer==0 and betweenLine:
                    
                    prev_line_dir=to.centroids[-2][line_idx[0]]
                    prev_move_dir=to.centroids[-2][line_idx[1]]
                
                    line_limit=self.x_to_y_scaler(line_dir,self.line_range,self.move_range)
                    prev_line_limit=self.x_to_y_scaler(prev_line_dir,self.line_range,self.move_range)
                    

                    if direction < 0 and move_dir <= line_limit and prev_move_dir>prev_line_limit:
                            self.totalUp += 1
                            self.on_line_update=True
                            to.counted = True
                            to.buffer=buffer_frames

                    elif direction > 0 and move_dir >= line_limit and prev_move_dir<prev_line_limit:
                            self.totalDown += 1
                            self.on_line_update=True
                            to.counted = True
                            to.buffer=buffer_frames

            self.trackableObjects[objectID] = to
            
class MotionTracker:
    
    def __init__(self,frequency=0.33):
        self.trackers=[]
        
        self.counter=0
        self.freq_numbers=np.linspace(0,100,int(100*frequency),dtype=int)
        
        
    def check_count(self):
        
        if self.counter>=100:
            self.counter=0
        else:
            self.counter+=1
            
        
        if self.counter in self.freq_numbers:
            return True
            
        return False
        
    def start_trackers(self,image,boxes):
        self.trackers=[]
                #print(results[0])
        for (ymin,xmin,ymax,xmax) in boxes:
            tracker = dlib.correlation_tracker()
            tracker.start_track(image, dlib.rectangle(xmin,ymin,xmax,ymax))
            self.trackers.append(tracker)
            
            
    def update_trackers(self,image):
        boxes=[]
        for tracker in self.trackers:
            tracker.update(image)
            pos = tracker.get_position()
            boxes.append([int(pos.top()),int(pos.left()),int(pos.bottom()),int(pos.right())])
                
        return (np.array(boxes),np.ones(len(boxes)),np.ones(len(boxes)))
        
        
class TrackableObject:
	def __init__(self, objectID, centroid):
		# store the object ID, then initialize a list of centroids
		# using the current centroid
		self.objectID = objectID
		self.centroids = [centroid]

		# initialize a boolean used to indicate if the object has
		# already been counted or not
		self.counted = False
		self.buffer =0        

class CentroidTracker:
	def __init__(self):
		# initialize the next unique object ID along with two ordered
		# dictionaries used to keep track of mapping a given object
		# ID to its centroid and number of consecutive frames it has
		# been marked as "disappeared", respectively
		self.nextObjectID = 0
		self.objects = OrderedDict()
		self.disappeared = OrderedDict()

		# store the number of maximum consecutive frames a given
		# object is allowed to be marked as "disappeared" until we
		# need to deregister the object from tracking
		self.maxDisappeared = 0

		# store the maximum distance between centroids to associate
		# an object -- if the distance is larger than this maximum
		# distance we'll start to mark the object as "disappeared"
		self.maxDistance = 0

	def register(self, centroid):
		# when registering an object we use the next available object
		# ID to store the centroid
		self.objects[self.nextObjectID] = centroid
		self.disappeared[self.nextObjectID] = 0
		self.nextObjectID += 1

	def deregister(self, objectID):
		# to deregister an object ID we delete the object ID from
		# both of our respective dictionaries
		del self.objects[objectID]
		del self.disappeared[objectID]

	def update(self, rects, max_disappeared=50, max_distance=50):
		self.maxDisappeared = max_disappeared
		self.maxDistance = max_distance
		# check to see if the list of input bounding box rectangles
		# is empty
		if len(rects) == 0:
			# loop over any existing tracked objects and mark them
			# as disappeared
			for objectID in list(self.disappeared.keys()):
				self.disappeared[objectID] += 1

				# if we have reached a maximum number of consecutive
				# frames where a given object has been marked as
				# missing, deregister it
				if self.disappeared[objectID] > self.maxDisappeared:
					self.deregister(objectID)

			# return early as there are no centroids or tracking info
			# to update
			return self.objects

		# initialize an array of input centroids for the current frame
		inputCentroids = np.zeros((len(rects), 2), dtype="int")

		# loop over the bounding box rectangles
		#for (i, (startX, startY, endX, endY)) in enumerate(rects):
		for (i, (startY, startX, endY, endX)) in enumerate(rects):
			# use the bounding box coordinates to derive the centroid
			cX = int((startX + endX) / 2.0)
			cY = int((startY + endY) / 2.0)
			inputCentroids[i] = (cX, cY)

		# if we are currently not tracking any objects take the input
		# centroids and register each of them
		if len(self.objects) == 0:
			for i in range(0, len(inputCentroids)):
				self.register(inputCentroids[i])

		# otherwise, are are currently tracking objects so we need to
		# try to match the input centroids to existing object
		# centroids
		else:
			# grab the set of object IDs and corresponding centroids
			objectIDs = list(self.objects.keys())
			objectCentroids = list(self.objects.values())

			# compute the distance between each pair of object
			# centroids and input centroids, respectively -- our
			# goal will be to match an input centroid to an existing
			# object centroid
			D = dist.cdist(np.array(objectCentroids), inputCentroids)

			# in order to perform this matching we must (1) find the
			# smallest value in each row and then (2) sort the row
			# indexes based on their minimum values so that the row
			# with the smallest value as at the *front* of the index
			# list
			rows = D.min(axis=1).argsort()

			# next, we perform a similar process on the columns by
			# finding the smallest value in each column and then
			# sorting using the previously computed row index list
			cols = D.argmin(axis=1)[rows]

			# in order to determine if we need to update, register,
			# or deregister an object we need to keep track of which
			# of the rows and column indexes we have already examined
			usedRows = set()
			usedCols = set()

			# loop over the combination of the (row, column) index
			# tuples
			for (row, col) in zip(rows, cols):
				# if we have already examined either the row or
				# column value before, ignore it
				if row in usedRows or col in usedCols:
					continue

				# if the distance between centroids is greater than
				# the maximum distance, do not associate the two
				# centroids to the same object
				if D[row, col] > self.maxDistance:
					continue

				# otherwise, grab the object ID for the current row,
				# set its new centroid, and reset the disappeared
				# counter
				objectID = objectIDs[row]
				self.objects[objectID] = inputCentroids[col]
				self.disappeared[objectID] = 0

				# indicate that we have examined each of the row and
				# column indexes, respectively
				usedRows.add(row)
				usedCols.add(col)

			# compute both the row and column index we have NOT yet
			# examined
			unusedRows = set(range(0, D.shape[0])).difference(usedRows)
			unusedCols = set(range(0, D.shape[1])).difference(usedCols)

			# in the event that the number of object centroids is
			# equal or greater than the number of input centroids
			# we need to check and see if some of these objects have
			# potentially disappeared
			if D.shape[0] >= D.shape[1]:
				# loop over the unused row indexes
				for row in unusedRows:
					# grab the object ID for the corresponding row
					# index and increment the disappeared counter
					objectID = objectIDs[row]
					self.disappeared[objectID] += 1

					# check to see if the number of consecutive
					# frames the object has been marked "disappeared"
					# for warrants deregistering the object
					if self.disappeared[objectID] > self.maxDisappeared:
						self.deregister(objectID)

			# otherwise, if the number of input centroids is greater
			# than the number of existing object centroids we need to
			# register each new input centroid as a trackable object
			else:
				for col in unusedCols:
					self.register(inputCentroids[col])

		# return the set of trackable objects
		return self.objects