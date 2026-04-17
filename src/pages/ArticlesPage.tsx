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
          <ArticlesToc active={active} onNavigate={scrollTo} />

          <div className="articles-content">
            <header className="articles-head">
              <p className="articles-kicker">Руководство по вёрстке статьи</p>
              <h1 className="articles-doc-title" id="articles-doc-title">
                Заготовка для написания статей
              </h1>
              <p className="articles-lead">
                Этот шаблон нужен для визуализации структуры: длинные абзацы, заметки, списки и врезки.
                Текст пока символический и служит ориентиром для будущего наполнения.
              </p>
            </header>

            <section className="article-block" id="general">
              <h3 className="article-block__title">Общая</h3>
              <p>
                Символический абзац: здесь будет вводная часть о цели статьи, о контексте и о том, зачем
                читателю переходить к следующим разделам. Пока это черновой текст для проверки отступов.
              </p>
              <p>
                Ещё один абзац-заполнитель: аккуратная длина строки, комфортный интерлиньяж и спокойный
                ритм чтения. Такой блок позволяет быстро оценить визуальный тон страницы.
              </p>
            </section>

            <section className="article-block" id="translators">
              <h3 className="article-block__title">Для переводчиков</h3>
              <p>
                Здесь будет описание композиции: как чередовать короткие и длинные абзацы, где ставить
                промежуточные подзаголовки и как удерживать внимание на протяжении всего материала.
              </p>
              <blockquote className="article-note">
                Врезка-примечание: этот блок выделяет важную мысль или быстрый совет, который должен
                читаться отдельно от основного потока текста.
              </blockquote>
              <p>
                Символический текст для проверки длинного фрагмента. Символический текст для проверки
                длинного фрагмента. Символический текст для проверки длинного фрагмента.
              </p>
            </section>

            <section className="article-block" id="cleaners">
              <h3 className="article-block__title">Для клинеров</h3>
              <p>Для визуализации разных форматов можно использовать:</p>
              <ul className="article-list">
                <li>маркированные списки с короткими тезисами;</li>
                <li>врезки с акцентом на ключевой мысли;</li>
                <li>небольшие карточки-пояснения для терминов.</li>
              </ul>
              <div className="article-grid">
                <article className="article-mini-card">
                  <h4 className="article-mini-card__title">Карточка A</h4>
                  <p>Короткий фрагмент текста-заполнителя для блока с быстрым пояснением.</p>
                </article>
                <article className="article-mini-card">
                  <h4 className="article-mini-card__title">Карточка B</h4>
                  <p>Второй пример карточки: можно хранить примеры, термины или ссылки.</p>
                </article>
              </div>
            </section>

            <section className="article-block" id="typers">
              <h3 className="article-block__title">Для тайперов</h3>
              <p>
                Этот раздел нужен для визуальной проверки иерархии: заголовок первого уровня, заголовок
                второго уровня, обычный параграф, подписи и вспомогательные элементы интерфейса.
              </p>
              <p className="article-muted">
                Вспомогательная подпись: символический текст для второстепенной информации.
              </p>
              <p>
                Здесь позже появятся реальные примеры из редактуры: как переносить реплики, как строить
                абзацы в сложных баблах и как избегать визуальной перегрузки.
              </p>
              <p>
                Технический текст-заполнитель, технический текст-заполнитель, технический текст-заполнитель.
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
