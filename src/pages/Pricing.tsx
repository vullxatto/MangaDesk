import {
  Check,
  FileOutput,
  Flame,
  Layers,
  Ticket,
  Users,
} from 'lucide-react'
import girlImage from '../assets/images/girl.png'
import portal1Image from '../assets/images/portal1.png'
import portal2Image from '../assets/images/portal2.png'

export function Pricing() {
  return (
    <section className="pricing" id="pricing" aria-labelledby="pricing-title">
      <header className="pricing__header">
        <h2 className="pricing__title" id="pricing-title">
          ТАРИФЫ
        </h2>
        <p className="pricing__subtitle">Выберите подходящий объём для ваших нужд</p>
      </header>

      <div className="pricing__grid">
        <article className="pricing__card pricing__card--with-portal1">
          <span className="pricing__portal pricing__portal--left" aria-hidden>
            <img className="pricing__portal-img pricing__portal-img--portal1" src={portal1Image} alt="" draggable={false} />
          </span>
          <h3 className="pricing__card-name">СТАРТОВЫЙ</h3>
          <div className="pricing__price">
            <span className="pricing__price-num">100</span>
            <span className="pricing__price-suffix">₽ / мес</span>
          </div>
          <ul className="pricing__list">
            <li>
              <Check className="pricing__list-icon" size={18} strokeWidth={2} aria-hidden />
              <span>100 000 Токенов</span>
            </li>
            <li>
              <FileOutput className="pricing__list-icon" size={18} strokeWidth={2} aria-hidden />
              <span>Экспорт в PSD</span>
            </li>
          </ul>
          <button type="button" className="pricing__btn pricing__btn--auth-like">
            <span className="pricing__btn-label">Оформить</span>
            <span className="pricing__btn-balance" aria-hidden />
          </button>
        </article>

        <article className="pricing__card">
          <h3 className="pricing__card-name">ЧИТАТЕЛЬСКИЙ</h3>
          <div className="pricing__price">
            <span className="pricing__price-num">500</span>
            <span className="pricing__price-suffix">₽ / мес</span>
          </div>
          <ul className="pricing__list">
            <li>
              <Check className="pricing__list-icon" size={18} strokeWidth={2} aria-hidden />
              <span>300 000 Токенов</span>
            </li>
          </ul>
          <p className="pricing__includes">Без клина и тайпа, <br/> но много Токенов</p>
          <button type="button" className="pricing__btn pricing__btn--auth-like">
            <span className="pricing__btn-label">Оформить</span>
            <span className="pricing__btn-balance" aria-hidden />
          </button>
        </article>

        <article className="pricing__card pricing__card--featured">
          <h3 className="pricing__card-name">МАКСИМУМ</h3>
          <div className="pricing__price">
            <span className="pricing__price-num">2 300</span>
            <span className="pricing__price-suffix">₽ / мес</span>
          </div>
          <ul className="pricing__list">
            <li>
              <Check className="pricing__list-icon" size={18} strokeWidth={2} aria-hidden />
              <span>20 000 000 Токенов</span>
            </li>
            <li>
              <Layers className="pricing__list-icon" size={18} strokeWidth={2} aria-hidden />
              <span>Параллельная обработка глав</span>
            </li>
            <li>
              <Flame className="pricing__list-icon" size={18} strokeWidth={2} aria-hidden />
              <span>Приоритет в очереди</span>
            </li>
          </ul>
          <p className="pricing__includes">Включает всё <br/> из «Стандартного»</p>
          <button type="button" className="pricing__btn pricing__btn--auth-like">
            <span className="pricing__btn-label">Оформить</span>
            <span className="pricing__btn-balance" aria-hidden />
          </button>
        </article>

        <article className="pricing__card pricing__card--with-girl">
          <span className="pricing__girl" aria-hidden>
            <img className="pricing__girl-img" src={girlImage} alt="" draggable={false} />
          </span>
          <span className="pricing__portal pricing__portal--right" aria-hidden>
            <img className="pricing__portal-img pricing__portal-img--portal2" src={portal2Image} alt="" draggable={false} />
          </span>
          <h3 className="pricing__card-name">СТАНДАРТНЫЙ</h3>
          <div className="pricing__price">
            <span className="pricing__price-num">1 500</span>
            <span className="pricing__price-suffix">₽ / мес</span>
          </div>
          <ul className="pricing__list">
            <li>
              <Check className="pricing__list-icon" size={18} strokeWidth={2} aria-hidden />
              <span>7 500 000 Токенов</span>
            </li>
            <li>
              <Users className="pricing__list-icon" size={18} strokeWidth={2} aria-hidden />
              <span>Создание команд</span>
            </li>
          </ul>
          <p className="pricing__includes">Включает всё <br/>из «Стартового»</p>
          <button type="button" className="pricing__btn pricing__btn--auth-like">
            <span className="pricing__btn-label">Оформить</span>
            <span className="pricing__btn-balance" aria-hidden />
          </button>
        </article>
      </div>

      <p className="pricing__promo">
        <a className="pricing__promo-link" href="#">
          <Ticket size={16} strokeWidth={2} className="pricing__promo-icon" aria-hidden />
          У меня есть промокод
        </a>
      </p>
    </section>
  )
}
