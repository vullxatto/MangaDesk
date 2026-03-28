import landingEngUrl from '../assets/landing_eng.jpg?url';
import landingRuUrl from '../assets/landing_ru.jpg?url';
import exampleGifUrl from '../assets/gif.jpg?url';
import examplePngUrl from '../assets/png.jpg?url';

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
    const card = e.target.closest(
        '#features .bento-grid-3 .bento-card, #features .bento-card[data-preview-fullscreen], #examples-page .examples-category-grid .bento-card'
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

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function exampleSliderCard(item, imgBefore, imgAfter) {
    const t = escapeHtml(item.title);
    const d = escapeHtml(item.desc);
    const srcBefore = escapeHtml(imgBefore);
    const srcAfter = escapeHtml(imgAfter);
    return `
          <div class="bento-card bento-card--slider-preview reveal">
            <div class="bento-visual">
              <div class="before-after-slider" data-slider>
                <img src="${srcAfter}" alt="После, ${t}">
                <div class="before-after-pane">
                  <img src="${srcBefore}" alt="До, ${t}">
                </div>
                <span class="before-after-label before-after-label--before">До</span>
                <span class="before-after-label before-after-label--after">После</span>
                <div class="before-after-divider">
                  <div class="before-after-grip">
                    <i data-lucide="move-horizontal" class="icon-20"></i>
                  </div>
                </div>
              </div>
            </div>
            <div class="bento-card-content">
              <h3 class="bento-title">${t}</h3>
              <p class="bento-text">${d}</p>
            </div>
          </div>`;
}

function initExamplesGrid() {
    const root = document.getElementById('examples-root');
    if (!root) return;

    const defaultImgBefore = landingEngUrl;
    const defaultImgAfter = landingRuUrl;

    /**
     * Категории и карточки примеров.
     * imgBefore / imgAfter: URL из import '../assets/...jpg?url' (иначе на GitHub Pages пути вида src/assets/... в dist не существуют).
     * У категории: defaultImgBefore, defaultImgAfter — те же правила.
     */
    const categories = [
        {
            id: 'examples-cat-clean',
            title: 'Клин и подготовка скана',
            subtitle: 'Очистка исходников, шумодав и подготовка страницы к переводу',
            items: [
                {
                    title: 'Очистка от артефактов',
                    desc: 'Убираем грязь, потёртости и следы сканирования без потери линий и штриховки',
                    imgBefore: exampleGifUrl,
                    imgAfter: examplePngUrl,
                },
                { title: 'Шумоподавление', desc: 'Настраиваемый шумодав снимает зернистость и мусор, сохраняя детали иллюстрации' },
                { title: 'Выравнивание тонов', desc: 'Более ровные блики и тени — текст и эффекты читаются предсказуемо на всей главе' },
            ],
        },
        {
            id: 'examples-cat-translate',
            title: 'Перевод и локализация',
            subtitle: 'Контекст, терминология и естественные реплики на русском',
            items: [
                { title: 'Контекстный перевод', desc: 'Учитываем сюжет, обращения и стиль речи персонажей от панели к панели' },
                { title: 'Глоссарий проекта', desc: 'Имена, локации и устойчивые формулировки остаются единообразными во всём томе' },
                { title: 'Адаптация идиом', desc: 'Метафоры и шутки переносим так, чтобы звучало по-русски, а не как дословный след оригинала' },
            ],
        },
        {
            id: 'examples-cat-type',
            title: 'Типографика и выдача',
            subtitle: 'Шрифты, контроль результата и готовый PSD для дальнейшей работы',
            items: [
                { title: 'Настройка типографики', desc: 'Шрифты, кегль и переносы в бабблах — с живым предпросмотром на странице' },
                { title: 'Контроль качества', desc: 'Правки в таблице перевода до сборки: в PSD попадает только согласованный вариант' },
                { title: 'Многослойный PSD', desc: 'Не склейка картинки, а рабочий файл со слоями для доработки в Photoshop' },
            ],
        },
    ];

    const resolveImages = (item, cat) => ({
        before: item.imgBefore ?? cat.defaultImgBefore ?? defaultImgBefore,
        after: item.imgAfter ?? cat.defaultImgAfter ?? defaultImgAfter,
    });

    root.innerHTML = categories
        .map(
            (cat) => `
    <section class="examples-category" aria-labelledby="${cat.id}">
      <div class="section-head examples-category-head">
        <h2 id="${cat.id}" class="examples-category-title">${escapeHtml(cat.title)}</h2>
        <p class="examples-category-subtitle">${escapeHtml(cat.subtitle)}</p>
      </div>
      <div class="examples-category-grid mb-24">
        ${cat.items.map((item) => {
        const { before, after } = resolveImages(item, cat);
        return exampleSliderCard(item, before, after);
    }).join('')}
      </div>
    </section>`
        )
        .join('');
}

// Анимация появления элементов при скролле (reveal)
document.addEventListener('DOMContentLoaded', () => {
    initExamplesGrid();

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