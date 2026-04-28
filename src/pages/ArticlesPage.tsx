import { Eraser, Info, Languages, Type } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import arrowSvg from '../assets/svg/arrow.svg'
import { Layout } from '../components/Layout'

const SECTION_IDS = ['general', 'translators', 'cleaners', 'typers'] as const
type SectionId = (typeof SECTION_IDS)[number]

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

function ArticlesToc({
  active,
  onNavigate,
}: {
  active: SectionId
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
          {/* <a href="#translators" onClick={(e) => { e.preventDefault(); onNavigate('translators') }}>
            Сверка терминов
          </a>
          <a href="#translators" onClick={(e) => { e.preventDefault(); onNavigate('translators') }}>
            Передача интонаций
          </a>
          <a href="#translators" onClick={(e) => { e.preventDefault(); onNavigate('translators') }}>
            Контроль смысла
          </a> */}
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

  return (
    <Layout headerVariant="minimal">
      <div className="articles-page-main" id="articles-page">
        <div className="articles-layout">
          <div className="articles-layout__toc-rail">
            <div id="articles-page-toc" className="articles-layout__toc">
              <ArticlesToc active={active} onNavigate={scrollTo} />
            </div>
          </div>

          <div className="articles-content">
            <header className="articles-head">
              <p className="articles-kicker">Гайд по работе над переводами манги, манхвы, маньхуа, комиксов, вебтунов и других проектов.</p>
            </header>

            <section className="article-block" id="general">
              <h3 className="article-block__title">Введение</h3>
              <p>
                Доброго времени суток!
              </p>
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

              <h4 className="article-block__subtitle">О чём эта статья?</h4>
              <p>
                Работа над главой — это всегда командная история. Над ней последовательно трудятся
                три роли, и каждая важна по-своему. Перевести, очистить, разместить текст — звучит просто, но
                за каждым шагом стоит набор тонкостей, которые отличают аккуратную работу от халтуры. Мы
                разделили материал на несколько больших разделов с подпунктами, чтобы можно было читать только
                нужную часть и не утонуть в деталях.
              </p>
              <div className="article-process" aria-label="Процесс перевода">
                <h5 className="article-process__title">Процесс перевода</h5>
                <div className="article-process__grid">
                  <article className="article-process__item">
                    <div className="article-process__icon">
                      <Languages size={44} strokeWidth={2} aria-hidden />
                    </div>
                    <div className="article-process__ribbon">
                      <img src={arrowSvg} alt="" aria-hidden />
                      <span>Переводчик</span>
                    </div>
                    <p className="article-process__desc">Переводит оригинальный <br/> текст на русский</p>
                  </article>

                  <article className="article-process__item">
                    <div className="article-process__icon">
                      <Eraser size={44} strokeWidth={2} aria-hidden />
                    </div>
                    <div className="article-process__ribbon">
                      <img src={arrowSvg} alt="" aria-hidden />
                      <span>Клинер</span>
                    </div>
                    <p className="article-process__desc">Удаляет оригинальный <br/>текст и звуки со сканов</p>
                  </article>

                  <article className="article-process__item">
                    <div className="article-process__icon">
                      <Type size={44} strokeWidth={2} aria-hidden />
                    </div>
                    <div className="article-process__ribbon">
                      <img src={arrowSvg} alt="" aria-hidden />
                      <span>Тайпер</span>
                    </div>
                    <p className="article-process__desc">Размещает переведенный <br/>текст на очищенных сканах</p>
                  </article>
                </div>
              </div>

              <h4 className="article-block__subtitle">О разделах:</h4>
              <ul className="article-list article-list--icon-items">
                <li>
                  <Languages size={25} strokeWidth={2} aria-hidden /> Переводчикам. Как сделать перевод живым, а не дословным. Грамматика, оформление, работа
                  с контекстом проекта и заполнение таблицы для перевода;
                </li>
                <li>
                  <Eraser size={25} strokeWidth={2} aria-hidden /> Клинерам. Как аккуратно очистить сканы, не повредив картинку. Правила работы со штампом,
                  фоном и звуками. Что нужно знать о Photoshop и зачем;
                </li>
                <li>
                  <Type size={25} strokeWidth={2} aria-hidden /> Тайперам. Как грамотно расставить текст на очищенных сканах. Компоновка, шрифты,
                  переносы, оформление мыслей и криков, работа со стилями в Photoshop.
                </li>
              </ul>

              <h4 className="article-block__subtitle">Как читать?</h4>
              <p>
                Если Вы учитесь конкретной роли — открывайте свой раздел и читайте по порядку. Если необходимо
                понять процесс целиком — пройдитесь по всем трём.
              </p>
              <p>
                Все правила, которые мы здесь описываем, — не догма ради догмы. За каждым стоит причина, и мы
                стараемся её объяснять. Время читать!
              </p>
            </section>

            <section className="article-block" id="translators">
              <h3 className="article-block__title">Для переводчиков</h3>
              <p>
                [Основной подход] В этом разделе удобно описывать процесс по шагам: анализ оригинала,
                выбор терминологии, проверка смысла и финальная вычитка перед передачей в следующий этап.
              </p>
              <blockquote className="article-note">
                [Врезка-совет] Фиксируйте спорные термины в отдельном глоссарии проекта. Это уменьшает
                расхождения между разными главами и ускоряет согласование спорных формулировок.
              </blockquote>
              <p>
                [Пример описания шага] "Проверьте реплики с подтекстом: в шутках и иронии сначала сохраните
                функцию фразы, потом дословность". Такой формат хорошо подходит для практических рекомендаций.
              </p>
              <h4 className="article-block__subtitle">Шаблон подраздела</h4>
              <ul className="article-list">
                <li>Что делаем на этом шаге.</li>
                <li>Какие ошибки встречаются чаще всего.</li>
                <li>Как проверяем качество перед передачей дальше.</li>
              </ul>
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
