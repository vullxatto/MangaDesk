import { Mail, Send } from 'lucide-react'
import { reloadHome } from '../utils/reloadHome'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__main">
        <div className="site-footer__brand">
          <a className="site-logo site-footer__logo" href="/" onClick={reloadHome} aria-label="MangaDesk">
            <span className="site-logo-box" aria-hidden>
              <img className="site-logo-icon" src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" />
            </span>
            <span className="site-logo-word" aria-hidden>
              <span className="site-logo-char site-logo-char--big">M</span>
              <span className="site-logo-char">anga</span>
              <span className="site-logo-char site-logo-char--big">D</span>
              <span className="site-logo-char">esk</span>
            </span>
          </a>
        </div>
        <div className="site-footer__col">
          <h3 className="site-footer__col-title">О НАС</h3>
          <ul className="site-footer__links">
            <li>
              <a href="#">Кто мы?</a>
            </li>
            <li>
              <a href="#">Вакансии</a>
            </li>
            <li>
              <a href="#">Реклама</a>
            </li>
          </ul>
        </div>
        <div className="site-footer__col">
          <h3 className="site-footer__col-title">ОБЩЕЕ</h3>
          <ul className="site-footer__links">
            <li>
              <a href="#">Правообладателям</a>
            </li>
            <li>
              <a href="#">Правила сайта</a>
            </li>
            <li>
              <a href="#">Соглашения</a>
            </li>
            <li>
              <a href="#">Privacy Policy</a>
            </li>
          </ul>
        </div>
        <div className="site-footer__col">
          <h3 className="site-footer__col-title">СВЯЗЬ</h3>
          <ul className="site-footer__contact">
            <li>
              <a href="#" className="site-footer__contact-link">
                <Send size={16} strokeWidth={2} aria-hidden />
                Telegram
              </a>
            </li>
            <li>
              <a href="#" className="site-footer__contact-link">
                <Mail size={16} strokeWidth={2} aria-hidden />
                Gmail
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="site-footer__bottom">
        <p className="site-footer__copyright">
          © 2024 MANGADESK — СЕРВИС ДЛЯ ПЕРЕВОДА. ВСЕ ПРАВА ЗАЩИЩЕНЫ.
        </p>
      </div>
    </footer>
  )
}
