import { useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { usePipeline } from '../../context/usePipeline'
import scanPlaceholder from '../../../assets/projects - titles/title.png'

const PLACEHOLDER_PHRASES: { original: string; translation: string }[] = [
  {
    original: 'ATTENTION PASSENGERS, WE WILL BE STOPPING AT THE MAIN STATION IN FIVE MINUTES.',
    translation: 'ВНИМАНИЕ, ПАССАЖИРЫ! ЧЕРЕЗ ПЯТЬ МИНУТ ПОЕЗД ПРИБЫВАЕТ НА ЦЕНТРАЛЬНЫЙ ВОКЗАЛ.',
  },
  {
    original: "DON'T FORGET TO PACK Your BeloNGINGS BEFORE MAKING YOUR WAY OUT OF THE TRAIN.",
    translation: 'НЕ ЗАБУДЬТЕ ЗАБРАТЬ СВОИ ВЕЩИ ПРИ ВЫХОДЕ ИЗ ВАГОНА.',
  },
  {
    original: "SO HOW IS IT? I WASN'T KIDDING WheN I SAId ThIs CITY WAS OVERWHELMING.",
    translation: 'НУ КАК ТЕБЕ? Я ЖЕ НЕ ШУТИЛ, КОГДА ГОВОРИЛ, ЧТО ЭТОТ ГОРОД ОШЕЛОМЛЯЕТ.',
  },
  {
    original: "OVERWHELMING? THAT ISN'T THE WORD I'D USE FOR this view, ADONIS.",
    translation: '«ОШЕЛОМЛЯЕТ»? Я БЫ ПОДОБРАЛА ДРУГОЕ СЛОВО ДЛЯ ЭТОГО ВИДА, АДОС!',
  },
  {
    original: 'A CITY WHERE Mortals, shifters, AND ENDURING LIVE IN HARMONY...',
    translation:
      'ГОРОД, В КОТОРОМ СМЕРТНЫЕ, ОБОРОТНИ И ВЕЧНЫЕ ЖИВУТ В МИРЕ... ОН ПРЕКРАСЕН!',
  },
]

export default function ChapterEditorPage() {
  const { chapterId: chapterIdParam } = useParams<{ chapterId: string }>()
  const chapterId = chapterIdParam ? parseInt(chapterIdParam, 10) : NaN
  const { chapters } = usePipeline()

  const chapter = useMemo(() => {
    if (!Number.isFinite(chapterId)) return undefined
    return chapters.find((c) => c.id === chapterId)
  }, [chapters, chapterId])

  if (!Number.isFinite(chapterId) || !chapter) {
    return <Navigate to="/dashboard/chapters" replace />
  }

  return (
    <div className="chapter-editor-page">
      <header className="chapter-editor-header">
        <Link to="/dashboard/chapters" className="chapter-editor-back">
          ← К списку глав
        </Link>
        <h1 className="chapter-editor-title">
          {chapter.title} № {chapter.number}
        </h1>
      </header>

      <div className="chapter-editor-split">
        <div className="chapter-editor-pane chapter-editor-pane--left">
          <div className="chapter-editor-table-wrap">
            <table className="chapter-editor-table">
              <thead>
                <tr>
                  <th scope="col">Оригинал</th>
                  <th scope="col">Перевод</th>
                </tr>
              </thead>
              <tbody>
                {PLACEHOLDER_PHRASES.map((row, i) => (
                  <tr key={i}>
                    <td>{row.original}</td>
                    <td>{row.translation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="chapter-editor-divider" aria-hidden />
        <div className="chapter-editor-pane chapter-editor-pane--right">
          <div className="chapter-editor-scan-viewport">
            <img
              src={scanPlaceholder}
              alt={`Скан: ${chapter.title}, глава ${chapter.number}`}
              className="chapter-editor-scan-img"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
