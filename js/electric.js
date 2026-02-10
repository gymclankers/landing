// Electric spark effect along the wordmark
// Spawns small amber particles that drift outward from the text edges

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

  // Start sparking after the trace animation
  setTimeout(() => {
    // Initial burst
    for (let i = 0; i < 12; i++) {
      setTimeout(spawnSpark, i * 40);
    }

    // Ongoing ambient sparks
    setInterval(() => {
      if (Math.random() < 0.6) {
        for (let i = 0; i < SPARKS_PER_TICK; i++) spawnSpark();
      }
    }, SPARK_INTERVAL);
  }, SPARK_DELAY);
})();
