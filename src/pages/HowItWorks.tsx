import type { ReactNode } from 'react'
import { ArrowBigUpDash, CheckLine, Sparkles, type LucideIcon } from 'lucide-react'
import boardPng from '../assets/images/board.png'

type Step = {
  id: string
  step: string
  title: string
  description: ReactNode
  Icon: LucideIcon
}

const steps: Step[] = [
  {
    id: 'upload',
    step: '01',
    title: 'Загрузка',
    description: (
      <>
        Перетащите ZIP-архив <br />
        с оригинальными сканами. <br />
        Поддерживаем JPG и PNG
      </>
    ),
    Icon: ArrowBigUpDash,
  },
  {
    id: 'process',
    step: '02',
    title: 'Обработка',
    description: (
      <>
        Сервис автоматически <br />
        клинит фон, переводит <br />
        и тайпит текст
      </>
    ),
    Icon: Sparkles,
  },
  {
    id: 'download',
    step: '03',
    title: 'Результат',
    description: (
      <>
        Архив с PSD, где оригинал, <br />
        клин и текст разнесены <br />
        по отдельным слоям
      </>
    ),
    Icon: CheckLine,
  },
]

export function HowItWorks() {
  return (
    <section className="how-it-works" id="how" aria-labelledby="how-title">
      <h2 className="how-it-works__title" id="how-title">
        КАК ЭТО РАБОТАЕТ?
      </h2>
      <div className="how-it-works__steps">
        <div className="how-it-works__panel" aria-hidden />
        <div className="how-it-works__grid">
          {steps.map(({ id, step, title, description, Icon }) => (
            <article className="how-step" key={id}>
              <span className="how-step__num" aria-hidden>
                {step}
              </span>
              <span className="btn-press-wrap how-step__icon-wrap">
                <span className="btn-press how-step__icon">
                  <Icon size={48} strokeWidth={2} />
                </span>
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
          <div className="how-it-works__board" aria-hidden>
            <img className="how-it-works__board-img" src={boardPng} alt="" loading="lazy" decoding="async" />
          </div>
        </div>
      </div>
    </section>
  )
}
