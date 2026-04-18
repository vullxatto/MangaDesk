import { createContext } from 'react'
import type { PipelineContextValue } from '../pipelineTypes'

export const PipelineReactContext = createContext<PipelineContextValue | null>(null)
