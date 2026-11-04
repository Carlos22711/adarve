document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (menuToggle && navMenu) {
        const navbar = document.querySelector('.navbar');
        const setMenu = (open) => {
            if (navbar) navbar.classList.toggle('menu-open', open);
            navMenu.classList.toggle('active', open);
            menuToggle.classList.toggle('open', open);
            menuToggle.setAttribute('aria-expanded', String(open));
            menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
        };

        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-controls', 'navMenu');

        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            setMenu(!navMenu.classList.contains('active'));
        });

        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => setMenu(false));
        });

        // cerrar al tocar fuera, con Escape o al pasar a escritorio
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target)) setMenu(false);
        });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
        window.addEventListener('resize', () => { if (window.innerWidth > 768) setMenu(false); });

        // marcar la página actual en el menú
        const current = location.pathname.split('/').pop() || 'index.html';
        navMenu.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href').split('/').pop();
            if (href === current) link.setAttribute('aria-current', 'page');
        });
    }


    // ---- Barra transparente sobre la portada (solo inicio) ----
    const navbarEl = document.querySelector('.navbar');
    if (navbarEl && document.body.classList.contains('home')) {
        const onScroll = () => navbarEl.classList.toggle('scrolled', window.scrollY > 40);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    // ---- Portada: recorrido automático de fotos de los proyectos ----
    const slides = Array.from(document.querySelectorAll('.intro-slide'));
    const caption = document.getElementById('introCaption');
    if (slides.length > 1) {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const INTERVAL = 6000;
        let current = 0, timer = null;

        const load = (i) => new Promise((resolve) => {
            const img = slides[i].querySelector('img');
            if (!img) return resolve();
            if (img.dataset.src && !img.getAttribute('src')) img.src = img.dataset.src;
            if (img.complete && img.naturalWidth > 0) return resolve();
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', resolve, { once: true });
        });

        const show = (i) => {
            slides[current].classList.remove('is-active');
            slides[current].setAttribute('aria-hidden', 'true');
            slides[i].classList.add('is-active');
            slides[i].removeAttribute('aria-hidden');
            if (caption && slides[i].dataset.project !== slides[current].dataset.project) {
                caption.classList.add('is-changing');
                setTimeout(() => { caption.textContent = slides[i].dataset.project; caption.classList.remove('is-changing'); }, 400);
            }
            current = i;
        };

        const next = async () => {
            const i = (current + 1) % slides.length;
            await load(i);
            show(i);
            load((i + 1) % slides.length);   // precarga la siguiente
        };

        const start = () => { if (!timer && !reduceMotion) timer = setInterval(next, INTERVAL); };
        const stop = () => { clearInterval(timer); timer = null; };

        window.addEventListener('load', () => { load(1); start(); });
        document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        gsap.from(".fade-in", { duration: 1.2, y: 30, opacity: 0, ease: "power3.out", delay: 0.2 });

        gsap.utils.toArray('.slide-up').forEach(element => {
            gsap.from(element, {
                scrollTrigger: { trigger: element, start: "top 85%", toggleActions: "play none none reverse" },
                duration: 1, y: 40, opacity: 0, ease: "power2.out"
            });
        });
    }
});
