import { Eraser, Info, Languages, Type } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import mangaPng from '../assets/images/manga.png'
import meme1Png from '../assets/images/meme1.png'
import meme2Png from '../assets/images/meme2.png'
import meme3Jpg from '../assets/images/meme3.jpg'
import arrowSvg from '../assets/svg/arrow.svg'
import { Layout } from '../components/Layout'

const SECTION_IDS = ['general', 'translators', 'cleaners', 'typers'] as const
type SectionId = (typeof SECTION_IDS)[number]
const TOC_SUBSECTION_IDS = [
  'general-terms',
  'general-about-article',
  'general-about-sections',
  'general-last-prelude',
  'translators-basics',
  'translators-meaning',
  'translators-repetitions-synonyms',
  'translators-consistency',
  'translators-adaptations-sounds',
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

function ArticlesToc({
  active,
  activeSubsection,
  onNavigate,
}: {
  active: SectionId
  activeSubsection: TocSubsectionId | null
  onNavigate: (id: SectionId) => void
}) {
  return (
    <aside className="articles-sidebar" aria-label="Навигация по статье">
      <p className="articles-sidebar-title">Содержание</p>
      <nav className="articles-toc" aria-label="Разделы руководства">
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
          <a href="#general-terms" className={active === 'general' && activeSubsection === 'general-terms' ? 'is-active' : ''}>Договоримся о терминах</a>
          <a href="#general-about-article" className={active === 'general' && activeSubsection === 'general-about-article' ? 'is-active' : ''}>О чём эта статья?</a>
          <a href="#general-about-sections" className={active === 'general' && activeSubsection === 'general-about-sections' ? 'is-active' : ''}>О разделах</a>
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
          <a href="#translators-repetitions-synonyms" className={active === 'translators' && activeSubsection === 'translators-repetitions-synonyms' ? 'is-active' : ''}>Повторения и синонимы</a>
          <a href="#translators-consistency" className={active === 'translators' && activeSubsection === 'translators-consistency' ? 'is-active' : ''}>Цифры, имена и единообразие</a>
          <a href="#translators-adaptations-sounds" className={active === 'translators' && activeSubsection === 'translators-adaptations-sounds' ? 'is-active' : ''}>Отсылки, адаптации и звуки</a>
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
          {/* <a href="#cleaners" onClick={(e) => { e.preventDefault(); onNavigate('cleaners') }}>
            Очистка фона
          </a>
          <a href="#cleaners" onClick={(e) => { e.preventDefault(); onNavigate('cleaners') }}>
            Шумы и артефакты
          </a>
          <a href="#cleaners" onClick={(e) => { e.preventDefault(); onNavigate('cleaners') }}>
            Подготовка к тайпу
          </a> */}
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
          {/* <a href="#typers" onClick={(e) => { e.preventDefault(); onNavigate('typers') }}>
            Формы расположения
          </a>
          <a href="#typers" onClick={(e) => { e.preventDefault(); onNavigate('typers') }}>
            Размеры текста
          </a>
          <a href="#typers" onClick={(e) => { e.preventDefault(); onNavigate('typers') }}>
            Экспорт финала
          </a> */}
        </div>
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
                Мы — команда MangaDesk, того самого сервиса, на котором Вы сейчас находитесь. И прежде чем
                учить нашу платформу клинить фоны, переводить реплики и тайпить текст, мы сами прошли через
                всё это ручками. Долго, упорно и со всеми типичными ошибками новичков. Поэтому решили собрать
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
                Хороший клин, живой перевод, аккуратный тайп — это не магия, а набор принципов. И принципы
                эти куда полезнее держать в голове, чем угадывать на ходу.
              </p>
              <p>
                Если Вы нашли ошибку или хотите что-то уточнить — пишите нам в социальные сети, ссылки
                где-то внизу страницы. Спорить тоже можно, мы не кусаемся.
              </p>
              <h4 className="article-block__subtitle" id="general-terms">Договоримся о терминах</h4>
              <p>
                Чтобы не повторять каждый раз «манга, манхва, маньхуа, комиксы, вебтуны и прочее», в статье
                мы будем называть всё это одним словом — «проект». А «главы», «выпуски», «эпизоды» и «серии»
                в любом из этих форматов — просто «глава». Так короче и понятнее.
              </p>

              <h4 className="article-block__subtitle" id="general-about-article">О чём эта статья?</h4>
              <p>
                Работа над главой — это всегда командная история. Над ней последовательно трудятся
                три роли, и каждая важна по-своему. Перевести, очистить, разместить текст — звучит просто, но
                за каждым шагом стоит набор тонкостей, которые отличают аккуратную работу от халтуры. Мы
                разделили материал на несколько больших разделов с подпунктами, чтобы можно было читать только
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
                    <p className="article-process__desc">Переводит оригинальный <br/> текст на русский</p>
                  </article>

                  <article className="article-process__item">
                    <div className="article-process__icon">
                      <Eraser className="article-process__icon-svg" strokeWidth={2} aria-hidden />
                    </div>
                    <div className="article-process__ribbon">
                      <img src={arrowSvg} alt="" aria-hidden />
                      <span>Клинер</span>
                    </div>
                    <p className="article-process__desc">Удаляет оригинальный <br/>текст и звуки со сканов</p>
                  </article>

                  <article className="article-process__item">
                    <div className="article-process__icon">
                      <Type className="article-process__icon-svg" strokeWidth={2} aria-hidden />
                    </div>
                    <div className="article-process__ribbon">
                      <img src={arrowSvg} alt="" aria-hidden />
                      <span>Тайпер</span>
                    </div>
                    <p className="article-process__desc">Размещает переведенный <br/>текст на очищенных сканах</p>
                  </article>
                  </div>
                </div>
              </div>

              <h4 className="article-block__subtitle" id="general-about-sections">О разделах</h4>
              <ul className="article-list article-list--icon-items">
                <li>
                  <Languages size={25} strokeWidth={2} aria-hidden /> Переводчикам: Как сделать перевод живым, а не дословным. Грамматика, оформление, работа
                  с контекстом проекта и заполнение таблицы для перевода;
                </li>
                <li>
                  <Eraser size={25} strokeWidth={2} aria-hidden /> Клинерам: Как аккуратно очистить сканы, не повредив картинку. Правила работы со штампом,
                  фоном и звуками. Что нужно знать о Photoshop и зачем;
                </li>
                <li>
                  <Type size={25} strokeWidth={2} aria-hidden /> Тайперам: Как грамотно расставить текст на очищенных сканах. Компоновка, шрифты,
                  переносы, оформление мыслей и криков, работа со стилями в Photoshop.
                </li>
              </ul>

              <h4 className="article-block__subtitle" id="general-last-prelude">Последняя прелюдия</h4>
              <p>
                Все правила, которые мы здесь описываем, — не догма ради догмы: за каждым стоит причина, и мы
                стараемся её объяснять. Итак... следующий блок — для переводчиков.
              </p>
            </section>

            <section className="article-block" id="translators">
              <h3 className="article-block__title">Переводчикам</h3>
              <p>
                Переводчик — это человек, ответственный за смысл переведённого проекта. Звучит банально, но на
                этом этапе закладывается всё, что читатель потом увидит в облачках. Если перевод получится сухим
                и дословным, никакой клин или тайп его уже не спасут. Ну а если живым — глава будет читаться так,
                будто её сразу нарисовали на русском, и это лучшее, что может случиться с переводом проекта.
              </p>
              <p>
              Задача переводчика заключается в том, чтобы донести до читателя оригинал как живую историю,
              где важна не буквальная точность, а сохранение духа, эмоций и интонаций. Переводчик подбирает
              слова так, чтобы диалоги звучали естественно, шутки вызывали улыбку, а драматические
              моменты — сопереживание. Иногда это значит уйти от оригинала на пару шагов в сторону.
              И это нормально. От того, насколько глубоко повествование сможет затронуть сердце читателя,
              зависит судьба всего проекта — поэтому давайте перейдём к конкретике.
              </p>
              <img
                src={meme1Png}
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
                Согласование времени, рода и числа — на месте. Знаки в конце предложений
                используем по правилам русского языка: ?, !, ???, !!!, ?!,
                …, !.., ?.. — иного не дано.                 Длинные цепочки
                точек («……») сводим к стандартному троеточию из трёх точек («...»).
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
                      <p style={{ margin: '0 0 12px' }}>Это возможно...?<br />Как я мог так ошибиться... !</p>
                      <p style={{ margin: 0 }}>Ты не понимаешь, как живёт эти люди!</p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 12px', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(var(--fg-rgb), 1)' }}>Правильно</p>
                      <p style={{ margin: '0 0 12px' }}>Кажется, ректор всеми способами пытается задобрить тебя.</p>
                      <p style={{ margin: '0 0 12px' }}>Ян, как насчёт того, чтобы поехать на машине?</p>
                      <p style={{ margin: '0 0 12px' }}>Это возможно?!<br />Как я мог так ошибиться!..</p>
                      <p style={{ margin: 0 }}>Ты не понимаешь, как живут эти люди!</p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 12px', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(var(--fg-rgb), 1)' }}>Пояснение</p>
                      <p style={{ margin: '0 0 12px' }}>Кажется — вводное слово, после него должна быть запятая.</p>
                      <p style={{ margin: '0 0 12px' }}>Пунктуация при обращении и запятая перед «чтобы».</p>
                      <p style={{ margin: '0 0 12px' }}>Знак препинания не по правилам русского языка.</p>
                      <p style={{ margin: 0 }}>Согласование времени, рода и числа.</p>
                    </div>
                  </div>
                </div>
              </div>
              <p>
                Отдельно про тире и дефис, потому что их регулярно путают. Разница не вкусовщина — это разные
                знаки, и грамотный читатель её замечает.
              </p>
              <ul className="article-checklist">
                <li>Дефис (-) соединяет части слова без пробелов: «кое-кто», «как-то», «чёрно-белый»;</li>
                <li>Длинное тире (—) разделяет части предложения с пробелами: «век живи — век учись»;</li>
                <li>Короткое тире (–) обозначает числовые диапазоны: «1941–1945».</li>
              </ul>
              <p>
                Кавычки используем только «ёлочки», лапки "вот такие" оставляем для кода и английских
                текстов. Букву «Ё» пишем там, где ей положено быть: «ещё», «всё», «её» — а не «еще», «все»,
                «ее». Кажется мелочью, но из таких мелочей складывается ощущение «тут поработали от души».
              </p>
              <p>
                А также, весь текст в проекте пишется КАПСОМ. Не потому что персонажи кричат, а потому что строчные
                буквы плохо читаются в баблах и выбиваются из стилистики. Неудобно, но привыкаешь за пару
                глав. Да и некоторые шрифты просто не имеют строчных букв, поэтому при смене шрифта всё может поломаться.
                В общем, КАПС наш друг.
              </p>
              <img
                src={meme2Png}
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
                которой их читает человек. Если на странице облачка идут «лесенкой» — соблюдаем лесенку,
                перепутаете порядок — и диалог развалится: персонаж начнёт отвечать сам себе, а фразы в
                кадре поменяются местами.
              </p>
              <div className="article-mini-card" style={{ margin: '12px 0 18px', padding: 0, overflow: 'hidden' }}>
                <img
                  src={mangaPng}
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
                также выписываем в таблицу перевода — кстати, о ней расскажем ниже.
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
                  Соответствует ли контексту сцены: драке, романтике, комедии? У каждой свой
                  словарь и свой ритм.
                </li>
                <li>
                  Соответствует ли эпохе? Средневековый рыцарь не говорит «окей, бро», а
                  космический инженер не выражается летописным слогом. Уместна ли стилистика —
                  школьник, аристократ, бандит, монашка, — у каждого свой регистр речи.
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
                          НА УЛИЦЕ ПРОИЗОШЛА АВАРИЯ.
                         
                          АВАРИЯ СЛУЧИЛАСЬ ИЗ-ЗА ГОЛОЛЁДА.
                        
                          В РЕЗУЛЬТАТЕ АВАРИИ ПОСТРАДАЛИ ДВА ЧЕЛОВЕКА.
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
                          НА УЛИЦЕ ПРОИЗОШЛО ДТП.
                          
                          ИНЦИДЕНТ СЛУЧИЛСЯ ИЗ-ЗА ГОЛОЛЁДА.
                         
                          В РЕЗУЛЬТАТЕ ПРОИСШЕСТВИЯ ПОСТРАДАЛИ ДВА ЧЕЛОВЕКА.
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
                  src={meme3Jpg}
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
                    Имена, термины и названия должны совпадать от главы к главе. Если в первой главе
                    героя зовут «Кейтаро», в двадцатой не должно внезапно появиться «Кэйтаро». Если
                    артефакт назвали «Меч Семи Ветров», ни в одной главе он не превратится в «Клинок
                    Семи Ветров». Для этого в таблице перевода ведут отдельную вкладку с глоссарием —
                    про неё расскажем чуть ниже.
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
                        <p style={{ margin: 0 }}>Примечания с объяснением незнакомых иностранных слов и событий.</p>
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
                разных команд разные, и единого «правильного» ответа нет. В MangaDesk это
                настраивается отдельно: можно клинить и тайпить переведённые звуки, можно оставить
                оригинальные.
              </p>
            </section>

            <section className="article-block" id="cleaners">
              <h3 className="article-block__title">Для клинеров</h3>
              <p>
                [Шаблон блока-инструментария] Здесь можно перечислять техники очистки и условия их
                применения: когда достаточно базовой ретуши, а когда нужна ручная дорисовка фона.
              </p>
              <ul className="article-list">
                <li>маркированные списки с короткими тезисами;</li>
                <li>врезки с акцентом на ключевой мысли;</li>
                <li>небольшие карточки-пояснения для терминов.</li>
              </ul>
              <p className="article-muted">
                [Подсказка по оформлению] В длинных технических разделах полезно чередовать списки и
                короткие абзацы, чтобы не перегружать читателя сплошным текстом.
              </p>
              <div className="article-grid">
                <article className="article-mini-card">
                  <h4 className="article-mini-card__title">Карточка A</h4>
                  <p>[Кейс] Сложный паттерн фона: какой инструмент выбрать и почему.</p>
                </article>
                <article className="article-mini-card">
                  <h4 className="article-mini-card__title">Карточка B</h4>
                  <p>[Антикейс] Типовая ошибка при очистке и способ её быстро исправить.</p>
                </article>
              </div>
            </section>

            <section className="article-block" id="typers">
              <h3 className="article-block__title">Для тайперов</h3>
              <p>
                [Шаблон практического раздела] Опишите принципы вёрстки реплик: приоритет читабельности,
                визуальный ритм, отступы в баблах и согласованность стиля между страницами.
              </p>
              <p className="article-muted">
                [Служебная заметка] Этим стилем удобно оформлять оговорки, ограничения и второстепенные
                уточнения, чтобы они не конкурировали с основным повествованием.
              </p>
              <p>
                [Пример формата рекомендации] "Длинные реплики разбивайте по смысловым паузам, а не по
                одинаковой длине строк". Такой формат легко сканируется и подходит для чек-пунктов ревью.
              </p>
              <p>
                [Финальный блок секции] Здесь можно размещать краткое резюме раздела и ссылку на смежный
                этап пайплайна, чтобы читатель понимал следующий шаг после прочтения.
              </p>
              <h4 className="article-block__subtitle">Итоговый чеклист</h4>
              <ul className="article-checklist">
                <li>Проверить читабельность на десктопе и мобильном.</li>
                <li>Согласовать стиль заголовков и подзаголовков.</li>
                <li>Убедиться, что врезки не конфликтуют с основным текстом.</li>
                <li>Заполнить блоки реальным контентом после утверждения шаблона.</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  )
}
