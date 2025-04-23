document.addEventListener('DOMContentLoaded', () => {
  // 1) Neon glow follows pointer/touch
  const neon = document.getElementById('neon-overlay');
  document.body.addEventListener('pointermove', e => {
    neon.style.background = `
      radial-gradient(
        circle at ${e.clientX}px ${e.clientY}px,
        rgba(0,208,132,0.5),
        transparent 60%
      )`;
  });

  // 2) Side-menu toggle
  const menuBtn = document.getElementById('menu-btn');
  const closeBtn = document.getElementById('close-menu');
  const sideMenu = document.getElementById('side-menu');
  menuBtn.addEventListener('click', () => sideMenu.classList.add('open'));
  closeBtn.addEventListener('click', () => sideMenu.classList.remove('open'));

  // 3) Matter.js physics setup
  const {
    Engine,
    Render,
    World,
    Bodies,
    Mouse,
    MouseConstraint
  } = Matter;

  const canvas = document.getElementById('physics-canvas');
  const engine = Engine.create();
  const render = Render.create({
    canvas,
    engine,
    options: {
      wireframes: false,
      background: 'transparent'
    }
  });

  // size canvas for high-dpi
  const resizeCanvas = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = canvas.clientWidth  * dpr;
    canvas.height = canvas.clientHeight * dpr;
    Render.lookAt(render, { min: { x: 0, y: 0 }, max: { x: canvas.clientWidth, y: canvas.clientHeight } });
  };
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // walls/floor
  const w = canvas.clientWidth,
        h = canvas.clientHeight;
  const floor = Bodies.rectangle(w/2, h+50, w, 100, { isStatic: true });
  const leftWall  = Bodies.rectangle(-50, h/2, 100, h, { isStatic: true });
  const rightWall = Bodies.rectangle(w+50, h/2, 100, h, { isStatic: true });
  World.add(engine.world, [floor, leftWall, rightWall]);

  // add mouse drag
  const mouse = Mouse.create(render.canvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.2, render: { visible: false } }
  });
  World.add(engine.world, mouseConstraint);
  render.mouse = mouse;

  Render.run(render);
  Engine.run(engine);

  // 4) Drop balls on button tap
  const dropBtn = document.getElementById('drop-ball-btn');
  dropBtn.addEventListener('click', () => {
    const radius = 20 + Math.random() * 20;
    const ball = Bodies.circle(
      Math.random() * (w - 2*radius) + radius, 
      -radius,
      radius,
      {
        restitution: 0.8,
        friction: 0.1,
        render: {
          fillStyle: '#' + Math.floor(Math.random()*16777215).toString(16)
        }
      }
    );
    World.add(engine.world, ball);
  });
});
