let timerElement = document.getElementById('timer');
let startButton = document.getElementById('startButton');
let time = 0;
let interval;

startButton.addEventListener('click', function() {
    if (!interval) { // Eğer geri sayım başlamamışsa
        interval = setInterval(() => {
            time++;
            timerElement.textContent = time;
        }, 1000);
    }
});


