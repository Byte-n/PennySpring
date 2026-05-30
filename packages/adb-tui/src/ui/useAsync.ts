import { useCallback, useEffect, useState } from 'react'

export interface AsyncState<T> {
  loading: boolean
  data?: T
  error?: unknown
}

export function useAsync<T>(task: () => Promise<T>, deps: ReadonlyArray<unknown> = []): AsyncState<T> & { reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ loading: true })

  const run = useCallback(() => {
    let active = true
    setState({ loading: true })
    task()
      .then(data => active && setState({ loading: false, data }))
      .catch(error => active && setState({ loading: false, error }))
    return () => {
      active = false
    }
  }, deps)

  useEffect(run, [run])

  return { ...state, reload: run }
}
