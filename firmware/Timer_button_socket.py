from machine import Pin, Timer
import time
import socket

# GPIO setup for the push button
button = Pin(14, Pin.IN, Pin.PULL_UP)

# Timer state management
isTimerRunning = False

# Timer start function
def startTimer(timer):
    global isTimerRunning
    if not isTimerRunning:
        isTimerRunning = True
        print("Timer started!")
        timer.init(period=1000, mode=Timer.ONE_SHOT, callback=lambda t: stopTimer())
    else:
        print("Timer already running!")

# Timer stop function
def stopTimer():
    global isTimerRunning
    isTimerRunning = False
    print("Timer stopped!")

# Function to check button press
def checkButtonPress():
    return button.value() == 0

# Socket setup
def setupSocket():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.bind(('0.0.0.0', 1234))  
        s.listen(1)
        print("Waiting for connection...")
        conn, addr = s.accept()  
        print("Connected by", addr)
        return conn
    except OSError as e:
        print("Socket setup failed:", e)
        return None

# Main loop
def main():
    timer = Timer()  
    conn = setupSocket()  

    if conn:  # Proceed only if the socket connection was successful
        while True:
            if checkButtonPress(): 
                startTimer(timer)   
                try:
                    conn.send(b'Button pressed\n')  
                    print("Message sent")
                except OSError as e:
                    print("Failed to send message:", e)

            time.sleep(0.1)  # Debounce delay

# Run the main function
main()




    
    
    
    
