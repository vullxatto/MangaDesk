import { ChevronDown } from 'lucide-react'
import { useId, useState } from 'react'

const FAQ_ITEMS = [
  {
    id: 'langs',
    question: 'Какие языки поддерживаются?',
    answer:
      'Мы поддерживаем распознавание с английского, японского, китайского и корейского языков. Перевод осуществляется на русский язык с использованием специализированных моделей, понимающих контекст проекта',
  },
] as const

export function Faq() {
  const baseId = useId()
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <section className="faq" id="faq" aria-labelledby="faq-title">
      <h2 className="faq__title" id="faq-title">
        ЧАСТЫЕ ВОПРОСЫ
      </h2>
      <div className="faq__list">
        {FAQ_ITEMS.map((item) => {
          const panelId = `${baseId}-${item.id}`
          const isOpen = openId === item.id
          return (
            <div className="faq__item" key={item.id}>
              <button
                type="button"
                className="faq__question"
                aria-expanded={isOpen}
                aria-controls={panelId}
                id={`${panelId}-btn`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setOpenId((prev) => (prev === item.id ? null : item.id))}
              >
                <span className="faq__question-text">{item.question}</span>
                <ChevronDown
                  className={isOpen ? 'faq__chev faq__chev--open' : 'faq__chev'}
                  size={22}
                  strokeWidth={2}
                  aria-hidden
                />
              </button>
              <div
                className="faq__panel"
                id={panelId}
                role="region"
                aria-labelledby={`${panelId}-btn`}
                hidden={!isOpen}
              >
                <p className="faq__answer">{item.answer}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
