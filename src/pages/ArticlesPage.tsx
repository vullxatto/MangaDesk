import { Eraser, Info, Languages, Type } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
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
          <span>Общая часть</span>
        </a>
        <a
          href="#general"
          className="articles-toc-sub"
          onClick={(e) => {
            e.preventDefault()
            onNavigate('general')
          }}
        >
          О проекте и правила
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
          <span>Для переводчиков</span>
        </a>
        <div className="articles-toc-children">
          <a href="#translators" onClick={(e) => { e.preventDefault(); onNavigate('translators') }}>
            Сверка терминов
          </a>
          <a href="#translators" onClick={(e) => { e.preventDefault(); onNavigate('translators') }}>
            Передача интонаций
          </a>
          <a href="#translators" onClick={(e) => { e.preventDefault(); onNavigate('translators') }}>
            Контроль смысла
          </a>
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
          <span>Для клинеров</span>
        </a>
        <div className="articles-toc-children">
          <a href="#cleaners" onClick={(e) => { e.preventDefault(); onNavigate('cleaners') }}>
            Очистка фона
          </a>
          <a href="#cleaners" onClick={(e) => { e.preventDefault(); onNavigate('cleaners') }}>
            Шумы и артефакты
          </a>
          <a href="#cleaners" onClick={(e) => { e.preventDefault(); onNavigate('cleaners') }}>
            Подготовка к тайпу
          </a>
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
          <span>Для тайперов</span>
        </a>
        <div className="articles-toc-children">
          <a href="#typers" onClick={(e) => { e.preventDefault(); onNavigate('typers') }}>
            Формы расположения
          </a>
          <a href="#typers" onClick={(e) => { e.preventDefault(); onNavigate('typers') }}>
            Размеры текста
          </a>
          <a href="#typers" onClick={(e) => { e.preventDefault(); onNavigate('typers') }}>
            Экспорт финала
          </a>
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
              <p className="articles-kicker">Руководство по вёрстке статьи</p>
              <h1 className="articles-doc-title" id="articles-doc-title">
                Заготовка для написания статей
              </h1>
              <p className="articles-lead">
                Эта страница - рабочий шаблон для будущих материалов. Ниже собраны готовые блоки:
                вводные абзацы, подзаголовки, заметки, списки, карточки, чеклисты и финальные выводы.
                При написании реальной статьи можно заменять только текст, сохраняя структуру секций.
              </p>
            </header>

            <section className="article-block" id="general">
              <h3 className="article-block__title">Общая</h3>
              <p>
                [Вступление] Коротко объясните цель материала: что читатель получит после прочтения и для
                кого предназначено руководство. Этот абзац обычно отвечает на вопрос "зачем читать дальше".
              </p>
              <p>
                [Контекст] Во втором абзаце можно описать ограничения, исходные данные и договорённости:
                версии инструментов, формат исходников, целевое качество результата и критерии приёмки.
              </p>
              <h4 className="article-block__subtitle">Мини-шаблон вводного раздела</h4>
              <ul className="article-checklist">
                <li>Кому адресован материал.</li>
                <li>Какой результат считается успешным.</li>
                <li>Какие входные данные требуются до старта.</li>
              </ul>
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
