(() => {
  // Blur Highlight - Premium text highlighting with blur effect
  function mount(element, options = {}) {
    if (!element) return () => {};
    
    const {
      highlightedBits = [],
      highlightDirection = 'ltr',
      highlightDelay = 0,
      highlightDuration = 800,
      blurAmount = 4,
      inactiveOpacity = 0.4,
      highlightColor = 'var(--accent)',
      reducedMotion = false
    } = options;
    
    if (reducedMotion || highlightedBits.length === 0) return () => {};
    
    const text = element.textContent || '';
    const words = text.split(' ');
    
    // Create wrapper
    element.innerHTML = '';
    element.style.position = 'relative';
    
    words.forEach((word, index) => {
      const span = document.createElement('span');
      span.textContent = word;
      span.style.cssText = `
        display: inline-block;
        margin-right: 0.3em;
        transition: all ${highlightDuration}ms cubic-bezier(0.28, 0.11, 0.32, 1);
        will-change: color, font-weight;
      `;
      
      // Check if this word should be highlighted
      const shouldHighlight = highlightedBits.some(bit => 
        word.toLowerCase().includes(bit.toLowerCase())
      );
      
      if (shouldHighlight) {
        const delay = highlightDirection === 'ltr' 
          ? index * 50 + highlightDelay
          : (words.length - index) * 50 + highlightDelay;
        
        setTimeout(() => {
          span.style.color = highlightColor;
          span.style.fontWeight = '600';
        }, delay);
      }
      
      element.appendChild(span);
    });
    
    return () => {
      element.innerHTML = text;
    };
  }

  window.ReactBitsBlurHighlight = { mount };
})();
