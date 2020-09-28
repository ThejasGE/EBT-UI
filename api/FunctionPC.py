import os
import cv2
import sys
import time
import json
import serial
import numpy as np
import parametersPC as P
import sqlite3

def connectToDb():
    return sqlite3.connect(P.dbPath)

def createJsonFile():
    if not os.path.isfile(P.jsonPath) or os.stat(P.jsonPath).st_size == 0:
        f = open(P.jsonPath, 'w')
        f.close()

def readDbConfig():
    temp = {}
    conn = connectToDb()
    query = "SELECT * FROM pcsconfig"
    cursor = conn.execute(query)
    row = cursor.fetchall()[0]
    # print row
    temp['commission_flag'] = row[1]
    temp['degree'] = row[2]
    temp['op_flag'] = row[3]
    temp['up'] = row[4]
    temp['down'] = row[5]
    temp['outside'] = row[6]
    temp['inside'] = row[7]
    temp['thresh'] = row[8]
    temp['people_count'] = row[9]
    temp['rotatelines'] = row[10]
    temp['alpha'] = row[11]
    temp['swap'] = row[12]
    temp['host_address'] = row[13]
    temp['second_host_address'] = row[14]
    temp['linedistance'] = row[15]
    temp['upoffset'] = row[16]
    temp['downoffset'] = row[17]
    temp['leftoffset'] = row[18]
    temp['rightoffset'] = row[19]
    temp['movinglines'] = row[20]
    return temp

def writeDbConfig(data):
    conn = connectToDb()
    try:
        query1 = "UPDATE pcsconfig SET commission_flag = %d, degree = %d, op_flag = %d, up = %d, down = %d, outside = %d, thresh = %d, people_count = %d, rotatelines = %d, alpha = %.1f, swap = %d, host_address = '%s', linedistance = %d , upoffset = %d, downoffset = %d, leftoffset = %d, rightoffset = %d, movinglines = %d WHERE id = 1" %(data['commission_flag'], data['degree'], data['op_flag'], data['up'], data['down'], data['outside'], data['thresh'], data['people_count'], data['rotatelines'], data['alpha'], data['swap'], data['host_address'].encode('utf-8'), data['linedistance'], data['upoffset'], data['downoffset'], data['leftoffset'], data['rightoffset'], data['movinglines'])
        query2 = "INSERT INTO pcsconfig(commission_flag, degree, op_flag, up, down, outside, thresh, people_count, rotatelines, alpha, swap, host_address, linedistance, upoffset, downoffset, leftoffset, rightoffset, movinglines) SELECT %d, %d, %d, %d, %d, %d, %d, %d, %d, %.1f, %d, '%s', %d, %d, %d, %d, %d, %d WHERE changes() = 0" %(data['commission_flag'], data['degree'], data['op_flag'], data['up'], data['down'], data['outside'], data['thresh'], data['people_count'], data['rotatelines'], data['alpha'], data['swap'], data['host_address'].encode('utf-8'), data['linedistance'], data['upoffset'], data['downoffset'], data['leftoffset'], data['rightoffset'], data['movinglines'])
    except Exception,e1:
        print str(e1)
        query1 = "UPDATE pcsconfig SET commission_flag = %d, degree = %d, op_flag = %d, up = %d, down = %d, outside = %d, thresh = %d, people_count = %d, rotatelines = %d, alpha = %.1f, swap = %d, host_address = '%s', linedistance = %d, upoffset = %d, downoffset = %d, leftoffset = %d, rightoffset = %d, movinglines=%d WHERE id = 1" %(data['commission_flag'], data['degree'], data['op_flag'], data['up'], data['down'], data['outside'], data['thresh'], data['people_count'], data['rotatelines'], data['alpha'], data['swap'], data['host_address'], data['linedistance'], data['upoffset'], data['downoffset'], data['leftoffset'], data['rightoffset'], data['movinglines'])
        query2 = "INSERT INTO pcsconfig(commission_flag, degree, op_flag, up, down, outside, thresh, people_count, rotatelines, alpha, swap, host_address, linedistance, upoffset, downoffset, leftoffset, rightoffset, movinglines) SELECT %d, %d, %d, %d, %d, %d, %d, %d, %d, %.1f, %d, '%s', %d, %d, %d, %d, %d, %d   WHERE changes() = 0" %(data['commission_flag'], data['degree'], data['op_flag'], data['up'], data['down'], data['outside'], data['thresh'], data['people_count'], data['rotatelines'], data['alpha'], data['swap'], data['host_address'], data['linedistance'], data['upoffset'], data['downoffset'], data['leftoffset'], data['rightoffset'], data['movinglines'])
    conn.execute(query1)
    conn.execute(query2)
    conn.commit()
    conn.close()

#format(100, 'x').zfill(2).decode('hex')
#str(data).zfill(2).decode('hex')
def checkChangeByte(intValue):
    flag = False
    if(intValue == 10):
        intValue = 254
        flag = True
    elif(intValue == 13):
        intValue = 255
        flag = True
    return flag, intValue

def encryptStr(data):
    hexValue = chr(int(str(data), 16))
    intValue = ord(hexValue) 
    flag, intValue = checkChangeByte(intValue)
    hexValue = chr(intValue)
    return flag, intValue, hexValue

def encryptInt(data):
    hexValue = chr(data)
    intValue = ord(hexValue)
    flag, intValue = checkChangeByte(intValue)
    hexValue = chr(intValue)
    return flag, intValue, hexValue


def send_num(num, address):
    finalData = []
    changeByte = 0
    isChanged, intAddr1, hexAddr1 = encryptStr(address[:2])
    if(isChanged):
        changeByte = changeByte | (1<<7)
    isChanged, intAddr2, hexAddr2 = encryptStr(address[2:])
    if(isChanged):
        changeByte = changeByte | (1<<6)

    isChanged, intNum, hexNum = encryptInt(num)
    if(isChanged):
        changeByte = changeByte | (1<<5)

    checksum = intAddr1 + intAddr2 + intNum
    if(checksum > 255):
        chksum1 = checksum % 255
        chksum2 = checksum / 255
    else:
        chksum1 = checksum
        chksum2 = 0
    
    isChanged, intChksum1, hexChksum1 = encryptInt(chksum1)
    if(isChanged):
        changeByte = changeByte | (1<<4)

    isChanged, intChksum2, hexChksum2 = encryptInt(chksum2)
    if(isChanged):
        changeByte = changeByte | (1<<3)
    
    if(changeByte == 0):
        changeByte = 1
    isChanged, intChangeByte, hexChangeByte = encryptInt(changeByte)

    finalData.append(hexAddr1)
    finalData.append(hexAddr2)
    finalData.append(hexNum)
    finalData.append(hexChksum1)
    finalData.append(hexChksum2)
    finalData.append(hexChangeByte)
    print "finalData:",finalData

    ser=serial.Serial("/dev/ttyS0",115200,timeout=1)
    jsonData=readDbConfig()
    # print "jsonData_num",jsonData
    addr=jsonData['host_address']
    print addr
    cmd = "D " + str(addr) + " " + ''.join(finalData) + "\n\r"
    ser.write(cmd)
    ser.close()

def send_ack(address):
    finalData = []
    changeByte = 0
    isChanged, intAddr1, hexAddr1 = encryptStr(address[:2])
    if(isChanged):
        changeByte = changeByte | (1<<7)
    isChanged, intAddr2, hexAddr2 = encryptStr(address[2:])
    if(isChanged):
        changeByte = changeByte | (1<<6)

    intNum = ord('s')
    hexNum = 's'

    checksum = intAddr1 + intAddr2 + intNum
    if(checksum > 255):
        chksum1 = checksum % 255
        chksum2 = checksum / 255
    else:
        chksum1 = checksum
        chksum2 = 0
    
    isChanged, intChksum1, hexChksum1 = encryptInt(chksum1)
    if(isChanged):
        changeByte = changeByte | (1<<4)

    isChanged, intChksum2, hexChksum2 = encryptInt(chksum2)
    if(isChanged):
        changeByte = changeByte | (1<<3)
    
    if(changeByte == 0):
        changeByte = 1
    isChanged, intChangeByte, hexChangeByte = encryptInt(changeByte)

    finalData.append(hexAddr1)
    finalData.append(hexAddr2)
    finalData.append(hexNum)
    finalData.append(hexChksum1)
    finalData.append(hexChksum2)
    finalData.append(hexChangeByte)

    ser=serial.Serial("/dev/ttyS0",115200,timeout=1)
    jsonData=readDbConfig()
    addr=jsonData['host_address']
    cmd = "D " + str(addr) + " " + ''.join(finalData) + "\n\r"
    ser.write(cmd)
    ser.close()

def rotate(image,angle,center=None,scale=1.0):
    (h,w)=image.shape[:2]
    if center is None:
        center=(w//2,h//2)
    M=cv2.getRotationMatrix2D(center,angle,scale)
    rotated=cv2.warpAffine(image,M,(w,h))
    return rotated

def rotate_bound(image, angle):
    # grab the dimensions of the image and then determine the
    # center
    (h, w) = image.shape[:2]
    (cX, cY) = (w // 2, h // 2)
    # grab the rotation matrix (applying the negative of the
    # angle to rotate clockwise), then grab the sine and cosine
    # (i.e., the rotation components of the matrix)
    M = cv2.getRotationMatrix2D((cX, cY), -angle, 1.0)
    cos = np.abs(M[0, 0])
    sin = np.abs(M[0, 1])
    # compute the new bounding dimensions of the image
    P.nW = int((h * sin) + (w * cos))
    P.nH = int((h * cos) + (w * sin))  
    # adjust the rotation matrix to take into account translation
    M[0, 2] += (P.nW / 2) - cX
    M[1, 2] += (P.nH / 2) - cY
    # perform the actual rotation and return the image
    return cv2.warpAffine(image, M, (P.nW, P.nH))

def json_function_get():
    jsonData=readDbConfig()
    P.THRESH=jsonData['thresh']
    P.cnt_up=jsonData['up']
    P.cnt_down=jsonData['down']
    P.cout=jsonData['outside']
    P.cin=jsonData['people_count']
    P.deg=jsonData['degree']
    P.swap=jsonData['swap']
    P.alpha=jsonData['alpha']
    P.rotate_lines=jsonData['rotatelines']
    P.linedistance=jsonData['linedistance']
    P.upoffset=jsonData['upoffset']
    P.downoffset=jsonData['downoffset']
    P.leftoffset=jsonData['leftoffset']
    P.rightoffset=jsonData['rightoffset']
    P.movinglines=jsonData['movinglines']
    # print jsonData
    
def json_function_put():
    jsonData=readDbConfig()
    jsonData['up']=int(P.cnt_up)
    jsonData['down']=int(P.cnt_down)
    jsonData['outside']=int(P.cout)
    jsonData['people_count']=int(P.cin)
    jsonData['thresh']=int(P.THRESH)
    jsonData['alpha']=float(P.alpha)
    jsonData['swap']=int(P.swap)
    jsonData['degree']=int(P.deg)
    jsonData['rotatelines']=int(P.rotate_lines)
    jsonData['linedistance']=int(P.linedistance)
    jsonData['upoffset']=int(P.upoffset)
    jsonData['downoffset']=int(P.downoffset)
    jsonData['leftoffset']=int(P.leftoffset)
    jsonData['rightoffset']=int(P.rightoffset)
    jsonData['movinglines']=int(P.movinglines)
    writeDbConfig(jsonData)
    

def function_swap(value):
    jsonData=readDbConfig()
    jsonData['swap']=value
    writeDbConfig(jsonData)

def function_deg(value):
    jsonData=readDbConfig()
    jsonData['degree']=value
    writeDbConfig(jsonData)

def function_intensity(value):
    jsonData=readDbConfig()
    jsonData['alpha']=value
    writeDbConfig(jsonData)

def function_secondHost(value):
    jsonData=readDbConfig()
    jsonData['second_host_address']=value
    jsonData['host_address']=value
    writeDbConfig(jsonData)

def function_thresh(value):
    jsonData=readDbConfig()
    jsonData['thresh']=value
    writeDbConfig(jsonData)

def function_FReset():
    jsonData = {}
    jsonData['commission_flag']=False
    jsonData['host_address']="1234"
    jsonData['op_flag']=True
    jsonData['up']=0
    jsonData['down']=0
    jsonData['outside']=0
    jsonData['people_count']=0
    jsonData['swap']=0
    jsonData['alpha']=1.1
    jsonData['degree']=0
    jsonData['thresh']=0
    jsonData['rotatelines']=0
    jsonData['second_host_address']="1234"
    jsonData['linedistance']=0
    jsonData['upoffset']=0
    jsonData['downoffset']=0
    jsonData['leftoffset']=0
    jsonData['rightoffset']=0
    jsonData['movinglines']=0
    # print jsonData
    writeDbConfig(jsonData)

def readSerialConfig():
    jsonData = readDbConfig()
    P.COMMISSION_FLAG = jsonData['commission_flag']
    P.HOST_ADDRESS = jsonData['host_address']

def resetConfigFile():
    jsonData = {}
    jsonData['commission_flag']=bool(P.COMMISSION_FLAG)
    jsonData['host_address']=str(P.HOST_ADDRESS)
    jsonData['op_flag']=True
    jsonData['up']=int(P.cnt_up)
    jsonData['down']=int(P.cnt_down)
    jsonData['outside']=int(P.cout)
    jsonData['people_count']=int(P.cin)
    jsonData['swap']=int(P.swap)
    jsonData['alpha']=float(P.alpha)
    jsonData['degree']=int(P.deg)
    jsonData['thresh']=int(P.THRESH)
    jsonData['rotatelines']=int(P.rotate_lines)
    jsonData['second_host_address']=str(P.second_host_address)
    jsonData['upoffset']=int(P.upoffset)
    jsonData['downoffset']=int(P.downoffset)
    jsonData['leftoffset']=int(P.leftoffset)
    jsonData['rightoffset']=int(P.rightoffset)
    jsonData['movinglines']=int(P.movinglines)
    writeDbConfig(jsonData)
    return jsonData

def function_flash():
    jsonData=readDbConfig()
    jsonData['commission_flag']=bool(P.COMMISSION_FLAG)
    jsonData['host_address']=str(P.HOST_ADDRESS)
    jsonData['op_flag']=bool(P.FLAG)
    writeDbConfig(jsonData)

def function_countClear():
    jsonData=readDbConfig()
    value=0
    jsonData['up']=value
    jsonData['down']=value
    jsonData['outside']=value
    jsonData['people_count']=value
    print value
    writeDbConfig(jsonData)

def point_plot(a,b,c,d):
    p1=[a,b]
    p2=[c,d]
    pts=np.array([p1,p2],np.int32)
    return pts

def function_rotate(value):
    jsonData=readDbConfig()
    jsonData['rotatelines']=value
    writeDbConfig(jsonData)

def mask_image(image, left_limit, right_limit, up_limit, down_limit):
    mask = np.full(image.shape[:2], 0, dtype = "uint8")
    cv2.rectangle(mask, (left_limit, up_limit), (right_limit , down_limit), 255, -1)
    masked = cv2.bitwise_and(image, image, mask = mask)
    masked[np.where((masked == [0,0,0] ).all(axis = 2))] = [255,255,255]
    return masked
