import landingEng from '../assets/images/landing_eng.jpg'
import landingRu from '../assets/images/landing_ru.jpg'
import { Layout } from '../components/Layout'
import { BeforeAfterSlider } from '../components/BeforeAfterSlider'

const BEFORE_SRC = landingRu
const AFTER_SRC = landingEng

const EXAMPLES: Array<{
  id: string
  caption: string
  initialPosition?: number
}> = [
  {
    id: '1',
    caption: 'Слева — до, справа — после. Перетаскивайте разделитель за стрелки.',
    initialPosition: 42,
  },
  {
    id: '2',
    caption: 'Сравнение варианта RU и EN.',
    initialPosition: 50,
  },
  {
    id: '3',
    caption: 'Та же пара кадров — разные стартовые позиции разделителя.',
    initialPosition: 58,
  },
]

export function ExamplesPage() {
  return (
    <Layout headerVariant="minimal">
      <div className="examples-page">
        <header className="examples-page__head">
          <h1 className="examples-page__title">Примеры работы сервиса</h1>
          <p className="examples-page__lead">
            Двигайте разделитель за стрелки в центре: слева показан вариант «до», справа — «после».
          </p>
        </header>

        <div className="examples-page__grid">
          {EXAMPLES.map((ex) => (
            <section key={ex.id} className="examples-page__section">
              <BeforeAfterSlider
                beforeSrc={BEFORE_SRC}
                afterSrc={AFTER_SRC}
                altBefore="RU (до)"
                altAfter="EN (после)"
                caption={ex.caption}
                initialPosition={ex.initialPosition}
              />
            </section>
          ))}
        </div>
      </div>
    </Layout>
  )
}
