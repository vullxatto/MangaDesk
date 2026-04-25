import {
  ChevronRight,
  Eye,
  EyeOff,
  Image,
  Layers,
  PenTool,
  Type,
  X,
} from 'lucide-react'
import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import catImage from '../assets/images/cat.png'
import cat2Image from '../assets/images/cat2.png'
import cat3Image from '../assets/images/cat3.png'
import landingEng from '../assets/images/landing_eng.jpg'
import landingRu from '../assets/images/landing_ru.jpg'
import { BeforeAfterSlider } from '../components/BeforeAfterSlider'

const FEATURE_BEFORE_SRC = landingRu
const FEATURE_AFTER_SRC = landingEng

/** Горизонтальная заглушка для «Контроль качества». */
const PLACEHOLDER_IMG_QUALITY_WIDE =
  'https://picsum.photos/seed/mangadesk-quality-wide/1200/675'

/** Горизонтальная заглушка для «Единый личный кабинет». */
const PLACEHOLDER_IMG_CABINET =
  'https://picsum.photos/seed/mangadesk-cabinet/1200/675'

/** Заглушка для блока «Для личного чтения». */
const PLACEHOLDER_IMG_READER =
  'https://picsum.photos/seed/mangadesk-reader/1200/675'

const FEATURE_COMPARISON_SLIDERS: Array<{
  id: string
  title: string
  caption: string
  initialPosition?: number
  /** Одна картинка вместо слайдера «до/после». */
  staticImageSrc?: string
  /** Горизонтальное превью (16∶9). */
  staticImageLandscape?: boolean
  /** Только заголовок и текст, без превью. */
  textOnly?: boolean
  /** Горизонтальное превью на две колонки сетки (рядом с предыдущей карточкой). */
  wideImageSpan2?: boolean
  /** Второй текстовый блок под первым (та же колонка сетки). */
  pairedTextBelow?: { title: string; caption: string }
}> = [
  {
    id: 'reader',
    title: 'Читательский режим',
    caption:
      'Сервисом может пользоваться и обычный читатель: загрузите ZIP и получите перевод с эффектом glass — без выгрузки в Photoshop и без шагов для публикации главы на сайт. Релиз не обязателен: можно открыть результат только ради того, чтобы самому прочитать мангу.',
    staticImageSrc: PLACEHOLDER_IMG_READER,
    staticImageLandscape: true,
    wideImageSpan2: true,
  },
  {
    id: 'typography',
    title: 'Настройка типографики',
    caption:
      'Загружайте шрифты и настраивайте их в реальном времени. Предпросмотр фразы в баблах разного масштаба поможет найти идеальный баланс.',
    textOnly: true,
    pairedTextBelow: {
      title: 'Контекстный перевод',
      caption:
        'Наш сервис запоминает имена героев и названия локаций на протяжении всего проекта. Настраивайте единый глоссарий для неизменной терминологии.',
    },
  },
  {
    id: 'localization',
    title: 'Умная локализация',
    caption:
      'Сервис адаптирует под особенности русского языка метафоры и идиомы, сохраняя культурный контекст и эмоциональный окрас оригинала.',
    initialPosition: 50,
  },
  {
    id: 'quality',
    title: 'Контроль качества',
    caption:
      'Вносите правки в таблице перевода до создания PSD-файла. Вы скачиваете только тот результат, в котором уверены на 100%.',
    staticImageSrc: PLACEHOLDER_IMG_QUALITY_WIDE,
    staticImageLandscape: true,
    wideImageSpan2: true,
  },
  {
    id: 'denoise',
    title: 'Шумоподавление',
    caption:
      'Настраиваемый шумодав позволяет убрать артефакты и мусор с исходников, делая сканы чистыми и красивыми.',
    initialPosition: 48,
  },
  {
    id: 'graphics',
    title: 'Работа со сложной графикой',
    caption:
      'Сервис очищает звуковые эффекты и текст на детализированных фонах, сохраняя эстетику и детали оригинала.',
    initialPosition: 58,
  },
  {
    id: 'zip-raw',
    title: 'Архивы без подготовки',
    caption:
      'Загружайте ZIP с сырыми сканами: обрывы посреди реплик или, наоборот, чрезмерно крупные страницы — сервис сам нарежет кадры и приведёт исходники к виду, удобному для перевода и вёрстки.',
    textOnly: true,
    pairedTextBelow: {
      title: 'Доступность для всех',
      caption:
        'Мы максимально снизили стоимость, чтобы автоматизация была доступна как крупным командам, так и соло-переводчикам',
    },
  },
]

function FeaturesProcessParamsMock() {
  const [cleanSounds, setCleanSounds] = useState(false)
  const [typeSounds, setTypeSounds] = useState(false)
  const base = 600
  const cleanCost = 120
  const typeCost = 120
  const total = base + (cleanSounds ? cleanCost : 0) + (typeSounds ? typeCost : 0)

  return (
    <div className="features__psd features__process-params">
      <div className="features__process-params-header">
        <div className="features__process-params-header-main">
          <p className="features__process-params-heading">Параметры обработки</p>
          <p className="features__process-params-file">Bleach_145.zip</p>
        </div>
        <span className="features__process-params-close" aria-hidden>
          <X size={17} strokeWidth={2} />
        </span>
      </div>
      <div className="features__process-params-body">
        <label className="features__process-params-row">
          <input
            type="checkbox"
            className="features__process-params-checkbox"
            checked={cleanSounds}
            onChange={(e) => setCleanSounds(e.target.checked)}
          />
          <span className="features__process-params-label">Клинить звуки?</span>
          <span className="features__process-params-tokens">{cleanCost} ток.</span>
        </label>
        <label className="features__process-params-row">
          <input
            type="checkbox"
            className="features__process-params-checkbox"
            checked={typeSounds}
            onChange={(e) => setTypeSounds(e.target.checked)}
          />
          <span className="features__process-params-label">Тайпить звуки?</span>
          <span className="features__process-params-tokens">{typeCost} ток.</span>
        </label>
      </div>
      <div className="features__process-params-footer">
        <span className="features__process-params-total">Всего: {total} ток.</span>
        <span className="btn-press-wrap btn-press-wrap--design features__process-params-cta-wrap">
          <button type="button" className="btn-press features__process-params-cta">
            Отправить в обработку
          </button>
        </span>
      </div>
    </div>
  )
}

function FeatureTextOnlyCard({
  heading,
  caption,
  bottomRightDecorSrc,
}: {
  heading: string
  caption: string
  bottomRightDecorSrc?: string
}) {
  const id = useId()
  const headingId = `${id}-heading`
  return (
    <figure className="before-after" aria-labelledby={headingId}>
      <div
        className={[
          'before-after__card',
          'before-after__card--text-only',
          bottomRightDecorSrc ? 'before-after__card--with-bottom-right-decor' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <h3 className="features__extras-text-only-title features__card-title" id={headingId}>
          {heading}
        </h3>
        <p id={`${id}-cap`} className="features__extras-text-only-body">
          {caption}
        </p>
        {bottomRightDecorSrc ? (
          <span className="features__bottom-right-decor" aria-hidden>
            <img
              className="features__bottom-right-decor-img"
              src={bottomRightDecorSrc}
              alt=""
              draggable={false}
            />
          </span>
        ) : null}
      </div>
    </figure>
  )
}

function FeatureStaticImageCard({
  heading,
  caption,
  src,
  landscape,
  note,
  topDecorSrc,
  leftDecorSrc,
}: {
  heading: string
  caption: string
  src: string
  landscape?: boolean
  /** Второй блок текста (как «примечание» в карточках features). */
  note?: string
  /** Декоративная картинка, которая крепится над заголовком. */
  topDecorSrc?: string
  /** Декоративная картинка слева от карточки. */
  leftDecorSrc?: string
}) {
  const id = useId()
  const headingId = `${id}-heading`
  const viewportClass = [
    'before-after__viewport',
    'before-after__viewport--static',
    landscape ? 'before-after__viewport--landscape' : '',
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <figure
      className={[
        'before-after',
        topDecorSrc ? 'before-after--with-top-decor' : '',
        leftDecorSrc ? 'before-after--with-left-decor' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-labelledby={headingId}
    >
      {leftDecorSrc ? (
        <span className="features__left-decor" aria-hidden>
          <img className="features__left-decor-img" src={leftDecorSrc} alt="" draggable={false} />
        </span>
      ) : null}
      {topDecorSrc ? (
        <span className="features__top-decor" aria-hidden>
          <img className="features__top-decor-img" src={topDecorSrc} alt="" draggable={false} />
        </span>
      ) : null}
      <div className="before-after__card">
        <div className={viewportClass} aria-hidden>
          <img
            className="before-after__img before-after__img--static"
            src={src}
            alt=""
            draggable={false}
          />
        </div>
        <h3 className="before-after__heading features__card-title" id={headingId}>
          {heading}
        </h3>
        <p
          id={`${id}-cap`}
          className="before-after__caption before-after__caption--below-heading"
        >
          {caption}
        </p>
        {note ? <p className="features__card-note">{note}</p> : null}
      </div>
    </figure>
  )
}

export function Features() {
  return (
    <section className="features" id="features" aria-labelledby="features-title">
      <header className="features__header">
        <h2 className="features__title" id="features-title">
          ВОЗМОЖНОСТИ
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
        <div className="features__extras-sliders" aria-label="Иллюстрации к возможностям сервиса">
          {FEATURE_COMPARISON_SLIDERS.map((item) => (
            <section
              key={item.id}
              className={[
                'features__extras-slider-section',
                item.wideImageSpan2 ? 'features__extras-slider-section--wide-span' : '',
                item.pairedTextBelow ? 'features__extras-slider-section--text-pair' : '',
                !item.textOnly && !item.staticImageSrc
                  ? 'features__extras-slider-section--slider'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {item.textOnly ? (
                item.pairedTextBelow ? (
                  <>
                    <FeatureTextOnlyCard heading={item.title} caption={item.caption} />
                    <FeatureTextOnlyCard
                      heading={item.pairedTextBelow.title}
                      caption={item.pairedTextBelow.caption}
                      bottomRightDecorSrc={item.id === 'zip-raw' ? cat3Image : undefined}
                    />
                  </>
                ) : (
                  <FeatureTextOnlyCard heading={item.title} caption={item.caption} />
                )
              ) : item.staticImageSrc ? (
                item.id === 'quality' ? (
                  <div className="features__extras-static-with-more">
                    <FeatureStaticImageCard
                      heading={item.title}
                      caption={item.caption}
                      src={item.staticImageSrc}
                      landscape={item.staticImageLandscape}
                      topDecorSrc={catImage}
                    />
                    <div className="features__extras-more-below-quality">
                      <Link className="features__card features__card--more" to="/examples">
                        <span className="features__more-row">
                          <span>Больше примеров</span>
                          <ChevronRight size={20} strokeWidth={2} aria-hidden />
                        </span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <FeatureStaticImageCard
                    heading={item.title}
                    caption={item.caption}
                    src={item.staticImageSrc}
                    landscape={item.staticImageLandscape}
                  />
                )
              ) : (
                <BeforeAfterSlider
                  beforeSrc={FEATURE_BEFORE_SRC}
                  afterSrc={FEATURE_AFTER_SRC}
                  altBefore="RU (до)"
                  altAfter="EN (после)"
                  heading={item.title}
                  caption={item.caption}
                  initialPosition={item.initialPosition ?? 50}
                />
              )}
            </section>
          ))}
        </div>

        <div className="features__grid features__grid--bottom">
          <article className="features__card features__card--builder">
            <div className="features__wide">
              <div className="features__wide-col features__wide-col--text">
                <h3 className="features__wide-title">Гибкий конструктор процессов</h3>
                <p className="features__wide-text">
                  Используйте сервис так, как удобно вам: делегируйте полный цикл «под ключ» или выбирайте отдельные этапы
                </p>
                <p className="features__card-note">
                  Стоимость каждой отдельной главы определяется динамически, в зависимости от выбранного набора функций и процессов
                </p>
              </div>
              <div className="features__wide-col features__wide-col--mock">
                <FeaturesProcessParamsMock />
              </div>
            </div>
          </article>
        </div>

        <div className="features__continuation">
          <div className="features__cabinet-block">
            <FeatureStaticImageCard
              heading="Единый личный кабинет"
              caption="Все ваши проекты, главы, статистика, выдачи задач участникам команды и многое другое в одном месте. Мы предоставляем полноценную рабочую среду"
              note="*Оплату производит только создатель команды. Участники получают доступ бесплатно после приглашения"
              src={PLACEHOLDER_IMG_CABINET}
              landscape
            />
          </div>
          <div className="features__grid features__grid--two">
            <article className="features__card features__card--with-cat2-under">
              <h3 className="features__card-title">Длина холстов 30к</h3>
              <p className="features__card-text">
              Автоматическая склейка страниц. Работайте с любым форматом вебтунов без ограничений
              </p>
              <span className="features__cat2-under" aria-hidden>
                <img className="features__cat2-under-img" src={cat2Image} alt="" draggable={false} />
              </span>
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
