import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import annaImage from '../assets/images/Footer/anna.avif'
import mailIcon from '../assets/svg/Mail.svg'
import telegramIcon from '../assets/svg/Telegram.svg'
import tikTokIcon from '../assets/svg/TikTok.svg'
import vkIcon from '../assets/svg/VK.svg'
import { reloadHome } from '../utils/reloadHome'

const FOOTER_EMAIL = 'example@magadesk.ru'

const footerSocialLinks = [
  { href: 'https://t.me/mangadeskofficial', label: 'Telegram', icon: telegramIcon },
  { copyText: FOOTER_EMAIL, label: 'Почта', icon: mailIcon },
  { href: 'https://vk.ru/mangadesk', label: 'ВКонтакте', icon: vkIcon },
  { href: '#', label: 'TikTok', icon: tikTokIcon },
] as const

function FooterSocialIcon({ icon }: { icon: string }) {
  const style = { '--social-icon': `url("${icon}")` } as CSSProperties

  return <span className="site-footer__social-icon" style={style} aria-hidden />
}

export function Footer() {
  const [emailCopied, setEmailCopied] = useState(false)
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(FOOTER_EMAIL)
      setEmailCopied(true)
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
      copyTimeoutRef.current = setTimeout(() => setEmailCopied(false), 2500)
    } catch {
      setEmailCopied(false)
    }
  }, [])

  useEffect(
    () => () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
    },
    [],
  )

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
          <div className="site-footer__social-wrap">
            <ul className="site-footer__social">
              {footerSocialLinks.map((link) => {
                const { label, icon } = link

                if ('copyText' in link) {
                  return (
                    <li key={label}>
                      <button
                        type="button"
                        className="site-footer__social-link"
                        aria-label={`Скопировать почту ${link.copyText}`}
                        onClick={copyEmail}
                      >
                        <FooterSocialIcon icon={icon} />
                      </button>
                    </li>
                  )
                }

                return (
                  <li key={label}>
                    <a
                      href={link.href}
                      className="site-footer__social-link"
                      aria-label={label}
                      {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      <FooterSocialIcon icon={icon} />
                    </a>
                  </li>
                )
              })}
            </ul>
            <p
              className={`site-footer__copy-hint${emailCopied ? ' is-visible' : ''}`}
              role="status"
              aria-live="polite"
            >
              Адрес почты скопирован!
            </p>
          </div>
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
          <h3 className="site-footer__col-title">ПОЛЬЗОВАТЕЛЯМ</h3>
          <ul className="site-footer__links">
            <li>
              <a href="#">Пользовательское соглашение</a>
            </li>
            <li>
              <a href="#">Политика использования файлов cookie</a>
            </li>
            <li>
              <a href="#">Согласие на обработку персональных данных</a>
            </li>
          </ul>
        </div>
      </div>
      <span className="site-footer__anna" aria-hidden>
        <img className="site-footer__anna-img" src={annaImage} alt="" draggable={false} />
      </span>
      <div className="site-footer__bottom">
        <p className="site-footer__copyright">
          © 2026 MANGADESK — СЕРВИС ДЛЯ ПЕРЕВОДА. ВСЕ ПРАВА ЗАЩИЩЕНЫ.
        </p>
      </div>
    </footer>
  )
}
