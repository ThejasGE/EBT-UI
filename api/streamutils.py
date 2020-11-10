from imutils.video import FPS
from imutils.video import FileVideoStream
import datetime
from tracking import Tracking,MotionTracker
from detection import Detection
import os
import cv2
import numpy as np
import sys
import importlib.util
from db import readConfig,saveConfig
from db import DB
import time
import threading
import signal
import logging
import schedule

exit_event = False

#Setting up the Logger, Handler and Formatter
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
ch = logging.FileHandler("streamutils.log")
ch.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)

def terminateProcess(signalNumber, frame):
    print("(SIGTERM) received. Setting Exit Event to True and waiting 0.8 sec before terminating")
    global exit_event
    exit_event = True
    time.sleep(0.8)


def stream_video(pathIn=None,resolution=(300,240)):
    print("pathIn")
    print(pathIn)
    if pathIn is not None:
        videostream = FileVideoStream(pathIn).start()
        logger.info('File loaded from %s', pathIn)
    else:

        from imutils.video.pivideostream import PiVideoStream
        #from imutils.video import VideoStream
        videostream=PiVideoStream(resolution=resolution,framerate=32)
        logger.info('Video being streamed from PiCamera')

        #videostream=VideoStream(src=0, usePiCamera=False, resolution=resolution,framerate=32).start()


    fps=None
#    print("videostream")
#    print(videostream)
    count=0
    while True:
        if count<=2:
            count+=1

        if count==2:
            fps = FPS().start()

        if pathIn is None and count == 1:   #Starting PiVideoStream camera input
            videostream.start()
            time.sleep(0.2)

        #videostream.update()
        frame = videostream.read()
        if frame is None:
            break

        if exit_event:   #Once SIGTERM signal is received, stop the loop
            logger.info('Exit Event set to True, breaking out of videostream loop')
            videostream.stop()
            videostream.rawCapture.truncate()
            #print("Before Stream close")
            #videostream.stream.close()
            #print("After stream close")
            videostream.rawCapture.close()
            #videostream.camera.close()
            break

        yield frame,fps

        if fps is not None:
            fps.update()

    #print("fps after loop")
    #print(fps)
    fps.stop()
    #videostream.stop()

    try:
        print("[INFO] elasped time: {:.2f}".format(fps.elapsed()))
        print("[INFO] approx. FPS: {:.2f}".format(fps.fps()))
        logger.info('Elapsed Time :- {:.2f}', fps.elapsed())
        logger.info('Approx. FPS :- {:.2f}', format(fps.fps()))
    except:
        None


def get_ouput_file_path(video_path,model_path):

    videoname='sample'
    if video_path is not None:
        videoname=os.path.splitext(os.path.basename(video_path))[0]


    folder=os.path.basename(os.path.split(model_path)[0])
    filename= os.path.splitext(os.path.basename(model_path))[0]
    output_path='/home/pi/tf_inference/outputs/{}/{}.avi'.format(videoname,'{}_{}'.format(folder,filename))

    return output_path

def recorder(video_path,model_path,resolution=(240,180),output_fps=20):
    if video_path is None:
        video_path='sample'

    output_path=get_ouput_file_path(video_path,model_path)
    #os.makedirs(output_dir) if not os.path.exists(os.path.split(output_path)[0]) else None
    os.makedirs(os.path.split(output_path)[0]) if not os.path.exists(os.path.split(output_path)[0]) else None


    return cv2.VideoWriter(output_path,cv2.VideoWriter_fourcc(*"XVID"), output_fps, resolution, True),output_path


def streaming():

    #exit_event = threading.Event()    #Creating an Event to check when the process is being killed;
    #exit_event.clear()      #Setting the flag in the exit_event as false
    signal.signal(signal.SIGTERM, terminateProcess)

    config=readConfig()
    DB().createDB()

    #print("In streamutils.py function streaming()")

    model_kwargs=dict(config['model'])

    record=config['video']['record']
    draw=config['video']['draw']
    display=config['video']['display']
    test=config['video']['test']
    color=config['image']['color']


    #test_video=config['video']['test_video'] if test is not None else None
    test_video=config['video']['test_video'] if test else None

    schedule.every().second.do(DB().limitDB,config['db']['max_days'])

    track,detection=True,True
    if not draw:
        track,detection=False,False

    #initialize model detection
    if detection:
        det=Detection()
        det.load_model(**model_kwargs)
        resolution=det.resolution
        #print("resolution assigned")

        if track:
#            motrk=MotionTracker(config['motion']['frequency'])
            trk=Tracking(resolution)

    if record:
        #print("calling recorder")
        vid,output_path=recorder(test_video,model_kwargs['model_path'],resolution)


    for frame,fps in stream_video(test_video,resolution):
        #print("stream_video yielded")
        display_buffer = 0
        time_init = datetime.datetime.now()
        time_d_init = datetime.timedelta(minutes = time_init.minute, seconds = time_init.second, microseconds = time_init.microsecond)
        config=readConfig()
        det_kwargs=dict(config['detection'])
        counter_kwargs=dict(config['counter'])
        track_kwargs=dict(config['tracking'])


        frame,image=det.transform_image(frame,resolution,color)


        if detection:
#            if not motrk.check_count():


#                    results=det.model_inference(image)

#                    results=det.filter_boxes(results,**det_kwargs)

#                    results=det.scale_boxes(results,resolution)

#                    if config['motion']['frequency']>0:
#                        motrk.start_trackers(image,results[0])

#            else:

#                results=motrk.update_trackers(image)

            results=det.model_inference(image)

            results=det.filter_boxes(results,**det_kwargs)

            results=det.scale_boxes(results,resolution)


        if detection and track:

            trk.track_objects(results[0],counter_kwargs['line_points'],**track_kwargs)


            (on_update,output_data)=trk.update_counter(config['location']['capacity'],counter_kwargs['entrance'],
                                                       counter_kwargs['minutes_inactive'],
                               counter_kwargs['percent_cap'],counter_kwargs['min_wait_time'],counter_kwargs['max_wait_time'],
                               counter_kwargs['reset'])
            if on_update:

                print("Data from Detector & Tracker being written to database")
                DB().writeDbData(output_data)
                print("Data written to database at time {}".format(datetime.datetime.now()))


        #if fps is not None:
        #    fps.stop()
        #    curr_fps=round(fps.fps(),2)

        if record or display:
            #frame=det.draw_boxes(frame,results,det.labels)

            if track:
                frame=trk.draw_tracking(frame)

            if record:
                vid.write(frame)

            if display:
                #cv2.imshow('imgs',frame)
                #image = frame.array
                if display_buffer == 0:  #Setting Display Buffer so that the tracking lines are written to the file every 30 iterations of the loop
                    cv2.imwrite("/home/pi/tf_inference/static/pcImg/liveCamera.jpg", frame)
                    display_buffer = 30

        time_final = datetime.datetime.now()
        time_d_final = datetime.timedelta(minutes = time_final.minute, seconds = time_final.second, microseconds = time_final.microsecond)

        display_buffer = display_buffer - 1
        if display_buffer < 0:
            display_buffer = 0

        time_taken = time_d_final - time_d_init
        #print("Current Time and Time Taken :- ")
        #print('{} ; {}'.format(time_final, time_taken))

        if cv2.waitKey(1) == ord('q'):break

        schedule.run_pending()

    if record:
        vid.release()
        print("Recorded Video being stored\n\n")
        output_split=os.path.splitext(output_path)
        new_output_path='{}_{:.1f}{}'.format(output_split[0],fps.fps(),output_split[-1])
        os.rename(output_path,new_output_path)
        print("Recorded video stored at \n" + new_output_path + "\n")


    cv2.destroyAllWindows()
