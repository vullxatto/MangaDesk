import { MoveHorizontal } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type BeforeAfterSliderProps = {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
};

export function BeforeAfterSlider({ beforeSrc, afterSrc, beforeAlt, afterAlt }: BeforeAfterSliderProps) {
  const [percent, setPercent] = useState(50);
  const [fullscreen, setFullscreen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [fullscreenSize, setFullscreenSize] = useState<{ width: number; height: number } | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const activeDragSliderRef = useRef<HTMLDivElement | null>(null);
  const dragStartXRef = useRef(0);
  const draggedRef = useRef(false);
  const suppressOpenUntilRef = useRef(0);
  const paneStyle = useMemo(() => ({ width: `${percent}%` }), [percent]);
  const dividerStyle = useMemo(() => ({ left: `${percent}%` }), [percent]);
  const beforeImageStyle = useMemo(
    () => ({ width: 'var(--before-after-image-width, 100%)', maxWidth: 'none' as const }),
    [],
  );
  const beforeLabelStyle = useMemo(() => {
    const threshold = 20;
    const opacity = Math.max(0, Math.min(1, percent / threshold));
    return { opacity, transition: 'opacity 0.18s ease' };
  }, [percent]);
  const afterLabelStyle = useMemo(() => {
    const threshold = 20;
    const opacity = Math.max(0, Math.min(1, (100 - percent) / threshold));
    return { opacity, transition: 'opacity 0.18s ease' };
  }, [percent]);

  const computeFullscreenSize = useCallback(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const rect = slider.getBoundingClientRect();
    const sourceWidth = Math.max(1, rect.width);
    const sourceHeight = Math.max(1, rect.height);

    const viewportWidth = window.innerWidth - 48;
    const viewportHeight = window.innerHeight - 48;
    const scale = Math.min(viewportWidth / sourceWidth, viewportHeight / sourceHeight);

    setFullscreenSize({
      width: Math.max(1, Math.round(sourceWidth * scale)),
      height: Math.max(1, Math.round(sourceHeight * scale)),
    });
  }, []);

  const syncBeforeImageWidth = useCallback((sliderElement: HTMLDivElement | null) => {
    if (!sliderElement) return;
    sliderElement.style.setProperty('--before-after-image-width', `${sliderElement.offsetWidth}px`);
  }, []);

  const updateFromClientX = useCallback((clientX: number) => {
    const slider = activeDragSliderRef.current ?? sliderRef.current;
    if (!slider) return;

    const rect = slider.getBoundingClientRect();
    if (rect.width <= 0) return;
    syncBeforeImageWidth(slider);

    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const nextPercent = (x / rect.width) * 100;
    setPercent(nextPercent);
  }, [syncBeforeImageWidth]);

  const startDrag = useCallback(
    (clientX: number, sliderElement: HTMLDivElement | null) => {
      activeDragSliderRef.current = sliderElement;
      dragStartXRef.current = clientX;
      draggedRef.current = false;
      setDragging(true);
      updateFromClientX(clientX);
    },
    [syncBeforeImageWidth, updateFromClientX],
  );

  const endDrag = useCallback(() => {
    setDragging(false);
    activeDragSliderRef.current = null;
    if (draggedRef.current) {
      suppressOpenUntilRef.current = Date.now() + 180;
    }
  }, []);

  useEffect(() => {
    if (!dragging) return undefined;

    const onMouseMove = (event: MouseEvent) => {
      if (Math.abs(event.clientX - dragStartXRef.current) > 4) {
        draggedRef.current = true;
      }
      updateFromClientX(event.clientX);
    };

    const onMouseUp = () => {
      endDrag();
    };

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      if (Math.abs(touch.clientX - dragStartXRef.current) > 4) {
        draggedRef.current = true;
      }
      event.preventDefault();
      updateFromClientX(touch.clientX);
    };

    const onTouchEnd = () => {
      endDrag();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [dragging, endDrag, updateFromClientX]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return undefined;

    syncBeforeImageWidth(slider);

    const resizeObserver = new ResizeObserver(() => {
      syncBeforeImageWidth(slider);
    });
    resizeObserver.observe(slider);

    return () => resizeObserver.disconnect();
  }, [syncBeforeImageWidth]);

  useEffect(() => {
    if (!fullscreen) return undefined;
    const frame = window.requestAnimationFrame(() => {
      const fullscreenSlider = document.querySelector('.modal-slider-target .before-after-slider');
      if (fullscreenSlider instanceof HTMLDivElement) {
        syncBeforeImageWidth(fullscreenSlider);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [fullscreen, syncBeforeImageWidth]);

  useEffect(() => {
    if (!fullscreen) return undefined;
    computeFullscreenSize();

    const onResize = () => {
      computeFullscreenSize();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFullscreen(false);
    };

    window.addEventListener('resize', onResize);
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [computeFullscreenSize, fullscreen]);

  const handleOpenFullscreen = useCallback(() => {
    if (Date.now() < suppressOpenUntilRef.current) return;
    computeFullscreenSize();
    setFullscreen(true);
  }, [computeFullscreenSize]);

  const sliderClassName = `before-after-slider${dragging ? ' before-after-slider--dragging' : ''}`;

  const sliderMarkup = (isFullscreen: boolean) => (
    <div
      ref={isFullscreen ? null : sliderRef}
      className={sliderClassName}
      style={
        isFullscreen && fullscreenSize
          ? {
              width: `${fullscreenSize.width}px`,
              height: `${fullscreenSize.height}px`,
              aspectRatio: 'unset',
              maxWidth: 'none',
              margin: 0,
            }
          : undefined
      }
      onClick={isFullscreen ? undefined : handleOpenFullscreen}
      role={isFullscreen ? undefined : 'button'}
      tabIndex={isFullscreen ? undefined : 0}
      onKeyDown={
        isFullscreen
          ? undefined
          : (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleOpenFullscreen();
              }
            }
      }
    >
      <img src={afterSrc} alt={afterAlt} />
      <div className="before-after-pane" style={paneStyle}>
        <img src={beforeSrc} alt={beforeAlt} style={beforeImageStyle} />
      </div>
      <span className="before-after-label before-after-label--before" style={beforeLabelStyle}>
        До
      </span>
      <span className="before-after-label before-after-label--after" style={afterLabelStyle}>
        После
      </span>
      <div className="before-after-divider" style={dividerStyle}>
        <div
          className="before-after-grip"
          aria-hidden="true"
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            const sliderElement = event.currentTarget.closest('.before-after-slider');
            startDrag(event.clientX, sliderElement instanceof HTMLDivElement ? sliderElement : null);
          }}
          onTouchStart={(event) => {
            const touch = event.touches[0];
            if (!touch) return;
            event.preventDefault();
            event.stopPropagation();
            const sliderElement = event.currentTarget.closest('.before-after-slider');
            startDrag(touch.clientX, sliderElement instanceof HTMLDivElement ? sliderElement : null);
          }}
        >
          <MoveHorizontal className="icon-20" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {sliderMarkup(false)}

      {fullscreen
        ? createPortal(
            <div className="modal-overlay active" onClick={() => setFullscreen(false)}>
              <div className="close-modal" onClick={() => setFullscreen(false)}>
                ×
              </div>
              <div className="modal-slider-target" onClick={(event) => event.stopPropagation()}>
                {sliderMarkup(true)}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
