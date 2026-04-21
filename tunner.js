document.addEventListener("DOMContentLoaded", (event) => {
  if (typeof gsap === "undefined" || typeof Draggable === "undefined") return;

  gsap.registerPlugin(Draggable);

  // --- 1. REFERENCIAS DEL DOM ---
  const radioTop = document.querySelector('.radio_top');
  const progressiveWrapper = document.querySelector('.radio_progresive-embed');
  const freqLayout = document.querySelector('.radio_freq-layout');
  const freqBars = document.querySelectorAll('.radio_freq');
  const totalBars = freqBars.length;
  
  const homeMiddle = document.querySelector('.home_middle');
  const slides = document.querySelectorAll('.home_bento');
  const totalSlides = slides.length; 
  
  const tabWrappers = document.querySelectorAll('.radio_freq-layout .radio_tab-link-wrapper');

  // Variables de dimensiones
  let slideWidth = 0;
  let slideGap = 0;
  let stepWidth = 0; 

  function updateDimensions() {
    if (slides.length > 0 && homeMiddle) {
      slideWidth = slides[0].offsetWidth;
      let computedStyle = window.getComputedStyle(homeMiddle);
      let gapValue = computedStyle.getPropertyValue('gap') || computedStyle.gap;
      slideGap = (gapValue && gapValue !== 'normal') ? parseFloat(gapValue) : 0;
      stepWidth = slideWidth + slideGap;
    }
  }

  window.addEventListener('resize', () => {
    updateDimensions();
    let currentRot = gsap.getProperty(radioTop, "rotation") || 180;
    syncSystem(currentRot, 0); 
  });

  // --- 2. SISTEMA DE SONIDO ANTI-SOLAPAMIENTO ---
  const tickSound = new Audio('https://cdn.prod.website-files.com/69d75a4037abb9fda95564c7/69d7c990b63368c8dcf28ca5_254286__jagadamba__mechanical-switch.mp3'); 
  tickSound.volume = 0.06; // Volumen fijo en el canal principal
  let lastBarPlayed = -1;
  let lastTickTime = 0; 

  // --- 3. LÓGICA DE UI (BARRAS Y TABS) ---
  function renderUI(interpolatedRotation) {
    let progress = (interpolatedRotation / 360) * 100;
    
    if (progressiveWrapper) {
      progressiveWrapper.style.setProperty('--progress', progress.toFixed(2));
    }

    let barIndex = Math.round((progress / 100) * (totalBars - 1));

    if (barIndex !== lastBarPlayed) {
      freqBars.forEach((bar, index) => {
        bar.classList.remove('is-active', 'is-active-1', 'is-active-2');
        
        let tabLink = bar.querySelector('.radio_tab-link');
        if (tabLink) tabLink.classList.remove('is-active');

        let diff = Math.abs(index - barIndex);
        if (diff === 0) {
          bar.classList.add('is-active');
          if (tabLink) tabLink.classList.add('is-active'); 
        } 
        else if (diff === 1) bar.classList.add('is-active-1');
        else if (diff === 2) bar.classList.add('is-active-2');
      });

      // --- CONTROL DE SONIDO: UN SOLO CANAL ---
      let now = Date.now();
      if (now - lastTickTime > 50) { // 50ms de respiro
        // Al poner el tiempo a 0, cortamos en seco cualquier "eco" anterior
        tickSound.currentTime = 0; 
        tickSound.play().catch(() => {});
        lastTickTime = now;
      }

      lastBarPlayed = barIndex;
    }
  }

  // --- 4. SISTEMA CENTRAL DE SINCRONIZACIÓN ---
  function syncSystem(targetRot, duration = 0.6) {
    let clamped = Math.max(0, Math.min(360, targetRot));

    if (homeMiddle && totalSlides > 0) {
      let progress = clamped / 360;
      let slideIndexFloat = progress * (totalSlides - 1);
      let centerIndex = (totalSlides - 1) / 2;
      let offsetSlides = centerIndex - slideIndexFloat;
      let moveX = offsetSlides * stepWidth;
      
      gsap.to(homeMiddle, { 
        x: moveX, 
        duration: duration, 
        ease: "power2.out", 
        overwrite: "auto" 
      });
    }

    gsap.to(radioTop, { 
      rotation: clamped, 
      duration: duration, 
      ease: "power2.out", 
      overwrite: "auto",
      onUpdate: function() {
        let currentInterpolatedRot = gsap.getProperty(radioTop, "rotation");
        renderUI(currentInterpolatedRot);
      }
    });
  }

  // --- 5. FUNCIÓN DE AUTO-ENCAJE (SNAP) ---
  function snapToNearestSlide() {
    let currentRot = gsap.getProperty(radioTop, "rotation");
    let interval = 360 / (totalSlides - 1); 
    let targetRot = Math.round(currentRot / interval) * interval;
    targetRot = Math.max(0, Math.min(360, targetRot));

    syncSystem(targetRot, 0.8);
  }

  // --- 6. CONTROLES DRAGGABLE Y CLICKS ---
  
  if (radioTop) {
    Draggable.create(radioTop, {
      type: "rotation",
      bounds: { minRotation: 0, maxRotation: 360 },
      onDrag: function() {
        syncSystem(this.rotation, 0.1); 
      },
      onDragEnd: snapToNearestSlide
    });
  }

  if (freqLayout) {
    Draggable.create(document.createElement("div"), {
      trigger: freqLayout,
      type: "x",
      onDrag: function() {
        let sensibilidad = 2; 
        let currentRot = gsap.getProperty(radioTop, "rotation");
        let newRotation = currentRot + (this.deltaX / sensibilidad);
        syncSystem(newRotation, 0.4);
      },
      onDragEnd: snapToNearestSlide
    });
    freqLayout.style.cursor = "grab";
  }

  if (homeMiddle) {
    let startSliderRot = 0; 

    Draggable.create(document.createElement("div"), {
      trigger: homeMiddle,
      type: "x",
      onDragStart: function() {
        startSliderRot = gsap.getProperty(radioTop, "rotation");
      },
      onDrag: function() {
        let safeStep = stepWidth || 1; 
        let currentRot = gsap.getProperty(radioTop, "rotation");
        let interval = 360 / (totalSlides - 1); 
        let sensibilidadSlider = 2.5; 
        
        let rotationChange = -(this.deltaX * sensibilidadSlider / safeStep) * interval;
        let newRotation = currentRot + rotationChange;
        
        syncSystem(newRotation, 0.6); 
      },
      onDragEnd: function() {
        let currentRot = gsap.getProperty(radioTop, "rotation");
        let interval = 360 / (totalSlides - 1); 
        let diff = currentRot - startSliderRot;
        let targetRot;

        if (diff > 5) targetRot = Math.ceil(currentRot / interval) * interval;
        else if (diff < -5) targetRot = Math.floor(currentRot / interval) * interval;
        else targetRot = Math.round(currentRot / interval) * interval;

        targetRot = Math.max(0, Math.min(360, targetRot));

        syncSystem(targetRot, 0.8); 
      }
    });

    homeMiddle.style.cursor = "grab";
  }

  // EVENTOS DE CLICK EN LOS TABS
  if (tabWrappers.length > 0) {
    tabWrappers.forEach((wrapper, index) => {
      wrapper.style.cursor = "pointer";
      wrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        let interval = 360 / (tabWrappers.length - 1);
        let targetRot = index * interval; 
        syncSystem(targetRot, 0.8); 
      });
    });
  }

  // --- 7. INICIALIZACIÓN ---
  updateDimensions();
  syncSystem(180, 0); 
});
