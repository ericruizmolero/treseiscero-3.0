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
  
  // Ancho dinámico para el movimiento de las tarjetas
  let slideWidth = slides.length > 0 ? slides[0].offsetWidth : 0;

  // Actualizamos el ancho si el usuario redimensiona la pantalla
  window.addEventListener('resize', () => {
    if (slides.length > 0) {
      slideWidth = slides[0].offsetWidth;
      let currentRot = gsap.getProperty(radioTop, "rotation") || 180;
      syncSystem(currentRot);
    }
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
  function updateSlider(rotation) {
    if (!homeMiddle || totalSlides === 0) return;
    let progress = rotation / 360;
    let slideIndexFloat = progress * (totalSlides - 1);
    let centerIndex = (totalSlides - 1) / 2;
    let offsetSlides = centerIndex - slideIndexFloat;
    let moveX = offsetSlides * slideWidth;
    gsap.set(homeMiddle, { x: moveX });
  }

  // --- 5. SISTEMA CENTRAL DE SINCRONIZACIÓN ---
  function syncSystem(newRotation) {
    let clamped = Math.max(0, Math.min(360, newRotation));
    gsap.set(radioTop, { rotation: clamped });
    renderUI(clamped);
    updateSlider(clamped);
  }

  // --- 6. FUNCIÓN DE AUTO-ENCAJE (SNAP) ---
  function snapToNearestSlide() {
    let currentRot = gsap.getProperty(radioTop, "rotation");
    let interval = 360 / (totalSlides - 1); 
    let targetRot = Math.round(currentRot / interval) * interval;
    targetRot = Math.max(0, Math.min(360, targetRot));

    gsap.to({ rot: currentRot }, {
      rot: targetRot,
      duration: 0.4,
      ease: "power2.out",
      onUpdate: function() {
        syncSystem(this.targets()[0].rot);
      }
    });
  }

  // --- 7. CONTROLES DRAGGABLE ---
  
  // A. Control del dial (Rueda)
  if (radioTop) {
    Draggable.create(radioTop, {
      type: "rotation",
      bounds: { minRotation: 0, maxRotation: 360 },
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

  // C. Control del propio Slider (Tarjetas)
  if (homeMiddle) {
    Draggable.create(document.createElement("div"), {
      trigger: homeMiddle,
      type: "x",
      onDrag: function() {
        let safeWidth = slideWidth || 1; 
        let currentRot = gsap.getProperty(radioTop, "rotation");
        let interval = 360 / (totalSlides - 1); 
        
        // --- NUEVO: Sensibilidad del slider ---
        // Aumenta este número para que sea más fácil deslizar (ej: 3)
        // Disminúyelo si quieres que cueste más (ej: 1)
        let sensibilidadSlider = 2.5; 
        
        let rotationChange = -(this.deltaX * sensibilidadSlider / safeWidth) * interval;
        let newRotation = currentRot + rotationChange;
        
        syncSystem(newRotation);
      },
      onDragEnd: snapToNearestSlide
    });

    homeMiddle.style.cursor = "grab";
    homeMiddle.addEventListener("mousedown", () => homeMiddle.style.cursor = "grabbing");
    window.addEventListener("mouseup", () => {
        if(homeMiddle.style.cursor === "grabbing") homeMiddle.style.cursor = "grab";
    });
  }

  // --- 8. INICIALIZACIÓN ---
  // 180 grados = 50% = Centrado exacto en la tarjeta del medio (Slide 3)
  syncSystem(180);
});
