import { Cloud, Heart, Maximize2, Send, Settings, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import heroArt from '../assets/images/character1.png'

const toolButtons: Array<{ label: string; Icon: LucideIcon }> = [
  { label: 'Избранное', Icon: Heart },
  { label: 'Облако', Icon: Cloud },
  { label: 'Отправить', Icon: Send },
  { label: 'Настройки', Icon: Settings },
]

export function Landing() {
  return (
    <section className="landing-hero" id="hero" aria-labelledby="hero-title">
      <div className="hero-image-side">
        <div className="hero-art">
          <img src={heroArt} alt="Сцена из манги" width={414} height={558} loading="eager" decoding="async" />
        </div>
      </div>

      <div className="hero-text-side">
        <h1 id="hero-title">
          Новое поколение
          <br />
          перевода
        </h1>

        <div className="content-window">
          <span className="btn-press-wrap window-close-wrap">
            <button className="window-close btn-press" type="button" aria-label="Закрыть окно">
              <Maximize2 size={13} strokeWidth={2} aria-hidden />
            </button>
          </span>

          <div className="window-inner">
            <h2>
              Переводите главы за <br />
              секунды с сохранением
              <br />
              слоёв в PSD
            </h2>
            <p className="description">
              Мы экономим ваше время, чтобы вы занимались <br /> творчеством, а не рутиной
            </p>
          </div>

          <div className="toolbar" aria-label="Панель инструментов">
            {toolButtons.map(({ label, Icon }) => (
              <span className="btn-press-wrap btn-press-wrap--design" key={label}>
                <button className="tool-item btn-press" type="button" aria-label={label}>
                  <Icon size={13} strokeWidth={2} />
                </button>
              </span>
            ))}
          </div>

          <span className="btn-press-wrap btn-press-wrap--design btn-cta-wrap">
            <Link className="btn-cta btn-press" to="/auth">
              Начать работу
            </Link>
          </span>
        </div>
      </div>
    </section>
  )
}
