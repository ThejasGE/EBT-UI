import os
import sqlite3 
import json
from datetime import datetime,timedelta
from werkzeug.security import generate_password_hash, check_password_hash

class DB:
    def __init__(self):
        self.path='db/data.db'
        #self.conn = connectToDb()      
        
     
    def connectToDb(self):
        return sqlite3.connect('db/data.db')
    
    #return sqlite3.connect(os.path.abspath('db/footfallCounter.db'))


    def createDB(self):
        conn = self.connectToDb()
        create_table_sql='''CREATE TABLE IF NOT EXISTS peopleCounting( 
                            ENTER INT NOT NULL, EXIT INT NOT NULL,FILL INT, FILL_PERC INT, WAIT INT,
                            TIMESTAMP TEXT NOT NULL PRIMARY KEY)'''

        conn.execute(create_table_sql)
        conn.commit()
        conn.close()
       
    def limitDB(self,max_days=None):
        if max_days is not None:
            conn = self.connectToDb()
            query='DELETE FROM peopleCounting WHERE TIMESTAMP < %s' % ((datetime.now()-timedelta(days=max_days)).timestamp())
            conn.execute(query)
            conn.commit()
            conn.close()
        
    def readDbLatestData(self):
        temp = {}
        conn = self.connectToDb()
        query = '''SELECT ENTER,EXIT,FILL,FILL_PERC,WAIT,TIMESTAMP
                  FROM peopleCounting WHERE TIMESTAMP=(SELECT max(TIMESTAMP)  FROM peopleCounting) LIMIT 1'''
        cursor = conn.execute(query)
        row = cursor.fetchone()
        
        temp['enter'] = row[0]
        temp['exit'] = row[1]
        temp['fill'] = row[2]
        temp['fill_perc'] = row[3]
        temp['wait'] = row[4]
        temp['timestamp'] = row[5]
        
        conn.close()
        return temp
    
    
    def writeDbData(self,data):
        conn = self.connectToDb()
        query2 = "INSERT INTO peopleCounting(ENTER, EXIT,FILL,FILL_PERC,WAIT, TIMESTAMP) VALUES( %d, %d, %d,%d, %d, %s)" %(data['in'], data['out'], data['fill'],data['fill_perc'],data['wait'],data['pidatetime'])
        conn.execute(query2)
        conn.commit()
        conn.close()
    
    def validateLogin(self, loginId, username, password):
        conn = self.connectToDb()
        query = "SELECT * FROM users WHERE name = '%s' and loginId = '%s' " % (
            username, loginId)
        cursor = conn.execute(query)
        row = cursor.fetchall()
        conn.close()
        if(len(row) == 1):
            print(row[0])
            if(check_password_hash(row[0][3], password)):
                return (True, row[0][3][16:])
            else:
                return (False, None)
        else:
            return (-1, None)


    def validateRequest(self, request):
        if 'auth_token' in request.cookies:
            token = request.cookies['auth_token']
            user = request.cookies['user']
            conn = self.connectToDb()
            query = "SELECT * FROM users WHERE name = '%s' AND password LIKE '%s'" % (
                user, "%" + token)
            cursor = conn.execute(query)
            row = cursor.fetchall()
            conn.close()
            if(len(row) == 1):
                return True
            else:
                return False
        else:
            return False



def readConfig(path='data_cfg.json'):

    return json.load(open(path, 'r'))

def readConfigAnalytics(path='data_analytics.json'):

    return json.load(open(path, 'r'))

    
def saveConfig(config,path='data_cfg.json'):
    jsondata = readConfig()

    jsondata['video']['record'] = config['video']['record']
    jsondata['video']['draw'] = config['video']['draw']
    jsondata['video']['display'] = config['video']['display']
    jsondata['video']['test'] = config['video']['test']
    jsondata['video']['test_video'] = config['video']['test_video']
    
    jsondata['image']['color'] = config['image']['color']

    jsondata['model']['model_path'] = config['model']['model_path']
    jsondata['model']['label_path'] = config['model']['label_path']

    jsondata['motion']['frequency'] = config['motion']['frequency']

    jsondata['detection']['min_conf'] = config['detection']['min_conf']
    jsondata['detection']['max_boxes'] = config['detection']['max_boxes']

    jsondata['tracking']['max_distance'] = config['tracking']['max_distance']
    jsondata['tracking']['max_disappeared'] = config['tracking']['max_disappeared']
    jsondata['tracking']['buffer_frames'] = config['tracking']['buffer_frames']

    jsondata['location']['location_name'] = config['location']["location_name"]
    jsondata["location"]['capacity'] = config['location']['capacity']

    jsondata['counter']['line_points'] = config['counter']['line_points']
    
    jsondata['counter']['entrance'] = config['counter']['entrance']
    jsondata['counter']['minutes_inactive'] = config['counter']['minutes_inactive']
    jsondata['counter']['percent_cap'] = config['counter']['percent_cap']
    jsondata['counter']['min_wait_time'] = config['counter']['min_wait_time']
    jsondata['counter']['max_wait_time'] = config['counter']['max_wait_time']
    jsondata['counter']['reset'] = config['counter']['reset']

    jsondata['db']['wifi'] = config['db']['wifi']
    jsondata['db']['cloud'] = config['db']['cloud']
    jsondata['db']['gateway'] = config['db']['gateway']
    jsondata['db']['max_days'] = config['db']['max_days']

    with open(path, 'w') as json_file:
        json.dump(jsondata, json_file,indent=2)     

def saveConfig1(config,path='data_cfg.json'):
    jsondata = readConfig()
    for key, value in config.items():

        if key == "record":
            jsondata['video']['record'] = value
        elif key == "draw":
            jsondata['video']['draw'] = value
        elif key == "display":
            jsondata['video']['display'] = value
        elif key == "test":
            jsondata['video']['test'] = value
        elif key == "test_video":
            jsondata['video']['test_video'] = value

        elif key == "color":
            jsondata['image']['color'] = value        
        
        elif key == "model_path":
            jsondata['model']['model_path'] = value
        elif key == "label_path":
            jsondata['model']['label_path'] = value
        
        elif key == "frequency":
            jsondata['motion']['frequency'] = value
        
        elif key == "min_conf":
            jsondata['detection']['min_conf'] = value
        elif key == "max_boxes":
            jsondata['detection']['max_boxes'] = value

        elif key == "max_distance":
            jsondata['tracking']['max_distance'] = value
        elif key == "max_disappeared":
            jsondata['tracking']['max_disappeared'] = value
        elif key == "buffer_frames":
            jsondata['tracking']['buffer_frames'] = value

        elif key == "location_name":
            jsondata['location']['location_name'] = value 
        elif key == "capacity":
            jsondata['location']['capacity'] = value
            
        elif key == "line_points":
            jsondata['counter']['line_points'] = value
        elif key == "entrance":
            jsondata['counter']['entrance'] = value
        elif key == "minutes_inactive":
            jsondata['counter']['minutes_inactive'] = value
        elif key == "percent_cap":
            jsondata['counter']['percent_cap'] = value
        elif key == "min_wait_time":
            jsondata['counter']['min_wait_time'] = value
        elif key == "max_wait_time":
            jsondata['counter']['max_wait_time'] = value
        elif key == "reset":
            jsondata['counter']['reset'] = value

        elif key == "wifi":
            jsondata['db']['wifi'] = value
        elif key == "cloud":
            jsondata['db']['cloud'] = value
        elif key == "gateway":
            jsondata['db']['gateway'] = value
        elif key == "max_days":
            jsondata['db']['max_days'] = value
        else:
            print("[INFO] Data Not Found")
        
        with open(path, 'w') as json_file:
            json.dump(jsondata, json_file,indent=2)  


def mask_image(image, left_limit, right_limit, up_limit, down_limit):
    mask = np.full(image.shape[:2], 0, dtype = "uint8")
    cv2.rectangle(mask, (left_limit, up_limit), (right_limit , down_limit), 255, -1)
    masked = cv2.bitwise_and(image, image, mask = mask)
    masked[np.where((masked == [0,0,0] ).all(axis = 2))] = [255,255,255]
    return masked

