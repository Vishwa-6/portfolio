/**
 * main.js — Vishwa N Portfolio
 * Handles: typing animation · scroll reveal · nav behavior · mobile menu
 * No external libraries — vanilla JS only.
 */

'use strict';

/* ─── HERO ROLE ROTATOR ───────────────────────────────────── */
const HERO_ROLES = ['Cloud Engineer', 'DevOps', 'Cloud Ops', 'SRE'];
const ROLE_TYPE_SPEED = 60;  // ms per char typed
const ROLE_DELETE_SPEED = 35; // ms per char deleted
const ROLE_PAUSE_AFTER = 1800; // pause after fully typed
const ROLE_PAUSE_BEFORE = 300;  // pause before typing next

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function initTyping() {
  const roleEl = document.getElementById('heroRoleText');
  if (!roleEl) return;

  let idx = 0;
  while (true) {
    const role = HERO_ROLES[idx % HERO_ROLES.length];

    // Type forward
    for (let i = 0; i <= role.length; i++) {
      roleEl.textContent = role.slice(0, i);
      await wait(ROLE_TYPE_SPEED + Math.random() * 20 - 10);
    }

    await wait(ROLE_PAUSE_AFTER);

    // Delete backward
    for (let i = role.length; i >= 0; i--) {
      roleEl.textContent = role.slice(0, i);
      await wait(ROLE_DELETE_SPEED + Math.random() * 10);
    }

    await wait(ROLE_PAUSE_BEFORE);
    idx++;
  }
}

/* ─── SCROLL REVEAL (IntersectionObserver) ───────────────── */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    // Group entries that intersect in this tick so we can stagger them
    const visible = entries.filter(e => e.isIntersecting);
    visible.forEach((entry, i) => {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, i * 70);
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -48px 0px',
  });

  elements.forEach(el => observer.observe(el));
}

/* ─── NAV: scroll glass + active section ─────────────────── */
function initNav() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  // Frosted-glass on scroll
  const handleScroll = () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateActiveLink();
  };

  // Active section tracking
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64;

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // run once on load

  function updateActiveLink() {
    let current = '';
    sections.forEach(section => {
      const top = section.getBoundingClientRect().top;
      if (top <= navHeight + 60) {
        current = section.id;
      }
    });

    navLinks.forEach(link => {
      const sec = link.getAttribute('data-section');
      if (sec === current) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}

/* ─── MOBILE MENU ─────────────────────────────────────────── */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburgerBtn');
  const drawer = document.getElementById('mobileDrawer');
  const mobLinks = document.querySelectorAll('.mob-link');
  if (!hamburger || !drawer) return;

  let isOpen = false;

  function openMenu() {
    isOpen = true;
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    drawer.classList.add('open');
    drawer.style.display = 'flex';
    drawer.removeAttribute('aria-hidden');
    // Slight delay to allow display:flex to take effect before opacity transition
    requestAnimationFrame(() => drawer.classList.add('open'));
  }

  function closeMenu() {
    isOpen = false;
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
  }

  hamburger.addEventListener('click', () => {
    if (isOpen) closeMenu(); else openMenu();
  });

  // Close when a link is clicked
  mobLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (isOpen && !drawer.contains(e.target) && !hamburger.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });

  // Close on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && isOpen) closeMenu();
  });
}

/* ─── SMOOTH SCROLL (fallback for older browsers) ───────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ─── SUBTLE CARD TILT ON MOUSE MOVE ─────────────────────── */
function initCardTilt() {
  const cards = document.querySelectorAll('.proj-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const dx = (x - cx) / cx;
      const dy = (y - cy) / cy;
      const tiltX = dy * -3;  // max 3deg
      const tiltY = dx * 3;
      card.style.transform = `translateY(-4px) perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ─── INIT ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initLoadingScreen();
  initScrollReveal();
  initNav();
  initMobileMenu();
  initSmoothScroll();
  initCardTilt();
  initTyping(); // async, non-blocking
  initSkillsGraph();
  initCertLightbox();
  initProjectModal();
});

/* ─── CERTIFICATE LIGHTBOX ─────────────────────────── */
function initCertLightbox() {
  const lightbox = document.getElementById('certLightbox');
  const frame = document.getElementById('clbFrame');
  const title = document.getElementById('clbTitle');
  const closeBtn = document.getElementById('clbClose');
  const backdrop = document.getElementById('clbBackdrop');
  if (!lightbox) return;

  // Open on any cert-tile click
  document.querySelectorAll('.cert-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      const pdf = tile.getAttribute('data-pdf');
      const name = tile.getAttribute('data-name');
      title.textContent = name;
      frame.src = pdf;
      lightbox.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    });
  });

  function close() {
    lightbox.setAttribute('hidden', '');
    frame.src = '';
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !lightbox.hasAttribute('hidden')) close();
  });
}

/* ─── PROJECT DETAILS MODALS ────────────────────────── */
function initProjectModal() {
  const modalConfigs = [
    {
      modalId: 'projectModal',
      openBtnId: 'openSupportNestDetails',
      closeBtnId: 'pmClose',
      backdropId: 'pmBackdrop'
    },
    {
      modalId: 'finopsModal',
      openBtnId: 'openFinOpsDetails',
      closeBtnId: 'finopsClose',
      backdropId: 'finopsBackdrop'
    }
  ];

  modalConfigs.forEach(cfg => {
    const modal = document.getElementById(cfg.modalId);
    const openBtn = document.getElementById(cfg.openBtnId);
    const closeBtn = document.getElementById(cfg.closeBtnId);
    const backdrop = document.getElementById(cfg.backdropId);
    if (!modal) return;

    function open() {
      modal.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }

    function close() {
      modal.setAttribute('hidden', '');
      document.body.style.overflow = '';
      if (openBtn) openBtn.focus();
    }

    if (openBtn) openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !modal.hasAttribute('hidden')) close();
    });
  });
}

/* ─── LOADING / INTRO SCREEN ─────────────────────────────── */
function initLoadingScreen() {
  const screen = document.getElementById('loading-screen');
  const bar = document.getElementById('lsBar');

  if (!screen) return;

  // Prevent body scroll while loading screen is visible
  document.body.style.overflow = 'hidden';

  // Start the progress bar after name has appeared
  setTimeout(() => {
    if (bar) bar.style.width = '100%';
  }, 1000);

  function dismiss() {
    screen.classList.add('ls-hidden');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (screen.parentNode) screen.parentNode.removeChild(screen);
    }, 950);
  }

  // Automatically dismiss after bar completes (1000ms start + 1600ms transition + slight buffer)
  setTimeout(dismiss, 3000);
}

/* ─── D3.js INTERACTIVE SKILLS TREE ─────────────────────── */
function initSkillsGraph() {
  const container = document.getElementById('skills-graph-container');
  if (!container || !window.d3 || window.innerWidth <= 768) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  // Color palette per group
  const GROUP_COLORS = {
    0: '#C084FC',  // Root / Center — light purple
    1: '#9333EA',  // Core Concepts — accent purple
    2: '#3b82f6',  // Programming — blue
    3: '#22c55e',  // Version Control — green
    4: '#f59e0b',  // DevOps & Cloud — amber
    5: '#ec4899',  // Developer Tools — pink
  };

  // ── NODE DATA ──────────────────────────────────────────
  // Matching the user's hand-drawn tree structure with smooth branching
  const cx = width / 2;
  const nodes = [
    // ─ Root (center trunk) ─
    { id: 'Skills', group: 0, radius: 12, x_target: cx, y_target: height * 0.46, isRoot: true },

    // ─ Core Concepts (shifted to lower right, structured like DevOps) ─
    { id: 'Core Concepts', group: 1, radius: 9, x_target: cx + 110, y_target: height * 0.64 },

    { id: 'Systems & Networks', group: 1, radius: 7, x_target: cx + 220, y_target: height * 0.72 },
    { id: 'Linux', group: 1, radius: 5.5, x_target: cx + 180, y_target: height * 0.86 },
    { id: 'Operating Systems', group: 1, radius: 5.5, x_target: cx + 270, y_target: height * 0.86 },
    { id: 'Computer Networks', group: 1, radius: 5.5, x_target: cx + 360, y_target: height * 0.82 },

    { id: 'CS Fundamentals', group: 1, radius: 7, x_target: cx + 80, y_target: height * 0.80 },
    { id: 'DSA', group: 1, radius: 5.5, x_target: cx + 10, y_target: height * 0.92 },
    { id: 'OOPS', group: 1, radius: 5, x_target: cx + 70, y_target: height * 0.94 },
    { id: 'DBMS', group: 1, radius: 5, x_target: cx + 130, y_target: height * 0.92 },

    // ─ Programming (left upper branch) ─
    { id: 'Programming', group: 2, radius: 8, x_target: cx - 180, y_target: height * 0.35 },
    { id: 'Python', group: 2, radius: 5.5, x_target: cx - 270, y_target: height * 0.20 },
    { id: 'Bash', group: 2, radius: 5.5, x_target: cx - 180, y_target: height * 0.16 },

    // ─ Version Control (center-left branch) ─
    { id: 'Version Control', group: 3, radius: 7.5, x_target: cx - 60, y_target: height * 0.28 },
    { id: 'Git', group: 3, radius: 5, x_target: cx - 110, y_target: height * 0.12 },
    { id: 'GitHub', group: 3, radius: 5, x_target: cx - 20, y_target: height * 0.10 },

    // ─ DevOps & Cloud (right upper branch) ─
    { id: 'DevOps', group: 4, radius: 9, x_target: cx + 150, y_target: height * 0.38 },

    { id: 'AWS', group: 4, radius: 6.5, x_target: cx + 70, y_target: height * 0.22 },
    { id: 'Containers', group: 4, radius: 7, x_target: cx + 190, y_target: height * 0.22 },
    { id: 'Docker', group: 4, radius: 5, x_target: cx + 150, y_target: height * 0.08 },
    { id: 'Kubernetes', group: 4, radius: 5, x_target: cx + 240, y_target: height * 0.10 },

    { id: 'CI/CD', group: 4, radius: 7, x_target: cx + 300, y_target: height * 0.30 },
    { id: 'Jenkins', group: 4, radius: 5, x_target: cx + 340, y_target: height * 0.16 },
    { id: 'GitHub Actions', group: 4, radius: 5, x_target: cx + 390, y_target: height * 0.26 },

    { id: 'IaC', group: 4, radius: 6.5, x_target: cx + 330, y_target: height * 0.46 },
    { id: 'Terraform', group: 4, radius: 5, x_target: cx + 410, y_target: height * 0.40 },

    // ─ Developer Tools (left lower curved branch — structured cleanly like DevOps) ─
    { id: 'Developer Tools', group: 5, radius: 8.5, x_target: cx - 140, y_target: height * 0.55 },

    { id: 'IDEs', group: 5, radius: 6.5, x_target: cx - 250, y_target: height * 0.44 },
    { id: 'VS Code', group: 5, radius: 4.5, x_target: cx - 350, y_target: height * 0.36 },
    { id: 'JetBrains', group: 5, radius: 4.5, x_target: cx - 320, y_target: height * 0.48 },

    { id: 'Workflow', group: 5, radius: 6.5, x_target: cx - 270, y_target: height * 0.62 },
    { id: 'Jira', group: 5, radius: 4.5, x_target: cx - 370, y_target: height * 0.58 },
    { id: 'n8n', group: 5, radius: 4.5, x_target: cx - 360, y_target: height * 0.69 },
    { id: 'Antigravity', group: 5, radius: 4.5, x_target: cx - 320, y_target: height * 0.78 },

    { id: 'Databases', group: 5, radius: 6.5, x_target: cx - 210, y_target: height * 0.76 },
    { id: 'MongoDB', group: 5, radius: 4.5, x_target: cx - 280, y_target: height * 0.88 },
    { id: 'MySQL', group: 5, radius: 4.5, x_target: cx - 190, y_target: height * 0.92 },

    { id: 'API & Testing', group: 5, radius: 6, x_target: cx - 110, y_target: height * 0.74 },
    { id: 'Postman', group: 5, radius: 4.5, x_target: cx - 90, y_target: height * 0.90 },
  ];

  // ── LINK DATA ──────────────────────────────────────────
  const links = [
    // Trunk to main branches
    { source: 'Skills', target: 'Core Concepts' },
    { source: 'Skills', target: 'Programming' },
    { source: 'Skills', target: 'Version Control' },
    { source: 'Skills', target: 'DevOps' },
    { source: 'Skills', target: 'Developer Tools' },

    // Core Concepts → sub-branches (curvy multi-tier like DevOps)
    { source: 'Core Concepts', target: 'Systems & Networks' },
    { source: 'Core Concepts', target: 'CS Fundamentals' },

    // Systems & Networks → leaves
    { source: 'Systems & Networks', target: 'Linux' },
    { source: 'Systems & Networks', target: 'Operating Systems' },
    { source: 'Systems & Networks', target: 'Computer Networks' },

    // CS Fundamentals → leaves (includes DSA)
    { source: 'CS Fundamentals', target: 'DSA' },
    { source: 'CS Fundamentals', target: 'OOPS' },
    { source: 'CS Fundamentals', target: 'DBMS' },

    // Programming → leaves
    { source: 'Programming', target: 'Python' },
    { source: 'Programming', target: 'Bash' },

    // Version Control → leaves
    { source: 'Version Control', target: 'Git' },
    { source: 'Version Control', target: 'GitHub' },

    // DevOps → sub-branches
    { source: 'DevOps', target: 'AWS' },
    { source: 'DevOps', target: 'Containers' },
    { source: 'DevOps', target: 'CI/CD' },
    { source: 'DevOps', target: 'IaC' },

    // Containers → leaves
    { source: 'Containers', target: 'Docker' },
    { source: 'Containers', target: 'Kubernetes' },

    // CI/CD → leaves
    { source: 'CI/CD', target: 'Jenkins' },
    { source: 'CI/CD', target: 'GitHub Actions' },

    // IaC → leaves
    { source: 'IaC', target: 'Terraform' },

    // Developer Tools → sub-branches (curvy, tiered structure like DevOps)
    { source: 'Developer Tools', target: 'IDEs' },
    { source: 'Developer Tools', target: 'Workflow' },
    { source: 'Developer Tools', target: 'Databases' },
    { source: 'Developer Tools', target: 'API & Testing' },

    // IDEs → leaves
    { source: 'IDEs', target: 'VS Code' },
    { source: 'IDEs', target: 'JetBrains' },

    // Workflow → leaves
    { source: 'Workflow', target: 'Jira' },
    { source: 'Workflow', target: 'n8n' },
    { source: 'Workflow', target: 'Antigravity' },

    // Databases → leaves
    { source: 'Databases', target: 'MongoDB' },
    { source: 'Databases', target: 'MySQL' },

    // API & Testing → leaves
    { source: 'API & Testing', target: 'Postman' },
  ];

  // ── SVG SETUP ──────────────────────────────────────────
  const svg = d3.select('#skills-graph-container')
    .append('svg')
    .attr('viewBox', [0, 0, width, height]);

  // Glow filter for hovered nodes
  const defs = svg.append('defs');
  Object.entries(GROUP_COLORS).forEach(([group, color]) => {
    const filter = defs.append('filter')
      .attr('id', `glow-${group}`)
      .attr('x', '-50%').attr('y', '-50%')
      .attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');
    const merge = filter.append('feMerge');
    merge.append('feMergeNode').attr('in', 'coloredBlur');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');
  });

  // ── SIMULATION ─────────────────────────────────────────
  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(58).strength(1.1))
    .force('charge', d3.forceManyBody().strength(-140))
    .force('collide', d3.forceCollide().radius(d => d.radius + 18))
    .force('y', d3.forceY(d => d.y_target).strength(1.9))
    .force('x', d3.forceX(d => d.x_target).strength(1.6));

  // ── DRAW LINKS (curved) ────────────────────────────────
  const linkGroup = svg.append('g').attr('class', 'graph-links');

  const link = linkGroup.selectAll('path')
    .data(links)
    .join('path')
    .attr('class', 'graph-link')
    .attr('fill', 'none')
    .attr('stroke-width', d => {
      // Thicker trunk links
      if (d.source === 'Skills' || d.source.id === 'Skills') return 2.5;
      return 1.5;
    });

  // ── DRAW NODES ─────────────────────────────────────────
  const nodeGroup = svg.append('g').attr('class', 'graph-nodes');

  const node = nodeGroup.selectAll('g')
    .data(nodes)
    .join('g')
    .attr('class', d => `graph-node ${d.isRoot ? 'root-node' : ''}`)
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended));

  // Outer glow ring for branch nodes
  node.filter(d => d.radius >= 7)
    .append('circle')
    .attr('class', 'node-glow-ring')
    .attr('r', d => d.radius + 6)
    .attr('fill', 'none')
    .attr('stroke', d => GROUP_COLORS[d.group])
    .attr('stroke-width', 1)
    .attr('stroke-opacity', 0.15);

  // Main circle
  node.append('circle')
    .attr('r', d => d.radius)
    .attr('fill', d => GROUP_COLORS[d.group])
    .attr('fill-opacity', d => d.isRoot ? 1 : 0.85);

  // Labels
  node.append('text')
    .text(d => d.id)
    .attr('x', d => d.radius + 10)
    .attr('y', 4)
    .attr('class', d => d.isRoot ? 'root-label' : '');

  // ── HOVER HIGHLIGHTING ─────────────────────────────────
  // Tooltip element
  const tooltip = d3.select('#skills-graph-container')
    .append('div')
    .attr('class', 'graph-tooltip')
    .style('opacity', 0);

  node.on('mouseover', function (event, d) {
    // Highlight connected links
    link.classed('active', l => l.source.id === d.id || l.target.id === d.id);
    link.classed('dimmed', l => l.source.id !== d.id && l.target.id !== d.id);

    // Dim unconnected nodes
    const connected = new Set();
    connected.add(d.id);
    links.forEach(l => {
      if (l.source.id === d.id) connected.add(l.target.id);
      if (l.target.id === d.id) connected.add(l.source.id);
    });
    node.classed('dimmed', n => !connected.has(n.id));

    // Apply glow
    d3.select(this).select('circle')
      .attr('filter', `url(#glow-${d.group})`);

    // Show tooltip
    tooltip
      .html(`<span class="tt-name">${d.id}</span>`)
      .style('opacity', 1)
      .style('left', (event.offsetX + 16) + 'px')
      .style('top', (event.offsetY - 10) + 'px');

  }).on('mousemove', function (event) {
    tooltip
      .style('left', (event.offsetX + 16) + 'px')
      .style('top', (event.offsetY - 10) + 'px');

  }).on('mouseout', function () {
    link.classed('active', false).classed('dimmed', false);
    node.classed('dimmed', false);
    d3.select(this).select('circle').attr('filter', null);
    tooltip.style('opacity', 0);
  });

  // ── TICK (curved links) ────────────────────────────────
  simulation.on('tick', () => {
    // Keep nodes within bounds
    nodes.forEach(d => {
      d.x = Math.max(d.radius + 10, Math.min(width - d.radius - 90, d.x));
      d.y = Math.max(d.radius + 10, Math.min(height - d.radius - 10, d.y));
    });

    // Curved bezier links with radial perpendicular bowing for dynamic branching feel
    link.attr('d', d => {
      const dx = d.target.x - d.source.x;
      const dy = d.target.y - d.source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      // Perpendicular vector for natural curve
      const nx = -dy / dist;
      const ny = dx / dist;

      // Curvature direction factor based on position relative to center
      const curvature = dist * 0.14;
      const side = (d.target.x >= d.source.x) ? 1 : -1;

      const cx1 = (d.source.x + d.target.x) / 2 + nx * curvature * side;
      const cy1 = (d.source.y + d.target.y) / 2 + ny * curvature * side;

      return `M${d.source.x},${d.source.y} Q${cx1},${cy1} ${d.target.x},${d.target.y}`;
    });

    node.attr('transform', d => `translate(${d.x},${d.y})`);
  });

  // ── DRAG FUNCTIONS ─────────────────────────────────────
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }
  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }
  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  // ── RESIZE HANDLER ─────────────────────────────────────
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (window.innerWidth <= 768) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      svg.attr('viewBox', [0, 0, w, h]);
      simulation.alpha(0.3).restart();
    }, 250);
  });
}