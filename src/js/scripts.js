// Смена светлой и тёмной темы
const themeToggle = document.getElementById('theme-toggle');
themeToggle?.addEventListener('click', () => {
    const html = document.documentElement;
    html.classList.toggle('dark');
    localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
});

// FAQ: ответ-вопрос
document.querySelectorAll('.faq-item').forEach((item) => {
    const btn = item.querySelector('.faq-question');
    const panel = item.querySelector('.faq-answer');
    if (!btn || !panel) return;

    btn.addEventListener('click', () => {
        const open = item.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        panel.hidden = !open;
    });
});

// Полноэкранный просмотр примера по клику на превью в "Обзоре возможностей" и на examples.html
document.addEventListener('click', (e) => {
    if (e.target.closest('a[href]')) return;

    const card = e.target.closest(
        '#features .bento-grid-3 .bento-card, #features .bento-card[data-preview-fullscreen], #articles .bento-card[data-preview-fullscreen], #examples-page .examples-category-grid .bento-card'
    );
    if (!card) return;

    const slider = card.querySelector('.before-after-slider, [data-slider]');
    if (slider) {
        if (slider.dataset.draggingJustNow === 'true') return;
        openFullscreen(slider);
        return;
    }

    const image = card.querySelector('.bento-visual img');
    if (image) {
        openImageFullscreen(image);
    }
});

// Иконки
window.lucide?.createIcons?.();

// Анимация появления элементов при скролле (reveal)
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        root: null,
        /* Небольшой «запас» до края вьюпорта — анимация стартует раньше, без рывка */
        rootMargin: '48px 0px 48px 0px',
        threshold: 0,
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Добавляем класс active, когда элемент попадает в зону видимости
                entry.target.classList.add('active');

                // Перестаем наблюдать, чтобы анимация проигрывалась только один раз
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Находим все элементы с классом .reveal и вешаем на них наблюдатель
    document.querySelectorAll('.reveal').forEach(element => {
        observer.observe(element);
    });
});

// Логика слайдера
function setupSlider(slider) {
    const beforeOverlay = slider.querySelector('.before-after-pane');
    const beforeImg = beforeOverlay?.querySelector('img');
    const handle = slider.querySelector('.before-after-divider');
    const circle = slider.querySelector('.before-after-grip');
    const badgeBefore = slider.querySelector('.before-after-label--before');
    const badgeAfter = slider.querySelector('.before-after-label--after');

    if (!beforeOverlay || !handle || !circle) return;

    // Синхронизация ширины изображения "до"
    const syncSize = () => {
        if (slider.classList.contains('before-after-slider--dragging')) return;
        if (beforeImg) beforeImg.style.width = `${slider.offsetWidth}px`;
    };
    syncSize();
    if (!slider.closest('#modal-slider-target')) {
        let roFrame = 0;
        const syncSizeRaf = () => {
            cancelAnimationFrame(roFrame);
            roFrame = requestAnimationFrame(syncSize);
        };
        new ResizeObserver(syncSizeRaf).observe(slider);
    }
    /* В #modal-slider-target не вешаем ResizeObserver: клон под CSS scale, observer даёт лишние перерисовки */

    /* Полноэкранный клон под scale: живой getBoundingClientRect() и % «плавают» на субпикселях — фиксируем бокс на время drag и шаг в px layout. */
    let frozenModalHit = null;

    const move = e => {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const live = slider.getBoundingClientRect();
        const left = frozenModalHit ? frozenModalHit.left : live.left;
        const hitW = frozenModalHit ? frozenModalHit.width : live.width;
        const ow = frozenModalHit ? frozenModalHit.ow : slider.offsetWidth;

        let xVisual = clientX - left;
        xVisual = Math.max(0, Math.min(xVisual, hitW));

        let xLayout = hitW > 0 ? (xVisual / hitW) * ow : 0;
        xLayout = Math.max(0, Math.min(xLayout, ow));
        if (frozenModalHit) {
            xLayout = Math.round(xLayout);
        }

        const percent = ow > 0 ? (xLayout / ow) * 100 : 50;

        beforeOverlay.style.width = `${percent}%`;
        handle.style.left = `${percent}%`;

        // Плавное затухание бейджей
        const threshold = 20;
        if (badgeBefore) {
            badgeBefore.style.opacity = percent < threshold ? percent / threshold : 1;
        }
        if (badgeAfter) {
            badgeAfter.style.opacity = percent > (100 - threshold) ? (100 - percent) / threshold : 1;
        }
    };

    let active = false;
    let dragStartX = 0;
    let didDrag = false;

    const start = e => {
        e.preventDefault();
        e.stopPropagation();
        slider.classList.add('before-after-slider--dragging');
        if (slider.closest('#modal-slider-target')) {
            const r = slider.getBoundingClientRect();
            frozenModalHit = { left: r.left, width: r.width, ow: slider.offsetWidth };
        } else {
            frozenModalHit = null;
        }
        active = true;
        didDrag = false;
        dragStartX = e.touches ? e.touches[0].clientX : e.clientX;
        move(e);
    };

    circle.addEventListener('mousedown', start);
    circle.addEventListener('touchstart', start, { passive: false });

    window.addEventListener('mouseup', () => {
        if (!active) return;
        active = false;
        frozenModalHit = null;
        slider.classList.remove('before-after-slider--dragging');
        if (didDrag) {
            slider.dataset.draggingJustNow = 'true';
            setTimeout(() => { delete slider.dataset.draggingJustNow; }, 180);
        }
    });
    window.addEventListener('mousemove', e => {
        if (!active) return;
        const deltaX = Math.abs(e.clientX - dragStartX);
        if (deltaX > 4) didDrag = true;
        move(e);
    });
    const endTouchDrag = () => {
        if (!active) return;
        active = false;
        frozenModalHit = null;
        slider.classList.remove('before-after-slider--dragging');
        if (didDrag) {
            slider.dataset.draggingJustNow = 'true';
            setTimeout(() => { delete slider.dataset.draggingJustNow; }, 180);
        }
    };
    window.addEventListener('touchend', endTouchDrag);
    window.addEventListener('touchcancel', endTouchDrag);
    window.addEventListener('touchmove', e => {
        if (active) {
            const deltaX = Math.abs(e.touches[0].clientX - dragStartX);
            if (deltaX > 4) didDrag = true;
            e.preventDefault();
            move(e);
        }
    }, { passive: false });
}

// Полноэкранный просмотр
let currentOriginalSlider = null;

function openFullscreen(element) {
    const overlay = document.getElementById('modal-overlay');
    const target = document.getElementById('modal-slider-target');
    if (!overlay || !target) return;

    currentOriginalSlider = element;

    const clone = element.cloneNode(true);

    /* Те же px-размеры, что на лэндинге — иначе другой бокс → object-fit: cover режет иначе.
       Вписываем в экран равномерным scale, без смены пропорций контейнера. */
    let w = element.offsetWidth;
    let h = element.offsetHeight;
    if (!w || !h) {
        const r = element.getBoundingClientRect();
        w = r.width || 600;
        h = r.height || (w * 4 / 3);
    }

    const pad = 48; /* ≈ 1.5rem × 2, как padding у .modal-overlay */
    const scale = Math.min((window.innerWidth - pad) / w, (window.innerHeight - pad) / h);

    const wrap = document.createElement('div');
    wrap.className = 'modal-slider-scale-wrap';
    wrap.style.width = `${w * scale}px`;
    wrap.style.height = `${h * scale}px`;
    wrap.style.overflow = 'hidden';
    wrap.style.flexShrink = '0';

    clone.style.cursor = 'default';
    clone.style.boxSizing = 'border-box';
    clone.style.width = `${w}px`;
    clone.style.height = `${h}px`;
    clone.style.aspectRatio = 'unset';
    clone.style.maxWidth = 'none';
    clone.style.maxHeight = 'none';
    clone.style.margin = '0';
    clone.style.transform = `scale(${scale})`;
    clone.style.transformOrigin = 'top left';

    const originalWidth = element.querySelector('.before-after-pane')?.style.width;
    const originalHandle = element.querySelector('.before-after-divider')?.style.left;
    if (originalWidth) {
        clone.querySelector('.before-after-pane').style.width = originalWidth;
        clone.querySelector('.before-after-divider').style.left = originalHandle;
    }

    wrap.appendChild(clone);
    target.innerHTML = '';
    target.appendChild(wrap);

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    lucide.createIcons();
    setupSlider(clone);
}

function openImageFullscreen(imageElement) {
    const overlay = document.getElementById('modal-overlay');
    const target = document.getElementById('modal-slider-target');
    if (!overlay || !target) return;

    currentOriginalSlider = null;

    const img = document.createElement('img');
    img.src = imageElement.currentSrc || imageElement.src;
    img.alt = imageElement.alt || 'Пример';
    img.style.maxWidth = 'min(96vw, 1400px)';
    img.style.maxHeight = '92vh';
    img.style.width = 'auto';
    img.style.height = 'auto';
    img.style.objectFit = 'contain';
    img.style.borderRadius = '16px';
    img.style.boxShadow = 'var(--shadow__base)';

    target.innerHTML = '';
    target.appendChild(img);
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Закрытие полноэкранного режима (клик по фону или крестику)
document.addEventListener('click', function (e) {
    const overlay = document.getElementById('modal-overlay');
    if (!overlay || !overlay.classList.contains('active')) return;

    // Закрываем, если кликнули:
    // 1. по самому #modal-overlay (фон)
    // 2. по .close-modal или внутри него
    if (
        e.target === overlay ||
        e.target.closest('.close-modal')
    ) {
        const target = document.getElementById('modal-slider-target');

        if (currentOriginalSlider && target) {
            const clonedSlider = target.querySelector('.before-after-slider, [data-slider]');

            if (clonedSlider) {
                const finalWidth = clonedSlider.querySelector('.before-after-pane')?.style.width;
                const finalHandle = clonedSlider.querySelector('.before-after-divider')?.style.left;

                if (finalWidth && finalHandle) {
                    currentOriginalSlider.querySelector('.before-after-pane').style.width = finalWidth;
                    currentOriginalSlider.querySelector('.before-after-divider').style.left = finalHandle;
                }
            }
        }

        overlay.classList.remove('active');
        document.body.style.overflow = '';
        currentOriginalSlider = null;
    }
});

// Инициализация слайдера на странице
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.before-after-slider, [data-slider]').forEach(slider => {
        setupSlider(slider);
    });
    lucide.createIcons();
});

// Автоподсветка активного пункта содержания в статье
document.addEventListener('DOMContentLoaded', () => {
    const page = document.getElementById('articles-page');
    if (!page) return;

    const headerActions = document.querySelector('.header-actions');
    let tocToggle = document.getElementById('articles-toc-toggle');
    if (!tocToggle && headerActions) {
        tocToggle = document.createElement('button');
        tocToggle.type = 'button';
        tocToggle.id = 'articles-toc-toggle';
        tocToggle.className = 'icon-btn articles-header-toc-toggle';
        tocToggle.setAttribute('aria-label', 'Показать или скрыть содержание');
        tocToggle.setAttribute('aria-controls', 'articles-toc-nav');
        tocToggle.innerHTML = '<i data-lucide="panel-left-close"></i>';

        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn && themeBtn.parentElement === headerActions) {
            themeBtn.insertAdjacentElement('afterend', tocToggle);
        } else {
            headerActions.appendChild(tocToggle);
        }
        window.lucide?.createIcons?.();
    }

    const tocStorageKey = 'articlesTocHidden';
    const setTocCollapsed = (collapsed) => {
        document.body.classList.toggle('articles-toc-hidden', collapsed);
        if (tocToggle) {
            tocToggle.innerHTML = collapsed
                ? '<i data-lucide="panel-left-open"></i>'
                : '<i data-lucide="panel-left-close"></i>';
            tocToggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
            tocToggle.setAttribute('aria-label', collapsed ? 'Показать содержание' : 'Скрыть содержание');
            window.lucide?.createIcons?.();
        }
    };

    const savedTocState = localStorage.getItem(tocStorageKey);
    setTocCollapsed(savedTocState === 'true');

    tocToggle?.addEventListener('click', () => {
        const isCollapsed = !document.body.classList.contains('articles-toc-hidden');
        setTocCollapsed(isCollapsed);
        localStorage.setItem(tocStorageKey, String(isCollapsed));
    });

    const tocLinks = Array.from(document.querySelectorAll('.articles-toc a[href^="#"]'));
    if (!tocLinks.length) return;

    const sections = tocLinks
        .map((link) => {
            const id = link.getAttribute('href')?.slice(1);
            const section = id ? document.getElementById(id) : null;
            return section ? { link, section } : null;
        })
        .filter(Boolean);

    if (!sections.length) return;

    const setActive = (targetId) => {
        sections.forEach(({ link, section }) => {
            link.classList.toggle('active', section.id === targetId);
        });
    };

    // Плавный апдейт активного якоря при скролле
    const updateActive = () => {
        const offset = 140;
        let current = sections[0].section.id;

        sections.forEach(({ section }) => {
            if (section.getBoundingClientRect().top <= offset) {
                current = section.id;
            }
        });

        setActive(current);
    };

    // Сразу выставляем состояние при загрузке (включая переходы по #hash)
    const hashTarget = window.location.hash?.slice(1);
    if (hashTarget && sections.some(({ section }) => section.id === hashTarget)) {
        setActive(hashTarget);
    } else {
        updateActive();
    }

    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive);
});