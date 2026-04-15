import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronDown,
  Cpu,
  Eye,
  EyeOff,
  FileArchive,
  FileOutput,
  Files,
  Flame,
  Heart,
  Image,
  Layers2,
  Link2,
  Ticket,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';
import { usePageMeta } from '../hooks/usePageMeta';
import { useReveal } from '../hooks/useReveal';
import { useTheme } from '../hooks/useTheme';

const beforeImage = new URL('../../assets/landing_eng.jpg', import.meta.url).href;
const afterImage = new URL('../../assets/landing_ru.jpg', import.meta.url).href;

export function HomePage() {
  const { toggleTheme } = useTheme();
  const [faqOpen, setFaqOpen] = useState(false);

  usePageMeta('MangaDesk — Инструмент для автоматизации перевода');
  useReveal();

  return (
    <>
      <SiteHeader showNav onToggleTheme={toggleTheme} />
      <main>
        <section className="hero">
          <div className="page-content hero-content">
            <div className="hero-badge">
              <span className="hero-dot" aria-hidden="true" />
              <span className="hero-badge-text">Новое поколение перевода</span>
            </div>
            <h1 className="hero-title">
              Переводите главы за секунды с сохранением <span className="text-gradient">слоёв в PSD</span>
            </h1>
            <p className="hero-subtitle">Мы экономим ваше время, чтобы вы занимались творчеством, а не рутиной</p>
            <div className="hero-actions">
              <Link className="btn-primary hero-cta" to="/auth" role="button">
                начать работу
              </Link>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="how-it-works-section">
          <div className="page-content">
            <div className="section-card reveal">
              <h2 className="section-title section-title--in-card">Как это работает</h2>
              <div className="steps-grid">
                <div className="step">
                  <div className="step-number">01</div>
                  <div className="step-icon-wrapper">
                    <FileArchive className="step-icon-svg" />
                  </div>
                  <h3 className="step-title">Загрузите ZIP</h3>
                  <p className="step-description">Перетащите архив с оригинальными сканами. Мы поддерживаем все популярные форматы изображений</p>
                </div>
                <div className="step">
                  <div className="step-number">02</div>
                  <div className="step-icon-wrapper">
                    <Cpu className="step-icon-svg" />
                  </div>
                  <h3 className="step-title">Обработка</h3>
                  <p className="step-description">Наш сервис автоматически клинит фон, переводит и тайпит текст на русском языке</p>
                </div>
                <div className="step">
                  <div className="step-number">03</div>
                  <div className="step-icon-wrapper">
                    <Layers2 className="step-icon-svg" />
                  </div>
                  <h3 className="step-title">Скачайте PSD</h3>
                  <p className="step-description">Получите готовый архив с PSD, где оригинал, клин и текст разнесены по отдельным слоям</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="bento-section">
          <div className="page-content">
            <div className="section-head bento-head-margin">
              <h2 className="section-title bento-title-main">Обзор возможностей</h2>
              <p className="section-subtitle bento-subtitle">Зачем мы Вам нужны?</p>
            </div>
            <div className="bento-grid-2 mb-24">
              <div className="bento-card reveal">
                <div className="bento-card-content">
                  <h3 className="bento-title">Экономия времени</h3>
                  <p className="bento-text">
                    Пока команда вручную переводит, клинит и тайпит главу несколько часов, мы выдаём готовый результат
                    за считанные минуты. Масштабируйте выпуск контента без расширения команды.
                  </p>
                </div>
              </div>
              <div className="bento-card reveal">
                <div className="bento-card-content">
                  <h3 className="bento-title">Оптимизация процессов</h3>
                  <p className="bento-text">
                    Вам больше не нужна целая цепочка людей на каждую главу. Весь цикл работы теперь замыкается на
                    одном редакторе, который только корректирует работу сервиса.
                  </p>
                </div>
              </div>
            </div>
            <div className="bento-card bento-psd-card mb-24 reveal">
              <div className="psd-card-content">
                <h2 className="bento-title-lg">PSD на выходе</h2>
                <p className="bento-text">
                  Вы получаете не «склеенную» картинку, а полноценный рабочий файл со слоями. Редактируйте тайп,
                  дорабатывайте клин или меняйте перевод прямо в Photoshop — мы даём базу, которую легко довести до
                  идеала.
                </p>
              </div>
              <div className="psd-card-visual">
                <div className="psd-layers-panel mock-shadow">
                  <div className="psd-layers-panel-head">
                    <Layers2 className="psd-layers-panel-head-icon" />
                    <span className="psd-layers-panel-head-label">Слои Photoshop (.PSD)</span>
                  </div>
                  <div className="psd-layers-panel-rows">
                    <div className="psd-layers-row">
                      <div className="psd-layers-row-main">
                        <div className="psd-layers-row-thumb psd-layers-row-thumb--text">
                          <span className="psd-layers-row-thumb-letter">T</span>
                        </div>
                        <span className="psd-layers-row-label">Группа: Текст</span>
                      </div>
                      <Eye className="psd-layers-row-eye" />
                    </div>
                    <div className="psd-layers-row">
                      <div className="psd-layers-row-main">
                        <div className="psd-layers-row-thumb psd-layers-row-thumb--clean">
                          <Link2 className="psd-layers-row-thumb-svg" />
                        </div>
                        <span className="psd-layers-row-label">Слой: Клин</span>
                      </div>
                      <Eye className="psd-layers-row-eye" />
                    </div>
                    <div className="psd-layers-row psd-layers-row--inactive">
                      <div className="psd-layers-row-main">
                        <div className="psd-layers-row-thumb psd-layers-row-thumb--original">
                          <Image className="psd-layers-row-thumb-svg" />
                        </div>
                        <span className="psd-layers-row-label">Слой: Оригинал</span>
                      </div>
                      <EyeOff className="psd-layers-row-eye-off" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bento-grid-3 mb-24">
              <div className="bento-card reveal">
                <div className="bento-visual">
                  <BeforeAfterSlider beforeSrc={beforeImage} afterSrc={afterImage} beforeAlt="До" afterAlt="После" />
                </div>
                <div className="bento-card-content">
                  <h3 className="bento-title">Контекстный перевод</h3>
                  <p className="bento-text">
                    Наш сервис запоминает имена героев и названия локаций на протяжении всего проекта. Настраивайте
                    единый глоссарий для неизменной терминологии.
                  </p>
                </div>
              </div>
              <div className="bento-card reveal">
                <div className="bento-visual">
                  <BeforeAfterSlider beforeSrc={beforeImage} afterSrc={afterImage} beforeAlt="До" afterAlt="После" />
                </div>
                <div className="bento-card-content">
                  <h3 className="bento-title">Умная локализация</h3>
                  <p className="bento-text">
                    Сервис адаптирует под особенности русского языка метафоры и идиомы, сохраняя культурный контекст и
                    эмоциональный окрас оригинала.
                  </p>
                </div>
              </div>
              <div className="bento-card bento-card--slider-preview reveal">
                <div className="bento-visual">
                  <BeforeAfterSlider beforeSrc={beforeImage} afterSrc={afterImage} beforeAlt="До" afterAlt="После" />
                </div>
                <div className="bento-card-content">
                  <h3 className="bento-title">Работа со сложной графикой</h3>
                  <p className="bento-text">
                    Сервис очищает звуковые эффекты и текст на детализированных фонах, сохраняя эстетику и детали
                    оригинала.
                  </p>
                </div>
              </div>
              <div className="bento-card reveal">
                <div className="bento-visual">
                  <BeforeAfterSlider beforeSrc={beforeImage} afterSrc={afterImage} beforeAlt="До" afterAlt="После" />
                </div>
                <div className="bento-card-content">
                  <h3 className="bento-title">Контроль качества</h3>
                  <p className="bento-text">
                    Вносите правки в таблице перевода до создания PSD-файла. Вы скачиваете только тот результат, в
                    котором уверены на 100%.
                  </p>
                </div>
              </div>
              <div className="bento-card reveal">
                <div className="bento-visual">
                  <BeforeAfterSlider beforeSrc={beforeImage} afterSrc={afterImage} beforeAlt="До" afterAlt="После" />
                </div>
                <div className="bento-card-content">
                  <h3 className="bento-title">Настройка типографики</h3>
                  <p className="bento-text">
                    Загружайте шрифты и настраивайте их в реальном времени. Предпросмотр фразы в баблах разного
                    масштаба поможет найти идеальный баланс.
                  </p>
                </div>
              </div>
              <div className="bento-card bento-card--slider-preview reveal">
                <div className="bento-visual">
                  <BeforeAfterSlider beforeSrc={beforeImage} afterSrc={afterImage} beforeAlt="До" afterAlt="После" />
                </div>
                <div className="bento-card-content">
                  <h3 className="bento-title">Шумоподавление</h3>
                  <p className="bento-text">
                    Настраиваемый шумодав позволяет убрать артефакты и мусор с исходников, делая сканы чистыми и
                    красивыми.
                  </p>
                </div>
              </div>
            </div>

            <div className="bento-layout">
              <div className="bento-card col-span-8 reveal">
                <div className="bento-card-content p-8-lg">
                  <div className="mb-16">
                    <h3 className="bento-title">Гибкий конструктор процессов</h3>
                  </div>
                  <p className="bento-text mb-24 text-md">
                    Используйте сервис так, как удобно Вам: делегируйте полный цикл «под ключ» или выбирайте отдельные
                    этапы.
                  </p>
                  <div className="bento-note mt-auto">
                    Стоимость каждой отдельной главы определяется динамически, в зависимости от выбранного набора
                    функций и процессов.
                  </div>
                </div>
              </div>
              <div className="col-span-4 flex-col-gap">
                <div className="bento-card reveal">
                  <div className="bento-card-content p-8-lg">
                    <h3 className="bento-title">Доступность для всех</h3>
                    <p className="bento-text mt-auto">
                      Мы максимально снизили стоимость, чтобы автоматизация была доступна как крупным командам, так и
                      соло-переводчикам.
                    </p>
                  </div>
                </div>
                <Link to="/examples" className="bento-card bento-link-card reveal">
                  <div className="bento-card-content p-8-lg">
                    <span className="bento-link-card-label">Больше примеров</span>
                    <ArrowRight className="bento-link-card-icon" />
                  </div>
                </Link>
              </div>
              <div className="bento-card col-span-12 reveal">
                <div className="bento-card-content">
                  <div className="mb-16">
                    <h3 className="bento-title">Единый личный кабинет</h3>
                  </div>
                  <p className="bento-text mb-16 text-md">
                    Все ваши проекты, главы, статистика, выдачи задач участникам команды и многое другое в одном
                    месте. Мы предоставляем полноценную рабочую среду.
                  </p>
                  <div className="bento-note mb-24">
                    Оплату производит только создатель команды. Участники получают доступ бесплатно после приглашения.
                  </div>
                </div>
              </div>
              <div className="col-span-12">
                <div className="bento-grid-2">
                  <div className="bento-card reveal">
                    <div className="bento-card-content">
                      <h3 className="bento-title">Длина холстов 30к</h3>
                      <p className="bento-text mt-auto">
                        Автоматическая склейка страниц. Работайте с любым форматом вебтунов без ограничений.
                      </p>
                    </div>
                  </div>
                  <div className="bento-card reveal">
                    <div className="bento-card-content">
                      <h3 className="bento-title">Параллельная обработка</h3>
                      <p className="bento-text mt-auto">
                        Загружайте сразу несколько глав — система обработает их одновременно, экономя часы ожидания.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="pricing-section">
          <div className="page-content">
            <div className="pricing-grid">
              <div className="pricing-card">
                <div className="pricing-card-header">
                  <span className="pricing-plan-name">Стартовый</span>
                </div>
                <div className="pricing-price">
                  <span className="price">0</span>
                  <span className="currency">₽</span>
                  <span className="period">/ мес</span>
                </div>
                <ul className="pricing-features">
                  <li>
                    <Check className="check-icon" /> 100 000 Токенов
                  </li>
                  <li>
                    <FileOutput className="check-icon" /> Экспорт в PSD
                  </li>
                  <li>
                    <AlertCircle className="check-icon" /> Водяной знак
                  </li>
                </ul>
                <Link to="/auth" className="pricing-btn secondary">
                  Оформить
                </Link>
              </div>
              <div className="pricing-card featured">
                <div className="pricing-card-header">
                  <span className="pricing-plan-name">Максимум</span>
                </div>
                <div className="pricing-price">
                  <span className="price">2 300</span>
                  <span className="currency">₽</span>
                  <span className="period">/ мес</span>
                </div>
                <ul className="pricing-features">
                  <li>
                    <Check className="check-icon" /> 20 000 000 Токенов
                  </li>
                  <li>
                    <Files className="check-icon" /> Параллельная обработка глав
                  </li>
                  <li>
                    <Flame className="check-icon" /> Приоритет в очереди
                  </li>
                  <li className="note">Включает всё из «Стандартного»</li>
                </ul>
                <Link to="/auth" className="pricing-btn primary">
                  Оформить
                </Link>
              </div>
              <div className="pricing-card">
                <div className="pricing-card-header">
                  <span className="pricing-plan-name">Стандартный</span>
                </div>
                <div className="pricing-price">
                  <span className="price">1 500</span>
                  <span className="currency">₽</span>
                  <span className="period">/ мес</span>
                </div>
                <ul className="pricing-features">
                  <li>
                    <Check className="check-icon" /> 7 500 000 Токенов
                  </li>
                  <li>
                    <Users className="check-icon" /> Создание команд
                  </li>
                  <li>
                    <Heart className="check-icon" /> Без водяного знака
                  </li>
                  <li className="note">Включает всё из «Стартового»</li>
                </ul>
                <Link to="/auth" className="pricing-btn secondary">
                  Оформить
                </Link>
              </div>
            </div>
            <div className="pricing-promo reveal">
              <Link to="/auth" className="pricing-promo-link">
                <Ticket className="pricing-promo-link-icon" /> У меня есть промокод
              </Link>
            </div>
          </div>
        </section>

        <section id="faq" className="faq-section">
          <div className="page-content">
            <div className="section-head faq-section-head">
              <h2 className="section-title faq-section-title">Частые вопросы</h2>
            </div>
            <div className="faq-list reveal">
              <div className={`faq-item ${faqOpen ? 'is-open' : ''}`}>
                <button
                  type="button"
                  className="faq-question"
                  aria-expanded={faqOpen}
                  aria-controls="faq-answer-1"
                  id="faq-trigger-1"
                  onClick={() => setFaqOpen((value) => !value)}
                >
                  <span className="faq-question-text">Какие языки поддерживаются?</span>
                  <ChevronDown className="faq-chevron" />
                </button>
                <div className="faq-answer" id="faq-answer-1" role="region" aria-labelledby="faq-trigger-1" hidden={!faqOpen}>
                  Мы поддерживаем распознавание с английского, японского, китайского и корейского языков. Перевод
                  осуществляется на русский язык с использованием специализированных моделей, понимающих контекст
                  проекта.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
