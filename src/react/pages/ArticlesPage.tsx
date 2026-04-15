import { Eraser, Info, Languages, Type } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';
import { usePageMeta } from '../hooks/usePageMeta';
import { useTheme } from '../hooks/useTheme';

const sections = [
  { id: 'general', title: 'Общая часть', icon: Info },
  { id: 'translators', title: 'Для переводчиков', icon: Languages },
  { id: 'cleaners', title: 'Для клинеров', icon: Eraser },
  { id: 'typers', title: 'Для тайперов', icon: Type },
] as const;

export function ArticlesPage() {
  const { toggleTheme } = useTheme();
  const [active, setActive] = useState('general');
  usePageMeta('MangaDesk — Статьи', 'articles-body');

  useEffect(() => {
    const handle = () => {
      const offset = 140;
      const reversed = [...sections].reverse();
      const current = reversed.find((section) => {
        const element = document.getElementById(section.id);
        return element ? element.getBoundingClientRect().top <= offset : false;
      });
      setActive(current ? current.id : 'general');
    };
    window.addEventListener('scroll', handle, { passive: true });
    window.addEventListener('resize', handle);
    handle();
    return () => {
      window.removeEventListener('scroll', handle);
      window.removeEventListener('resize', handle);
    };
  }, []);

  const sidebar = useMemo(
    () =>
      sections.map((section) => {
        const Icon = section.icon;
        return (
          <a key={section.id} href={`#${section.id}`} className={`articles-toc-main ${active === section.id ? 'active' : ''}`}>
            <Icon />
            <span>{section.title}</span>
          </a>
        );
      }),
    [active],
  );

  return (
    <>
      <SiteHeader onToggleTheme={toggleTheme} />
      <main className="articles-page" id="articles-page">
        <div className="page-content articles-layout">
          <aside className="articles-sidebar" aria-label="Навигация по статье">
            <p className="articles-sidebar-title">Содержание</p>
            <nav className="articles-toc" id="articles-toc-nav">
              {sidebar[0]}
              <a href="#general" className={`articles-toc-sub ${active === 'general' ? 'active' : ''}`}>
                О проекте и правила
              </a>

              {sidebar[1]}
              <div className="articles-toc-children">
                <a href="#translators" className={active === 'translators' ? 'active' : ''}>
                  Сверка терминов
                </a>
                <a href="#translators" className={active === 'translators' ? 'active' : ''}>
                  Передача интонаций
                </a>
                <a href="#translators" className={active === 'translators' ? 'active' : ''}>
                  Контроль смысла
                </a>
              </div>

              {sidebar[2]}
              <div className="articles-toc-children">
                <a href="#cleaners" className={active === 'cleaners' ? 'active' : ''}>
                  Очистка фона
                </a>
                <a href="#cleaners" className={active === 'cleaners' ? 'active' : ''}>
                  Шумы и артефакты
                </a>
                <a href="#cleaners" className={active === 'cleaners' ? 'active' : ''}>
                  Подготовка к тайпу
                </a>
              </div>

              {sidebar[3]}
              <div className="articles-toc-children">
                <a href="#typers" className={active === 'typers' ? 'active' : ''}>
                  Формы расположения
                </a>
                <a href="#typers" className={active === 'typers' ? 'active' : ''}>
                  Размеры текста
                </a>
                <a href="#typers" className={active === 'typers' ? 'active' : ''}>
                  Экспорт финала
                </a>
              </div>
            </nav>
          </aside>
          <div className="articles-content">
            <header className="articles-head">
              <p className="articles-kicker">Руководство по вёрстке статьи</p>
              <h1 className="articles-title">Заготовка для написания статей</h1>
              <p className="articles-lead">
                Этот шаблон нужен для визуализации структуры: длинные абзацы, заметки, списки и врезки. Текст пока
                символический и служит ориентиром для будущего наполнения.
              </p>
            </header>
            <section className="article-block" id="general">
              <h2>Общая</h2>
              <p>
                Символический абзац: здесь будет вводная часть о цели статьи, о контексте и о том, зачем читателю
                переходить к следующим разделам. Пока это черновой текст для проверки отступов.
              </p>
              <p>
                Ещё один абзац-заполнитель: аккуратная длина строки, комфортный интерлиньяж и спокойный ритм чтения.
                Такой блок позволяет быстро оценить визуальный тон страницы.
              </p>
            </section>
            <section className="article-block" id="translators">
              <h2>Для переводчиков</h2>
              <p>
                Здесь будет описание композиции: как чередовать короткие и длинные абзацы, где ставить промежуточные
                подзаголовки и как удерживать внимание на протяжении всего материала.
              </p>
              <blockquote className="article-note">
                Врезка-примечание: этот блок выделяет важную мысль или быстрый совет, который должен читаться отдельно
                от основного потока текста.
              </blockquote>
              <p>
                Символический текст для проверки длинного фрагмента. Символический текст для проверки длинного
                фрагмента. Символический текст для проверки длинного фрагмента.
              </p>
            </section>
            <section className="article-block" id="cleaners">
              <h2>Для клинеров</h2>
              <p>Для визуализации разных форматов можно использовать:</p>
              <ul className="article-list">
                <li>маркированные списки с короткими тезисами;</li>
                <li>врезки с акцентом на ключевой мысли;</li>
                <li>небольшие карточки-пояснения для терминов.</li>
              </ul>
              <div className="article-grid">
                <article className="article-mini-card">
                  <h3>Карточка A</h3>
                  <p>Короткий фрагмент текста-заполнителя для блока с быстрым пояснением.</p>
                </article>
                <article className="article-mini-card">
                  <h3>Карточка B</h3>
                  <p>Второй пример карточки: можно хранить примеры, термины или ссылки.</p>
                </article>
              </div>
            </section>
            <section className="article-block" id="typers">
              <h2>Для тайперов</h2>
              <p>
                Этот раздел нужен для визуальной проверки иерархии: заголовок первого уровня, заголовок второго
                уровня, обычный параграф, подписи и вспомогательные элементы интерфейса.
              </p>
              <p className="article-muted">Вспомогательная подпись: символический текст для второстепенной информации.</p>
              <p>
                Здесь позже появятся реальные примеры из редактуры: как переносить реплики, как строить абзацы в
                сложных баблах и как избегать визуальной перегрузки.
              </p>
              <p>Технический текст-заполнитель, технический текст-заполнитель, технический текст-заполнитель.</p>
              <h3>Итоговый чеклист</h3>
              <ul className="article-checklist">
                <li>Проверить читабельность на десктопе и мобильном.</li>
                <li>Согласовать стиль заголовков и подзаголовков.</li>
                <li>Убедиться, что врезки не конфликтуют с основным текстом.</li>
                <li>Заполнить блоки реальным контентом после утверждения шаблона.</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
