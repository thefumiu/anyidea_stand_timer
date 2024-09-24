import RPi.GPIO as GPIO
import time

# Pin ayarları
BUTTON_PIN = 14  # Butonun bağlı olduğu GPIO pini
BOUNCE_TIME = 0.5  # Bounce problemini önlemek için bekleme süresi

# Değişkenler
timer_active = False
start_time = 0

# GPIO ayarları
GPIO.setmode(GPIO.BCM)
GPIO.setup(BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)

def start_timer():
    global start_time
    start_time = time.time()
    print("Sayaç başlatıldı!")

def stop_timer():
    global start_time
    elapsed_time = time.time() - start_time
    print(f"Sayaç durdu! Geçen süre: {elapsed_time:.2f} saniye")
    
    if 9.95 <= elapsed_time <= 10.05:
        print("Tebrikler! Tam 10. saniyede durdurdunuz, oyunu kazandınız!")
    else:
        print("Maalesef, 10 saniyede durduramadınız.")

def button_callback(channel):
    global timer_active
    if not timer_active:
        start_timer()
        timer_active = True
    else:
        stop_timer()
        timer_active = False

# Butona basıldığında tetiklenecek işlev
GPIO.add_event_detect(BUTTON_PIN, GPIO.RISING, callback=button_callback, bouncetime=int(BOUNCE_TIME * 1000))

try:
    while True:
        time.sleep(0.1)  # Ana döngü
except KeyboardInterrupt:
    GPIO.cleanup()  # Çıkışta GPIO temizliği
