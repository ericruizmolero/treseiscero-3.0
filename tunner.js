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
  
  // Variables de dimensiones
  let slideWidth = 0;
  let slideGap = 0;
  let stepWidth = 0; // El ancho total de la tarjeta + el gap

  // Función para recalcular dimensiones dinámicamente
  function updateDimensions() {
    if (slides.length > 0 && homeMiddle) {
      slideWidth = slides[0].offsetWidth;
      
      // Leemos el valor exacto del gap desde el CSS calculado por el navegador
      let computedStyle = window.getComputedStyle(homeMiddle);
      let gapValue = computedStyle.getPropertyValue('gap') || computedStyle.gap;
      
      // Si el gap es 'normal' o no existe, usamos 0. Si existe, lo pasamos a número.
      slideGap = (gapValue && gapValue !== 'normal') ? parseFloat(gapValue) : 0;
      
      // La distancia real entre el centro de una tarjeta y la siguiente
      stepWidth = slideWidth + slideGap;
    }
  }

  // Actualizamos las dimensiones si el usuario redimensiona o gira la pantalla (mobile)
  window.addEventListener('resize', () => {
    updateDimensions();
    let currentRot = gsap.getProperty(radioTop, "rotation") || 180;
    syncSystem(currentRot, 0); // Reajuste instantáneo sin duración
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
    
    // Ahora multiplicamos por el "stepWidth" que ya incluye el gap
    let moveX = offsetSlides * stepWidth;
    
    gsap.to(homeMiddle, { 
      x: moveX, 
      duration: duration, 
      ease: "power2.out", 
      overwrite: "auto" 
    });
  }

  // --- 5. SISTEMA CENTRAL DE SINCRONIZACIÓN ---
  function syncSystem(newRotation, duration = 0.15) {
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

  // --- 6. FUNCIÓN DE AUTO-ENCAJE (SNAP) ---
  function snapToNearestSlide() {
    let currentRot = gsap.getProperty(radioTop, "rotation");
    let interval = 360 / (totalSlides - 1); 
    let targetRot = Math.round(currentRot / interval) * interval;
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

  if (homeMiddle) {
    Draggable.create(document.createElement("div"), {
      trigger: homeMiddle,
      type: "x",
      onDrag: function() {
        // Usamos el paso completo (ancho + gap) para calcular la sensibilidad
        let safeStep = stepWidth || 1; 
        let currentRot = gsap.getProperty(radioTop, "rotation");
        let interval = 360 / (totalSlides - 1); 
        let sensibilidadSlider = 2.5; 
        
        let rotationChange = -(this.deltaX * sensibilidadSlider / safeStep) * interval;
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
  // Calculamos medidas iniciales antes de renderizar
  updateDimensions();
  // 180 grados = 50% = Centrado exacto en la tarjeta del medio (Slide 3)
  syncSystem(180, 0);
});
