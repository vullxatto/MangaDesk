// Смена светлой и тёмной темы
const themeToggle = document.getElementById('theme-toggle');
themeToggle?.addEventListener('click', () => {
    const html = document.documentElement;
    html.classList.toggle('dark');
    localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
});

// Модалки
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.open-modal-btn');
    if (btn) {
        const modalId = btn.getAttribute('data-modal');
        const modal = document.getElementById(modalId);
        modal?.showModal();
    }
    if (e.target instanceof HTMLDialogElement) {
        e.target.close();
    }
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

// Полноэкранный просмотр примера по клику на превью в "Обзоре возможностей"
document.addEventListener('click', (e) => {
    const card = e.target.closest('#features .bento-grid-3 .bento-card, #features .bento-card[data-preview-fullscreen]');
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
        rootMargin: '0px',
        threshold: 0.15 // Элемент начнет появляться, когда покажется на 15%
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
    const beforeImg     = beforeOverlay?.querySelector('img');
    const handle        = slider.querySelector('.before-after-divider');
    const circle        = slider.querySelector('.before-after-grip');
    const badgeBefore   = slider.querySelector('.before-after-label--before');
    const badgeAfter    = slider.querySelector('.before-after-label--after');

    if (!beforeOverlay || !handle || !circle) return;

    // Синхронизация ширины изображения "до"
    const syncSize = () => {
        if (beforeImg) beforeImg.style.width = `${slider.offsetWidth}px`;
    };
    syncSize();
    new ResizeObserver(syncSize).observe(slider);

    const move = e => {
        const rect = slider.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let x = clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width));

        const percent = (x / rect.width) * 100;

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
        active = true;
        didDrag = false;
        dragStartX = e.touches ? e.touches[0].clientX : e.clientX;
        move(e);
    };

    circle.addEventListener('mousedown', start);
    circle.addEventListener('touchstart', start, { passive: false });

    window.addEventListener('mouseup',   () => {
        if (!active) return;
        active = false;
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
    window.addEventListener('touchend',  () => {
        if (!active) return;
        active = false;
        if (didDrag) {
            slider.dataset.draggingJustNow = 'true';
            setTimeout(() => { delete slider.dataset.draggingJustNow; }, 180);
        }
    });
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
    const target  = document.getElementById('modal-slider-target');
    if (!overlay || !target) return;

    currentOriginalSlider = element;

    const clone = element.cloneNode(true);
    
    const zoomOverlay = clone.querySelector('.before-after-zoom-layer');
    if (zoomOverlay) zoomOverlay.remove();

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

    setupSlider(clone);
    lucide.createIcons();
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
    img.style.boxShadow = 'var(--shadow-main)';

    target.innerHTML = '';
    target.appendChild(img);
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Закрытие полноэкранного режима (клик по фону или крестику)
document.addEventListener('click', function(e) {
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
                const finalWidth  = clonedSlider.querySelector('.before-after-pane')?.style.width;
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

// Делегирование клика по слою полноэкранного зума
document.addEventListener('click', function(e) {
    const zoomOverlay = e.target.closest('.before-after-zoom-layer');
    if (zoomOverlay) {
        const slider = zoomOverlay.closest('.before-after-slider, [data-slider]');
        if (slider) {
            openFullscreen(slider);
        }
    }
});