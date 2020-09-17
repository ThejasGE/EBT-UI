# import the necessary packages

import numpy as np
import cv2
import importlib
    

class Detection:
    def __init__(self):
        self.labels=None
        #resolution format = (width,height)
        self.image_tensor=None
        self.output_tensors=None
        self.session=None
        self.tflite=False
        
        #tflite specific params 
        self.resolution=None
        self.dtype=None

    def load_model(self,model_path,label_path):
        
        self.tflite= True if '.tflite' in model_path else False
        
        self.load_labels(label_path,self.tflite)
        
        if self.tflite:
            self.load_tflite_model(model_path)
        else:
            self.load_tf_model(model_path)


    def model_inference(self,image):
        if self.tflite:
            return self.tflite_inference(image)
        else:
            return self.tf_inference(image)
        
        
    def tflite_inference(self,image):

        image = np.expand_dims(image, axis=0)

        if self.dtype == np.float32:
            #image = (np.float32(image) - 127.5) / 127.5
            image = (np.float32(image) - 128) / 128

        self.session.set_tensor(self.image_tensor, image)

        self.session.invoke()

        boxes = self.session.get_tensor(self.output_tensors[0]['index'])
        classes = self.session.get_tensor(self.output_tensors[1]['index'])
        scores = self.session.get_tensor(self.output_tensors[2]['index'])
        
        
        
        return np.squeeze(boxes),np.squeeze(scores),np.squeeze(classes).astype(np.uint8)

    def tf_inference(self,image):
   
        (boxes, scores, classes, num)=self.session.run(self.output_tensors,
                        feed_dict={self.image_tensor: np.expand_dims(image, axis=0)})
    
        
        return np.squeeze(boxes),np.squeeze(scores),np.squeeze(classes).astype(np.uint8)
    
            

    def armnn_inference(self,image):
        
        
        
        input_tensors = ann.make_input_tensors([self.image_tensor], [image])
        output_tensors=self.output_tensors
        
        self.session.EnqueueWorkload(0, input_tensors, output_tensors)
        
        boxes, output_tensor_info = ann.from_output_tensor(output_tensors[0][1])
        classes, output_tensor_info = ann.from_output_tensor(output_tensors[0][2])
        scores, output_tensor_info = ann.from_output_tensor(output_tensors[0][3])
        
        
        return None
    
    def load_armnn_model(self,model_path):
        import pyarmnn as ann
        
        parser = ann.ITfLiteParser()  
        network = parser.CreateNetworkFromBinaryFile(model_path)
        
        graph_id = 0
        input_names = parser.GetSubgraphInputTensorNames(graph_id)
        
        self.image_tensor = parser.GetNetworkInputBindingInfo(graph_id, input_names[0])
        
        options = ann.CreationOptions()
        
        self.session = ann.IRuntime(options)
        
        preferredBackends = [ann.BackendId('CpuAcc'), ann.BackendId('CpuRef')]
        opt_network, messages = ann.Optimize(network, preferredBackends, runtime.GetDeviceSpec(), ann.OptimizerOptions())
        
        net_id, _ = self.session.LoadNetwork(opt_network)
        
        output_names = parser.GetSubgraphOutputTensorNames(graph_id)
        
        output_binding_info = parser.GetNetworkOutputBindingInfo(0, output_names[0])
        
        self.output_tensors = ann.make_output_tensors([output_binding_info])

        return None
        
    
    
    
    def load_tflite_model(self,model_path):
        # Import TensorFlow libraries
        #only use tflite_runtime because the PI has issues with tensorflow tflite
        from tflite_runtime.interpreter import Interpreter
     
        interpreter = Interpreter(model_path)
        interpreter.allocate_tensors()
           
        self.session=interpreter    

        input_details = interpreter.get_input_details()
        
        self.dtype=input_details[0]['dtype']
        
        height = input_details[0]['shape'][1]
        width = input_details[0]['shape'][2]
        self.resolution=(width,height)
        
        self.output_tensors = interpreter.get_output_details()
        
        self.image_tensor=input_details[0]['index']
    
    def load_labels(self,label_path,tflite=False):
        with open(label_path, 'r') as f:
            labels = [line.strip() for line in f.readlines()]
        if tflite:
            if labels[0] == '???':
                labels.pop(0)
        else:
            if labels[0] != '???':
                labels.insert(0,'???')

        self.labels=labels
    
    def load_tf_model(self,model_path):
        import tensorflow as tf

        detection_graph = tf.Graph()
        with detection_graph.as_default():
            od_graph_def = tf.GraphDef()

            with tf.gfile.GFile(model_path, 'rb') as fid:
                serialized_graph = fid.read()
                od_graph_def.ParseFromString(serialized_graph)
                tf.import_graph_def(od_graph_def, name='')

            self.session = tf.Session(graph=detection_graph)
        

        self.image_tensor = detection_graph.get_tensor_by_name('image_tensor:0')
        boxes = detection_graph.get_tensor_by_name('detection_boxes:0')
        scores = detection_graph.get_tensor_by_name('detection_scores:0')
        classes = detection_graph.get_tensor_by_name('detection_classes:0')
        num_detections = detection_graph.get_tensor_by_name('num_detections:0')
        
        self.output_tensors=[boxes,scores,classes,num_detections]

##SUPPORT METHODS     
        
    def filter_boxes(self,results,min_conf,max_boxes,valid_classes=[0,1]):
        (boxes,scores,classes)=results

        new_boxes,new_scores,new_classes=[],[],[]

        for i in range(min(boxes.shape[0],max_boxes)):   

            valid=False
            if classes[i] in valid_classes:
                
                if scores[i]>min_conf and sum(boxes[i])>0:
                    valid=True

            if valid:   
                new_boxes.append(boxes[i])
                new_scores.append(scores[i])
                new_classes.append(classes[i])


        return (new_boxes,new_scores,new_classes)    
    
    
    def draw_boxes(self,image,results,labels):
        h,w=image.shape[:2]
        (boxes,scores,classes)=results
        for i in range(len(boxes)):
            #remove nan bbox values
            (ymin,xmin,ymax,xmax)=tuple(boxes[i].tolist())

            cv2.rectangle(image, (xmin,ymin), (xmax,ymax), (10, 255, 0), 2)
            cv2.rectangle(image, (xmin, ymin), (xmax,ymin+12), (10, 255, 0), cv2.FILLED)
            cv2.putText(image, '{} {}%'.format('person',int(scores[i]*100)), (xmin, ymin+10), cv2.FONT_HERSHEY_SIMPLEX,\
                        0.45, (255, 0, 0), 1) 
            #cv2.putText(image, '{} {}%'.format(labels[classes[i]],int(scores[i]*100)), (xmin, ymin+10), cv2.FONT_HERSHEY_SIMPLEX,\
            #            0.45, (255, 0, 0), 1) 

        return image
        
        
    def transform_image(self,frame,resolution,color=True):
    
        if frame.shape[:2][::-1]!=resolution:
            frame = cv2.resize(frame, resolution, interpolation=cv2.INTER_NEAREST)
            #frame = cv2.resize(frame, resolution, interpolation=cv2.INTER_LINEAR)

        if color:
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        else:
            image=cv2.cvtColor(frame,cv2.COLOR_BGR2GRAY)

        return frame,image

    def scale_boxes(self,results,resolution):
        (boxes,scores,classes)=results

        if len(boxes)>0:
            w,h=resolution
            boxes=np.nan_to_num(boxes).clip(0,1)
            boxes=(boxes* np.array([h,w,h,w])).astype('int16')
        return (boxes,scores,classes)


