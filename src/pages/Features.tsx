import { ChevronRight, Eye, EyeOff, Image, Layers, PenTool, Type } from 'lucide-react'
import { Link } from 'react-router-dom'
import landingEng from '../assets/images/landing_eng.jpg'
import landingRu from '../assets/images/landing_ru.jpg'
import { BeforeAfterSlider } from '../components/BeforeAfterSlider'

const FEATURE_BEFORE_SRC = landingRu
const FEATURE_AFTER_SRC = landingEng

const FEATURE_COMPARISON_SLIDERS: Array<{
  id: string
  title: string
  caption: string
  initialPosition: number
}> = [
  {
    id: 'context',
    title: 'Контекстный перевод',
    caption:
      'Наш сервис запоминает имена героев и названия локаций на протяжении всего проекта. Настраивайте единый глоссарий для неизменной терминологии.',
    initialPosition: 42,
  },
  {
    id: 'localization',
    title: 'Умная локализация',
    caption:
      'Сервис адаптирует под особенности русского языка метафоры и идиомы, сохраняя культурный контекст и эмоциональный окрас оригинала.',
    initialPosition: 50,
  },
  {
    id: 'graphics',
    title: 'Работа со сложной графикой',
    caption:
      'Сервис очищает звуковые эффекты и текст на детализированных фонах, сохраняя эстетику и детали оригинала.',
    initialPosition: 58,
  },
  {
    id: 'quality',
    title: 'Контроль качества',
    caption:
      'Вносите правки в таблице перевода до создания PSD-файла. Вы скачиваете только тот результат, в котором уверены на 100%.',
    initialPosition: 46,
  },
  {
    id: 'typography',
    title: 'Настройка типографики',
    caption:
      'Загружайте шрифты и настраивайте их в реальном времени. Предпросмотр фразы в баблах разного масштаба поможет найти идеальный баланс.',
    initialPosition: 54,
  },
  {
    id: 'denoise',
    title: 'Шумоподавление',
    caption:
      'Настраиваемый шумодав позволяет убрать артефакты и мусор с исходников, делая сканы чистыми и красивыми.',
    initialPosition: 48,
  },
]

export function Features() {
  return (
    <section className="features" id="features" aria-labelledby="features-title">
      <header className="features__header">
        <h2 className="features__title" id="features-title">
          ОБЗОР ВОЗМОЖНОСТЕЙ
        </h2>
        <p className="features__subtitle">Зачем мы Вам нужны?</p>
      </header>

      <div className="features__grid features__grid--two">
        <article className="features__card">
          <h3 className="features__card-title">Экономия времени</h3>
          <p className="features__card-text">
            Пока команда вручную переводит, клинит и тайпит главу несколько часов, мы выдаём готовый результат за считанные минуты. Масштабируйте выпуск контента без расширения команды
          </p>
        </article>
        <article className="features__card">
          <h3 className="features__card-title">Оптимизация процессов</h3>
          <p className="features__card-text">
            Вам больше не нужна целая цепочка людей на каждую главу. Весь цикл работы теперь замыкается на одном редакторе, который только корректирует работу сервиса
          </p>
        </article>
      </div>

      <article className="features__card features__card--wide">
        <div className="features__wide">
          <div className="features__wide-col features__wide-col--text">
            <h3 className="features__wide-title">PSD на выходе</h3>
            <p className="features__wide-text">
              Вы получаете не «склеенную» картинку, а полноценный рабочий файл со слоями. Редактируйте тайп, дорабатывайте клин или меняйте перевод прямо в Photoshop — мы даём базу, которую легко довести до идеала
            </p>
          </div>
          <div className="features__wide-col features__wide-col--mock" aria-hidden>
            <div className="features__psd">
              <div className="features__psd-head">
                <Layers size={16} strokeWidth={2} className="features__psd-head-icon" />
                <span className="features__psd-head-title">СЛОИ PHOTOSHOP (.PSD)</span>
              </div>
              <ul className="features__psd-list">
                <li className="features__psd-row">
                  <span className="features__psd-row-icon">
                    <Type size={14} strokeWidth={2} aria-hidden />
                  </span>
                  <span className="features__psd-row-label">ГРУППА: ТЕКСТ</span>
                  <Eye size={15} strokeWidth={2} className="features__psd-eye" aria-hidden />
                </li>
                <li className="features__psd-row">
                  <span className="features__psd-row-icon">
                    <PenTool size={14} strokeWidth={2} aria-hidden />
                  </span>
                  <span className="features__psd-row-label">СЛОЙ: КЛИН</span>
                  <Eye size={15} strokeWidth={2} className="features__psd-eye" aria-hidden />
                </li>
                <li className="features__psd-row features__psd-row--original">
                  <span className="features__psd-row-icon">
                    <Image size={14} strokeWidth={2} aria-hidden />
                  </span>
                  <span className="features__psd-row-label">СЛОЙ: ОРИГИНАЛ</span>
                  <EyeOff size={15} strokeWidth={2} className="features__psd-eye features__psd-eye--off" aria-hidden />
                </li>
              </ul>
            </div>
          </div>
        </div>
      </article>

      <div className="features__extras">
        <div className="features__extras-sliders" aria-label="Примеры сравнения до и после по возможностям сервиса">
          {FEATURE_COMPARISON_SLIDERS.map((item) => (
            <section key={item.id} className="features__extras-slider-section">
              <h3 className="features__extras-slider-title">{item.title}</h3>
              <BeforeAfterSlider
                beforeSrc={FEATURE_BEFORE_SRC}
                afterSrc={FEATURE_AFTER_SRC}
                altBefore="RU (до)"
                altAfter="EN (после)"
                caption={item.caption}
                initialPosition={item.initialPosition}
              />
            </section>
          ))}
        </div>

        <div className="features__grid features__grid--bottom">
          <article className="features__card features__card--builder">
            <h3 className="features__card-title">Гибкий конструктор процессов</h3>
            <p className="features__card-text">
            Используйте сервис так, как удобно Вам: делегируйте полный цикл «под ключ» или выбирайте отдельные этапы
            </p>
            <p className="features__card-note">
            Стоимость каждой отдельной главы определяется динамически, в зависимости от выбранного набора функций и процессов
            </p>
          </article>
          <article className="features__card features__card--side-top">
            <h3 className="features__card-title">Доступность для всех</h3>
            <p className="features__card-text">
            Мы максимально снизили стоимость, чтобы автоматизация была доступна как крупным командам, так и соло-переводчикам
            </p>
          </article>
          <div className="features__more-host">
            <Link className="features__card features__card--more" to="/examples">
              <span className="features__more-row">
                <span>Больше примеров</span>
                <ChevronRight size={20} strokeWidth={2} aria-hidden />
              </span>
            </Link>
          </div>
        </div>

        <div className="features__continuation">
          <article className="features__card features__card--fullwidth">
            <h3 className="features__card-title">Единый личный кабинет</h3>
            <p className="features__card-text">
            Все ваши проекты, главы, статистика, выдачи задач участникам команды и многое другое в одном месте. Мы предоставляем полноценную рабочую среду
            </p>
            <p className="features__card-note">
            Оплату производит только создатель команды. Участники получают доступ бесплатно после приглашения
            </p>
          </article>
          <div className="features__grid features__grid--two">
            <article className="features__card">
              <h3 className="features__card-title">Длина холстов 30к</h3>
              <p className="features__card-text">
              Автоматическая склейка страниц. Работайте с любым форматом вебтунов без ограничений
              </p>
            </article>
            <article className="features__card">
              <h3 className="features__card-title">Параллельная обработка</h3>
              <p className="features__card-text">
              Загружайте сразу несколько глав — система обработает их одновременно, экономя часы ожидания
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}
