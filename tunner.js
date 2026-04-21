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

  // --- 2. SISTEMA DE SONIDO ---
  const tickSound = new Audio('https://cdn.prod.website-files.com/69d75a4037abb9fda95564c7/69d7c990b63368c8dcf28ca5_254286__jagadamba__mechanical-switch.mp3'); 
  tickSound.volume = 0.1;
  let lastBarPlayed = -1;

  // --- 3. LÓGICA DE UI (FRECUENCIAS) ---
  function renderUI(rotation) {
    let progress = (rotation / 360) * 100;
    
    if (progressiveWrapper) {
      progressiveWrapper.style.setProperty('--progress', progress.toFixed(2));
    }

    let barIndex = Math.round((progress / 100) * (totalBars - 1));

    if (barIndex !== lastBarPlayed) {
      freqBars.forEach((bar, index) => {
        bar.classList.remove('is-active', 'is-active-1', 'is-active-2');
        let diff = Math.abs(index - barIndex);
        if (diff === 0) bar.classList.add('is-active');
        else if (diff === 1) bar.classList.add('is-active-1');
        else if (diff === 2) bar.classList.add('is-active-2');
      });

      const sound = tickSound.cloneNode();
      sound.volume = 0.08;
      sound.play().catch(() => {});
      lastBarPlayed = barIndex;
    }
  }

  // --- 4. LÓGICA DEL SLIDER ---
  function updateSlider(rotation, duration) {
    if (!homeMiddle || totalSlides === 0) return;
    let progress = rotation / 360;
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

  // --- 5. SISTEMA CENTRAL DE SINCRONIZACIÓN (CON LÍMITES) ---
  function syncSystem(newRotation, duration = 0.15) {
    // Volvemos a limitar la rotación entre 0 y 360
    let clamped = Math.max(0, Math.min(360, newRotation));
    
    gsap.to(radioTop, { 
      rotation: clamped, 
      duration: duration, 
      ease: "power2.out", 
      overwrite: "auto" 
    });
    
    renderUI(clamped);
    updateSlider(clamped, duration);
  }

  // --- 6. FUNCIONES DE AUTO-ENCAJE (SNAP) ---
  function snapToNearestSlide() {
    let currentRot = gsap.getProperty(radioTop, "rotation");
    let interval = 360 / (totalSlides - 1); 
    let targetRot = Math.round(currentRot / interval) * interval;
    
    // Restauramos el límite para que no intente encajar más allá de las esquinas
    targetRot = Math.max(0, Math.min(360, targetRot));

    gsap.to({ rot: currentRot }, {
      rot: targetRot,
      duration: 0.5, 
      ease: "power2.out",
      onUpdate: function() {
        syncSystem(this.targets()[0].rot, 0);
      }
    });
  }

  // --- 7. CONTROLES DRAGGABLE ---
  
  // A. Control del dial (Rueda)
  if (radioTop) {
    Draggable.create(radioTop, {
      type: "rotation",
      bounds: { minRotation: 0, maxRotation: 360 }, // Restauramos el tope físico
      onDrag: function() {
        syncSystem(this.rotation); 
      },
      onDragEnd: snapToNearestSlide
    });
  }

  // B. Control de la barra de frecuencias
  if (freqLayout) {
    Draggable.create(document.createElement("div"), {
      trigger: freqLayout,
      type: "x",
      onDrag: function() {
        let sensibilidad = 2; 
        let currentRot = gsap.getProperty(radioTop, "rotation");
        let newRotation = currentRot + (this.deltaX / sensibilidad);
        syncSystem(newRotation);
      },
      onDragEnd: snapToNearestSlide
    });
    freqLayout.style.cursor = "grab";
  }

  // C. Control del Slider
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
        
        syncSystem(newRotation);
      },
      onDragEnd: function() {
        let currentRot = gsap.getProperty(radioTop, "rotation");
        let interval = 360 / (totalSlides - 1); 
        let diff = currentRot - startSliderRot;
        let targetRot;

        if (diff > 5) {
          targetRot = Math.ceil(currentRot / interval) * interval;
        } else if (diff < -5) {
          targetRot = Math.floor(currentRot / interval) * interval;
        } else {
          targetRot = Math.round(currentRot / interval) * interval;
        }

        // Restauramos el límite aquí también
        targetRot = Math.max(0, Math.min(360, targetRot));

        gsap.to({ rot: currentRot }, {
          rot: targetRot,
          duration: 0.5,
          ease: "power2.out",
          onUpdate: function() {
            syncSystem(this.targets()[0].rot, 0);
          }
        });
      }
    });

    homeMiddle.style.cursor = "grab";
    homeMiddle.addEventListener("mousedown", () => homeMiddle.style.cursor = "grabbing");
    window.addEventListener("mouseup", () => {
        if(homeMiddle.style.cursor === "grabbing") homeMiddle.style.cursor = "grab";
    });
  }

  // --- 8. INICIALIZACIÓN ---
  updateDimensions();
  syncSystem(180, 0);
});
