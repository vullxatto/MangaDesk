import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';
import { usePageMeta } from '../hooks/usePageMeta';
import { useReveal } from '../hooks/useReveal';
import { useTheme } from '../hooks/useTheme';

const beforeImage = new URL('../../assets/landing_eng.jpg', import.meta.url).href;
const afterImage = new URL('../../assets/landing_ru.jpg', import.meta.url).href;

const categories = [
  {
    title: 'Клин и подготовка скана',
    subtitle: 'Очистка исходников, шумодав и подготовка страницы к переводу',
    cards: [
      {
        title: 'Очистка от артефактов',
        text: 'Убираем грязь, потёртости и следы сканирования без потери линий и штриховки',
        afterAlt: 'После, очистка от артефактов',
        beforeAlt: 'До, очистка от артефактов',
      },
      {
        title: 'Шумоподавление',
        text: 'Настраиваемый шумодав снимает зернистость и мусор, сохраняя детали иллюстрации',
        afterAlt: 'После, шумоподавление',
        beforeAlt: 'До, шумоподавление',
      },
      {
        title: 'Выравнивание тонов',
        text: 'Более ровные блики и тени — текст и эффекты читаются предсказуемо на всей главе',
        afterAlt: 'После, выравнивание тонов',
        beforeAlt: 'До, выравнивание тонов',
      },
    ],
  },
  {
    title: 'Перевод и локализация',
    subtitle: 'Контекст, терминология и естественные реплики на русском',
    cards: [
      {
        title: 'Контекстный перевод',
        text: 'Учитываем сюжет, обращения и стиль речи персонажей от панели к панели',
        afterAlt: 'После, контекстный перевод',
        beforeAlt: 'До, контекстный перевод',
      },
      {
        title: 'Глоссарий проекта',
        text: 'Имена, локации и устойчивые формулировки остаются единообразными во всём томе',
        afterAlt: 'После, глоссарий проекта',
        beforeAlt: 'До, глоссарий проекта',
      },
      {
        title: 'Адаптация идиом',
        text: 'Метафоры и шутки переносим так, чтобы звучало по-русски, а не как дословный след оригинала',
        afterAlt: 'После, адаптация идиом',
        beforeAlt: 'До, адаптация идиом',
      },
    ],
  },
  {
    title: 'Типографика и выдача',
    subtitle: 'Шрифты, контроль результата и готовый PSD для дальнейшей работы',
    cards: [
      {
        title: 'Настройка типографики',
        text: 'Шрифты, кегль и переносы в бабблах — с живым предпросмотром на странице',
        afterAlt: 'После, настройка типографики',
        beforeAlt: 'До, настройка типографики',
      },
      {
        title: 'Контроль качества',
        text: 'Правки в таблице перевода до сборки: в PSD попадает только согласованный вариант',
        afterAlt: 'После, контроль качества',
        beforeAlt: 'До, контроль качества',
      },
      {
        title: 'Многослойный PSD',
        text: 'Не склейка картинки, а рабочий файл со слоями для доработки в Photoshop',
        afterAlt: 'После, многослойный PSD',
        beforeAlt: 'До, многослойный PSD',
      },
    ],
  },
];

export function ExamplesPage() {
  const { toggleTheme } = useTheme();
  usePageMeta('MangaDesk — Примеры работ');
  useReveal();

  return (
    <>
      <SiteHeader onToggleTheme={toggleTheme} />
      <main className="examples-page" id="examples-page">
        <div className="page-content">
          <div className="examples-head section-head">
            <h1 className="section-title">Примеры работ</h1>
            <p className="section-subtitle">Демонстрация возможностей сервиса по категориям</p>
          </div>

          <div id="examples-root" className="examples-categories">
            {categories.map((category) => (
              <section key={category.title} className="examples-category">
                <div className="section-head examples-category-head">
                  <h2 className="examples-category-title">{category.title}</h2>
                  <p className="examples-category-subtitle">{category.subtitle}</p>
                </div>
                <div className="examples-category-grid mb-24">
                  {category.cards.map((card) => (
                    <div key={`${category.title}-${card.title}`} className="bento-card bento-card--slider-preview reveal">
                      <div className="bento-visual">
                        <BeforeAfterSlider
                          beforeSrc={beforeImage}
                          afterSrc={afterImage}
                          beforeAlt={card.beforeAlt}
                          afterAlt={card.afterAlt}
                        />
                      </div>
                      <div className="bento-card-content">
                        <h3 className="bento-title">{card.title}</h3>
                        <p className="bento-text">{card.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
