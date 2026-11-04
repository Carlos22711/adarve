document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (menuToggle && navMenu) {
        const setMenu = (open) => {
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
