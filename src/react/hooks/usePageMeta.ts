import { useEffect } from 'react';

export function usePageMeta(title: string, bodyClass?: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    if (!bodyClass) return undefined;
    document.body.classList.add(bodyClass);
    return () => document.body.classList.remove(bodyClass);
  }, [bodyClass]);
}
