// main.js
document.addEventListener('DOMContentLoaded', () => {
  let audioContext;
  let analyser;

  const initializeAudioContext = () => {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.connect(audioContext.destination);
  };

  const canvas = document.getElementById('spectroCanvas');
  const ctx = canvas.getContext('2d');
  const audioFileInput = document.getElementById('audioFile');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const progressBar = document.getElementById('progressBar');
  const elapsedTime = document.getElementById('elapsedTime');

  let audio;

  const initializeAudio = () => {
    audio = new Audio();
    audio.addEventListener('play', () => {
      draw();
    });

    audio.addEventListener('timeupdate', () => {
      updateProgressBar();
    });

    playPauseBtn.addEventListener('click', () => {
      if (audio.paused) {
        audio.play();
        playPauseBtn.textContent = 'Pause';
      } else {
        audio.pause();
        playPauseBtn.textContent = 'Play';
      }
    });

    progressBar.addEventListener('input', () => {
      const seekTime = (progressBar.value / 100) * audio.duration;
      audio.currentTime = seekTime;
    });
  };

  const updateProgressBar = () => {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBar.value = progress;
    elapsedTime.textContent = `Tempo decorrido: ${formatTime(
      audio.currentTime
    )}`;
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return `${minutes}:${formattedSeconds}`;
  };

  const draw = () => {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    analyser.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = 16;
    const maxBarHeight = canvas.height - 20; // Ajuste da altura máxima
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * maxBarHeight;
      const gradient = ctx.createLinearGradient(x, 0, x, barHeight);

      if (i % 2 === 0) {
        gradient.addColorStop(0, '#22d3ee'); // Azul claro
        gradient.addColorStop(1, '#10b981'); // Azul escuro
      } else {
        gradient.addColorStop(0, '#22d3ee'); // Azul escuro
        gradient.addColorStop(1, '#10b981'); // Azul claro
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }

    updateProgressBar();

    // Efeito parallax simulado diretamente no canvas
    const parallaxFactor = 0.6; // Ajuste conforme necessário
    ctx.translate(0, audio.currentTime * parallaxFactor);
    requestAnimationFrame(draw);
    ctx.translate(0, -audio.currentTime * parallaxFactor);
  };

  audioFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];

    if (file) {
      if (!audioContext) {
        initializeAudioContext();
        initializeAudio();
      }

      const objectURL = URL.createObjectURL(file);
      const audioSrc = audioContext.createMediaElementSource(audio);
      audioSrc.connect(analyser);
      audio.src = objectURL;
    }
  });
});
