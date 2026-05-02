import { MANGA_PROJECTS } from '../context/pipelineConstants'

export function projectIdFromTitle(title: string): string | undefined {
  return MANGA_PROJECTS.find((p) => p.title === title)?.id
}
