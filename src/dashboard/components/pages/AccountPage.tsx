import { CreditCard, Link2, Wallet } from 'lucide-react'

type AccountPageProps = {
  title?: string
}

export default function AccountPage({ title = 'Личный кабинет' }: AccountPageProps) {
  return (
    <div className="chapters-page projects-page account-page">
      <div className="dashboard-toolbar projects-page-toolbar">
        <h1>{title}</h1>
      </div>
      <div className="account-grid">
        <section className="account-card">
          <h2>Профиль</h2>
          <label className="account-field">
            <span>Имя пользователя</span>
            <input className="account-input" defaultValue="Still Rise" />
          </label>
          <button type="button" className="dashboard-new-btn">
            Сохранить имя
          </button>
        </section>

        <section className="account-card">
          <h2>
            <CreditCard size={16} strokeWidth={2} /> Подписка
          </h2>
          <p className="account-muted">Текущий тариф: Pro Team (демо)</p>
          <button type="button" className="dashboard-new-btn">
            Оплатить подписку
          </button>
        </section>

        <section className="account-card">
          <h2>
            <Link2 size={16} strokeWidth={2} /> Соцсети
          </h2>
          <div className="account-socials">
            <button type="button" className="account-social-btn">
              Привязать Google
            </button>
            <button type="button" className="account-social-btn">
              Привязать VK
            </button>
          </div>
        </section>

        <section className="account-card">
          <h2>
            <Wallet size={16} strokeWidth={2} /> Баланс токенов
          </h2>
          <label className="account-field">
            <span>Сумма пополнения</span>
            <input className="account-input" defaultValue="5000" />
          </label>
          <button type="button" className="dashboard-new-btn">
            Пополнить токены
          </button>
        </section>
      </div>
    </div>
  )
}
