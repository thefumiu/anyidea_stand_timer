
from machine import Pin, Timer
import time
import socket

# GPIO setup for the push button
button = Pin(14, Pin.IN, Pin.PULL_UP)

# Timer state management
isTimerRunning = False

def startTimer(timer):
    global isTimerRunning
    if not isTimerRunning:
        isTimerRunning = True
        print("Timer started!")
        timer.init(period=1000, mode=Timer.ONE_SHOT, callback=lambda t: stopTimer())
    else:
        print("Timer already running!")

def stopTimer():
    global isTimerRunning
    isTimerRunning = False
    print("Timer stopped!")

# Function to check button press
def checkButtonPress():
    return button.value() == 0

# Setup socket communication
def setupSocket():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(('0.0.0.0', 1234))  
    s.listen(1)
    print("Waiting for connection....")
    conn, addr = s.accept()  
    print("Connected by", addr)
    return conn

# Main loop
def main():
    timer = Timer()  
    conn = setupSocket()  

    while True:
        if checkButtonPress(): 
            startTimer(timer)   
            conn.send(b'Button pressed\n')  
            print("Message sent")

        time.sleep(0.1)  

main()




    
    
    
    
