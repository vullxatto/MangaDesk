import { Archive, Languages, Layers, type LucideIcon } from 'lucide-react'

type Step = {
  id: string
  step: string
  title: string
  description: string
  Icon: LucideIcon
}

const steps: Step[] = [
  {
    id: 'upload',
    step: '01',
    title: 'Загрузите ZIP',
    description: 'Перетащите архив с оригинальными сканами. Поддерживаем популярные форматы изображений',
    Icon: Archive,
  },
  {
    id: 'process',
    step: '02',
    title: 'Обработка',
    description: 'Сервис автоматически клинит фон, переводит и тайпит текст на русском языке',
    Icon: Languages,
  },
  {
    id: 'download',
    step: '03',
    title: 'Скачайте PSD',
    description: 'Получите архив с PSD, где оригинал, клин и текст разведены по отдельным слоям',
    Icon: Layers,
  },
]

export function HowItWorks() {
  return (
    <section className="how-it-works" id="how" aria-labelledby="how-title">
      <h2 className="how-it-works__title" id="how-title">
        КАК ЭТО РАБОТАЕТ
      </h2>
      <div className="how-it-works__grid">
        {steps.map(({ id, step, title, description, Icon }) => (
          <article className="how-step" key={id}>
            <span className="how-step__num" aria-hidden>
              {step}
            </span>
            <span className="btn-press-wrap how-step__icon-wrap">
              <span className="btn-press how-step__icon">
                <Icon size={16} strokeWidth={2} />
              </span>
            </span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
