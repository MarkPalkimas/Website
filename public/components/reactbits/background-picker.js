(() => {
  // Background Picker - Premium theme selector using gradient carousel pattern
  const BACKGROUND_PRESETS = [
    { 
      id: 'dark', 
      name: 'Dark', 
      bg: '#0a0e1a',
      bgSecondary: '#0f1420',
      surface: '#151b2b',
      text: '#e8edf5',
      textSecondary: '#b4bdd0'
    },
    { 
      id: 'black', 
      name: 'Black', 
      bg: '#000000',
      bgSecondary: '#0a0a0a',
      surface: '#121212',
      text: '#ffffff',
      textSecondary: '#b0b0b0'
    },
    { 
      id: 'light', 
      name: 'Light', 
      bg: '#f4f6f8',
      bgSecondary: '#ffffff',
      surface: '#ffffff',
      text: '#0f1724',
      textSecondary: '#516072'
    },
    { 
      id: 'gray', 
      name: 'Cool Gray', 
      bg: '#1a1d23',
      bgSecondary: '#1f2229',
      surface: '#252930',
      text: '#e5e7eb',
      textSecondary: '#9ca3af'
    },
    { 
      id: 'slate', 
      name: 'Slate', 
      bg: '#0f172a',
      bgSecondary: '#1e293b',
      surface: '#334155',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1'
    },
    { 
      id: 'midnight', 
      name: 'Midnight', 
      bg: '#0c1222',
      bgSecondary: '#111827',
      surface: '#1f2937',
      text: '#f9fafb',
      textSecondary: '#d1d5db'
    }
  ];
  
  const STORAGE_KEY = 'portfolio-background';
  
  function mount(container, options = {}) {
    if (!container) return () => {};
    
    const { reducedMotion = false } = options;
    
    // Get stored background or default to dark
    const getStoredBackground = () => localStorage.getItem(STORAGE_KEY) || 'dark';
    const setStoredBackground = (id) => localStorage.setItem(STORAGE_KEY, id);
    
    let currentIndex = BACKGROUND_PRESETS.findIndex(p => p.id === getStoredBackground());
    if (currentIndex === -1) currentIndex = 0;
    
    // Create picker UI
    container.innerHTML = '';
    container.className = 'background-picker';
    container.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px;
      border-radius: 12px;
      background: var(--surface);
      border: 1px solid var(--line);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    `;
    
    // Create preset buttons
    BACKGROUND_PRESETS.forEach((preset, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'bg-preset-btn';
      button.setAttribute('aria-label', `Switch to ${preset.name} background`);
      button.dataset.presetId = preset.id;
      
      button.style.cssText = `
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: 2px solid transparent;
        background: ${preset.bg};
        cursor: pointer;
        transition: all 0.32s cubic-bezier(0.28, 0.11, 0.32, 1);
        position: relative;
        overflow: hidden;
      `;
      
      // Add subtle gradient overlay
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, ${preset.surface} 0%, transparent 100%);
        opacity: 0.5;
      `;
      button.appendChild(overlay);
      
      if (index === currentIndex) {
        button.style.borderColor = 'var(--accent)';
        button.style.transform = 'scale(1.1)';
      }
      
      button.addEventListener('click', () => {
        if (index === currentIndex) return;
        applyBackground(preset, index);
      });
      
      container.appendChild(button);
    });
    
    function applyBackground(preset, index) {
      // Smooth transition
      document.documentElement.style.transition = reducedMotion 
        ? 'none' 
        : 'background-color 0.52s cubic-bezier(0.28, 0.11, 0.32, 1), color 0.52s cubic-bezier(0.28, 0.11, 0.32, 1)';
      
      // Apply CSS variables
      document.documentElement.style.setProperty('--bg', preset.bg);
      document.documentElement.style.setProperty('--bg-secondary', preset.bgSecondary);
      document.documentElement.style.setProperty('--surface', preset.surface);
      document.documentElement.style.setProperty('--text', preset.text);
      document.documentElement.style.setProperty('--text-secondary', preset.textSecondary);
      
      // Update theme attribute for compatibility
      document.documentElement.setAttribute('data-theme', preset.id === 'light' ? 'light' : 'dark');
      
      // Update buttons
      container.querySelectorAll('.bg-preset-btn').forEach((btn, i) => {
        if (i === index) {
          btn.style.borderColor = 'var(--accent)';
          btn.style.transform = 'scale(1.1)';
        } else {
          btn.style.borderColor = 'transparent';
          btn.style.transform = 'scale(1)';
        }
      });
      
      currentIndex = index;
      setStoredBackground(preset.id);
      
      // Remove transition after animation
      setTimeout(() => {
        document.documentElement.style.transition = '';
      }, 520);
    }
    
    // Apply initial background
    applyBackground(BACKGROUND_PRESETS[currentIndex], currentIndex);
    
    return () => {
      container.innerHTML = '';
    };
  }

  window.ReactBitsBackgroundPicker = { mount, BACKGROUND_PRESETS };
})();
