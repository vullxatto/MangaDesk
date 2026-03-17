// Временный скрипт для гида
async function loadComponents() {
    const loadTags = document.querySelectorAll('load');
    
    for (const tag of loadTags) {
        const file = tag.getAttribute('='); // Получаем путь из атрибута
        if (file) {
            try {
                const response = await fetch(file);
                if (response.ok) {
                    const content = await response.text();
                    tag.outerHTML = content; // Заменяем тег <load> на контент файла
                } else {
                    console.error(`Ошибка загрузки: ${file}`);
                }
            } catch (err) {
                console.error(`Не удалось загрузить компонент: ${err}`);
            }
        }
    }
    // Переинициализируем иконки после загрузки хедера и футера
    if (window.lucide) {
        lucide.createIcons();
    }
}

// Запускаем загрузку сразу
loadComponents();

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