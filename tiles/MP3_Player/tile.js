console.log("Tile MP3 Player loaded");

document.addEventListener('DOMContentLoaded', () => {
  const audio = document.getElementById('audioPlayer');
  const fileInput = document.getElementById('fileInput');
  const bars = document.querySelectorAll('#eq .bar');

  let audioContext;
  let analyser;
  let source;
  let dataArray;
  let animationId;

  function setupAudioNodes() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (!source) {
    source = audioContext.createMediaElementSource(audio);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 64;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);
    analyser.connect(audioContext.destination);
  }
}

  function animate() {
    animationId = requestAnimationFrame(animate);
    analyser.getByteFrequencyData(dataArray);

    const half = Math.floor(bars.length / 2);
    const mirroredData = [];

    for (let i = 0; i < half + (bars.length % 2); i++) {
      const start = Math.floor(i * dataArray.length / (half + (bars.length % 2)));
      const end = Math.floor((i + 1) * dataArray.length / (half + (bars.length % 2)));

      let sum = 0;
      for (let j = start; j < end; j++) {
        sum += dataArray[j];
      }
      const avg = sum / (end - start);
      mirroredData[i] = avg;
    }

    for (let i = 0; i < half; i++) {
      const height = Math.max(4, (mirroredData[half - 1 - i] / 255) * 48) + 'px';
      bars[i].style.height = height;
      bars[bars.length - 1 - i].style.height = height;
    }

    if (bars.length % 2 !== 0) {
      const mid = half;
      const height = Math.max(4, (mirroredData[mirroredData.length - 1] / 255) * 48) + 'px';
      bars[mid].style.height = height;
    }
  }

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file || !file.type.startsWith('audio/')) return;

    const url = URL.createObjectURL(file);
    audio.src = url;
    audio.load();

    if (!audioContext || audioContext.state === 'closed') {
      audioContext = null;
    }

    setupAudioNodes();

    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    audio.play().catch(() => {});
  });

  audio.addEventListener('play', () => {
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }
    animate();
  });

  audio.addEventListener('pause', () => {
    cancelAnimationFrame(animationId);
    bars.forEach(bar => bar.style.height = '10px');
  });

  audio.addEventListener('ended', () => {
    cancelAnimationFrame(animationId);
    bars.forEach(bar => bar.style.height = '10px');
  });

  // Modal logic
  const infoBtn = document.getElementById('infoBtn');
  const infoModal = document.getElementById('infoModal');
  const closeModal = document.getElementById('closeModal');

  infoBtn.addEventListener('click', () => {
    infoModal.classList.remove('hidden');
  });

  closeModal.addEventListener('click', () => {
    infoModal.classList.add('hidden');
  });

  infoModal.addEventListener('click', (e) => {
    if (e.target === infoModal) {
      infoModal.classList.add('hidden');
    }
  });
});
