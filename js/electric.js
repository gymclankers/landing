// Electric spark effect along the wordmark
// Spawns small green particles that drift outward from the text edges

(function () {
  const container = document.querySelector('.wordmark-container');
  if (!container) return;

  // Wait for the trace animation to finish before starting sparks
  const SPARK_DELAY = 4000;
  const SPARK_INTERVAL = 120;
  const SPARKS_PER_TICK = 2;

  function spawnSpark() {
    const rect = container.getBoundingClientRect();
    const spark = document.createElement('div');
    spark.className = 'spark';

    // Random position along the wordmark area
    const x = rect.left + Math.random() * rect.width;
    const y = rect.top + (rect.height * 0.3) + Math.random() * (rect.height * 0.5);

    // Random drift direction
    const dx = (Math.random() - 0.5) * 30;
    const dy = (Math.random() - 0.5) * 30;

    spark.style.left = x + 'px';
    spark.style.top = y + 'px';
    spark.style.setProperty('--dx', dx + 'px');
    spark.style.setProperty('--dy', dy + 'px');

    document.body.appendChild(spark);

    // Clean up after animation
    setTimeout(() => spark.remove(), 600);
  }

  // Letter flicker effect — multiple rapid flicks like a neon stutter
  const letters = document.querySelectorAll('.letter');
  function flickerLetter() {
    const idx = Math.floor(Math.random() * letters.length);
    const letter = letters[idx];
    const flicks = 2 + Math.floor(Math.random() * 3);
    let i = 0;
    function flick() {
      letter.classList.add('flicker');
      setTimeout(() => {
        letter.classList.remove('flicker');
        i++;
        if (i < flicks) setTimeout(flick, 50 + Math.random() * 40);
      }, 40 + Math.random() * 30);
    }
    flick();
  }

  // Start sparking + flickering after the trace animation
  setTimeout(() => {
    // Initial burst
    for (let i = 0; i < 12; i++) {
      setTimeout(spawnSpark, i * 40);
    }

    // Ongoing ambient sparks — stop after ~15s so they don't run forever
    var sparkTimer = setInterval(() => {
      if (Math.random() < 0.6) {
        for (let i = 0; i < SPARKS_PER_TICK; i++) spawnSpark();
      }
    }, SPARK_INTERVAL);
    setTimeout(() => clearInterval(sparkTimer), 15000);

    // Random letter flicker — stop after ~20s
    var flickerTimer = setInterval(() => {
      if (Math.random() < 0.2) flickerLetter();
    }, 800);
    setTimeout(() => clearInterval(flickerTimer), 20000);
  }, SPARK_DELAY);
})();
