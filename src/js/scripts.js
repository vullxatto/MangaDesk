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

// Иконки
window.lucide?.createIcons?.();






// ─── Логика слайдера (скопирована из oldscript.js без изменений) ─────────────
function setupSlider(slider) {
    const beforeOverlay = slider.querySelector('.before-overlay');
    const beforeImg     = beforeOverlay?.querySelector('img');
    const handle        = slider.querySelector('.handle');
    const circle        = slider.querySelector('.handle-circle');
    const badgeBefore   = slider.querySelector('.badge-before');
    const badgeAfter    = slider.querySelector('.badge-after');

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

    const start = e => {
        e.preventDefault();
        e.stopPropagation();
        active = true;
        move(e);
    };

    circle.addEventListener('mousedown', start);
    circle.addEventListener('touchstart', start, { passive: false });

    window.addEventListener('mouseup',   () => { active = false; });
    window.addEventListener('mousemove', e => active && move(e));
    window.addEventListener('touchend',  () => { active = false; });
    window.addEventListener('touchmove', e => {
        if (active) {
            e.preventDefault();
            move(e);
        }
    }, { passive: false });
}

// ─── Полноэкранный просмотр (скопировано из old без изменений) ───────────────
let currentOriginalSlider = null;

function openFullscreen(element) {
    const overlay = document.getElementById('modal-overlay');
    const target  = document.getElementById('modal-slider-target');
    if (!overlay || !target) return;

    currentOriginalSlider = element;

    const clone = element.cloneNode(true);
    
    const zoomOverlay = clone.querySelector('.zoom-overlay');
    if (zoomOverlay) zoomOverlay.remove();

    clone.style.cursor = 'default';
    clone.style.width = '100%';
    clone.style.maxWidth = '640px';
    clone.style.height = 'auto';
    clone.style.aspectRatio = '3/4';
    clone.style.margin = '0 auto';

    const originalWidth = element.querySelector('.before-overlay')?.style.width;
    const originalHandle = element.querySelector('.handle')?.style.left;
    if (originalWidth) {
        clone.querySelector('.before-overlay').style.width = originalWidth;
        clone.querySelector('.handle').style.left = originalHandle;
    }

    target.innerHTML = '';
    target.appendChild(clone);

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    setupSlider(clone);
    lucide.createIcons();
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
            const clonedSlider = target.querySelector('.comparison-container, [data-slider]');

            if (clonedSlider) {
                const finalWidth  = clonedSlider.querySelector('.before-overlay')?.style.width;
                const finalHandle = clonedSlider.querySelector('.handle')?.style.left;

                if (finalWidth && finalHandle) {
                    currentOriginalSlider.querySelector('.before-overlay').style.width = finalWidth;
                    currentOriginalSlider.querySelector('.handle').style.left = finalHandle;
                }
            }
        }

        overlay.classList.remove('active');
        document.body.style.overflow = '';
        currentOriginalSlider = null;
    }
});

// ─── Инициализация слайдера на странице ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.comparison-container, [data-slider]').forEach(slider => {
        setupSlider(slider);
    });
    lucide.createIcons();
});

// Делегирование клика по zoom-overlay
document.addEventListener('click', function(e) {
    const zoomOverlay = e.target.closest('.zoom-overlay');
    if (zoomOverlay) {
        const slider = zoomOverlay.closest('.comparison-container, [data-slider]');
        if (slider) {
            openFullscreen(slider);
        }
    }
});