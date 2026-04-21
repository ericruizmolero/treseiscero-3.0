document.addEventListener("DOMContentLoaded", (event) => {
  if (typeof gsap === "undefined" || typeof Draggable === "undefined") return;

  gsap.registerPlugin(Draggable);

  // --- 1. REFERENCIAS ---
  const radioTop = document.querySelector('.radio_top');
  const progressiveWrapper = document.querySelector('.radio_progresive-embed');
  const freqLayout = document.querySelector('.radio_freq-layout');
  const freqBars = document.querySelectorAll('.radio_freq');
  const totalBars = freqBars.length;
  
  const homeMiddle = document.querySelector('.home_middle');
  const slides = document.querySelectorAll('.home_bento');
  const totalSlides = slides.length; 
  
  let slideWidth = slides.length > 0 ? slides[0].offsetWidth : 0;

  window.addEventListener('resize', () => {
    if (slides.length > 0) {
      slideWidth = slides[0].offsetWidth;
      let currentRot = gsap.getProperty(radioTop, "rotation") || 180;
      syncSystem(currentRot);
    }
  });

  // --- 2. SONIDO ---
  const tickSound = new Audio('https://cdn.prod.website-files.com/69d75a4037abb9fda95564c7/69d7c990b63368c8dcf28ca5_254286__jagadamba__mechanical-switch.mp3'); 
  tickSound.volume = 0.1;
  let lastBarPlayed = -1;

  // --- 3. LÓGICAS DE UI Y SLIDER ---
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

  function updateSlider(rotation) {
    if (!homeMiddle || totalSlides === 0) return;
    let progress = rotation / 360;
    let slideIndexFloat = progress * (totalSlides - 1);
    let centerIndex = (totalSlides - 1) / 2;
    let offsetSlides = centerIndex - slideIndexFloat;
    let moveX = offsetSlides * slideWidth;
    gsap.set(homeMiddle, { x: moveX });
  }

  function syncSystem(newRotation) {
    let clamped = Math.max(0, Math.min(360, newRotation));
    gsap.set(radioTop, { rotation: clamped });
    renderUI(clamped);
    updateSlider(clamped);
  }

  // --- 4. NUEVA FUNCIÓN: SNAP AL SOLTAR ---
  function snapToNearestSlide() {
    let currentRot = gsap.getProperty(radioTop, "rotation");
    
    // Calculamos el tamaño de cada salto en grados (Ej: 360 / 4 = 90)
    let interval = 360 / (totalSlides - 1); 
    
    // Redondeamos al múltiplo más cercano
    let targetRot = Math.round(currentRot / interval) * interval;

    // Nos aseguramos de que no se pase de los límites
    targetRot = Math.max(0, Math.min(360, targetRot));

    // Animamos la transición usando GSAP para que sea suave
    gsap.to({ rot: currentRot }, {
      rot: targetRot,
      duration: 0.4,           // Velocidad de encaje (0.4s)
      ease: "power2.out",      // Curva de aceleración para que se sienta natural
      onUpdate: function() {
        // En cada frame de la animación, actualizamos todo el sistema
        syncSystem(this.targets()[0].rot);
      }
    });
  }

  // --- 5. CONTROLES DRAGGABLE (Actualizados con onDragEnd) ---
  if (radioTop) {
    Draggable.create(radioTop, {
      type: "rotation",
      bounds: { minRotation: 0, maxRotation: 360 },
      onDrag: function() {
        syncSystem(this.rotation);
      },
      // Añadimos el snap al soltar el dial
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
      // Añadimos el snap al soltar la barra de frecuencias
      onDragEnd: snapToNearestSlide
    });
  }

  // Inicialización: 180 grados = 50% = Centrado exacto en la Slide 3
  syncSystem(180);
});
