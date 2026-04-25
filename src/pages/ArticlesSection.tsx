import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function ArticlesSection() {
  return (
    <section className="articles-section" id="articles" aria-labelledby="articles-title">
      <header className="articles-section__header">
        <h2 className="articles-section__title" id="articles-title">
          СТАТЬИ
        </h2>
        <p className="articles-section__subtitle">
          Гайды по сканлейту, советы по работе с PSD и обновления MangaDesk
        </p>
      </header>
      <div className="articles-section__more-host">
        <Link className="features__card features__card--more articles-section__cta" to="/articles">
          <span className="features__more-row">
            <span>Перейти к статьям</span>
            <ArrowRight size={20} strokeWidth={2} aria-hidden />
          </span>
        </Link>
      </div>
    </section>
  )
}
