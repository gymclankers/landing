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
  var trackDuration = document.getElementById('track-duration');
  var volumeBtn = document.getElementById('volume-btn');
  var volOn = volumeBtn.querySelector('.vol-on');
  var volOff = volumeBtn.querySelector('.vol-off');
  var volumeSlider = document.getElementById('volume-slider');
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
    trackDuration.textContent = '';
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
    // Hero button waveform state
    if (heroPlay) {
      heroPlay.classList.toggle('active', playing || heroPlay.classList.contains('active'));
      heroPlay.classList.toggle('paused', !playing);
    }
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

  // Duration display
  audio.addEventListener('loadedmetadata', function () {
    trackDuration.textContent = formatTime(audio.duration);
  });

  // Volume
  var savedVolume = 1;
  var mpcVolSlider = document.getElementById('mpc-volume-slider');
  var mpcVolBtn = document.getElementById('mpc-volume-btn');
  var mpcVolOn = mpcVolBtn ? mpcVolBtn.querySelector('.mpc-vol-on') : null;
  var mpcVolOff = mpcVolBtn ? mpcVolBtn.querySelector('.mpc-vol-off') : null;

  function updateVolIcon() {
    var muted = audio.muted || audio.volume === 0;
    volOn.style.display = muted ? 'none' : '';
    volOff.style.display = muted ? '' : 'none';
    if (mpcVolOn) mpcVolOn.style.display = muted ? 'none' : '';
    if (mpcVolOff) mpcVolOff.style.display = muted ? '' : 'none';
  }

  function syncVolumeSliders() {
    var val = audio.muted ? 0 : audio.volume;
    volumeSlider.value = val;
    if (mpcVolSlider) mpcVolSlider.value = val;
  }

  volumeBtn.addEventListener('click', function () {
    if (audio.muted) {
      audio.muted = false;
      audio.volume = savedVolume || 1;
    } else {
      savedVolume = audio.volume || 1;
      audio.muted = true;
    }
    updateVolIcon();
    syncVolumeSliders();
  });

  volumeSlider.addEventListener('input', function () {
    audio.volume = parseFloat(this.value);
    audio.muted = false;
    if (audio.volume > 0) savedVolume = audio.volume;
    updateVolIcon();
    if (mpcVolSlider) mpcVolSlider.value = this.value;
  });

  if (mpcVolBtn) {
    mpcVolBtn.addEventListener('click', function () {
      if (audio.muted) {
        audio.muted = false;
        audio.volume = savedVolume || 1;
      } else {
        savedVolume = audio.volume || 1;
        audio.muted = true;
      }
      updateVolIcon();
      syncVolumeSliders();
    });
  }

  if (mpcVolSlider) {
    mpcVolSlider.addEventListener('input', function () {
      audio.volume = parseFloat(this.value);
      audio.muted = false;
      if (audio.volume > 0) savedVolume = audio.volume;
      updateVolIcon();
      volumeSlider.value = this.value;
    });
  }

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

  // Click on progress bar to seek
  progressWrap.addEventListener('mousedown', function (e) {
    scrubbing = true;
    scrub(e);
  });

  // Drag from robot to scrub
  progressRobot.addEventListener('mousedown', function (e) {
    e.preventDefault();
    scrubbing = true;
  });
  document.addEventListener('mousemove', function (e) {
    if (scrubbing) scrub(e);
  });
  document.addEventListener('mouseup', function () {
    scrubbing = false;
  });

  // Touch: robot drag + bar tap
  progressRobot.addEventListener('touchstart', function (e) {
    scrubbing = true;
  }, { passive: true });
  progressWrap.addEventListener('touchstart', function (e) {
    scrubbing = true;
    scrub(e);
  }, { passive: true });
  document.addEventListener('touchmove', function (e) {
    if (scrubbing) scrub(e);
  }, { passive: true });
  document.addEventListener('touchend', function () {
    scrubbing = false;
  });

  // Set initial track name (no autoplay)
  trackName.textContent = tracks[current].name;

  // Reveal player bar after animation sequence
  setTimeout(function () {
    bar.classList.add('visible');
  }, 5200);

  // ─── Simulated visualizer (no Web Audio — avoids CORS hijack) ───
  var heroCanvas = document.getElementById('hero-visualizer');
  var heroCtx = heroCanvas ? heroCanvas.getContext('2d') : null;
  var mobileCanvas = document.getElementById('mobile-visualizer');
  var mobileCtx = mobileCanvas ? mobileCanvas.getContext('2d') : null;
  var animId = null;

  // Shared EQ value generator
  function getBarValue(t, i) {
    var val = 0.25 + 0.3 * Math.sin(t * 3.2 + i * 1.1)
                   + 0.2 * Math.sin(t * 5.4 + i * 0.7)
                   + 0.15 * Math.sin(t * 1.8 + i * 2.3);
    return Math.max(0.1, Math.min(1, val));
  }

  // Draw stacked cubes on any canvas context
  function drawEQ(c, cx, numBars, cubeW, cubeH, cubeGap, barGap, maxCubes, t) {
    var w = c.width;
    var h = c.height;
    var totalW = numBars * cubeW + (numBars - 1) * barGap;
    var startX = (w - totalW) / 2;
    var floor = h - 4;

    cx.clearRect(0, 0, w, h);

    for (var i = 0; i < numBars; i++) {
      var val = getBarValue(t, i);
      var nc = Math.max(1, Math.round(val * maxCubes));
      var x = startX + i * (cubeW + barGap);

      for (var j = 0; j < nc; j++) {
        var y = floor - j * (cubeH + cubeGap) - cubeH;
        var brightness = 0.35 + (j / maxCubes) * 0.65;
        cx.fillStyle = 'rgba(186, 37, 37, ' + brightness + ')';
        cx.fillRect(x, y, cubeW, cubeH);
      }
    }
  }

  function resizeMobileCanvas() {
    if (!mobileCanvas) return;
    var wrap = document.getElementById('mobile-viz-wrap');
    if (!wrap) return;
    var rect = wrap.getBoundingClientRect();
    mobileCanvas.width = Math.round(rect.width * (window.devicePixelRatio || 1));
    mobileCanvas.height = Math.round(rect.height * (window.devicePixelRatio || 1));
  }

  function drawVisualizer(ts) {
    var t = (ts || 0) * 0.001;

    // Hero canvas (small, inside circle button)
    if (heroCtx) {
      drawEQ(heroCanvas, heroCtx, 7, 5, 4, 1.5, 3, 8, t);
    }

    // Mobile canvas (larger, scaled)
    if (mobileCtx) {
      var dpr = window.devicePixelRatio || 1;
      drawEQ(mobileCanvas, mobileCtx, 15, Math.round(8 * dpr), Math.round(6 * dpr), Math.round(3 * dpr), Math.round(5 * dpr), 12, t);
    }

    animId = requestAnimationFrame(drawVisualizer);
  }

  audio.addEventListener('play', function () {
    resizeMobileCanvas();
    drawVisualizer();
  });

  audio.addEventListener('pause', function () {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
  });

  // Resize mobile canvas on orientation change
  window.addEventListener('resize', resizeMobileCanvas);

  // ─── Tracklist ───
  var tracklistEl = document.getElementById('tracklist-list');

  function renderTracklist() {
    if (!tracklistEl) return;
    tracklistEl.innerHTML = '';
    tracks.forEach(function (t, i) {
      var row = document.createElement('div');
      row.className = 'tracklist-row' + (i === current ? ' active' : '');
      row.innerHTML = '<span class="tracklist-num">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span class="tracklist-name">' + t.name + '</span>';
      row.addEventListener('click', function () {
        loadTrack(i, true);
        bar.classList.add('visible');
        if (typeof gtag === 'function') {
          gtag('event', 'click_track', { track: t.name, index: i });
        }
      });
      tracklistEl.appendChild(row);
    });
  }

  function updateTracklist() {
    if (!tracklistEl) return;
    var rows = tracklistEl.querySelectorAll('.tracklist-row');
    rows.forEach(function (row, i) {
      row.classList.toggle('active', i === current);
    });
  }

  renderTracklist();

  // Patch loadTrack to also update tracklist + mobile UI
  var _origLoadTrack = loadTrack;
  loadTrack = function (index, autoplay) {
    _origLoadTrack(index, autoplay);
    updateTracklist();
    syncMobileUI();
  };

  // ─── Mobile player card ───
  var mpcPlay = document.getElementById('mpc-play');
  var mpcPrev = document.getElementById('mpc-prev');
  var mpcNext = document.getElementById('mpc-next');
  var mpcName = document.getElementById('mpc-name');
  var mpcTime = document.getElementById('mpc-time');
  var mpcProgressWrap = document.getElementById('mpc-progress');
  var mpcFill = document.getElementById('mpc-progress-fill');
  var mpcThumb = document.getElementById('mpc-progress-thumb');
  var mpcPlayIcon = mpcPlay ? mpcPlay.querySelector('.mpc-play-icon') : null;
  var mpcPauseIcon = mpcPlay ? mpcPlay.querySelector('.mpc-pause-icon') : null;

  if (mpcPlay) {
    mpcPlay.addEventListener('click', function () {
      handlePlayPause();
      bar.classList.add('visible');
    });
  }
  if (mpcPrev) {
    mpcPrev.addEventListener('click', function () {
      if (audio.currentTime > 3) {
        audio.currentTime = 0;
      } else {
        loadTrack((current - 1 + tracks.length) % tracks.length, !audio.paused);
      }
    });
  }
  if (mpcNext) {
    mpcNext.addEventListener('click', function () {
      loadTrack((current + 1) % tracks.length, !audio.paused);
    });
  }

  // Mobile card scrubbing
  var mpcScrubbing = false;
  function mpcScrub(e) {
    if (!mpcProgressWrap) return;
    var rect = mpcProgressWrap.getBoundingClientRect();
    var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    var pct = Math.max(0, Math.min(1, x / rect.width));
    if (mpcFill) mpcFill.style.width = (pct * 100) + '%';
    if (mpcThumb) mpcThumb.style.left = (pct * 100) + '%';
    if (audio.duration) audio.currentTime = pct * audio.duration;
  }

  if (mpcProgressWrap) {
    mpcProgressWrap.addEventListener('mousedown', function (e) { mpcScrubbing = true; mpcScrub(e); });
    mpcProgressWrap.addEventListener('touchstart', function (e) { mpcScrubbing = true; mpcScrub(e); }, { passive: true });
  }
  document.addEventListener('mousemove', function (e) { if (mpcScrubbing) mpcScrub(e); });
  document.addEventListener('touchmove', function (e) { if (mpcScrubbing) mpcScrub(e); }, { passive: true });
  document.addEventListener('mouseup', function () { mpcScrubbing = false; });
  document.addEventListener('touchend', function () { mpcScrubbing = false; });

  // ─── Mini-bar ───
  var miniBar = document.getElementById('mini-bar');
  var miniBarPlay = document.getElementById('mini-bar-play');
  var miniBarName = document.getElementById('mini-bar-name');
  var miniBarFill = document.getElementById('mini-bar-fill');
  var miniBarTime = document.getElementById('mini-bar-time');
  var miniPlayIcon = miniBarPlay ? miniBarPlay.querySelector('.mini-play-icon') : null;
  var miniPauseIcon = miniBarPlay ? miniBarPlay.querySelector('.mini-pause-icon') : null;
  var mobileCard = document.getElementById('mobile-player-card');

  if (miniBarPlay) {
    miniBarPlay.addEventListener('click', function (e) {
      e.stopPropagation();
      handlePlayPause();
    });
  }
  if (miniBar) {
    miniBar.addEventListener('click', function () {
      // Scroll back to hero
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // IntersectionObserver: show mini-bar when mobile card scrolls out
  if (mobileCard && miniBar) {
    var observer = new IntersectionObserver(function (entries) {
      var isMobile = window.innerWidth <= 767;
      if (!isMobile) { miniBar.classList.remove('visible'); return; }
      entries.forEach(function (entry) {
        miniBar.classList.toggle('visible', !entry.isIntersecting);
      });
    }, { threshold: 0 });
    observer.observe(mobileCard);
  }

  // ─── Sync all mobile UI ───
  function syncMobileUI() {
    var name = tracks[current].name;
    if (mpcName) mpcName.textContent = name;
    if (miniBarName) miniBarName.textContent = name;
  }

  function syncMobilePlayState() {
    var playing = !audio.paused;
    if (mpcPlayIcon) mpcPlayIcon.style.display = playing ? 'none' : '';
    if (mpcPauseIcon) mpcPauseIcon.style.display = playing ? '' : 'none';
    if (miniPlayIcon) miniPlayIcon.style.display = playing ? 'none' : '';
    if (miniPauseIcon) miniPauseIcon.style.display = playing ? '' : 'none';
  }

  audio.addEventListener('play', syncMobilePlayState);
  audio.addEventListener('pause', syncMobilePlayState);

  audio.addEventListener('timeupdate', function () {
    if (!audio.duration) return;
    var pct = (audio.currentTime / audio.duration) * 100;
    var timeStr = formatTime(audio.currentTime);
    // Mobile card
    if (mpcFill && !mpcScrubbing) mpcFill.style.width = pct + '%';
    if (mpcThumb && !mpcScrubbing) mpcThumb.style.left = pct + '%';
    if (mpcTime) mpcTime.textContent = timeStr;
    // Mini-bar
    if (miniBarFill) miniBarFill.style.width = pct + '%';
    if (miniBarTime) miniBarTime.textContent = timeStr;
  });

  // Initial sync
  syncMobileUI();
})();
