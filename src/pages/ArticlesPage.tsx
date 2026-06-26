import { Eraser, Info, Languages, Layers, Type } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import mangaAvif from '../assets/images/ArticlesPage/manga.avif'
import meme1Avif from '../assets/images/ArticlesPage/meme1.avif'
import meme2Avif from '../assets/images/ArticlesPage/meme2.avif'
import meme3Avif from '../assets/images/ArticlesPage/meme3.avif'
import meme4Avif from '../assets/images/ArticlesPage/meme4.avif'
import meme5Avif from '../assets/images/ArticlesPage/meme5.avif'
import translatorsGlossary1Avif from '../assets/images/ArticlesPage/Translators_Glossary1.avif'
import translatorsGlossary2Avif from '../assets/images/ArticlesPage/Translators_Glossary2.avif'
import translationChapter1Avif from '../assets/images/ArticlesPage/Translation_Chapter1.avif'
import translationChapter2Avif from '../assets/images/ArticlesPage/Translation_Chapter2.avif'
import translationChapter3Avif from '../assets/images/ArticlesPage/Translation_Chapter3.avif'
import typersBubbleLayout1Png from '../assets/images/ArticlesPage/1.1.png'
import typersBubbleLayout2Png from '../assets/images/ArticlesPage/1.2.png'
import typersBubbleLayout3Png from '../assets/images/ArticlesPage/1.3.png'
import typersFreeText1Png from '../assets/images/ArticlesPage/4.1.png'
import typersFreeText2Png from '../assets/images/ArticlesPage/4.2.png'
import typersLineBreaks1Png from '../assets/images/ArticlesPage/5.1.png'
import typersLineBreaks2Png from '../assets/images/ArticlesPage/5.2.png'
import typersLineBreaks3Png from '../assets/images/ArticlesPage/5.3.png'
import typersLineBreakRules1Png from '../assets/images/ArticlesPage/6.1.png'
import typersLineBreakUndesirable1Png from '../assets/images/ArticlesPage/7.1.png'
import typersLineBreakUndesirable2Png from '../assets/images/ArticlesPage/7.2.png'
import arrowSvg from '../assets/svg/arrow.svg'
import { ArticleImageCarousel } from '../components/ArticleImageCarousel'
import { Layout } from '../components/Layout'

const GOOGLE_DOCS_CAROUSEL_SLIDES = [
  { src: translatorsGlossary1Avif, alt: 'Глоссарий в google-документе — персонажи' },
  { src: translatorsGlossary2Avif, alt: 'Глоссарий в google-документе — термины' },
  { src: translationChapter1Avif, alt: 'Таблица перевода главы в google-документе' },
  { src: translationChapter2Avif, alt: 'Шаблон таблицы перевода в google-документе' },
  { src: translationChapter3Avif, alt: 'Таблица перевода главы с картинками и цветовым выделением' },
] as const

const TYPERS_BUBBLE_LAYOUT_CAROUSEL_SLIDES = [
  {
    src: typersBubbleLayout1Png,
    alt: 'Текст не должен липнуть к краям облачка — примеры с ошибками и правильным оформлением',
  },
  {
    src: typersBubbleLayout2Png,
    alt: 'Компоновка текста в облачке: слишком много коротких строк и сбалансированная форма',
  },
  {
    src: typersBubbleLayout3Png,
    alt: 'Оформление текста в овальном облачке: кавычки и переносы строк',
  },
] as const

const TYPERS_FREE_TEXT_CAROUSEL_SLIDES = [
  {
    src: typersFreeText1Png,
    alt: 'Свободный текст на фоне: выравнивание по центру и сбалансированные переносы',
  },
  {
    src: typersFreeText2Png,
    alt: 'Примеры текста в облачках и вне них на странице манги',
  },
] as const

const TYPERS_LINE_BREAKS_CAROUSEL_SLIDES = [
  {
    src: typersLineBreaks1Png,
    alt: 'Слишком много переносов ради формы и естественная компоновка без лишних переносов',
  },
  {
    src: typersLineBreaks2Png,
    alt: 'Узкая форма текста и перенос слова для лучшей компоновки в облачке',
  },
  {
    src: typersLineBreaks3Png,
    alt: 'Случаи, когда перенос слова необходим, чтобы текст вписался в облачко',
  },
] as const

const TYPERS_LINE_BREAK_RULES_CAROUSEL_SLIDES = [
  {
    src: typersLineBreakRules1Png,
    alt: 'Запреты при переносах: знаки препинания, одна буква на строке и перенос по имеющемуся дефису',
  },
] as const

const TYPERS_LINE_BREAK_UNDESIRABLE_CAROUSEL_SLIDES = [
  {
    src: typersLineBreakUndesirable1Png,
    alt: 'Висячие предлоги и разделение связанных слов — примеры с ошибками и правильным оформлением',
  },
  {
    src: typersLineBreakUndesirable2Png,
    alt: 'Частицы и предлоги не отрывают от главного слова — примеры с ошибками и правильным оформлением',
  },
] as const

const SECTION_IDS = ['general', 'translators', 'cleaners', 'typers', 'misc'] as const
type SectionId = (typeof SECTION_IDS)[number]
const TOC_SUBSECTION_IDS = [
  'general-terms',
  'general-about-article',
  'general-last-prelude',
  'translators-basics',
  'translators-meaning',
  'translators-repetitions-synonyms',
  'translators-consistency',
  'translators-adaptations-sounds',
  'translators-work-table',
  'translators-extract-text',
  'translators-how-to-translate',
  'cleaners-principle',
  'cleaners-what-to-clean',
  'cleaners-bubbles-and-text',
  'cleaners-sounds',
  'cleaners-background-restoration',
  'cleaners-photoshop',
  'cleaners-mangadesk',
  'typers-bubble-layout',
  'typers-line-breaks',
  'typers-font-size',
  'typers-fonts',
  'typers-appropriateness-perspective',
  'typers-styling',
  'typers-small-details',
  'typers-photoshop',
  'typers-mangadesk',
] as const
type TocSubsectionId = (typeof TOC_SUBSECTION_IDS)[number]

function useActiveSection(ids: readonly SectionId[]) {
  const [active, setActive] = useState<SectionId>('general')

  useEffect(() => {
    const lineOffset = 120

    function update() {
      const y = window.scrollY + lineOffset
      let current: SectionId = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        const top = el.getBoundingClientRect().top + window.scrollY
        if (top <= y) current = id
      }
      setActive(current)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [ids])

  const scrollTo = useCallback((id: SectionId) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return { active, scrollTo }
}

function useActiveSubsection(ids: readonly TocSubsectionId[]) {
  const [activeSubsection, setActiveSubsection] = useState<TocSubsectionId | null>(null)

  useEffect(() => {
    const lineOffset = 100

    function update() {
      const y = window.scrollY + lineOffset
      let current: TocSubsectionId | null = null
      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        const top = el.getBoundingClientRect().top + window.scrollY
        if (top <= y) current = id
      }
      setActiveSubsection(current)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [ids])

  return activeSubsection
}

function scrollTocToSection(nav: HTMLElement, sectionId: SectionId, smooth: boolean) {
  if (sectionId === 'general') {
    nav.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' })
    return
  }

  const link = nav.querySelector<HTMLElement>(`a.articles-toc-main[href="#${sectionId}"]`)
  if (!link) return

  const top = link.getBoundingClientRect().top - nav.getBoundingClientRect().top + nav.scrollTop
  nav.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' })
}

function ArticlesToc({
  active,
  activeSubsection,
  onNavigate,
}: {
  active: SectionId
  activeSubsection: TocSubsectionId | null
  onNavigate: (id: SectionId) => void
}) {
  const tocNavRef = useRef<HTMLElement>(null)
  const prevActiveRef = useRef<SectionId | null>(null)

  useLayoutEffect(() => {
    const nav = tocNavRef.current
    if (nav) nav.scrollTop = 0
  }, [])

  useEffect(() => {
    const nav = tocNavRef.current
    if (!nav) return

    if (prevActiveRef.current === null) {
      prevActiveRef.current = active
      nav.scrollTop = 0
      return
    }

    if (prevActiveRef.current === active) return

    prevActiveRef.current = active
    scrollTocToSection(nav, active, true)
  }, [active])

  return (
    <aside className="articles-sidebar" aria-label="Навигация по статье">
      <p className="articles-sidebar-title">Содержание</p>
      <nav ref={tocNavRef} className="articles-toc" aria-label="Разделы руководства">
        <a
          href="#general"
          className={`articles-toc-main${active === 'general' ? ' is-active' : ''}`}
          onClick={(e) => {
            e.preventDefault()
            onNavigate('general')
          }}
        >
          <Info size={16} strokeWidth={2} aria-hidden />
          <span>Введение</span>
        </a>
        <div className="articles-toc-children">
          <a href="#general-terms" className={active === 'general' && activeSubsection === 'general-terms' ? 'is-active' : ''}>Договоримся<br />о терминах</a>
          <a href="#general-about-article" className={active === 'general' && activeSubsection === 'general-about-article' ? 'is-active' : ''}>О чём эта статья?</a>
          <a href="#general-last-prelude" className={active === 'general' && activeSubsection === 'general-last-prelude' ? 'is-active' : ''}>Последняя прелюдия</a>
        </div>

        <a
          href="#translators"
          className={`articles-toc-main${active === 'translators' ? ' is-active' : ''}`}
          onClick={(e) => {
            e.preventDefault()
            onNavigate('translators')
          }}
        >
          <Languages size={16} strokeWidth={2} aria-hidden />
          <span>Переводчикам</span>
        </a>
        <div className="articles-toc-children">
          <a href="#translators-basics" className={active === 'translators' && activeSubsection === 'translators-basics' ? 'is-active' : ''}>Базовый минимум</a>
          <a href="#translators-meaning" className={active === 'translators' && activeSubsection === 'translators-meaning' ? 'is-active' : ''}>Смысл, а не слова</a>
          <a href="#translators-repetitions-synonyms" className={active === 'translators' && activeSubsection === 'translators-repetitions-synonyms' ? 'is-active' : ''}>Повторения <br />и синонимы</a>
          <a href="#translators-consistency" className={active === 'translators' && activeSubsection === 'translators-consistency' ? 'is-active' : ''}>Цифры, имена <br />и единообразие</a>
          <a href="#translators-adaptations-sounds" className={active === 'translators' && activeSubsection === 'translators-adaptations-sounds' ? 'is-active' : ''}>Отсылки, адаптации и звуки</a>
          <a href="#translators-work-table" className={active === 'translators' && activeSubsection === 'translators-work-table' ? 'is-active' : ''}>Файл с переводом</a>
          <a href="#translators-extract-text" className={active === 'translators' && activeSubsection === 'translators-extract-text' ? 'is-active' : ''}>Как вытащить текст со сканов?</a>
          <a href="#translators-how-to-translate" className={active === 'translators' && activeSubsection === 'translators-how-to-translate' ? 'is-active' : ''}>Как переводить?</a>
        </div>

        <a
          href="#cleaners"
          className={`articles-toc-main${active === 'cleaners' ? ' is-active' : ''}`}
          onClick={(e) => {
            e.preventDefault()
            onNavigate('cleaners')
          }}
        >
          <Eraser size={16} strokeWidth={2} aria-hidden />
          <span>Клинерам</span>
        </a>
        <div className="articles-toc-children">
          <a href="#cleaners-principle" className={active === 'cleaners' && activeSubsection === 'cleaners-principle' ? 'is-active' : ''}>Главный принцип: <br />не навреди</a>
          <a href="#cleaners-what-to-clean" className={active === 'cleaners' && activeSubsection === 'cleaners-what-to-clean' ? 'is-active' : ''}>Что клиним, <br />а что нет</a>
          <a href="#cleaners-bubbles-and-text" className={active === 'cleaners' && activeSubsection === 'cleaners-bubbles-and-text' ? 'is-active' : ''}>Облачки и текст <br />на фоне</a>
          <a href="#cleaners-sounds" className={active === 'cleaners' && activeSubsection === 'cleaners-sounds' ? 'is-active' : ''}>Звуки</a>
          <a href="#cleaners-background-restoration" className={active === 'cleaners' && activeSubsection === 'cleaners-background-restoration' ? 'is-active' : ''}>Восстановление <br />фона</a>
          <a href="#cleaners-photoshop" className={active === 'cleaners' && activeSubsection === 'cleaners-photoshop' ? 'is-active' : ''}>О Photoshop</a>
          <a href="#cleaners-mangadesk" className={active === 'cleaners' && activeSubsection === 'cleaners-mangadesk' ? 'is-active' : ''}>Через MangaDesk</a>
        </div>

        <a
          href="#typers"
          className={`articles-toc-main${active === 'typers' ? ' is-active' : ''}`}
          onClick={(e) => {
            e.preventDefault()
            onNavigate('typers')
          }}
        >
          <Type size={16} strokeWidth={2} aria-hidden />
          <span>Тайперам</span>
        </a>
        <div className="articles-toc-children">
          <a href="#typers-bubble-layout" className={active === 'typers' && activeSubsection === 'typers-bubble-layout' ? 'is-active' : ''}>Компоновка текста <br />в облачке</a>
          <a href="#typers-line-breaks" className={active === 'typers' && activeSubsection === 'typers-line-breaks' ? 'is-active' : ''}>Переносы</a>
          <a href="#typers-font-size" className={active === 'typers' && activeSubsection === 'typers-font-size' ? 'is-active' : ''}>Размер шрифта</a>
          <a href="#typers-fonts" className={active === 'typers' && activeSubsection === 'typers-fonts' ? 'is-active' : ''}>Шрифты</a>
          <a href="#typers-appropriateness-perspective" className={active === 'typers' && activeSubsection === 'typers-appropriateness-perspective' ? 'is-active' : ''}>Уместность <br />и перспектива</a>
          <a href="#typers-styling" className={active === 'typers' && activeSubsection === 'typers-styling' ? 'is-active' : ''}>Оформление</a>
          <a href="#typers-small-details" className={active === 'typers' && activeSubsection === 'typers-small-details' ? 'is-active' : ''}>Мелочи</a>
          <a href="#typers-photoshop" className={active === 'typers' && activeSubsection === 'typers-photoshop' ? 'is-active' : ''}>Инструменты <br />Photoshop</a>
          <a href="#typers-mangadesk" className={active === 'typers' && activeSubsection === 'typers-mangadesk' ? 'is-active' : ''}>Через MangaDesk</a>
        </div>

        <a
          href="#misc"
          className={`articles-toc-main${active === 'misc' ? ' is-active' : ''}`}
          onClick={(e) => {
            e.preventDefault()
            onNavigate('misc')
          }}
        >
          <Layers size={16} strokeWidth={2} aria-hidden />
          <span>Разное</span>
        </a>
      </nav>
    </aside>
  )
}

export function ArticlesPage() {
  const { active, scrollTo } = useActiveSection(SECTION_IDS)
  const activeSubsection = useActiveSubsection(TOC_SUBSECTION_IDS)

  return (
    <Layout headerVariant="minimal">
      <div className="articles-page-main" id="articles-page">
        <div className="articles-layout">
          <div className="articles-layout__toc-rail">
            <div id="articles-page-toc" className="articles-layout__toc">
              <ArticlesToc active={active} activeSubsection={activeSubsection} onNavigate={scrollTo} />
            </div>
          </div>

          <div className="articles-content">
            <header className="articles-head">
              <p className="articles-kicker">Гайд по работе над переводами манги, манхвы, маньхуа, комиксов, вебтунов и других проектов.</p>
            </header>

            <section className="article-block" id="general">
              <h3 className="article-block__title">Введение</h3>
              <p>
                Мы — команда MangaDesk, того самого сервиса, на котором Вы сейчас находитесь. <br />
                Прежде чем учить нашу платформу клинить фоны, переводить реплики и тайпить текст, мы сами прошли через
                всё это ручками. Долго, упорно и со всеми типичными ошибками новичков. Поэтому и решили собрать
                накопленный опыт в одну большую обучающую статью — чтобы Вы могли пройти этот путь чуть
                быстрее, чем мы.
              </p>
              <p>
                Гайд для всех, кому интересно, как делается перевод: для начинающих переводчиков, клинеров и
                тайперов, для команд, которым нужен системный подход к обучению новичков, и просто для
                любопытных читателей, которые хотят понимать, что стоит за каждой главой.
              </p>
              <p>
                Резонный вопрос: зачем сервису автоматизации писать про ручной труд? Очень просто: чтобы
                пользоваться инструментом осознанно, надо понимать, что он делает и почему именно так.
                <br />Хороший клин, живой перевод, аккуратный тайп — это не магия, а набор правил. И эти правила
                куда полезнее держать в голове, чем угадывать на ходу.
              </p>
              <p>
                Если Вы нашли ошибку или хотите что-то уточнить — пишите нам в социальные сети, <br />ссылки
                где-то внизу страницы. Спорить тоже можно, мы не кусаемся.
              </p>
              <h4 className="article-block__subtitle" id="general-terms">Договоримся о терминах</h4>
              <p>
                Чтобы не повторять каждый раз «манга, манхва, маньхуа, комиксы, вебтуны и прочее», в статье
                мы будем называть всё это одним словом — «проект». А «главы», «выпуски», «эпизоды» и «серии»
                в любом из этих форматов — просто «глава». Так короче и понятнее.
              </p>
              <p>
                Ещё несколько слов, которые будут встречаться дальше: «Облачка» («баблы» или «пузыри», <br />от англ.
                bubbles) — области, в которых нарисованы реплики и мысли персонажей. <br />«Сканы» («равки», от англ.
                raw) — страницы проекта в оригинале, до перевода и обработки. <br />«Анлейт» — страницы проекта,
                уже переведённые на английский зарубежными коллегами.
              </p>

              <h4 className="article-block__subtitle" id="general-about-article">О чём эта статья?</h4>
              <p>
                Работа над главой — это всегда командная история. Над ней последовательно трудятся
                три основные роли, и каждая важна по-своему. Перевести, очистить, разместить текст — звучит просто, но
                за каждым шагом стоит набор тонкостей, которые отличают аккуратную работу от халтуры. Мы
                разделили материал на несколько разделов с подпунктами, чтобы можно было читать только
                нужную часть и не утонуть в деталях.
              </p>
              <div className="article-process" aria-label="Процесс перевода">
                <div className="article-process__scale-surface">
                  <h5 className="article-process__title">Процесс перевода</h5>
                  <div className="article-process__grid">
                  <article className="article-process__item">
                    <div className="article-process__icon">
                      <Languages className="article-process__icon-svg" strokeWidth={2} aria-hidden />
                    </div>
                    <div className="article-process__ribbon">
                      <img src={arrowSvg} alt="" aria-hidden />
                      <span>Переводчик</span>
                    </div>
                    <p className="article-process__desc">Переводит оригинальные текст и звуки</p>
                  </article>

                  <article className="article-process__item">
                    <div className="article-process__icon">
                      <Eraser className="article-process__icon-svg" strokeWidth={2} aria-hidden />
                    </div>
                    <div className="article-process__ribbon">
                      <img src={arrowSvg} alt="" aria-hidden />
                      <span>Клинер</span>
                    </div>
                    <p className="article-process__desc">Удаляет оригинальные <br/>текст и звуки со сканов</p>
                  </article>

                  <article className="article-process__item">
                    <div className="article-process__icon">
                      <Type className="article-process__icon-svg" strokeWidth={2} aria-hidden />
                    </div>
                    <div className="article-process__ribbon">
                      <img src={arrowSvg} alt="" aria-hidden />
                      <span>Тайпер</span>
                    </div>
                    <p className="article-process__desc">Размещает переведенные <br/>текст и звуки на сканах</p>
                  </article>
                  </div>
                </div>
              </div>

              <h4 className="article-block__subtitle" id="general-last-prelude">Последняя прелюдия</h4>
              <p>
                Все правила, которые мы здесь описываем, — не догма ради догмы: за каждым стоит причина, <br />и мы
                стараемся её объяснять. Итак... следующий блок — для переводчиков.
              </p>
            </section>

            <section className="article-block" id="translators">
              <h3 className="article-block__title">Переводчикам</h3>
              <p>
                Переводчик — это человек, ответственный за смысл переведённого проекта. Звучит банально, но на
                этом этапе закладывается всё, что читатель потом увидит в облачках. Если перевод получится сухим
                и дословным, никакой клин или тайп его уже не спасут. Ну а если живым — глава <br /> будет читаться так,
                будто её сразу нарисовали на русском, и это лучшее, что может случиться <br />с переводом проекта.
              </p>
              <p>
              Задача переводчика заключается в том, чтобы донести до читателя оригинал как живую историю,
              где важна не буквальная точность, а сохранение духа, эмоций и интонаций. Переводчик подбирает
              слова так, чтобы диалоги звучали естественно, шутки вызывали улыбку, а драматические
              моменты — сопереживание. Иногда это значит уйти от оригинала на пару шагов в сторону, и это нормально.
              От того, насколько глубоко повествование сможет затронуть сердце читателя,
              зависит судьба всего проекта — поэтому давайте перейдём к конкретике.
              </p>
              <img
                src={meme1Avif}
                alt="Meme"
                style={{
                  opacity: 0.9,
                  display: 'block',
                  width: '500px',
                  maxWidth: '100%',
                  height: 'auto',
                  margin: '12px auto 18px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                }}
              />
              <p style={{ textAlign: 'center', color: 'var(--fg)', fontSize: '14px' }}>
                Когда фраза переведена правильно,
                <br />
                но звучит как пиратский дубляж 90-х
              </p>
              <h4 className="article-block__subtitle" id="translators-basics">Базовый минимум</h4>
              <p>
                Отсутствие грамматических, орфографических, лексических, пунктационных и
                прочих ошибок — база.
                Согласование времени, рода и числа — необходимы. Знаки в конце предложений
                используем по правилам русского языка: ?, !, ???, !!!, ?!,
                …, !.., ?.. — иного не дано.                 Длинные цепочки
                точек («……») сводим к стандартному троеточию («...»).
              </p>
              <div className="article-mini-card" style={{ width: '100%', margin: '10px 0 16px' }}>
                <div style={{ overflowX: 'auto' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '20px',
                      fontSize: '14px',
                      color: 'var(--fg)',
                    }}
                  >
                    <div>
                      <p style={{ margin: '0 0 12px', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(var(--fg-rgb), 1)' }}>Неправильно</p>
                      <p style={{ margin: '0 0 12px' }}>Кажется ректор всеми способами пытается задобрить тебя.</p>
                      <p style={{ margin: '0 0 12px' }}>Ян как насчёт того чтобы поехать на машине?</p>
                      <p style={{ margin: '0 0 12px' }}>Это возможно...?<br />Как я мог так ошибиться!...</p>
                      <p style={{ margin: 0 }}>Ты не понимаешь, как живёт эти люди!</p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 12px', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(var(--fg-rgb), 1)' }}>Правильно</p>
                      <p style={{ margin: '0 0 12px' }}>Кажется, ректор всеми способами пытается задобрить тебя.</p>
                      <p style={{ margin: '0 0 12px' }}>Ян, как насчёт того, чтобы поехать на машине?</p>
                      <p style={{ margin: '0 0 12px' }}>Это возможно?..<br />Как я мог так ошибиться!..</p>
                      <p style={{ margin: 0 }}>Ты не понимаешь, как живут эти люди!</p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 12px', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(var(--fg-rgb), 1)' }}>Пояснение</p>
                      <p style={{ margin: '0 0 12px' }}>Кажется — вводное слово, после него должна быть запятая.</p>
                      <p style={{ margin: '0 0 12px' }}>Пунктуация при обращении <br />и запятая перед «чтобы».</p>
                      <p style={{ margin: '0 0 12px' }}>Знак препинания не по правилам русского языка.</p>
                      <p style={{ margin: 0 }}>Согласование времени, рода <br />и числа.</p>
                    </div>
                  </div>
                </div>
              </div>
              <p>
                Отдельно про тире и дефис, потому что их регулярно путают. Разница не просто в длине символов, это разные
                знаки, и грамотный читатель это замечает.
              </p>
              <ul className="article-checklist">
                <li>Дефис (-) соединяет части слова без пробелов: «кое-кто», «как-то», «чёрно-белый»;</li>
                <li>Длинное тире (—) разделяет части предложения с пробелами: «век живи — век учись»;</li>
                <li>Короткое тире (–) обозначает числовые диапазоны: «1941–1945».</li>
              </ul>
              <p>
                Кавычки используем только «ёлочки», лапки "вот такие" оставляем для кода.
                Букву «Ё» пишем там, где ей положено быть: «ещё», «всё», «её» — а не «еще», «все»,
                «ее». Кажется мелочью, <br /> но из подобного складывается ощущение «тут поработали от души».
              </p>
              <p>
                А также, весь текст в проекте пишется КАПСОМ. Не потому что персонажи кричат, а потому что строчные
                буквы плохо читаются в баблах и выбиваются из стилистики. Неудобно, но привыкаешь за пару
                глав. Да и некоторые шрифты просто не имеют строчных букв, поэтому при смене шрифта всё может поломаться.
                В общем, КАПС наш друг.
              </p>
              <img
                src={meme2Avif}
                alt="Meme 2"
                style={{
                  opacity: 0.9,
                  display: 'block',
                  width: '660px',
                  maxWidth: '100%',
                  height: 'auto',
                  margin: '12px auto 18px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                }}
              />
              <p>
                Манга читается справа налево, манхва и вебтуны — сверху вниз и слева направо.
                Поэтому реплики переводим в той последовательности, в
                которой задумано автором. Перепутаете порядок — и диалог развалится: персонаж начнёт отвечать сам себе, а фразы поменяются местами.
              </p>
              <div className="article-mini-card" style={{ margin: '12px 0 18px', padding: 0, overflow: 'hidden' }}>
                <img
                  src={mangaAvif}
                  alt="Порядок чтения облачков"
                  style={{
                    opacity: 0.9,
                    display: 'block',
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                    borderRadius: 0,
                    border: 'none',
                  }}
                />
              </div>
              <p>
                Облачка, в которых только знаки препинания вроде «!!!» или «?!», — это тоже реплики. Их
                также выписываем в таблицу с переводом, чтобы не потерять при тайпинге. <br />(Подробнее о таблице с переводом будет ниже).
              </p>
              <h4 className="article-block__subtitle" id="translators-meaning">Смысл, а не слова</h4>
              <p>
                Это самое важное в работе переводчика. Запомните: дословный и 
                нагромождённый перевод — зло!
                Не бойтесь менять порядок слов, подбирать идиомы, искать более точные выражения.
              </p>
              <p>
                После того как Вы записали перевод фразы,
                перечитайте её и задайте себе несколько вопросов:
              </p>
              <ul className="article-checklist">
                <li>
                  Звучит ли это по-русски? Если в голове скрипит «так у нас не говорят» —
                  переписывайте.
                </li>
                <li>
                  Передаёт ли фраза характер и эмоцию говорящего? Грубиян не должен говорить как
                  профессор филологии, а ребёнок — как взрослый.
                </li>
                <li>
                  Соответствует ли контексту сцены: драке, признанию в любви, катастрофе?
                </li>
                <li>
                  Соответствует ли эпохе? Средневековый рыцарь не говорит «окей, бро», а
                  космический инженер не выражается летописным слогом.
                  </li>
                <li>  
                  Уместна ли стилистика? Бандит не заговорит официальным тоном при нападении, <br />как и аристократ не начнёт бросаться сленгом при встрече гостей.
                </li>
                <li>И главный вопрос: не ушли ли Вы от оригинала по смыслу? Адаптировать — да, переписывать сюжет — нет.</li>
              </ul>
        
              <div className="article-mini-card" style={{ width: '100%', margin: '10px 0 16px' }}>
                <div style={{ overflowX: 'auto' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.2fr 1.2fr 0.8fr',
                      gap: '20px',
                      fontSize: '14px',
                      color: 'var(--fg)',
                    }}
                  >
                    <div>
                      <p style={{ margin: '0 0 12px', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(var(--fg-rgb), 1)' }}>Неправильно</p>
                      <div style={{ minHeight: '122px', marginBottom: '10px' }}>
                        <p style={{ margin: 0 }}>
                          МОЯ КОШКА ДОВОЛЬНО ЗАСТЕНЧИВА, ТАК ЧТО НЕ РАССТРАИВАЙСЯ, ЕСЛИ ОНА НЕ УДЕЛИТ ТЕБЕ
                          НИКАКОГО ВНИМАНИЯ.
                        </p>
                      </div>
                      <p style={{ margin: 0 }}>ТЫ НЕ СМОЖЕШЬ СДЕЛАТЬ ВКУСНУЮ ЕДУ, НЕ ТАК ЛИ?</p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 12px', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(var(--fg-rgb), 1)' }}>Правильно</p>
                      <div style={{ minHeight: '122px', marginBottom: '10px' }}>
                        <p style={{ margin: 0 }}>
                          МОЯ КОШКА НЕ ЛЮБИТ ЧУЖАКОВ, ТАК ЧТО НЕ ОБИЖАЙСЯ, ЕСЛИ ОНА БУДЕТ ТЕБЯ ИГНОРИРОВАТЬ.
                        </p>
                      </div>
                      <p style={{ margin: 0 }}>ТЫ НЕ СИЛЁН В ГОТОВКЕ, ВЕРНО?</p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 12px', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(var(--fg-rgb), 1)' }}>Пояснение</p>
                      <p style={{ margin: 0 }}>Дословный перевод.</p>
                    </div>
                  </div>
                </div>
              </div>
              <h4 className="article-block__subtitle" id="translators-repetitions-synonyms">Повторения и синонимы</h4>
              <p>
                Избегайте повторений, хорошие синонимы — Ваши лучшие друзья. Если в одной реплике
                герой три раза говорит «сказал», что-то явно пошло не так. У русского языка богатый
                арсенал: «бросил», «выпалил», «прошептал», «промолвил», «буркнул». Пользуйтесь.
              </p>
              <div className="article-mini-card" style={{ width: '100%', margin: '10px 0 16px' }}>
                <div style={{ overflowX: 'auto' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.2fr 1.2fr 0.8fr',
                      gap: '20px',
                      fontSize: '14px',
                      color: 'var(--fg)',
                    }}
                  >
                    <div>
                      <p style={{ margin: '0 0 12px', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(var(--fg-rgb), 1)' }}>Неправильно</p>
                      <div style={{ minHeight: '110px', marginBottom: '10px' }}>
                        <p style={{ margin: 0 }}>
                          ПОЧЕМУ ТЫ НАЧАЛ ЧИСТИТЬ АПЕЛЬСИНЫ, ПОЧЕМУ НЕ СПРОСИЛ МЕНЯ?
                        </p>
                      </div>
                      <div style={{ minHeight: '96px' }}>
                        <p style={{ margin: 0 }}>
                          НА УЛИЦЕ ПРОИЗОШЛА АВАРИЯ.<br />
                         
                          АВАРИЯ СЛУЧИЛАСЬ ИЗ-ЗА ГОЛОЛЁДА.
                        
                          В РЕЗУЛЬТАТЕ АВАРИИ ПОСТРАДАЛО<br /> МНОГО ЛЮДЕЙ.
                        </p>
                      </div>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 12px', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(var(--fg-rgb), 1)' }}>Правильно</p>
                      <div style={{ minHeight: '110px', marginBottom: '10px' }}>
                        <p style={{ margin: 0 }}>ПОЧЕМУ ТЫ НАЧАЛ ЧИСТИТЬ АПЕЛЬСИНЫ, НЕ СПРОСИВ МЕНЯ?</p>
                      </div>
                      <div style={{ minHeight: '96px' }}>
                        <p style={{ margin: 0, fontStyle: 'italic' }}>
                          НА УЛИЦЕ ПРОИЗОШЛО ДТП в связи <br />с гололёдом, пострадало МНОГО ЛЮДЕЙ.
                        </p>
                      </div>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 12px', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(var(--fg-rgb), 1)' }}>Пояснение</p>
                      <div style={{ minHeight: '74px', marginBottom: '10px' }}>
                        <p style={{ margin: 0 }}>Повторы.</p>
                      </div>
                      <div style={{ minHeight: '96px' }}>
                        <p style={{ margin: 0 }}></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <h4 className="article-block__subtitle" id="translators-consistency">Цифры, имена и единообразие</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '14px', alignItems: 'center', marginBottom: '12px' }}>
                <img
                  src={meme3Avif}
                  alt="Пример про числа и названия"
                  style={{
                    opacity: 0.9,
                    width: '100%',
                    height: 'auto',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.22)',
                  }}
                />
                <div>
                  <p style={{ margin: 0 }}>
                    Цифры и числа в тексте пишем не словами, а символами: 1, 2, 3. Не «пятый этаж»,
                    а «5-й этаж». Исключение — когда «Пятый» это имя, прозвище или название:
                    «Пятый сегодня опаздывает», «Седьмой Континент закрылся».
                  </p>
                  <p style={{ margin: '12px 0 0' }}>
                    Имена, термины и названия должны совпадать от главы к главе. <br />Если  в первой главе
                    героя зовут «Кейтаро», в двадцатой не должно внезапно появиться «Кэйтаро». Если
                    артефакт назвали «Меч Семи Ветров», ни в одной главе он не превратится в «Клинок
                    Семи Ветров». <br />Для этого в файле перевода ведут отдельную вкладку с глоссарием.
                  </p>
                </div>
              </div>
              <p>
                Если в реплике мелькает «онигири», «сэмпай», «икебана» или название малоизвестного
                праздника, добавьте сноску с коротким объяснением. Читатель не обязан знать, что
                такое «о-бон» или «нэмавáси», но узнать ему будет приятно. Сноски делают не для
                того, чтобы выпендриться эрудицией, а чтобы человек не выпадал из истории.
              </p>
              <div className="article-mini-card" style={{ width: '100%', margin: '10px 0 16px' }}>
                <div style={{ overflowX: 'auto' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '20px',
                      fontSize: '14px',
                      color: 'var(--fg)',
                    }}
                  >
                    <div>
                      <p style={{ margin: '0 0 12px', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(var(--fg-rgb), 1)' }}>Неправильно</p>
                      <div style={{ marginBottom: '10px' }}>
                        <p style={{ margin: 0, whiteSpace: 'nowrap' }}>ОДНАЖДЫ НА ЦИСИНЗЕ...</p>
                        <p style={{ margin: '2px 0 0', visibility: 'hidden' }} aria-hidden>
                          *ЦИСИНЗЕ — КИТАЙСКИЙ ДЕНЬ ВЛЮБЛЁННЫХ.
                        </p>
                      </div>
                      <div>
                        <p style={{ margin: 0, whiteSpace: 'nowrap' }}>ГЛУПАЯ БАСАГИ!</p>
                        <p style={{ margin: '2px 0 0', visibility: 'hidden' }} aria-hidden>
                          *БАСАГИ — УСТАРЕВШИЙ СИНОНИМ К СЛОВУ «ДУРАК».
                        </p>
                      </div>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 12px', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(var(--fg-rgb), 1)' }}>Правильно</p>
                      <div style={{ marginBottom: '10px' }}>
                        <p style={{ margin: 0, whiteSpace: 'nowrap' }}>ОДНАЖДЫ НА ЦИСИНЗЕ...</p>
                        <p style={{ margin: '2px 0 0' }}>*ЦИСИНЗЕ — КИТАЙСКИЙ ДЕНЬ ВЛЮБЛЁННЫХ.</p>
                      </div>
                      <div>
                        <p style={{ margin: 0, whiteSpace: 'nowrap' }}>ГЛУПАЯ БАСАГИ!</p>
                        <p style={{ margin: '2px 0 0' }}>*БАСАГИ — УСТАРЕВШИЙ СИНОНИМ К СЛОВУ «ДУРАК».</p>
                      </div>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 12px', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(var(--fg-rgb), 1)' }}>Пояснение</p>
                      <div style={{ marginBottom: '10px' }}>
                        <p style={{ margin: 0 }}>Примечания с объяснением<br /> незнакомых иностранных слов<br /> и событий.</p>
                      </div>
                      <div>
                        <p style={{ margin: 0 }}></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <h4 className="article-block__subtitle" id="translators-adaptations-sounds">Отсылки, адаптации и звуки</h4>
              <p>
                Уместные отсылки и адаптации в переводе — приветствуются. Если в оригинале герой
                произносит расхожую японскую фразу, у которой есть очевидный русский аналог, —
                смело берите аналог. Если в манхве шутят про корейское шоу, которого никто у нас не
                знает, — можно заменить на ситуацию, понятную русскому читателю. Главное слово
                здесь — уместные. Не превращайте сёнэн в комедию из девяностых, чувство меры важнее
                находчивости.
              </p>
              <p>
                Отдельная история — звуки. Переводить ли «ドキドキ» как «тук-тук», оставлять ли
                «BANG» латиницей или заменять на «БАХ» — решается на старте проекта. Подходы у
                разных команд разные, <br />и единого «правильного» ответа нет. В MangaDesk это
                настраивается отдельно: можно клинить и тайпить переведённые звуки, можно оставить
                оригинальные.
              </p>
              <h4 className="article-block__subtitle" id="translators-work-table">Файл с переводом</h4>
              <p>
                Любой перевод проекта начинается с файла, содержащего две основные сущности:
                глоссарий <br />и вкладки (таблицы) под каждую главу. В MangaDesk такая штука заполняется и обновляется автоматически
                при создании проекта, с возможностью ручных правок. Раньше мы использовали google-документы, поскольку они
                поддерживают совместное редактирование.
                </p>
              <p>
                Глоссарий — это Ваша личная карта проекта. Сюда выписываем всё, что должно
                сохраняться <br />от главы к главе (на оригинале и в переводе):
                имена персонажей, названия мест, организаций, артефактов, техник и так далее.
              </p>
              <p>
                Если Вы переводите не с первой главы, а подхватываете проект после других переводчиков, прочитайте уже выпущенные главы
                и заполните глоссарий до того, как сядете за свою.            
                Это спасёт от ситуации, когда в новой главе
                у героя внезапно меняется имя или техника называется иначе, чем в предыдущих десяти.
              </p>
              <p>
                Под каждую главу — отдельная вкладка (таблица) с двумя колонками: Оригинал (текст из облачков и звуки
                на исходном языке) и Перевод (Ваша русская версия).
              </p>
              <p>
              Опционально, можно добавлять к оригинальному тексту ещё и картинку. Например, для персонажей, звуков или сложных облачков.
              Для удобства тайпера можно по-разному выделять фразы и звуки, допустим цветом.
              </p> 
              <p>                
                Пример google-документы:
              </p>
              <ArticleImageCarousel
                slides={GOOGLE_DOCS_CAROUSEL_SLIDES}
                label="Примеры google-документов для переводчиков"
              />

              <p>
                Пример MangaDesk:
              </p>
              <h4 className="article-block__subtitle" id="translators-extract-text">Как вытащить текст со сканов?</h4>
              <p>
                Необходимо собрать оригинальный текст в колонку «Оригинал», для этого существует несколько способов.
              </p>
              <p>
                Самый скучный — вручную. Если Вы знаете язык оригинала, просто перепечатываете текст <br />из облачков.
                Долго, но безошибочно. Подходит, когда облачка сложные или со стилизованными шрифтами, которые не
                распознаёт ни одна программа.
              </p>
              <p>
                Самый крутой — через MangaDesk: загружаете ZIP со сканами (или одну картинку), сервис распознаёт текст и раскладывает
                его по облачкам в таблице. Дальше Вам остаётся проверить результат и переходить к следующему этапу. Так как
                сервис заточен именно под мангу, с ним меньше шансов получить кашу в местах, где стандартные
                распознавалки спотыкаются.
              </p>
              <p>
                Если хочется собрать всё из внешних инструментов — пожалуйста, вариантов хватает. <br />Делаете
                скриншот фрагмента (Win + Shift + S на Windows, Cmd + Shift + 4 на macOS) и кидаете его <br />в
                распознавалку типа Яндекс.Переводчика. Удобный гибрид — программа {" "}
                <a href="https://github.com/dynobo/normcap" target="_blank" rel="noopener noreferrer">
                  NormCap
               </a>: она совмещает скриншот
                и распознавание в один шаг. С декоративными или нестандартными
                шрифтами справляется плохо, но для типового текста — отличная штука. Также можно отправлять скрины
                в нейронки ({""}
                   <a href="https://claude.ai" target="_blank" rel="noopener noreferrer">
                     Claude
                   </a>{""}
                   ,{" "}
                   <a href="https://gemini.google.com" target="_blank" rel="noopener noreferrer">
                     Gemini
                   </a> и т.д.) — они хорошо распознают текст, в том числе извращённые шрифты.
              </p>
              <p>
                Но что бы Вы ни использовали, всегда проверяйте результат. Один пропущенный или перепутанный символ в слове — и перевод
                поедет.
              </p>
              <h4 className="article-block__subtitle" id="translators-how-to-translate">Как переводить?</h4>
              <p>
                Когда «Оригинал» собран, переходим к «Переводу».
              </p>
              <p>
                В MangaDesk перевод появляется автоматически, с учётом контекста проекта и Вашего глоссария. Сервис
                помнит имена героев, названия локаций и не путает их между главами, а заодно адаптирует под русский
                язык метафоры и идиомы — то, на чём чаще всего ломаются стандартные переводчики. Вам остаётся вычитать
                результат и довести до того уровня, на котором Вы лично готовы поставить подпись.
              </p>
              <p>
                 Вручную через сторонние сервисы тоже можно. Копируете содержимое «Оригинала» (не весь столбец
                   разом, а по несколько фраз), отправляете в нейронку ({""}
                   <a href="https://claude.ai" target="_blank" rel="noopener noreferrer">
                     Claude
                   </a>{""}
                   ,{" "}
                   <a href="https://gemini.google.com" target="_blank" rel="noopener noreferrer">
                     Gemini
                   </a> и т.д.)
                   с просьбой
                   перевести на русский. Полученный перевод можно прогнать через вторую для «более литературного слога», а потом —
                   корректировать под правила, которые мы разобрали выше.
                 </p>
              <p>
                Конечно, если Вы знаете язык оригинала, переводить можно и самостоятельно, но это занимает значительно больше времени,
                да и человек не может помнить всех идиом, фразеологизмов и прочих прелестей на память.
              </p>
              <p>
                Однако работа любого инструмента — это черновик, а не готовый перевод. Финальная
                редактура остаётся за Вами. Программа не всегда чувствует иронию, характер персонажа, шутку <br /> или ложь. Это всё ещё работа человека.
              </p>
              <p>
                Поздравляем, глава готова! Теперь переходим к очистке сканов.
              </p>
            </section>

            <section className="article-block" id="cleaners">
              <h3 className="article-block__title">Клинерам</h3>
              <p>
                Клинер — это человек, ответственный за чистоту сканов. От его работы зависит, на каком «холсте»
                окажется переведённый текст и насколько незаметно он туда ляжет. Если клин сделан грубо, никакой
                шрифт и никакая компоновка тайпера ситуацию уже не исправят. Если аккуратно — страница будет выглядеть
                так, будто оригинального текста там никогда и не было.
              </p>
              <p>
                Задача клинера — подготовить оригинальные сканы проекта: аккуратно удалить
                текст, восстановить фон под ним и убрать артефакты.
              </p>
              <img
                src={meme4Avif}
                alt="Meme"
                style={{
                  opacity: 0.9,
                  display: 'block',
                  width: '550px',
                  maxWidth: '100%',
                  height: 'auto',
                  margin: '12px auto 18px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                }}
              />
              <h4 className="article-block__subtitle" id="cleaners-principle">Главный принцип: не навреди</h4>
              <p>
                Это та мысль, которую стоит держать в голове на протяжении всей работы: клин не должен негативно
                влиять на картинку. Из этого правила вытекает почти всё остальное.
                </p>
              <p>
                Штамп используем аккуратно, маленькими «мазками», следя, чтобы не
                появлялись повторяющиеся узоры (фотошоп их обожает, читатель — нет).
                </p>
              <p>
                Не замазываем удалённый текст и звуки цветом или текстурой, отличными от оригинальных, — иначе на странице
                появится дыра, в которую сразу проваливается глаз. Например, если фон был с шумом,
                после клина он тоже должен быть с шумом, а не превращаться в гладкую заливку.
                </p>
              <p>
                Хороший клин невидим. Если читатель замечает Вашу работу — значит необходимо переделать.
              </p>
              <h4 className="article-block__subtitle" id="cleaners-what-to-clean">Что клиним, а что нет</h4>
              <p>
                Не весь текст на странице подлежит удалению, и это важно понимать с самого начала.
              </p>
              <p>
                Клиним всё, что относится к содержанию главы: реплики в облачках, мысли героев, надписи <br />на фонах
                (вывески, плакаты, записки, экраны телефонов), а ещё облачка с одной только пунктуацией — «...»,
                «?!», «……» — они тоже несут реплику и должны быть очищены. Вотермарки сайтов-источников, через
                которые получены сканы, тоже убираем — их не должно быть в финальной версии.
              </p>
              <p>
                Не клиним то, что относится к автору оригинала: имя автора, копирайт, ссылки на его соцсети,
                подпись художника в углу страницы. Это часть оригинала, её сохраняем как есть. Уважение <br />к авторскому
                труду — не пустая формальность: художник имеет право быть подписан под своей работой.
              </p>
              <p>
                Звуки — отдельная история. Нужно ли их клинить, решается на старте проекта: одни команды клинят и
                тайпят переведённые звуки, другие оставляют оригинальные как есть. Единого «правильного» подхода нет.
                Уточните, по какому варианту работает Ваш проект, до того как начнёте, —
                переделывать потом обиднее всего.
              </p>
              <h4 className="article-block__subtitle" id="cleaners-bubbles-and-text">Облачки и текст на фоне</h4>
              <p>
                Самая простая часть работы — облачка, внутри которых обычно однотонный фон. Текст оттуда
                удаляется легко: достаточно простой кисточки с нужным цветом. Главное — не выйти за контур самого облачка, иначе
                появится «съеденная» граница.
              </p>
              <p>
                С текстом на фоне всё сложнее. Когда реплика, мысль или надпись лежат не в облачке, а поверх рисунка,
                под ней может быть что угодно: текстура, тень, складки одежды, листья, элементы интерьера. Здесь и
                проявляется мастерство клинера. Штамп, восстанавливающая кисть, ручная дорисовка кисточкой — у каждого
                инструмента своя ниша, и хороший клинер использует их по очереди, в зависимости от того, что прячется
                под текстом.
              </p>
              <p>
                Если фон под текстом слишком сложный и его восстановление займёт больше времени, чем сама страница того
                стоит, — это нормальная причина обсудить с тайпером, не оставить ли в этом месте белую плашку под
                перевод. Иногда честная плашка лучше плохо восстановленного фона.
              </p>
              <h4 className="article-block__subtitle" id="cleaners-sounds">Звуки</h4>
              <p>
                Если на проекте решили клинить звуки — это самая трудоёмкая часть работы. Звуки в манге часто
                нарисованы вручную, лежат поверх рисунка, имеют сложные контуры и пересекают самые неудобные участки
                страницы. Их удаление почти всегда требует ручной дорисовки фона.
              </p>
              <p>
                Подход тут поэтапный: сначала аккуратно убираем сам звук, не задевая рисунок, потом восстанавливаем то,
                что было под ним. Где-то спасает штамп, где-то — копирование соседних участков, где-то — рисование с
                нуля. Это медленно, и это нормально: звуки традиционно считаются самой сложной частью клина.
              </p>
              <h4 className="article-block__subtitle" id="cleaners-background-restoration">Восстановление фона</h4>
              <p>
                Когда удалённый текст или звук находился на сложном фоне, дыру нужно чем-то закрыть. Универсального
                рецепта нет — есть набор приёмов, которые комбинируются.
              </p>
              <p>
                Если рядом есть однородный участок похожей текстуры — копируем его и аккуратно подгоняем по форме. Если
                фон состоит из повторяющегося узора (плитка, кирпич, ткань с принтом) — продлеваем узор. Если под
                текстом было лицо, рука или другой осмысленный элемент — приходится дорисовывать вручную, ориентируясь
                на то, как этот элемент выглядит на соседних кадрах. Чем меньше у клинера соблазна «и так сойдёт», тем
                выше итоговое качество.
              </p>
              <p>
                Отдельная боль — пыль, царапины и артефакты сжатия на исходниках. Их тоже стоит убирать. В MangaDesk это делается одной кнопкой шумоподавления —
                сервис чистит сканы, не трогая основной рисунок. Если работаете руками, для этого есть инструмент
                «Восстанавливающая кисть» в Photoshop.
              </p>
              <h4 className="article-block__subtitle" id="cleaners-photoshop">О Photoshop</h4>
              <p>
                Важная привычка, которая экономит тайперу много времени: переименовывать слои в каждом PSD. Слой с
                оригиналом — в «Оригинал», слой с клином — в «Клин». Тогда тайпер сразу видит структуру файла и не
                тратит время на поиск нужного слоя.
              </p>
              <h4 className="article-block__subtitle" id="cleaners-mangadesk">Через MangaDesk</h4>
              <p>
                Если работаете в MangaDesk — большая часть рутинной работы уже сделана за Вас. Сервис распознаёт
                облачки, удаляет текст, восстанавливает фон под ним (включая сложные случаи с тенями и текстурами),
                убирает вотермарки и подавляет шум на сканах. На выходе Вы получаете PSD со слоями: «Оригинал», «Клин»
                и отдельный слой под текст, который позже заполнит тайпер.
              </p>
              <p>
                Это не значит, что клинер становится не нужен. Сервис делает базовую работу, но проверку, точечную
                доработку сложных мест и финальное «да, это можно отдавать» всё ещё делает человек. Просто на проверку
                и доработку уходит в разы меньше времени, чем на клин с нуля. Особенно это заметно на длинных проектах с
                большим количеством звуков и сложных фонов.
              </p>
              <p>
                Дальше за главу берётся тайпер, и о нём написано ниже.
              </p>
            </section>

            <section className="article-block" id="typers">
              <h3 className="article-block__title">Тайперам</h3>
              <p>
                Тайпер — это человек, ответственный за то, как переведённый текст ляжет на очищенные сканы. Он берёт
                готовый перевод и чистый «холст» после переводчика и клинера, чтобы собрать <br />из них финальную страницу: расставить реплики по облачкам,
                подобрать шрифты, оформить эмоции и мысли, разместить звуки. Это последний этап перед публикацией, и
                именно его видит читатель.
              </p>
              <p>
                Задача тайпера — разместить текст грамотно, читабельно и стилистически верно, сохранив <br /> атмосферу
                оригинала. Звучит как «просто вставить буквы в кружочки», но за каждым облачком стоит десяток мелких
                решений: какой размер шрифта, где сделать перенос, какую форму придать тексту, нужна ли обводка. От суммы
                этих решений зависит, будет глава выглядеть <br /> профессионально или любительски.
              </p>
              <img
                src={meme5Avif}
                alt="Meme"
                style={{
                  opacity: 0.9,
                  display: 'block',
                  width: '600px',
                  maxWidth: '100%',
                  height: 'auto',
                  margin: '12px auto 18px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                }}
              />
              <h4 className="article-block__subtitle" id="typers-bubble-layout">Компоновка текста в облачке</h4>
              <p>
                Начнём с основы — как текст должен сидеть внутри облачка.
              </p>
              <p>
                Текст аккуратно повторяет форму облачка и располагается по центру, с комфортными отступами от краёв.
                Никаких «лесенок», «пирамидок» и фигурных конструкций из текста — читабельность всегда важнее красоты
                построения. Если облачко круглое, текст собираем в круглую форму; если вытянутое — вытягиваем и текст.
                При этом не нужно бояться, что форма текста получилась слишком «сложной»: если реплика длинная, облачко это
                компенсирует, и дело тут в количестве текста, а не в его форме.
              </p>
              <p>
              Строки не должны наезжать друг на друга.
              Между ними нужен достаточный межстрочный интервал. Буквы не должны
              наползать друг на друга или слипаться.
              </p>
              <ArticleImageCarousel
                slides={TYPERS_BUBBLE_LAYOUT_CAROUSEL_SLIDES}
                label="Примеры компоновки текста в облачке"
              />
              <p>
                Для текста вне облачков (мысли без оформленного баббла, реплики поверх фона) в общем случае выбирают
                круглую или узкую овальную форму. Но стоит ориентироваться и на сам проект: если облачка в нём
                преимущественно узкие, то и свободный текст логично собирать в узкую форму, чтобы он не выбивался из
                общего стиля.
              </p>
              <ArticleImageCarousel
                slides={TYPERS_FREE_TEXT_CAROUSEL_SLIDES}
                label="Примеры текста вне облачков"
              />
              <h4 className="article-block__subtitle" id="typers-line-breaks">Переносы</h4>
              <p>
                Переносов должно быть как можно меньше. Текст без переносов читается легче. Не
                переживайте, что без них форма «поедет» и станет некрасивой, — после перебора вариантов почти всегда
                находится хорошая компоновка. Но и совсем без переносов не обойтись: если слово не помещается на строке
                или сильно ломает форму облачка, перенос неизбежен.
              </p>
              <ArticleImageCarousel
                slides={TYPERS_LINE_BREAKS_CAROUSEL_SLIDES}
                label="Примеры переносов в облачках"
              />
              <p>
                Когда переносить всё-таки приходится, есть несколько запретов. Нельзя переносить знаки препинания на
                отдельную строку. Нельзя оставлять на строке всего одну букву из слова, либо переносить всего одну букву. 
                Слова с дефисом переносим по уже имеющемуся дефису. Два дефиса в одном слове выглядят ужасно. 
              </p>
              <ArticleImageCarousel
                slides={TYPERS_LINE_BREAK_RULES_CAROUSEL_SLIDES}
                label="Примеры запретов при переносах"
              />
              <p>
                Есть и набор «нежелательного», которого по возможности избегают. Предлоги стараются не оставлять на
                конце строки (висячие предлоги — классика плохого тайпа). Наречия из нескольких коротких слов — «всё
                ещё», «до сих пор», «прямо как», «так и» — стараются не делить между строками. Единицы измерения и
                счёта — «10 монет», «пара стаканов», «6-й подъезд» — тоже желательно держать вместе. И частицы стараются
                не отрывать от главного слова, в первую очередь частицу «не», а также «бы», «ли», «уж», «же», «-то»,
                «-либо».
              </p>
              <ArticleImageCarousel
                slides={TYPERS_LINE_BREAK_UNDESIRABLE_CAROUSEL_SLIDES}
                label="Примеры нежелательных переносов"
              />
              <p>
                Сами переносы делаем по правилам русского языка — если подзабылись, есть удобный{' '}
                <a href="https://gramota.ru/biblioteka/spravochniki/pravila-russkoj-orfografii-i-punktuacii/pravila-perenosov" target="_blank" rel="noopener noreferrer">
                  справочник
                </a>
                . Это не придирка: неправильный перенос читатель замечает мгновенно, даже если не может объяснить, что
                именно не так.
              </p>
              <h4 className="article-block__subtitle" id="typers-font-size">Размер шрифта</h4>
              <p>
                У размера шрифта есть одно ключевое понятие — средний размер. Это не одно фиксированное число, а
                небольшой диапазон, который подходит для большинства облачков конкретного проекта.
              </p>
              <p>
                Работает это так: берём базовый размер (например, 30) для большинства реплик и в зависимости от облачка
                и количества текста меняем его на ±2–5 пунктов. Со стороны может казаться, что на хорошо свёрстанной
                странице везде один размер, но на деле он почти в каждом облачке чуть-чуть разный — просто разница
                незаметна глазу. В этом и смысл: текст подстраивается под пространство облачка, оставаясь в рамках
                единого «среднего».
              </p>
              <p>
                Важный нюанс: средний размер у каждого проекта свой. Облачка и текст в разных тайтлах отличаются,
                поэтому один и тот же размер нельзя механически переносить из проекта в проект — его подбирают заново.
                А если в проекте встречается облачко заметно крупнее обычного, размер текста в нём увеличивают
                пропорционально, чтобы он не «тонул» в пустоте.
              </p>
              <p>
                Уменьшать текст ниже среднего стоит только в крайнем случае — когда он физически не влезает в облачко
                даже с грамотными переносами. Не нужно делать шрифт мельче без причины: это создаёт визуальные «скачки»
                размера, бьёт по читаемости и выдаёт себя несоответствием формы текста форме облачка.
              </p>
              <p>
                И наоборот: если в оригинале реплика заметно крупнее остальных — например, акцентное «ПОСТОЙ!» — этот
                акцент стоит повторить и в переводе. Ориентир на оригинал помогает сохранить интонацию сцены.
              </p>
              <h4 className="article-block__subtitle" id="typers-fonts">Шрифты</h4>
              <p>
                Шрифт — половина впечатления от тайпа, поэтому к выбору относимся серьёзно. (Под «шрифтами» для
                простоты будем понимать и сами шрифты, и гарнитуры.)
              </p>
              <p>
                Первое правило простое: никаких Arial, Times New Roman и Comic Sans — кроме случаев, когда они
                действительно зачем-то нужны (например, системный интерфейс на экране телефона). Эти шрифты мгновенно
                удешевляют картинку и кричат «тут тайпил новичок».
              </p>
              <p>
                Для основного текста выбирают читаемый шрифт, у которого есть несколько начертаний (обычное, жирное,
                курсив, жирный курсив) — это удобно, когда внутри одной реплики нужно что-то выделить. Для криков берут
                крупные «ударные» шрифты, для звуков — стилизованные под звук, для печатного текста (письма, вывески,
                документы) — печатные гарнитуры, для интерфейсов и техники — технические. Под каждую задачу свой
                инструмент.
              </p>
              <p>
                Можно использовать и шрифты, которых нет в наборе команды. Главное условие — они должны быть свободны
                от авторских прав, то есть распространяться по лицензии OFL (Open Font License), и об их использовании
                стоит предупредить заранее. Брать бесплатные шрифты можно на{' '}
                <a href="https://fonts.google.com" target="_blank" rel="noopener noreferrer">
                  Google Fonts
                </a>{' '}
                и на{' '}
                <a href="https://sites.google.com/view/scanlatewait" target="_blank" rel="noopener noreferrer">
                  сайте Намикуса
                </a>
                . Использовать пиратские платные шрифты в публикуемой главе — плохая идея и для команды, и для
                читателя.
              </p>
              <h4 className="article-block__subtitle" id="typers-appropriateness-perspective">Уместность и перспектива</h4>
              <p>
                Мало выбрать красивый шрифт — он должен быть уместным. Логика простая: шрифт подбирается под ситуацию.
                В компьютерном интерфейсе — технический, а не рукописный. На строгой официальной табличке — строгий, а
                не игривый. В рукописном письме — рукописный, а не печатный. Несоответствие шрифта контексту читатель
                чувствует, даже если не формулирует.
              </p>
              <p>
                Второй момент — перспектива. Текст должен жить на той же плоскости, что и поверхность, на которой
                написан. Если табличка нарисована под углом, текст на ней тоже разворачивается под этим углом. Если
                надпись лежит на изгибающемся флаге — текст повторяет изгиб. Плоский текст поверх объёмного объекта
                смотрится как наклейка и сразу разрушает погружение.
              </p>
              <h4 className="article-block__subtitle" id="typers-styling">Оформление: мысли, крики, персонажи</h4>
              <p>
                Разные типы текста оформляются по-разному, и это помогает читателю без подсказок понимать, что
                происходит на странице.
              </p>
              <p>
                Для обычных реплик, мыслей, криков, названий и системных надписей используют разное оформление —
                шрифты, цвета, начертания. Мысли традиционно делают чуть тише обычной речи: классический приём —
                серый цвет (часто используют значение #5f5f5f вместо чистого чёрного). Крики — крупнее и «жёстче». Этим
                же приёмом можно различать персонажей: например, дать роботу механический угловатый шрифт, а призраку —
                «дрожащий». Главное — не превратить страницу в выставку шрифтов: приёмов должно быть ровно столько,
                сколько нужно для ясности.
              </p>
              <p>
                Отдельно про обводку. Её добавляют, когда текст лежит на фоне, отличном от белого, или вообще вне
                облачка, — чтобы буквы читались на любой подложке. Размер обводки тайпер выбирает сам, но на однотипных
                облачках и текстах его держат одинаковым, иначе страница начинает «дребезжать».
              </p>
              <p>
                И ещё одно общее правило: при размещении переведённого текста и звуков копируем стиль оригинала. Если
                оригинальный звук был с градиентом и тенью — переведённый делаем похожим. Небольшие отклонения от
                оригинала, которые не портят картинку, допустимы — это не копирование пиксель в пиксель, а сохранение
                духа оформления.
              </p>
              <h4 className="article-block__subtitle" id="typers-small-details">Мелочи, которые легко забыть</h4>
              <p>
                Несколько правил, которые перекликаются с переводческими, но за них отвечает и тайпер. Облачка с одной
                только пунктуацией — «...», «?!» — тоже тайпим, они не пустые. Длинные многоточия «……...» приводим к
                стандартному троеточию «...». Букву «Ё» сохраняем, не подменяем на «Е». И весь вставляемый текст
                пишем КАПСОМ — как и весь текст в манге.
              </p>
              <p>
                Тайп, как и клин, делается только в Photoshop или его аналогах, понимающих PSD и стили текста. В Paint не
                тайпим — там нет ни нормальной работы с текстом, ни слоёв, ни стилей.
              </p>
              <h4 className="article-block__subtitle" id="typers-photoshop">Инструменты Photoshop</h4>
              <p>
                Здесь — короткая практическая выжимка по тому, чем тайпер пользуется в Photoshop каждый день.
              </p>
              <p>
                <strong>Инструмент «Текст»</strong>
              </p>
              <p>
                Главный инструмент тайпера — «Текст» (горячая клавиша T). Для тонкой настройки открываем окно «Символ»
                (Window → Character). В нём живёт всё, что определяет вид текста:
              </p>
              <ul className="article-checklist">
                <li>Шрифт и начертание — что и в каком стиле пишем.</li>
                <li>Размер текста — тот самый «средний размер».</li>
                <li>Межстрочный интервал — расстояние между строками. Хорошее правило: интервал примерно на 10 пунктов больше размера текста (размер 30 → интервал ~40).</li>
                <li>Кернинг — ставим «Оптический».</li>
                <li>Трекинг — ставим «0».</li>
                <li>Масштаб по высоте и ширине — растяжка текста, если нужно вписать его в нестандартную форму.</li>
                <li>Смещение базовой линии — двигает отдельные символы вверх-вниз.</li>
                <li>Цвет — для мыслей, например, #5f5f5f.</li>
                <li>Псевдоначертания (искусственные жирный/курсив) — по необходимости.</li>
                <li>Язык и сглаживание — выбираем «Русский» и «Плавное».</li>
              </ul>
              <p>
                Маленький лайфхак: чтобы менять размер, не обязательно каждый раз вписывать число — можно навести
                курсор на иконку размера, зажать левую кнопку мыши и двигать мышь влево-вправо.
              </p>
              <p>
                <strong>Панель параметров</strong>
              </p>
              <p>
                После выбора инструмента «Текст» сверху появляется панель с настройками: режим текста (горизонтальный
                или вертикальный — почти всегда горизонтальный), выравнивание (в большинстве случаев по центру) и
                деформация текста (для работы с перспективой).
              </p>
              <p>
                Ещё одна частая ситуация: между словами образуется некрасивый «провал» из-за пробела. Лечится так —
                ставим курсор рядом с проблемным пробелом и жмём Alt + ← или Alt + →, подгоняя расстояние вручную.
              </p>
              <p>
                <strong>Стили символов</strong>
              </p>
              <p>
                Стили символов сильно ускоряют работу. Вместо того чтобы каждый раз настраивать текст заново, создаём
                стиль (например, «Основной 30», «Мысли серый», «Крик») и применяем его одним кликом. На большом
                проекте это экономит часы. По работе со стилями символов есть хорошие видеоразборы — поищите «стили
                символов Photoshop тайп».
              </p>
              <p>
                <strong>Стили слоя</strong>
              </p>
              <p>
                Стили слоя открываются двойным кликом по слою с текстом. Это набор эффектов оформления: обводка,
                наложение градиента, внешнее свечение, тень и так далее. Именно отсюда берётся обводка для текста на
                сложном фоне и эффекты для стилизованных звуков.
              </p>
              <h4 className="article-block__subtitle" id="typers-mangadesk">Через MangaDesk</h4>
              <p>
                Если работаете в MangaDesk, многое из вышеперечисленного сервис берёт на себя. Переведённый текст
                автоматически раскладывается по облачкам с учётом их формы и размера, подбирается подходящий размер
                шрифта, расставляются переносы по правилам русского языка, добавляется обводка там, где фон не белый.
                Можно загрузить свои шрифты — в том числе набор Вашей команды — и настроить оформление под стиль
                проекта: отдельно для реплик, мыслей, криков и звуков.
              </p>
              <p>
                Человек при этом остаётся главным. Сервис делает черновую раскладку быстро и аккуратно, но финальные
                художественные решения — где усилить акцент, как обыграть сложный звук, какой шрифт лучше подходит
                конкретному персонажу — за тайпером. На выходе получается PSD со слоями, который можно догнать руками
                до идеала, а не собирать каждую страницу с нуля.
              </p>
              <p>
                После финального «ок» глава отправляется в публикацию, и круг замыкается: то, что начиналось с пустой
                таблицы у переводчика, становится готовой страницей на русском.
              </p>
            </section>

            <section className="article-block" id="misc">
              <h3 className="article-block__title">Разное</h3>
              <p>
                Здесь собрано то, что не вошло в разделы по ролям, но без чего цельной картины не сложится. Если
                предыдущие разделы отвечали на вопрос «что делает каждый участник», то этот — про то, что происходит
                до перевода и после тайпа. Откуда вообще берутся сканы, как привести их в рабочий вид и что с готовой
                главой происходит перед публикацией.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  )
}
