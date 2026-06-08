// ==========================================
// PORTAFOLIO.JS - MOTOR V12 (TYPO SCALE INTEGRATION)
// ==========================================

// 1. INICIALIZACIÓN DE LIBRERÍAS (Lenis & GSAP)
let lenis;
function initLibraries() {
    try {
        if (typeof Lenis !== 'undefined') {
            lenis = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                smooth: true
            });
            function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
            requestAnimationFrame(raf);
        }
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }
    } catch (e) { console.warn("Librerías externas no listas."); }
}

// 2. VISIBILIDAD CRÍTICA
function initPageVisibility() {
    const reveal = () => {
        document.body.classList.add('loaded');
        setTimeout(() => { if(window.ScrollTrigger) ScrollTrigger.refresh(); }, 500);
    };

    const failsafe = setTimeout(reveal, 1000);
    window.addEventListener('load', () => { clearTimeout(failsafe); reveal(); });

    const hamBtn = document.getElementById('hamburgerBtn');
    const mobileNav = document.getElementById('mobileNav');
    if (hamBtn && mobileNav) {
        hamBtn.addEventListener('click', () => {
            const isOpen = hamBtn.classList.toggle('open');
            mobileNav.classList.toggle('active');
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });
    }
}

// 3. ANIMACIONES DE REVELADO
function initScrollAnimations() {
    const elements = document.querySelectorAll('.reveal-element');
    if (elements.length === 0) return;

    elements.forEach(el => {
        ScrollTrigger.create({
            trigger: el,
            start: "top 92%",
            onEnter: () => el.classList.add('active'),
            once: true
        });
    });
}

// 4. GRILLA DE PROYECTOS (Integración Typo Scale)
function initPortfolioGrid() {
    const grid = document.querySelector("#portfolio-grid");
    const selection = document.querySelector("#home-selection");
    if ((!grid && !selection) || typeof DATOS_GLOBALES === 'undefined') return;

    const target = grid || selection;
    const isHome = !!selection;

    const render = (filter = 'all') => {
        target.innerHTML = '';
        
        // FILTRO BLINDADO
        let items = (filter === 'all') 
            ? DATOS_GLOBALES.proyectos 
            : DATOS_GLOBALES.proyectos.filter(p => {
                // Comprobamos si el proyecto tiene la propiedad filtro y es un array
                if (!p.filtro || !Array.isArray(p.filtro)) return false;
                
                // Convertimos el array de filtros a minúsculas y comparamos
                return p.filtro.map(f => f.toLowerCase().trim()).includes(filter.toLowerCase().trim());
            });

        if (isHome) items = items.slice(0, 4);

        items.forEach((p, i) => {
            // Lógica de columnas (puedes mantener la tuya si preferías otra)
            const span = (i % 3 === 0) ? "col-span-12" : "col-span-6";
            const el = document.createElement('a');
            el.className = `project-item ${span} reveal-element`;
            el.href = `proyect.html?id=${p.id}`;
            
            const mediaHTML = p.video 
                ? `<video src="${p.video}" autoplay muted loop playsinline></video>`
                : `<img src="${p.imagen}" alt="${p.titulo}" loading="lazy">`;

            el.innerHTML = `
                ${mediaHTML}
                <div class="project-info">
                    <span class="project-name text-h2" style="color: white; opacity: 1;">${p.titulo}</span>
                    <span class="project-meta text-mono" style="color: var(--color-lime); opacity: 1;">${p.filtro ? p.filtro[0].toUpperCase() : ''}</span>
                </div>`;
            target.appendChild(el);
        });
        
        initScrollAnimations();
    };

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            render(this.dataset.filter);
        });
    });

    render();
}

// 5. DETALLE DE PROYECTO (Refactorización Semántica)
function initProjectDetail() {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');
    const container = document.getElementById('dyn-narrative-container');
    
    if (!projectId || !container || typeof DATOS_GLOBALES === 'undefined') return;

    const project = DATOS_GLOBALES.proyectos.find(p => p.id === projectId);
    if (!project) return;

    document.title = `${project.titulo} | Isabel Puelma`;
    
    // Aplicar clases de escala tipográfica a elementos estáticos
    const safeSet = (id, val, className) => { 
        const el = document.getElementById(id); 
        if(el) {
            el.textContent = val;
            if(className) el.className = className;
        }
    };

    safeSet('dyn-title', project.titulo, 'display-text');
    safeSet('dyn-desc', project.descripcion, 'text-body');
    safeSet('dyn-client', project.cliente, 'text-body');
    safeSet('dyn-year', project.year, 'text-body');
    if (project.servicios) safeSet('dyn-services', project.servicios.join(', '), 'text-body');
    if (project.herramientas) safeSet('dyn-tools', project.herramientas.join(', '), 'text-body');

    const hero = document.getElementById('dyn-hero-img'); 
    if(hero) hero.src = project.imagen;

    container.innerHTML = '';

    if (project.galeria) {
        project.galeria.forEach((item) => {
            const block = document.createElement('div');
            const config = typeof item === 'object' ? item : { src: item, layout: 'full' };

            // LAYOUT: LIVE PORTAL
            if (config.layout === 'live-portal') {
                block.className = 'col-span-12 reveal-element';
                block.innerHTML = `
                    <div class="browser-mockup" style="margin: 10vh auto;">
                        <div class="browser-top-bar"><div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div><div class="browser-address text-mono">${config.src}</div></div>
                        <div class="browser-screen-container" style="position: relative; height: 75vh; background: #000; overflow: hidden;">
                            <img src="${project.imagen}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.6;">
                            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10;">
                                <a href="${config.src}" target="_blank" class="btn-explore text-mono">Web en vivo↗</a>
                            </div>
                        </div>
                    </div>`;
            } 
            // LAYOUT: EDITORIAL SLIDER
            else if (config.layout === 'editorial-slider') {
                block.className = 'col-span-12 horizontal-slider-section';
                const pgs = config.pages.map(p => {
                    // Evaluamos si es solo una imagen o una imagen con texto
                    const isObj = typeof p === 'object';
                    const src = isObj ? p.src : p;
                    const caption = isObj && p.text ? `<div class="editorial-caption text-body">${p.text}</div>` : '';
                    
                    return `<div class="editorial-page" style="position: relative; overflow: hidden;"><img src="${src}">${caption}</div>`;
                }).join('');
                block.innerHTML = `<div class="horizontal-container">${pgs}</div>`;
            } 
// LAYOUT: STATEMENT QUOTE
else if (config.layout === 'statement-quote') {
    block.className = 'col-span-12 reveal-element quote-module';
    block.innerHTML = `
        <div class="quote-inner">
            <span class="quote-label">Concepto Estratégico</span>
            <blockquote class="quote-text">"${config.text}"</blockquote>
            ${config.author ? `<span class="quote-author">${config.author}</span>` : ''}
        </div>
    `;
}
// LAYOUT: BENTO GALLERY 
            else if (config.layout === 'bento-gallery') {
                block.className = 'col-span-12 reveal-element';
                const imgs = config.images.map((img, idx) => {
                    // Solo asignamos si es la foto principal o la secundaria
                    const bentoClass = idx === 0 ? 'bento-principal' : 'bento-secundaria';
                    return `<div class="${bentoClass}"><img src="${img}"></div>`;
                }).join('');
                block.innerHTML = `<div class="bento-wrapper">${imgs}</div>`;
            }
// LAYOUT: IMAGE TICKER (Carrusel de Logos Premium)
            else if (config.layout === 'image-ticker') {
                block.className = 'col-span-12 reveal-element';
                // Solo le ponemos la clase ticker-logo a cada imagen
                const trackItems = config.images.map(img => `<img src="${img}" class="ticker-logo">`).join('');
                block.innerHTML = `
                    <div class="ticker-container">
                        <div class="ticker-track" style="display: flex; width: fit-content; animation: ticker-scroll 40s linear infinite;">
                            ${trackItems} ${trackItems}
                        </div>
                    </div>`;
            }
            // LAYOUT: COMPARISON SLIDER
            else if (config.layout === 'comparison-slider') {
                block.className = 'col-span-12 reveal-element';
                block.style.padding = '8vh var(--spacing-margin)';
                block.innerHTML = `
                    <div class="comparison-container">
                        <img src="${config.after}" class="comp-after-img">
                        
                        <div class="comp-before">
                            <img src="${config.before}" class="comp-before-img">
                        </div>
                    </div>`;
            }
           /// LAYOUT: NARRATIVE CENTER (TEXTO DE INTENCIÓN ANIMADO)
            else if (config.layout === 'narrative-center') {
                block.className = 'col-span-12'; 
                block.innerHTML = `
                    <div class="narrative-center-container" style="display: flex !important; opacity: 1 !important; visibility: visible !important;">
                        <p class="narrative-center-text" style="opacity: 1 !important; transform: none !important; color: var(--color-text) !important;">
                            ${config.text}
                        </p>
                    </div>
                `;
            }
            // LAYOUT: IMPACT GRID (DATOS Y ESTADÍSTICAS)
            else if (config.layout === 'impact-grid') {
                block.className = 'col-span-12 reveal-element';
                
                const itemsHTML = config.items.map(item => {
                    // Extraemos los datos, protegiendo si no existen prefijos/sufijos
                    const prefix = item.prefix || '';
                    const suffix = item.suffix || '';
                    const val = item.value;
                    
                    return `
                    <div class="impact-item">
                        <span class="impact-number" data-target="${val}" data-prefix="${prefix}" data-suffix="${suffix}">${prefix}0${suffix}</span>
                        <span class="impact-label text-body">${item.label}</span>
                    </div>`;
                }).join('');

                block.innerHTML = `<div class="impact-grid-container">${itemsHTML}</div>`;
            }
            // LAYOUT: ESTÁNDAR
            else {
                block.className = `narrative-block layout-${config.layout || 'full'} reveal-element`;
                if (config.layout === 'full') {
                    block.innerHTML = `<img src="${config.src}" style="width: 100%; height: auto;">`;
                } else {
                    block.innerHTML = `<div class="narrative-image-side"><img src="${config.src}"></div>
                                       <div class="narrative-text-side"><div class="narrative-description text-body">${config.text || ''}</div></div>`;
                }
            }
            container.appendChild(block);
        });
    }

    const nextLink = document.getElementById('next-project-link');
    if (nextLink) {
        const currentIndex = DATOS_GLOBALES.proyectos.findIndex(p => p.id === projectId);
        const nextProject = DATOS_GLOBALES.proyectos[(currentIndex + 1) % DATOS_GLOBALES.proyectos.length];
        nextLink.href = `proyect.html?id=${nextProject.id}`;
        const nextName = document.getElementById('next-project-name');
        if (nextName) {
            nextName.textContent = nextProject.titulo;
            nextName.className = 'display-text';
        }
    }
    // Control estricto de hover para los subtítulos del slider
        document.querySelectorAll('.editorial-page').forEach(page => {
            page.addEventListener('mouseenter', () => page.classList.add('is-hovered'));
            page.addEventListener('mouseleave', () => page.classList.remove('is-hovered'));
        });
    initHorizontalScroll();
    initComparisonSliders();
    initScrollAnimations();
}

// 6. CURSOR Y EFECTOS
function initCustomCursor() {
    if (window.matchMedia("(max-width: 900px)").matches) return;
    const dot = document.querySelector(".cursor-dot");
    const outline = document.querySelector(".cursor-outline");
    if (!dot || !outline) return;

    window.addEventListener("mousemove", (e) => {
        gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.1 });
        gsap.to(outline, { x: e.clientX, y: e.clientY, duration: 0.4, ease: "power2.out" });
    });

    document.querySelectorAll('a, button, .project-item, .service-header').forEach(el => {
        el.addEventListener("mouseenter", () => document.body.classList.add("hovering"));
        el.addEventListener("mouseleave", () => document.body.classList.remove("hovering"));
    });
}

function initHoverReveal() {
    const hoverItems = document.querySelectorAll('.service-accordion-item');
    const revealContainer = document.getElementById('hover-reveal');
    const revealImg = document.getElementById('hover-reveal-img');
    if (!revealContainer || !revealImg) return;

    hoverItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const imgPath = item.getAttribute('data-img');
            if (imgPath) { revealImg.src = imgPath; revealContainer.classList.add('active'); }
        });
        item.addEventListener('mouseleave', () => revealContainer.classList.remove('active'));
        item.addEventListener('mousemove', (e) => {
            gsap.to(revealContainer, { x: e.clientX + 20, y: e.clientY + 20, duration: 0.4 });
        });
    });
}

function initHorizontalScroll() {
    document.querySelectorAll('.horizontal-slider-section').forEach(section => {
        const container = section.querySelector('.horizontal-container');
        if (!container) return;
        
        // Creamos la barra de progreso visual
        let track = section.querySelector('.mobile-progress-track');
        if (!track) {
            track = document.createElement('div');
            track.className = 'mobile-progress-track';
            track.innerHTML = '<div class="mobile-progress-fill"></div>';
            section.appendChild(track);
        }

        gsap.to(container, {
            x: () => -(container.scrollWidth - window.innerWidth + 150),
            ease: "none",
            scrollTrigger: { 
                trigger: section, 
                pin: true, 
                scrub: 1, 
                start: "center center", 
                end: () => "+=" + container.scrollWidth,
                invalidateOnRefresh: true,

                onUpdate: (self) => {
                    const currentFill = section.querySelector('.mobile-progress-fill');
                    if (currentFill) {
                        // Obligamos a que el ancho (%) sea exactamente igual a tu porcentaje de scroll
                        currentFill.style.width = `${self.progress * 100}%`;
                    }
                }
            }
        });
    });
}

function initComparisonSliders() {
    document.querySelectorAll('.comparison-container').forEach(cont => {
        const before = cont.querySelector('.comp-before');
        if(!before) return;
        
        // 1. Función para seguir el cursor (arrastre)
        const slide = (e) => {
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const rect = cont.getBoundingClientRect();
            const x = ((clientX - rect.left) / rect.width) * 100;
            gsap.to(before, { width: `${x}%`, duration: 0.1 });
        };

        // 2. NUEVO: Función "Imán" para completar la imagen al salir
        const snap = () => {
            // Leemos el ancho actual. Si no hay, asumimos 50%
            const currentWidth = parseFloat(before.style.width) || 50;
            // Si pasaste de la mitad, se va al 100% (Antes). Si no, al 0% (Después).
            const targetWidth = currentWidth > 50 ? 100 : 0;
            
            // Animación suave de medio segundo para revelar la imagen completa
            gsap.to(before, { width: `${targetWidth}%`, duration: 0.5, ease: "power2.out" });
        };

        // Eventos de movimiento
        cont.addEventListener('mousemove', slide);
        cont.addEventListener('touchmove', slide, { passive: true });
        
        // NUEVO: Eventos de soltar/salir que activan el efecto imán
        cont.addEventListener('mouseleave', snap);
        cont.addEventListener('touchend', snap);
    });
}

function initHeaderContrast() {
    const header = document.querySelector('.header');
    if (!header) return;

    // Detectamos automáticamente si estamos en la plantilla de proyectos
    const isProjectPage = window.location.pathname.includes('proyect.html');

    const check = () => {
        // 1. REGLA NUEVA: Si estamos en un proyecto, forzamos siempre el fondo del header
        if (isProjectPage) {
            header.classList.add('is-scrolled');
            return; // Cortamos la ejecución aquí para que el scroll o los colores no lo desactiven
        }

        // 2. COMPORTAMIENTO ORIGINAL para las demás páginas (Home, Info, etc.)
        if (window.scrollY > 50) header.classList.add('is-scrolled');
        else header.classList.remove('is-scrolled');
        
        let isOverLight = false;
        document.querySelectorAll('.bg-lime, [style*="--color-lime"]').forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 50 && rect.bottom >= 50) isOverLight = true;
        });

        if (isOverLight && !header.classList.contains('is-scrolled')) header.classList.add('is-glass');
        else header.classList.remove('is-glass');
    };
    
    window.addEventListener('scroll', check);
    check(); // Se ejecuta inmediatamente al cargar la página
}

// INICIALIZACIÓN GLOBAL
document.addEventListener('DOMContentLoaded', () => {
    initLibraries();
    initPageVisibility();
    
    setTimeout(() => {
        initCustomCursor();
        initScrollAnimations();
        initPortfolioGrid();
        initProjectDetail();
        initHoverReveal();
        initHeaderContrast();

        // 1. Observer para el Impact Grid
        const impactObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const targetEl = entry.target;
                    const finalValue = parseFloat(targetEl.getAttribute('data-target'));
                    const prefix = targetEl.getAttribute('data-prefix');
                    const suffix = targetEl.getAttribute('data-suffix');
                    
                    if (isNaN(finalValue)) {
                        targetEl.innerText = `${prefix}${targetEl.getAttribute('data-target')}${suffix}`;
                        impactObserver.unobserve(targetEl);
                        return;
                    }

                    const duration = 1500;
                    const startTime = performance.now();

                    const updateCounter = (currentTime) => {
                        const elapsedTime = currentTime - startTime;
                        const progress = Math.min(elapsedTime / duration, 1);
                        const easeOutProgress = 1 - Math.pow(1 - progress, 3);
                        const currentValue = (easeOutProgress * finalValue).toFixed(finalValue % 1 === 0 ? 0 : 1); 

                        targetEl.innerText = `${prefix}${currentValue}${suffix}`;

                        if (progress < 1) {
                            requestAnimationFrame(updateCounter);
                        } else {
                            targetEl.innerText = `${prefix}${targetEl.getAttribute('data-target')}${suffix}`; 
                        }
                    };
                    
                    requestAnimationFrame(updateCounter);
                    impactObserver.unobserve(targetEl); 
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.impact-number').forEach(el => impactObserver.observe(el));

        // 2. Lógica de Menú Hamburguesa (Integrada y cerrada correctamente)
        const hamBtn = document.getElementById('hamburgerBtn');
        const mobileNav = document.getElementById('mobileNav');
        if (hamBtn && mobileNav) {
            hamBtn.addEventListener('click', () => {
                const isOpen = hamBtn.classList.toggle('open');
                mobileNav.classList.toggle('active');
                document.body.style.overflow = isOpen ? 'hidden' : '';
            });
        }
        
        // 3. Otros eventos
        document.querySelectorAll('.service-header, .accordion-header').forEach(h => {
            h.addEventListener('click', () => {
                h.parentElement.classList.toggle('active');
                setTimeout(() => { if(window.ScrollTrigger) ScrollTrigger.refresh(); }, 500);
            });
        });

    }, 150);
});