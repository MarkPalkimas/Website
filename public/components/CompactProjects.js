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
      padding: 0;
      border-radius: 12px;
      border: 1px solid var(--line);
      background: var(--surface);
      transition: all 0.32s cubic-bezier(0.28, 0.11, 0.32, 1);
      cursor: pointer;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    `;
    
    // Project image
    const imageContainer = document.createElement('div');
    imageContainer.style.cssText = `
      width: 100%;
      height: clamp(152px, 34vw, 180px);
      overflow: hidden;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
      position: relative;
    `;
    
    const img = document.createElement('img');
    img.src = project.image.src;
    img.alt = project.image.alt;
    img.loading = 'lazy';
    img.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.52s cubic-bezier(0.28, 0.11, 0.32, 1);
    `;
    imageContainer.appendChild(img);
    card.appendChild(imageContainer);
    
    // Content container
    const content = document.createElement('div');
    content.style.cssText = `
      padding: clamp(12px, 3vw, 16px);
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
    `;
    
    // Title
    const title = document.createElement('h3');
    title.style.cssText = `
      font-size: 1rem;
      font-weight: 600;
      margin: 0;
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
      margin: 0;
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
      margin: 0;
      line-height: 1.5;
      flex: 1;
    `;
    
    content.appendChild(title);
    content.appendChild(kind);
    content.appendChild(summary);
    
    // Tech badges
    if (project.techBadges && project.techBadges.length > 0) {
      const badges = document.createElement('div');
      badges.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
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
      
      content.appendChild(badges);
    }
    
    // Links
    const links = document.createElement('div');
    links.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
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
        white-space: nowrap;
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
    
    content.appendChild(links);
    card.appendChild(content);
    
    // Card hover effect
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-4px)';
      card.style.borderColor = 'var(--line-strong)';
      card.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
      img.style.transform = 'scale(1.05)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.borderColor = 'var(--line)';
      card.style.boxShadow = 'none';
      img.style.transform = 'scale(1)';
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
      flex-wrap: nowrap;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
      gap: 8px;
      padding: 6px;
      border-radius: 12px;
      background: var(--surface);
      border: 1px solid var(--line);
      width: 100%;
      max-width: 100%;
    `;
    
    let activeCategory = 'all';
    
    Object.entries(CATEGORIES).forEach(([key, cat]) => {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.textContent = cat.label;
      tab.className = 'project-tab';
      tab.dataset.category = key;
      tab.style.cssText = `
        flex: 0 0 auto;
        white-space: nowrap;
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
    
    // Create horizontal scroll container
    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'projects-scroll';
    scrollContainer.style.cssText = `
      display: flex;
      gap: 16px;
      margin-top: 8px;
      overflow-x: auto;
      overflow-y: hidden;
      padding: 8px 2px 16px 2px;
      scroll-padding-inline: 2px;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
      scrollbar-color: var(--accent) var(--surface);
    `;
    
    // Custom scrollbar styles
    const style = document.createElement('style');
    style.textContent = `
      .projects-scroll::-webkit-scrollbar {
        height: 8px;
      }
      .projects-scroll::-webkit-scrollbar-track {
        background: var(--surface);
        border-radius: 4px;
      }
      .projects-scroll::-webkit-scrollbar-thumb {
        background: var(--accent);
        border-radius: 4px;
      }
      .projects-scroll::-webkit-scrollbar-thumb:hover {
        background: var(--accent-bright);
      }
    `;
    document.head.appendChild(style);
    
    container.appendChild(scrollContainer);
    
    function updateProjects() {
      const filtered = projects.filter(CATEGORIES[activeCategory].filter);
      scrollContainer.innerHTML = '';
      
      filtered.forEach((project, index) => {
        const card = createProjectCard(project, index);
        card.style.width = 'min(340px, calc(100vw - 72px))';
        card.style.minWidth = 'min(340px, calc(100vw - 72px))';
        card.style.maxWidth = '340px';
        card.style.flex = '0 0 min(340px, calc(100vw - 72px))';
        card.style.scrollSnapAlign = 'start';
        scrollContainer.appendChild(card);
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
