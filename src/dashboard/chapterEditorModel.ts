/**
 * Фрагмент текста главы (ответ бэкенда).
 * bbox — четыре целых: [left, top, right, bottom] в пикселях исходного скана.
 */
export interface ChapterTranslationSlice {
  id: number
  slice_id: number
  type: string
  text: string
  bbox: [number, number, number, number]
  confidence?: number
  translated: string
}

export function bboxToPercentStyle(
  bbox: [number, number, number, number],
  naturalWidth: number,
  naturalHeight: number,
): { left: string; top: string; width: string; height: string } {
  const [x1, y1, x2, y2] = bbox
  if (naturalWidth <= 0 || naturalHeight <= 0) {
    return { left: '0%', top: '0%', width: '0%', height: '0%' }
  }
  return {
    left: `${(x1 / naturalWidth) * 100}%`,
    top: `${(y1 / naturalHeight) * 100}%`,
    width: `${((x2 - x1) / naturalWidth) * 100}%`,
    height: `${((y2 - y1) / naturalHeight) * 100}%`,
  }
}

/** Демо-данные; при появлении API заменить загрузкой по chapterId */
export function getMockChapterSlices(): ChapterTranslationSlice[] {
  return [
    {
      id: 1,
      slice_id: 39,
      type: 'bubble',
      text: 'ATTENTION PASSENGERS, WE WILL BE STOPPING AT THE MAIN STATION IN FIVE MINUTES.',
      bbox: [62, 124, 406, 180],
      confidence: 0.607,
      translated:
        'ВНИМАНИЕ, ПАССАЖИРЫ! ЧЕРЕЗ ПЯТЬ МИНУТ ПОЕЗД ПРИБЫВАЕТ НА ЦЕНТРАЛЬНЫЙ ВОКЗАЛ.',
    },
    {
      id: 2,
      slice_id: 41,
      type: 'bubble',
      text: "DON'T FORGET TO PACK Your BeloNGINGS BEFORE MAKING YOUR WAY OUT OF THE TRAIN.",
      bbox: [365, 18, 375, 218],
      confidence: 0.47,
      translated: 'НЕ ЗАБУДЬТЕ ЗАБРАТЬ СВОИ ВЕЩИ ПРИ ВЫХОДЕ ИЗ ВАГОНА.',
    },
    {
      id: 3,
      slice_id: 42,
      type: 'bubble',
      text: "SO HOW IS IT? I WASN'T KIDDING WheN I SAId ThIs CITY WAS OVERWHELMING.",
      bbox: [48, 320, 660, 520],
      confidence: 0.55,
      translated: 'НУ КАК ТЕБЕ? Я ЖЕ НЕ ШУТИЛ, КОГДА ГОВОРИЛ, ЧТО ЭТОТ ГОРОД ОШЕЛОМЛЯЕТ.',
    },
    {
      id: 4,
      slice_id: 43,
      type: 'bubble',
      text: "OVERWHELMING? THAT ISN'T THE WORD I'D USE FOR this view, ADONIS.",
      bbox: [48, 560, 660, 780],
      confidence: 0.52,
      translated: '«ОШЕЛОМЛЯЕТ»? Я БЫ ПОДОБРАЛА ДРУГОЕ СЛОВО ДЛЯ ЭТОГО ВИДА, АДОС!',
    },
    {
      id: 5,
      slice_id: 44,
      type: 'bubble',
      text: 'A CITY WHERE Mortals, shifters, AND ENDURING LIVE IN HARMONY...',
      bbox: [48, 820, 660, 1080],
      confidence: 0.48,
      translated:
        'ГОРОД, В КОТОРОМ СМЕРТНЫЕ, ОБОРОТНИ И ВЕЧНЫЕ ЖИВУТ В МИРЕ... ОН ПРЕКРАСЕН!',
    },
  ]
}
