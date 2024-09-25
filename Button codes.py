from machine import Pin
import time

# Buton ve zaman sayaç durumu
button = Pin(14, Pin.IN, Pin.PULL_DOWN)  # Buton GPIO 14'e bağlı
timer_active = False  # Sayaç durumu (başlatıldı mı durduruldu mu)
start_time = 0

def start_timer():
    global start_time
    start_time = time.time()
    print("Sayaç başlatıldı!")

def stop_timer():
    global start_time
    elapsed_time = time.time() - start_time
    print(f"Sayaç durdu! Geçen süre: {elapsed_time:.2f} saniye")
    
    # 10 saniye kontrolü
    if 9.95 <= elapsed_time <= 10.05:
        print("Tebrikler! Tam 10. saniyede durdurdunuz, oyunu kazandınız!")
    else:
        print("Maalesef, 10 saniyede durduramadınız.")

while True:
    if button.value() == 1:  # Buton basıldığında
        if not timer_active:
            start_timer()     # Sayaç başlat
            timer_active = True
        else:
            stop_timer()      # Sayaç durdur
            timer_active = False
        time.sleep(0.5)       # Bouncing problemini önlemek için kısa gecikme
