import { ChevronDown } from 'lucide-react'
import { useId, useState } from 'react'

const FAQ_ITEMS = [
  {
    id: 'langs',
    question: 'Какие языки поддерживаются?',
    answer:
      'Мы поддерживаем распознавание с английского, японского, китайского и корейского языков. Перевод выполняется на русский с учётом контекста проекта.',
  },
  {
    id: 'time',
    question: 'Сколько времени занимает обработка главы?',
    answer:
      'Обычно от нескольких минут до получаса - в зависимости от количества страниц, сложности графики и выбранных этапов (перевод, клин, тайп).',
  },
  {
    id: 'tokens',
    question: 'Как рассчитывается стоимость и списание токенов?',
    answer:
      'Стоимость зависит от объёма главы и набора включённых функций. Перед запуском обработки вы видите итоговую сумму токенов и подтверждаете её.',
  },
  {
    id: 'zip',
    question: 'Можно ли загружать ZIP без предварительной подготовки?',
    answer:
      'Да. Можно загрузить архив с сырыми сканами: сервис автоматически приведёт страницы к формату, удобному для перевода и вёрстки.',
  },
  {
    id: 'psd',
    question: 'Что входит в PSD на выходе?',
    answer:
      'Вы получаете рабочий PSD со слоями (текст, клин, исходник), чтобы можно было быстро внести ручные правки и финально доработать страницу.',
  },
  {
    id: 'edit-before-psd',
    question: 'Можно ли отредактировать перевод до генерации PSD?',
    answer:
      'Да. Перед созданием PSD вы можете править текст в таблице перевода и запускать финальную сборку только после проверки результата.',
  },
  {
    id: 'team',
    question: 'Как работает командная работа?',
    answer:
      'Вы можете создать команду, приглашать участников и распределять задачи. Оплату производит только владелец команды, доступ участникам выдаётся по приглашению.',
  },
  {
    id: 'webtoon',
    question: 'Поддерживаются ли длинные холсты и вебтуны?',
    answer:
      'Да. Сервис поддерживает длинные холсты и автоматически обрабатывает вебтун-форматы, включая склейку и подготовку страниц.',
  },
  {
    id: 'data',
    question: 'Насколько безопасны мои файлы и проекты?',
    answer:
      'Проекты доступны только вашей учётной записи и приглашённым участникам команды. Мы не публикуем исходники и не передаём их третьим лицам.',
  },
  {
    id: 'promo',
    question: 'Есть ли пробный доступ или промокоды?',
    answer:
      'Да, периодически доступны промокоды и специальные предложения. Следите за обновлениями в личном кабинете и новостях сервиса.',
  },
] as const

export function Faq() {
  const baseId = useId()
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <section className="faq" id="faq" aria-labelledby="faq-title">
      <h2 className="faq__title" id="faq-title">
        ВОПРОСЫ
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
