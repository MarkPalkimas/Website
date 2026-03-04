(() => {
  // Background Picker - Premium theme selector with dropdown
  const BACKGROUND_PRESETS = [
    { 
      id: 'dark', 
      name: 'Dark', 
      bg: '#0a0e1a',
      bgSecondary: '#0f1420',
      surface: '#151b2b',
      surfaceElevated: '#1f2738',
      text: '#e8edf5',
      textSecondary: '#b4bdd0',
      previewColor: '#1e3a8a' // Deep blue
    },
    { 
      id: 'black', 
      name: 'Black', 
      bg: '#000000',
      bgSecondary: '#0a0a0a',
      surface: '#121212',
      surfaceElevated: '#1a1a1a',
      text: '#ffffff',
      textSecondary: '#b0b0b0',
      previewColor: '#18181b' // Zinc black
    },
    { 
      id: 'light', 
      name: 'Light', 
      bg: '#f4f6f8',
      bgSecondary: '#ffffff',
      surface: '#ffffff',
      surfaceElevated: '#f8fafc',
      text: '#0f1724',
      textSecondary: '#516072',
      previewColor: '#e0e7ff' // Light indigo
    },
    { 
      id: 'gray', 
      name: 'Cool Gray', 
      bg: '#1a1d23',
      bgSecondary: '#1f2229',
      surface: '#252930',
      surfaceElevated: '#2d3139',
      text: '#e5e7eb',
      textSecondary: '#9ca3af',
      previewColor: '#374151' // Gray
    },
    { 
      id: 'slate', 
      name: 'Slate', 
      bg: '#0f172a',
      bgSecondary: '#1e293b',
      surface: '#334155',
      surfaceElevated: '#475569',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      previewColor: '#475569' // Slate
    },
    { 
      id: 'midnight', 
      name: 'Midnight', 
      bg: '#0c1222',
      bgSecondary: '#111827',
      surface: '#1f2937',
      surfaceElevated: '#374151',
      text: '#f9fafb',
      textSecondary: '#d1d5db',
      previewColor: '#1e40af' // Blue
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
    
    let isOpen = false;
    
    // Create picker UI
    container.innerHTML = '';
    container.className = 'background-picker';
    container.style.cssText = `
      position: relative;
      display: inline-flex;
    `;
    
    // Create toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'bg-picker-toggle';
    toggleBtn.setAttribute('aria-label', 'Choose background theme');
    toggleBtn.style.cssText = `
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: 1px solid var(--line);
      background: ${BACKGROUND_PRESETS[currentIndex].previewColor};
      cursor: pointer;
      transition: all 0.32s cubic-bezier(0.28, 0.11, 0.32, 1);
      position: relative;
      overflow: hidden;
    `;
    
    // Add icon
    const icon = document.createElement('div');
    icon.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="display: block; margin: auto;">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"></path>
      </svg>
    `;
    toggleBtn.appendChild(icon);
    
    // Create dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'bg-picker-dropdown';
    dropdown.style.cssText = `
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      padding: 12px;
      border-radius: 12px;
      background: var(--surface);
      border: 1px solid var(--line);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      opacity: 0;
      transform: translateY(-8px) scale(0.95);
      pointer-events: none;
      transition: all 0.32s cubic-bezier(0.28, 0.11, 0.32, 1);
      z-index: 1000;
      min-width: 200px;
    `;
    
    // Create preset buttons
    BACKGROUND_PRESETS.forEach((preset, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'bg-preset-btn';
      button.setAttribute('aria-label', `Switch to ${preset.name} background`);
      button.dataset.presetId = preset.id;
      button.title = preset.name;
      
      button.style.cssText = `
        width: 56px;
        height: 56px;
        border-radius: 10px;
        border: 2px solid ${index === currentIndex ? 'var(--accent)' : 'transparent'};
        background: ${preset.previewColor};
        cursor: pointer;
        transition: all 0.32s cubic-bezier(0.28, 0.11, 0.32, 1);
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      
      // Add label
      const label = document.createElement('span');
      label.textContent = preset.name;
      label.style.cssText = `
        font-size: 0.7rem;
        font-weight: 600;
        color: ${preset.id === 'light' ? '#1e293b' : '#ffffff'};
        text-align: center;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        pointer-events: none;
      `;
      button.appendChild(label);
      
      // Add checkmark for active
      if (index === currentIndex) {
        const check = document.createElement('div');
        check.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="3" style="position: absolute; top: 4px; right: 4px;">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;
        button.appendChild(check);
      }
      
      button.addEventListener('click', () => {
        if (index === currentIndex) return;
        applyBackground(preset, index);
        closeDropdown();
      });
      
      button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.05)';
        button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = 'none';
      });
      
      dropdown.appendChild(button);
    });
    
    container.appendChild(toggleBtn);
    container.appendChild(dropdown);
    
    function openDropdown() {
      isOpen = true;
      dropdown.style.opacity = '1';
      dropdown.style.transform = 'translateY(0) scale(1)';
      dropdown.style.pointerEvents = 'auto';
      toggleBtn.style.transform = 'scale(0.95)';
    }
    
    function closeDropdown() {
      isOpen = false;
      dropdown.style.opacity = '0';
      dropdown.style.transform = 'translateY(-8px) scale(0.95)';
      dropdown.style.pointerEvents = 'none';
      toggleBtn.style.transform = 'scale(1)';
    }
    
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isOpen) {
        closeDropdown();
      } else {
        openDropdown();
      }
    });
    
    // Close on click outside
    document.addEventListener('click', (e) => {
      if (isOpen && !container.contains(e.target)) {
        closeDropdown();
      }
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
      document.documentElement.style.setProperty('--surface-elevated', preset.surfaceElevated);
      document.documentElement.style.setProperty('--text', preset.text);
      document.documentElement.style.setProperty('--text-secondary', preset.textSecondary);
      
      // Update theme attribute for compatibility
      document.documentElement.setAttribute('data-theme', preset.id === 'light' ? 'light' : 'dark');
      
      // Update toggle button color
      toggleBtn.style.background = preset.previewColor;
      
      // Update buttons
      dropdown.querySelectorAll('.bg-preset-btn').forEach((btn, i) => {
        btn.style.borderColor = i === index ? 'var(--accent)' : 'transparent';
        
        // Remove old checkmarks
        const oldCheck = btn.querySelector('svg');
        if (oldCheck && oldCheck.parentElement.tagName === 'DIV') {
          oldCheck.parentElement.remove();
        }
        
        // Add checkmark to active
        if (i === index) {
          const check = document.createElement('div');
          check.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="3" style="position: absolute; top: 4px; right: 4px;">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          `;
          btn.appendChild(check);
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
