document.addEventListener("DOMContentLoaded", (event) => {
  if (typeof gsap === "undefined" || typeof Draggable === "undefined") return;

  gsap.registerPlugin(Draggable);

  // --- 1. REFERENCIAS DEL RADIO ---
  const radioTop = document.querySelector('.radio_top');
  const progressiveWrapper = document.querySelector('.radio_progresive-embed');
  const freqLayout = document.querySelector('.radio_freq-layout');
  const freqBars = document.querySelectorAll('.radio_freq');
  const totalBars = freqBars.length;
  
  // --- 2. REFERENCIAS DEL SLIDER ---
  const homeMiddle = document.querySelector('.home_middle');
  const slides = document.querySelectorAll('.home_bento');
  const totalSlides = slides.length; // En tu estructura son 5
  
  // Calculamos el ancho dinámico para el movimiento (optimización)
  let slideWidth = slides.length > 0 ? slides[0].offsetWidth : 0;

  // Actualizamos el ancho si el usuario redimensiona la pantalla
  window.addEventListener('resize', () => {
    if (slides.length > 0) {
      slideWidth = slides[0].offsetWidth;
      let currentRot = gsap.getProperty(radioTop, "rotation") || 180;
      syncSystem(currentRot); // Reajusta la posición exacta
    }
  });

  // --- 3. SONIDO ---
  const tickSound = new Audio('https://cdn.prod.website-files.com/69d75a4037abb9fda95564c7/69d7c990b63368c8dcf28ca5_254286__jagadamba__mechanical-switch.mp3'); 
  tickSound.volume = 0.1;
  let lastBarPlayed = -1;

  // --- 4. LÓGICA DE UI (FRECUENCIAS) ---
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

  // --- 5. LÓGICA DEL SLIDER ---
  function updateSlider(rotation) {
    if (!homeMiddle || totalSlides === 0) return;

    // Convertimos la rotación (0-360) a progreso (0 a 1)
    let progress = rotation / 360;

    // Obtenemos el índice exacto en decimales (ej: 2.5)
    let slideIndexFloat = progress * (totalSlides - 1);

    // Como flexbox centra el layout, el índice 2 es nuestro centro natural (X = 0)
    let centerIndex = (totalSlides - 1) / 2;

    // Diferencia entre el centro natural y el progreso actual
    let offsetSlides = centerIndex - slideIndexFloat;

    // Distancia final en píxeles que debe moverse el contenedor
    let moveX = offsetSlides * slideWidth;

    // Aplicamos el desplazamiento a todo el contenedor
    gsap.set(homeMiddle, { x: moveX });
  }

  // --- 6. SISTEMA CENTRAL DE SINCRONIZACIÓN ---
  function syncSystem(newRotation) {
    let clamped = Math.max(0, Math.min(360, newRotation));
    
    // Rotamos el dial físico
    gsap.set(radioTop, { rotation: clamped });
    
    // UI del Radio
    renderUI(clamped);

    // Movimiento del Slider
    updateSlider(clamped);
  }

  // --- 7. CONTROLES DRAGGABLE ---
  if (radioTop) {
    Draggable.create(radioTop, {
      type: "rotation",
      bounds: { minRotation: 0, maxRotation: 360 },
      onDrag: function() {
        syncSystem(this.rotation);
      }
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
      }
    });
  }

  // Inicialización: 180 grados = 50% = Centrado exacto en la Slide 3
  syncSystem(180);
});
