from imutils.video import FPS
from imutils.video import FileVideoStream
from datetime import datetime
from tracking import Tracking,MotionTracker
from detection import Detection
import os
import cv2
import numpy as np
import sys
import importlib.util
from db import readConfig,saveConfig
from db import DB
import schedule

def stream_video(pathIn=None,resolution=(300,240)):
    if pathIn is not None:
        videostream = FileVideoStream(pathIn).start()
    else:
        
        from imutils.video import VideoStream
        #videostream=VideoStream(src=0, usePiCamera=True, resolution=resolution,framerate=32).start()
        videostream=VideoStream(src=0, usePiCamera=False, resolution=resolution,framerate=32).start()


    fps=None
    count=0
    while True:
        if count<=2:
            count+=1
            
        if count==2:
            fps = FPS().start()
        
        #videostream.update()
        frame = videostream.read()
        if frame is None:
            break
            
        yield frame,fps
        
        if fps is not None:
            fps.update()

        
    fps.stop()
    videostream.stop()

    try:
        print("[INFO] elasped time: {:.2f}".format(fps.elapsed()))
        print("[INFO] approx. FPS: {:.2f}".format(fps.fps()))
    except:
        None
        
        
def get_ouput_file_path(video_path,model_path):
    
    videoname='sample'
    if video_path is not None:
        videoname=os.path.splitext(os.path.basename(video_path))[0]
        
        
    folder=os.path.basename(os.path.split(model_path)[0])
    filename= os.path.splitext(os.path.basename(model_path))[0]
    output_path='outputs/{}/{}.avi'.format(videoname,'{}_{}'.format(folder,filename))
    
    return output_path

def recorder(video_path,model_path,resolution=(240,180),output_fps=20):
    if video_path is None:
        video_path='sample'
    
    output_path=get_ouput_file_path(video_path,model_path)
    #os.makedirs(output_dir) if not os.path.exists(os.path.split(output_path)[0]) else None
    os.makedirs(os.path.split(output_path)[0]) if not os.path.exists(os.path.split(output_path)[0]) else None
    
    
    return cv2.VideoWriter(output_path,cv2.VideoWriter_fourcc(*"XVID"), output_fps, resolution, True),output_path

    
def streaming():
    
    config=readConfig()
    DB().createDB()
    
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
        
        if track:
            motrk=MotionTracker(config['motion']['frequency'])
            trk=Tracking(resolution)
     
    if record:
        vid,output_path=recorder(test_video,model_kwargs['model_path'],resolution)
        
    
    
    for frame,fps in stream_video(test_video,resolution):
        config=readConfig()
        det_kwargs=dict(config['detection'])
        counter_kwargs=dict(config['counter'])
        track_kwargs=dict(config['tracking'])
        
        
        frame,image=det.transform_image(frame,resolution,color)
        
        
        if detection:
            if not motrk.check_count():


                    results=det.model_inference(image)

                    results=det.filter_boxes(results,**det_kwargs)

                    results=det.scale_boxes(results,resolution)
                    
                    if config['motion']['frequency']>0:
                        motrk.start_trackers(image,results[0])

            else:

                results=motrk.update_trackers(image)
            
        
        if detection and track:
            
            trk.track_objects(results[0],counter_kwargs['line_points'],**track_kwargs)
           
            
            (on_update,output_data)=trk.update_counter(config['location']['capacity'],counter_kwargs['entrance'],
                                                       counter_kwargs['minutes_inactive'],  
                               counter_kwargs['percent_cap'],counter_kwargs['min_wait_time'],counter_kwargs['max_wait_time'],
                               counter_kwargs['reset'])
            if on_update:
                
                DB().writeDbData(output_data)

            
        #if fps is not None:
        #    fps.stop()
        #    curr_fps=round(fps.fps(),2)
            
        if record or display:
            frame=det.draw_boxes(frame,results,det.labels)    
            
            if track:
                frame=trk.draw_tracking(frame)

            if record:
                vid.write(frame)
                
            if display:
                cv2.imshow('imgs',frame)
            
        if cv2.waitKey(1) == ord('q'):break 
            
        schedule.run_pending() 
                
    if record:
        vid.release()
        
        output_split=os.path.splitext(output_path)
        new_output_path='{}_{:.1f}{}'.format(output_split[0],fps.fps(),output_split[-1])
        os.rename(output_path,new_output_path)
     
        
    cv2.destroyAllWindows()
