(() => {
  // Compact Projects - Tabbed interface with hover preview
  const PROJECTS_DATA_URL = "data/projects.json";
  
  const CATEGORIES = {
    all: { label: 'All', filter: () => true },
    ai: { label: 'AI', filter: (p) => p.kind.toLowerCase().includes('ai') },
    web: { label: 'Web', filter: (p) => p.kind.toLowerCase().includes('platform') || p.kind.toLowerCase().includes('data') },
    blockchain: { label: 'Blockchain', filter: (p) => p.kind.toLowerCase().includes('blockchain') }
  };
  
  function createProjectCard(project, index) {
    const card = document.createElement('article');
    card.className = 'compact-project-card';
    card.style.cssText = `
      padding: 16px;
      border-radius: 12px;
      border: 1px solid var(--line);
      background: var(--surface);
      transition: all 0.32s cubic-bezier(0.28, 0.11, 0.32, 1);
      cursor: pointer;
    `;
    
    // Title with hover preview trigger
    const title = document.createElement('h3');
    title.style.cssText = `
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 4px 0;
      color: var(--text);
    `;
    
    const titleLink = document.createElement('span');
    titleLink.textContent = project.title;
    titleLink.dataset.preview = String(index);
    titleLink.style.cssText = `
      background: linear-gradient(135deg, var(--accent), var(--accent-bright));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      cursor: pointer;
    `;
    title.appendChild(titleLink);
    
    // Kind
    const kind = document.createElement('p');
    kind.textContent = project.kind;
    kind.style.cssText = `
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin: 0 0 8px 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    `;
    
    // Summary
    const summary = document.createElement('p');
    summary.textContent = project.summary;
    summary.style.cssText = `
      font-size: 0.88rem;
      color: var(--muted);
      margin: 0 0 12px 0;
      line-height: 1.5;
    `;
    
    // Tech badges
    if (project.techBadges && project.techBadges.length > 0) {
      const badges = document.createElement('div');
      badges.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 12px;
      `;
      
      project.techBadges.forEach(tech => {
        const badge = document.createElement('span');
        badge.textContent = tech;
        badge.style.cssText = `
          font-size: 0.7rem;
          padding: 3px 8px;
          border-radius: 6px;
          background: rgba(59, 130, 246, 0.1);
          color: var(--accent-bright);
          border: 1px solid var(--line);
        `;
        badges.appendChild(badge);
      });
      
      card.appendChild(title);
      card.appendChild(kind);
      card.appendChild(summary);
      card.appendChild(badges);
    } else {
      card.appendChild(title);
      card.appendChild(kind);
      card.appendChild(summary);
    }
    
    // Links
    const links = document.createElement('div');
    links.style.cssText = `
      display: flex;
      gap: 8px;
    `;
    
    project.links.forEach(link => {
      const a = document.createElement('a');
      a.href = link.url;
      a.textContent = link.label;
      a.target = '_blank';
      a.rel = 'noopener';
      a.style.cssText = `
        font-size: 0.82rem;
        padding: 6px 12px;
        border-radius: 8px;
        border: 1px solid var(--line);
        background: var(--surface-elevated);
        color: var(--text);
        text-decoration: none;
        transition: all 0.18s cubic-bezier(0.28, 0.11, 0.32, 1);
        font-weight: 500;
      `;
      
      a.addEventListener('mouseenter', () => {
        a.style.transform = 'translateY(-1px)';
        a.style.borderColor = 'var(--accent)';
      });
      
      a.addEventListener('mouseleave', () => {
        a.style.transform = 'translateY(0)';
        a.style.borderColor = 'var(--line)';
      });
      
      links.appendChild(a);
    });
    
    card.appendChild(links);
    
    // Card hover effect
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-2px)';
      card.style.borderColor = 'var(--line-strong)';
      card.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.borderColor = 'var(--line)';
      card.style.boxShadow = 'none';
    });
    
    return card;
  }
  
  async function mount(container, options = {}) {
    if (!container) return () => {};
    
    const { reducedMotion = false } = options;
    
    container.innerHTML = '';
    container.style.cssText = `
      display: grid;
      gap: 16px;
    `;
    
    // Fetch projects
    let projects = [];
    try {
      const response = await fetch(PROJECTS_DATA_URL);
      projects = await response.json();
    } catch (error) {
      console.error('Failed to load projects:', error);
      container.innerHTML = '<p style="color: var(--muted);">Failed to load projects.</p>';
      return () => {};
    }
    
    // Create tabs
    const tabs = document.createElement('div');
    tabs.className = 'project-tabs';
    tabs.style.cssText = `
      display: flex;
      gap: 8px;
      padding: 6px;
      border-radius: 12px;
      background: var(--surface);
      border: 1px solid var(--line);
      width: fit-content;
    `;
    
    let activeCategory = 'all';
    
    Object.entries(CATEGORIES).forEach(([key, cat]) => {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.textContent = cat.label;
      tab.className = 'project-tab';
      tab.dataset.category = key;
      tab.style.cssText = `
        padding: 8px 16px;
        border-radius: 8px;
        border: none;
        background: ${key === activeCategory ? 'var(--accent)' : 'transparent'};
        color: ${key === activeCategory ? '#ffffff' : 'var(--text-secondary)'};
        font-size: 0.88rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.32s cubic-bezier(0.28, 0.11, 0.32, 1);
      `;
      
      tab.addEventListener('click', () => {
        activeCategory = key;
        updateProjects();
        
        // Update tab styles
        tabs.querySelectorAll('.project-tab').forEach(t => {
          const isActive = t.dataset.category === activeCategory;
          t.style.background = isActive ? 'var(--accent)' : 'transparent';
          t.style.color = isActive ? '#ffffff' : 'var(--text-secondary)';
        });
      });
      
      tabs.appendChild(tab);
    });
    
    container.appendChild(tabs);
    
    // Create grid
    const grid = document.createElement('div');
    grid.className = 'projects-grid';
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
      margin-top: 16px;
    `;
    container.appendChild(grid);
    
    function updateProjects() {
      const filtered = projects.filter(CATEGORIES[activeCategory].filter);
      grid.innerHTML = '';
      
      filtered.forEach((project, index) => {
        grid.appendChild(createProjectCard(project, index));
      });
    }
    
    updateProjects();
    
    // Initialize hover preview
    if (window.ReactBitsHoverPreview && !reducedMotion) {
      const targets = projects.map(p => ({
        imageUrl: p.image.src,
        altText: p.image.alt,
        linkUrl: p.links[0]?.url
      }));
      
      window.ReactBitsHoverPreview.mount(container, {
        targets,
        imagePosition: 'cursor',
        enterSpeed: 320,
        exitSpeed: 220,
        maxRotation: 3,
        reducedMotion
      });
    }
    
    return () => {
      container.innerHTML = '';
    };
  }

  window.CompactProjects = { mount };
})();
