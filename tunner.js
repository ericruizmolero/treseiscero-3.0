document.addEventListener("DOMContentLoaded", (event) => {
  if (typeof gsap === "undefined" || typeof Draggable === "undefined") return;

  gsap.registerPlugin(Draggable);

  const radioTop = document.querySelector('.radio_top');
  const progressiveWrapper = document.querySelector('.radio_progresive-embed');
  const freqLayout = document.querySelector('.radio_freq-layout');
  const freqBars = document.querySelectorAll('.radio_freq');
  const totalBars = freqBars.length;
  
  const tickSound = new Audio('https://cdn.prod.website-files.com/69d75a4037abb9fda95564c7/69d7c990b63368c8dcf28ca5_254286__jagadamba__mechanical-switch.mp3'); 
  tickSound.volume = 0.1;

  let lastBarPlayed = -1;

  function renderUI(rotation) {
    let progress = (rotation / 360) * 100;
    
    if (progressiveWrapper) {
      progressiveWrapper.style.setProperty('--progress', progress.toFixed(2));
    }

    // Calculamos el índice
    let barIndex = Math.round((progress / 100) * (totalBars - 1));

    // Solo ejecutamos el cambio de clases si realmente hemos cambiado de barra
    // Esto evita que el navegador reinicie la transición CSS en cada micro-movimiento
    if (barIndex !== lastBarPlayed) {
      freqBars.forEach((bar, index) => {
        bar.classList.remove('is-active', 'is-active-1', 'is-active-2');
        
        let diff = Math.abs(index - barIndex);
        if (diff === 0) bar.classList.add('is-active');
        else if (diff === 1) bar.classList.add('is-active-1');
        else if (diff === 2) bar.classList.add('is-active-2');
      });

      // Sonido
      const sound = tickSound.cloneNode();
      sound.volume = 0.08;
      sound.play().catch(() => {});
      
      lastBarPlayed = barIndex;
    }
  }

  function syncSystem(newRotation) {
    let clamped = Math.max(0, Math.min(360, newRotation));
    
    // Rotamos el dial físico
    gsap.set(radioTop, { rotation: clamped });
    
    // Llamamos a la UI: el CSS se encargará del suavizado gracias a tu cubic-bezier
    renderUI(clamped);
  }

  // --- CONTROLES ---
  Draggable.create(radioTop, {
    type: "rotation",
    bounds: { minRotation: 0, maxRotation: 360 },
    onDrag: function() {
      syncSystem(this.rotation);
    }
  });

  Draggable.create(document.createElement("div"), {
    trigger: freqLayout,
    type: "x",
    onDrag: function() {
      let sensibilidad = 2; 
      let currentRot = gsap.getProperty(radioTop, "rotation");
      let newRotation = currentRot + (this.deltaX / sensibilidad);
      syncSystem(newRotation);
    }
  });

  // Inicialización
  syncSystem(180);
});
