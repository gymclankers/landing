// GymClankers custom audio player — streams from R2
(function () {
  var BASE = 'https://songs.gymclankers.com/upgrade/';

  var tracks = [
    { file: '01-fuel.mp3', name: 'FUEL' },
    { file: '02-upgrade.mp3', name: 'UPGRADE' },
    { file: '03-free-weights.mp3', name: 'FREE WEIGHTS' },
    { file: '04-nancy.mp3', name: 'NANCY' },
    { file: '05-barbell.mp3', name: 'BARBELL' },
    { file: '06-personal-best.mp3', name: 'PERSONAL BEST' },
    { file: '07-invitational-upgrade.mp3', name: 'INVITATIONAL (UPGRADE)' },
    { file: '08-clink-clank.mp3', name: 'CLINK CLANK' },
    { file: '09-memory.mp3', name: 'MEMORY' },
    { file: '10-process-is-performance.mp3', name: 'PROCESS IS PERFORMANCE' },
    { file: '11-leg-day-upgrade.mp3', name: 'LEG DAY (UPGRADE)' },
    { file: '12-powertrain.mp3', name: 'POWERTRAIN' },
    { file: '13-upset-camel.mp3', name: 'UPSET CAMEL' },
    { file: '14-lisp.mp3', name: 'LISP' },
    { file: '15-takeout.mp3', name: 'TAKEOUT' }
  ];

  var current = 0;
  var audio = document.getElementById('audio');
  var bar = document.getElementById('player-bar');
  var playBtn = document.getElementById('play-btn');
  var prevBtn = document.getElementById('prev-btn');
  var nextBtn = document.getElementById('next-btn');
  var playIcon = playBtn.querySelector('.play-icon');
  var pauseIcon = playBtn.querySelector('.pause-icon');
  var trackName = document.getElementById('track-name');
  var trackTime = document.getElementById('track-time');
  var progressWrap = document.getElementById('progress-wrap');
  var progressFill = document.getElementById('progress-fill');
  var progressHandle = document.getElementById('progress-handle');
  var progressRobot = document.getElementById('progress-robot');

  function setProgress(pct) {
    progressFill.style.width = pct;
    progressHandle.style.left = pct;
    progressRobot.style.left = pct;
  }

  function formatTime(s) {
    if (!s || isNaN(s)) return '0:00';
    var m = Math.floor(s / 60);
    var sec = Math.floor(s % 60);
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  function loadTrack(index, autoplay) {
    current = index;
    audio.src = BASE + tracks[current].file;
    audio.load();
    trackName.textContent = tracks[current].name;
    trackTime.textContent = '0:00';
    setProgress('0%');
    if (autoplay) {
      audio.play();
    }
  }

  function togglePlay() {
    if (!audio.src || audio.src === location.href) {
      loadTrack(current, true);
      return;
    }
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }

  function updatePlayState() {
    var playing = !audio.paused;
    playIcon.style.display = playing ? 'none' : '';
    pauseIcon.style.display = playing ? '' : 'none';
    bar.classList.toggle('playing', playing);
  }

  // Play / pause
  function handlePlayPause() {
    var wasPlaying = !audio.paused;
    togglePlay();
    if (typeof gtag === 'function') {
      gtag('event', wasPlaying ? 'player_pause' : 'player_play', {
        track: tracks[current].name
      });
    }
  }

  playBtn.addEventListener('click', handlePlayPause);

  // Hero play button
  var heroPlay = document.getElementById('hero-play');
  if (heroPlay) {
    heroPlay.addEventListener('click', function () {
      handlePlayPause();
      // Reveal player bar immediately if not already visible
      bar.classList.add('visible');
    });
  }

  // Previous — restart if >3s in, else go to previous track
  prevBtn.addEventListener('click', function () {
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
    } else {
      loadTrack((current - 1 + tracks.length) % tracks.length, !audio.paused);
    }
  });

  // Next
  nextBtn.addEventListener('click', function () {
    loadTrack((current + 1) % tracks.length, !audio.paused);
  });

  // Auto-advance
  audio.addEventListener('ended', function () {
    loadTrack((current + 1) % tracks.length, true);
  });

  // Progress update
  audio.addEventListener('timeupdate', function () {
    if (!audio.duration) return;
    var pct = (audio.currentTime / audio.duration) * 100;
    setProgress(pct + '%');
    trackTime.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener('play', updatePlayState);
  audio.addEventListener('pause', updatePlayState);

  // Scrubbing — mouse + touch
  var scrubbing = false;

  function scrub(e) {
    var rect = progressWrap.getBoundingClientRect();
    var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    var pct = Math.max(0, Math.min(1, x / rect.width));
    setProgress((pct * 100) + '%');
    if (audio.duration) {
      audio.currentTime = pct * audio.duration;
    }
  }

  progressWrap.addEventListener('mousedown', function (e) {
    scrubbing = true;
    scrub(e);
  });
  document.addEventListener('mousemove', function (e) {
    if (scrubbing) scrub(e);
  });
  document.addEventListener('mouseup', function () {
    scrubbing = false;
  });

  progressWrap.addEventListener('touchstart', function (e) {
    scrubbing = true;
    scrub(e);
  }, { passive: true });
  progressWrap.addEventListener('touchmove', function (e) {
    if (scrubbing) scrub(e);
  }, { passive: true });
  progressWrap.addEventListener('touchend', function () {
    scrubbing = false;
  });

  // Set initial track name (no autoplay)
  trackName.textContent = tracks[current].name;

  // Reveal player bar after animation sequence
  setTimeout(function () {
    bar.classList.add('visible');
  }, 5200);
})();
