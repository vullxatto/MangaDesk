import { useContext } from 'react'
import { PipelineReactContext } from './pipelineReactContext'

export function usePipeline() {
  const ctx = useContext(PipelineReactContext)
  if (!ctx) {
    throw new Error('usePipeline must be used within PipelineProvider')
  }
  return ctx
}
