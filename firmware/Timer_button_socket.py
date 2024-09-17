from machine import Pin, Timer
import time
import socket

# GPIO setup for the push button
button = Pin(14, Pin.IN, Pin.PULL_UP)

# Timer logic
is_timer_running = False

def start_timer(t):
    global is_timer_running
    if not is_timer_running:
        is_timer_running = True
        print("Timer started!")
    else:
        print("Timer already running!")

# Function to handle button press
def check_button_press():
    return button.value() == 0

# Setting up socket communication
def setup_socket():
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
    conn = setup_socket()

    while True:
        # Check if button is pressed
        if check_button_press():
            start_timer(timer)
            conn.send(b'Button pressed\n')
            print("Message sent")

        time.sleep(0.1)

main()



    
    
    
    