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
        const INTERVAL = 3000;   // milisegundos entre fotos (3000 = 3 s, 2000 = 2 s)
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


    // ---- WhatsApp: utilidades compartidas por los formularios ----
    const WHATSAPP = '525650339854';
    const clean = (v) => v.replace(/\s+/g, ' ').trim();
    const openWhatsApp = (lines) => {
        const url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(lines.join('\n'));
        const win = window.open(url, '_blank', 'noopener');
        if (!win) window.location.href = url;   // por si el navegador bloquea la pestaña nueva
    };

    // ---- Formulario de CONTACTO (general) ----
    const form = document.getElementById('contactForm');
    if (form) {
        const errorBox = document.getElementById('formError');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const campos = [
                ['nombre', clean(form.nombre.value), 'tu nombre'],
                ['motivo', form.motivo.value, 'el motivo'],
                ['mensaje', form.mensaje.value.trim(), 'un mensaje']
            ];
            const faltan = campos.filter(([, val]) => !val);
            campos.forEach(([id, val]) => form[id].closest('.field').classList.toggle('has-error', !val));
            if (faltan.length) {
                errorBox.textContent = 'Por favor completa: ' + faltan.map(f => f[2]).join(', ') + '.';
                errorBox.hidden = false;
                form[faltan[0][0]].focus();
                return;
            }
            errorBox.hidden = true;
            openWhatsApp([
                'Hola Adarve Arquitectura, quisiera ponerme en contacto con ustedes.',
                '',
                '*Nombre:* ' + campos[0][1],
                '*Motivo:* ' + campos[1][1],
                '*Mensaje:* ' + campos[2][1]
            ]);
            form.reset();   // limpia el formulario después de enviar
            form.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
        });
        form.addEventListener('input', (e) => {
            const field = e.target.closest('.field');
            if (field && e.target.value.trim()) field.classList.remove('has-error');
        });
    }

    // ---- Cuestionarios de SERVICIOS ("Quiero este servicio") ----
    // Preguntas del cuestionario (las mismas del formulario de Tally). Se usan en los 3 servicios.
    // Edita aquí: type = text | select | textarea | checks ; required: true las vuelve obligatorias
    const PREGUNTAS = [
        { id: 'nombre', label: 'Nombre', type: 'text', required: true, autocomplete: 'name' },
        { id: 'ciudad', label: 'Ciudad/Colonia', type: 'text', required: true },
        { id: 'terreno', label: '¿Cuentas con terreno o inmueble?', type: 'select', required: true,
          options: ['Sí, tengo terreno', 'Sí, tengo inmueble', 'Todavía no'] },
        { id: 'm2', label: '¿Cuántos m² tiene tu terreno?', type: 'text', optional: true, format: 'number', decimal: true, suffix: ' m²', placeholder: 'Ej. 1,200' },
        { id: 'planos', label: '¿Tienes planos, estructura o algún levantamiento?', type: 'checks', optional: true,
          options: ['Planos', 'Estructura', 'Levantamiento', 'Ninguno'] },
        { id: 'presupuesto', label: '¿Qué presupuesto tienes pensado?', type: 'text', optional: true, format: 'number', prefix: '$', placeholder: 'Ej. 4,000,000' },
        { id: 'inicio', label: '¿Cuándo te gustaría iniciar?', type: 'text', optional: true, placeholder: 'Ej. enero 2027' }
    ];
    const SERVICES = {
        diseno: { nombre: 'Diseño Arquitectónico Integral', campos: PREGUNTAS },
        interiorismo: { nombre: 'Interiorismo y Remodelación Comercial', campos: PREGUNTAS },
        supervision: { nombre: 'Supervisión y Dirección de Obra', campos: PREGUNTAS }
    };

    const dialog = document.getElementById('serviceDialog');
    if (dialog) {
        const sform = document.getElementById('serviceForm');
        const box = sform.querySelector('.dialog-fields');
        const title = document.getElementById('serviceDialogTitle');
        const err = document.getElementById('serviceError');
        let actual = null;

        const labelHtml = (f) => f.label + (f.optional ? ' <span class="optional">(opcional)</span>' : '');
        const fieldHtml = (f) => {
            const id = 'sf-' + f.id;
            if (f.type === 'select') {
                return `<div class="field" data-id="${f.id}"><label for="${id}">${labelHtml(f)}</label>
                    <select id="${id}" name="${f.id}"><option value="" selected disabled>Selecciona una opción</option>${f.options.map(o => `<option>${o}</option>`).join('')}</select></div>`;
            }
            if (f.type === 'textarea') {
                return `<div class="field" data-id="${f.id}"><label for="${id}">${labelHtml(f)}</label><textarea id="${id}" name="${f.id}" rows="4" maxlength="600"></textarea></div>`;
            }
            if (f.type === 'checks') {
                return `<fieldset class="field" data-id="${f.id}"><legend>${labelHtml(f)}</legend>${f.options.map(o => `<label class="check"><input type="checkbox" name="${f.id}" value="${o}"> ${o}</label>`).join('')}</fieldset>`;
            }
            return `<div class="field" data-id="${f.id}"><label for="${id}">${labelHtml(f)}</label>
                <input type="text" id="${id}" name="${f.id}" maxlength="100"${f.format ? ` inputmode="${f.decimal ? 'decimal' : 'numeric'}" data-format="number"${f.decimal ? ' data-decimal="1"' : ''}` : ''}${f.autocomplete ? ` autocomplete="${f.autocomplete}"` : ''}${f.placeholder ? ` placeholder="${f.placeholder}"` : ''}></div>`;
        };
        const valueOf = (f) => {
            if (f.type === 'checks') return Array.from(sform.querySelectorAll(`input[name="${f.id}"]:checked`)).map(i => i.value).join(', ');
            const el = sform.elements[f.id];
            return f.type === 'textarea' ? el.value.trim() : clean(el.value);
        };

        document.querySelectorAll('[data-service]').forEach((btn) => {
            btn.addEventListener('click', () => {
                actual = SERVICES[btn.dataset.service];
                if (!actual) return;
                if (typeof dialog.showModal !== 'function') {            // navegador muy antiguo: mensaje directo
                    openWhatsApp(['Hola Adarve Arquitectura, tengo interés en este servicio: *' + actual.nombre + '*']);
                    return;
                }
                title.textContent = actual.nombre;
                box.innerHTML = actual.campos.map(fieldHtml).join('');
                err.hidden = true;
                document.body.classList.add('modal-open');
                dialog.showModal();
                dialog.scrollTop = 0;
                title.focus();
            });
        });

        // Da formato de miles (4,000,000) mientras se escribe, conservando la posición del cursor
        const formatNumber = (raw, decimal) => {
            let s = raw.replace(/[^\d.]/g, '');
            if (!decimal) s = s.replace(/\./g, '');
            else {
                const i = s.indexOf('.');
                if (i !== -1) s = s.slice(0, i + 1) + s.slice(i + 1).replace(/\./g, '').slice(0, 2);
            }
            let [ent, dec] = s.split('.');
            ent = ent.replace(/^0+(?=\d)/, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return dec !== undefined ? ent + '.' + dec : ent;
        };
        sform.addEventListener('input', (e) => {
            const el = e.target;
            if (el.dataset.format !== 'number') return;
            const pos = el.selectionStart;
            const significativos = el.value.slice(0, pos).replace(/[^\d.]/g, '').length;
            el.value = formatNumber(el.value, !!el.dataset.decimal);
            let n = 0, nueva = 0;
            while (nueva < el.value.length && n < significativos) { if (/[\d.]/.test(el.value[nueva])) n++; nueva++; }
            el.setSelectionRange(nueva, nueva);
        });

        const cerrar = () => dialog.close();
        document.getElementById('serviceClose').addEventListener('click', cerrar);
        dialog.addEventListener('click', (e) => { if (e.target === dialog) cerrar(); });   // clic en el fondo
        dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));

        sform.addEventListener('input', (e) => {
            const field = e.target.closest('.field');
            if (field) field.classList.remove('has-error');
        });

        sform.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!actual) return;
            const faltan = [];
            actual.campos.forEach((f) => {
                const vacio = !valueOf(f);
                const falta = !!(f.required && vacio);
                sform.querySelector(`.field[data-id="${f.id}"]`).classList.toggle('has-error', falta);
                if (falta) faltan.push(f);
            });
            if (faltan.length) {
                err.textContent = 'Por favor completa: ' + faltan.map(f => f.label.toLowerCase().replace(/[¿?]/g, '')).join(', ') + '.';
                err.hidden = false;
                const primero = sform.querySelector(`.field[data-id="${faltan[0].id}"]`);
                (primero.querySelector('input, select, textarea') || primero).focus();
                return;
            }
            err.hidden = true;
            const lineas = ['Hola Adarve Arquitectura, tengo interés en este servicio: *' + actual.nombre + '*', ''];
            actual.campos.forEach((f) => { const v = valueOf(f); if (v) lineas.push('*' + f.label.replace(/[¿?]/g, '') + ':* ' + (f.prefix || '') + v + (f.suffix || '')); });
            openWhatsApp(lineas);
            dialog.close();   // cierra la ventana emergente al enviar
        });
    }


    // ---- Comparador render / obra (arrastrar) ----
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('.compare').forEach((el) => {
        const handle = el.querySelector('.compare-handle');
        let split = 50, dragging = false, startX = 0, startY = 0;

        const setSplit = (v) => {
            split = Math.max(0, Math.min(100, v));
            el.style.setProperty('--split', split + '%');
            handle.setAttribute('aria-valuenow', String(Math.round(split)));
        };
        const fromPointer = (e) => {
            const r = el.getBoundingClientRect();
            setSplit(((e.clientX - r.left) / r.width) * 100);
        };

        el.addEventListener('pointerdown', (e) => {
            el.classList.remove('is-hinting');
            startX = e.clientX; startY = e.clientY;
            if (e.pointerType === 'mouse') {          // con mouse: salta al clic y arrastra
                dragging = true; try { el.setPointerCapture(e.pointerId); } catch (_) {} fromPointer(e);
            }
        });
        el.addEventListener('pointermove', (e) => {
            if (!dragging && e.pointerType !== 'mouse' && e.buttons) {
                // con el dedo: solo arrastra si el movimiento es horizontal (así el scroll vertical no mueve la barra)
                const dx = Math.abs(e.clientX - startX), dy = Math.abs(e.clientY - startY);
                if (dx > 6 && dx > dy) { dragging = true; try { el.setPointerCapture(e.pointerId); } catch (_) {} }
            }
            if (dragging) fromPointer(e);
        });
        const end = () => { dragging = false; };
        ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((t) => el.addEventListener(t, end));

        handle.addEventListener('keydown', (e) => {
            const step = e.shiftKey ? 10 : 5;
            if (e.key === 'ArrowLeft') { setSplit(split - step); e.preventDefault(); }
            else if (e.key === 'ArrowRight') { setSplit(split + step); e.preventDefault(); }
            else if (e.key === 'Home') { setSplit(0); e.preventDefault(); }
            else if (e.key === 'End') { setSplit(100); e.preventDefault(); }
        });

        // Pista de movimiento: al llegar a la vista, la barra se mueve un poco para mostrar que se desliza
        if (!prefersReduced && 'IntersectionObserver' in window) {
            const io = new IntersectionObserver((entries) => {
                if (!entries[0].isIntersecting) return;
                io.disconnect();
                el.classList.add('is-hinting');
                setTimeout(() => setSplit(36), 250);
                setTimeout(() => setSplit(64), 1000);
                setTimeout(() => setSplit(50), 1750);
                setTimeout(() => el.classList.remove('is-hinting'), 2600);
            }, { threshold: 0.6 });
            io.observe(el);
        }
    });

    // ---- Portada con carrusel (Estética Sagitarios) ----
    document.querySelectorAll('.cover-carousel').forEach((root) => {
        const slides = root.querySelectorAll('.cover-slide'), dots = root.querySelectorAll('.cover-dot');
        if (slides.length < 2) return;
        let cur = 0, timer = null;
        const go = (n) => {
            slides[cur].classList.remove('is-active'); dots[cur].classList.remove('is-active');
            cur = (n + slides.length) % slides.length;
            slides[cur].classList.add('is-active'); dots[cur].classList.add('is-active');
        };
        const start = () => { if (!prefersReduced && !timer) timer = setInterval(() => go(cur + 1), 4000); };
        const stop = () => { clearInterval(timer); timer = null; };
        dots.forEach((d, n) => d.addEventListener('click', () => { go(n); stop(); start(); }));
        root.addEventListener('mouseenter', stop); root.addEventListener('mouseleave', start);
        root.addEventListener('focusin', stop); root.addEventListener('focusout', start);
        start();
    });

    // ---- Visor de imágenes (lightbox) ----
    const lb = document.getElementById('lightbox');
    const lbLinks = Array.from(document.querySelectorAll('[data-lightbox]'));
    if (lb && lbLinks.length && typeof lb.showModal === 'function') {
        const lbImg = lb.querySelector('img'), lbCap = lb.querySelector('figcaption');
        let idx = 0;
        lb.classList.toggle('is-single', lbLinks.length < 2);
        const show = (i) => {
            idx = (i + lbLinks.length) % lbLinks.length;
            const a = lbLinks[idx], thumb = a.querySelector('img');
            lbImg.src = a.href;
            lbImg.alt = thumb ? thumb.alt : '';
            lbCap.textContent = a.dataset.caption || '';
        };
        lbLinks.forEach((a, i) => a.addEventListener('click', (e) => {
            e.preventDefault();
            show(i);
            document.body.classList.add('modal-open');
            lb.showModal();
        }));
        lb.querySelector('.lightbox-close').addEventListener('click', () => lb.close());
        lb.querySelector('.lightbox-prev').addEventListener('click', () => show(idx - 1));
        lb.querySelector('.lightbox-next').addEventListener('click', () => show(idx + 1));
        lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
        lb.addEventListener('close', () => document.body.classList.remove('modal-open'));
        lb.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') show(idx - 1);
            if (e.key === 'ArrowRight') show(idx + 1);
        });
        let tx = 0;                                                  // deslizar con el dedo para cambiar de imagen
        lb.addEventListener('touchstart', (e) => { tx = e.changedTouches[0].clientX; }, { passive: true });
        lb.addEventListener('touchend', (e) => {
            const dx = e.changedTouches[0].clientX - tx;
            if (Math.abs(dx) > 60) show(idx + (dx < 0 ? 1 : -1));
        }, { passive: true });
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Evita que la página "se deslice sola al inicio": ScrollTrigger recalcula posiciones
        // (al volver a la pestaña/app, rotar el celular o terminar de cargar) y, con
        // scroll-behavior: smooth, ese recálculo se veía como un salto animado hacia arriba.
        ScrollTrigger.config({ ignoreMobileResize: true });
        const rootEl = document.documentElement;
        ScrollTrigger.addEventListener('refreshInit', () => { rootEl.style.scrollBehavior = 'auto'; });
        ScrollTrigger.addEventListener('refresh', () => { rootEl.style.scrollBehavior = ''; });

        gsap.from(".fade-in", { duration: 1.2, y: 30, opacity: 0, ease: "power3.out", delay: 0.2 });

        gsap.utils.toArray('.slide-up').forEach(element => {
            gsap.from(element, {
                scrollTrigger: { trigger: element, start: "top 85%", toggleActions: "play none none reverse" },
                duration: 1, y: 40, opacity: 0, ease: "power2.out"
            });
        });
    }
});
