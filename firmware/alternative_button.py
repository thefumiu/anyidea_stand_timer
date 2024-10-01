import socket
import machine
import time
import network

# Set up the button on GPIO 
button = machine.Pin(14, machine.Pin.IN, machine.Pin.PULL_UP)

# Connect to Wi-Fi
# CHANGE it to spesific hotspot which we gonna use
ssid = 'your_SSID'
password = 'your_PASSWORD'

wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(ssid, password)

while not wlan.isconnected():
    time.sleep(1)

# Set up the socket connection to the server
server_ip = "<your_server_ip>"  # CHANGE to our server's IP (i don't know where to find that but you guys gonna figure it out, somehow i guess)
server_port = 8082              # same port number in Node.js 

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.connect((server_ip, server_port))

def button_pressed():
    message = "BUTTON_PRESSED"
    sock.send(message.encode())  # Send a message when the button is pressed (the part that connects server.js)

# Main loop to listen for button presses
try:
    while True:
        if not button.value():  # Button is pressed (value is 0 when pressed)
            button_pressed()
            time.sleep(0.5)  # Debounce delay

except Exception as e:
    print("Error:", e)
    sock.close()
