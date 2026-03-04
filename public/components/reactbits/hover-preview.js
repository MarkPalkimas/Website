(() => {
  // Hover Preview - Show image preview on hover with smooth animations
  function mount(container, options = {}) {
    if (!container) return () => {};
    
    const {
      targets = [],
      imagePosition = 'cursor',
      enterSpeed = 320,
      exitSpeed = 220,
      maxRotation = 5,
      maxOffset = 20,
      reducedMotion = false
    } = options;
    
    if (reducedMotion || targets.length === 0) return () => {};
    
    // Create preview container
    const preview = document.createElement('div');
    preview.className = 'hover-preview';
    preview.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 9998;
      opacity: 0;
      transform: scale(0.9) translateY(10px);
      transition: opacity ${exitSpeed}ms cubic-bezier(0.28, 0.11, 0.32, 1),
                  transform ${exitSpeed}ms cubic-bezier(0.28, 0.11, 0.32, 1);
      will-change: transform, opacity;
    `;
    
    const img = document.createElement('img');
    img.style.cssText = `
      width: 280px;
      height: auto;
      border-radius: 12px;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
      border: 1px solid var(--line);
      display: block;
    `;
    preview.appendChild(img);
    document.body.appendChild(preview);
    
    let currentTarget = null;
    let rafId = null;
    
    // Find trigger elements and attach listeners
    targets.forEach((target, index) => {
      const triggers = container.querySelectorAll(`[data-preview="${index}"]`);
      
      triggers.forEach(trigger => {
        trigger.style.cursor = 'pointer';
        
        trigger.addEventListener('mouseenter', () => {
          currentTarget = target;
          img.src = target.imageUrl;
          img.alt = target.altText || '';
          
          preview.style.transition = `opacity ${enterSpeed}ms cubic-bezier(0.16, 1, 0.3, 1),
                                      transform ${enterSpeed}ms cubic-bezier(0.16, 1, 0.3, 1)`;
          preview.style.opacity = '1';
          preview.style.transform = 'scale(1) translateY(0)';
        });
        
        trigger.addEventListener('mouseleave', () => {
          currentTarget = null;
          preview.style.transition = `opacity ${exitSpeed}ms cubic-bezier(0.28, 0.11, 0.32, 1),
                                      transform ${exitSpeed}ms cubic-bezier(0.28, 0.11, 0.32, 1)`;
          preview.style.opacity = '0';
          preview.style.transform = 'scale(0.9) translateY(10px)';
        });
        
        trigger.addEventListener('mousemove', (e) => {
          if (!currentTarget) return;
          
          if (rafId) cancelAnimationFrame(rafId);
          
          rafId = requestAnimationFrame(() => {
            const x = e.clientX;
            const y = e.clientY;
            
            // Position based on cursor with offset
            const offsetX = imagePosition === 'cursor' ? 20 : 0;
            const offsetY = imagePosition === 'cursor' ? 20 : 0;
            
            // Calculate rotation based on mouse position
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const rotateX = ((y - centerY) / centerY) * maxRotation;
            const rotateY = ((x - centerX) / centerX) * maxRotation;
            
            preview.style.left = `${x + offsetX}px`;
            preview.style.top = `${y + offsetY}px`;
            preview.style.transform = `
              scale(1) 
              translateY(0) 
              rotateX(${-rotateX}deg) 
              rotateY(${rotateY}deg)
            `;
          });
        });
      });
    });
    
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      preview.remove();
    };
  }

  window.ReactBitsHoverPreview = { mount };
})();
