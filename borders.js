  if (typeof borderSyncInitialized === 'undefined') {
    window.borderSyncInitialized = true;

    const syncAllBorders = () => {
      // Buscamos nuestro nuevo contenedor exacto
      document.querySelectorAll('.animated-border-exact').forEach(wrapper => {
        const svg = wrapper.querySelector('svg');
        const rect = wrapper.querySelector('rect');
        if (!svg || !rect) return;

        // --- LA MAGIA CONTRA LOS SUBPÍXELES DEL GRID ---
        // Medimos la caja de Webflow y redondeamos a píxeles enteros exactos
        const bounds = wrapper.getBoundingClientRect();
        const preciseWidth = Math.round(bounds.width);
        const preciseHeight = Math.round(bounds.height);
        
        // Obligamos al SVG a medir píxeles exactos (ej: 346px en lugar de 345.6px)
        svg.style.width = preciseWidth + 'px';
        svg.style.height = preciseHeight + 'px';
        // ------------------------------------------------

        // Cálculo de los guiones
        const dashLargo = 10; 
        const dashEspacio = 6;
        const patternBase = dashLargo + dashEspacio;

        const length = rect.getTotalLength();
        if (length === 0) return;

        const repetitions = Math.round(length / patternBase);
        const actualPattern = length / repetitions;
        
        rect.style.strokeDasharray = `${actualPattern * (dashLargo/patternBase)} ${actualPattern * (dashEspacio/patternBase)}`;
        rect.style.setProperty('--offset', `-${actualPattern}px`);
      });
    };

    window.addEventListener('DOMContentLoaded', syncAllBorders);
    window.addEventListener('resize', syncAllBorders);
    
    // Ejecutamos varias veces al cargar por si las fuentes o el layout tardan en asentar
    setTimeout(syncAllBorders, 200);
    setTimeout(syncAllBorders, 800);
  }
