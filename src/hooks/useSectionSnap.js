import { useEffect, useRef } from 'react';

// Simple hook that enables wheel/touch/key based snapping between sections
// inside a scroll container. The container must be overflow-y: auto and each
// child section should be roughly full-screen height so snapping works well.
export default function useSectionSnap(containerRef, options = {}) {
  const { sectionSelector = 'section', timeout = 700, minDelta = 8 } = options;
  const animatingRef = useRef(false);
  const touchStartRef = useRef(null);
  const touchStartTargetRef = useRef(null);

  useEffect(() => {
    const container = containerRef && containerRef.current;
    if (!container) return;

    const sections = () => Array.from(container.querySelectorAll(sectionSelector));

    const snapToIndex = (index) => {
      const nodes = sections();
      if (!nodes.length) return;
      if (index < 0) index = 0;
      if (index >= nodes.length) index = nodes.length - 1;

      const target = nodes[index];
      if (!target) return;

      animatingRef.current = true;
      container.scrollTo({ top: target.offsetTop, behavior: 'smooth' });

      // unlock after timeout
      setTimeout(() => {
        animatingRef.current = false;
      }, timeout + 50);
    };

    const findCurrentIndex = () => {
      const nodes = sections();
      const scrollTop = container.scrollTop;
      // choose the section with the smallest distance to current scrollTop
      let best = 0;
      let bestDist = Infinity;
      nodes.forEach((n, i) => {
        const d = Math.abs(n.offsetTop - scrollTop);
        if (d < bestDist) { best = i; bestDist = d; }
      });
      return best;
    };

    // Find a scrollable ancestor between the event target and the container
    const findScrollableAncestor = (start) => {
      let el = start;
      while (el && el !== container) {
        if (el.scrollHeight > el.clientHeight) return el;
        el = el.parentElement;
      }
      return null;
    };

    const canScrollElement = (el, delta) => {
      if (!el) return false;
      if (delta > 0) {
        // scrolling down
        return el.scrollTop + el.clientHeight < el.scrollHeight - 1;
      } else {
        // scrolling up
        return el.scrollTop > 0;
      }
    };

    const onWheel = (ev) => {
      if (animatingRef.current) {
        ev.preventDefault();
        return;
      }

      const delta = ev.deltaY;
      if (Math.abs(delta) < minDelta) return; // ignore tiny moves

      // If the wheel event started inside a scrollable child that can still
      // scroll in the direction of the wheel, allow the native scroll so the
      // user can read content inside the section. Otherwise, prevent default
      // and move to the next section.
      const scroller = findScrollableAncestor(ev.target);
      if (scroller && canScrollElement(scroller, delta)) {
        // allow inner scrolling
        return;
      }

      ev.preventDefault();
      const current = findCurrentIndex();
      if (delta > 0) snapToIndex(current + 1);
      else snapToIndex(current - 1);
    };

    let lastTouchY = null;
    const onTouchStart = (ev) => {
      lastTouchY = ev.touches && ev.touches[0] && ev.touches[0].clientY;
      touchStartRef.current = lastTouchY;
      touchStartTargetRef.current = ev.target;
    };

    const onTouchEnd = (ev) => {
      if (animatingRef.current) return;
      const startY = touchStartRef.current;
      const endY = lastTouchY;
      if (startY == null || endY == null) return;
      const diff = startY - endY;
      if (Math.abs(diff) < 30) return;
      // If finger started inside a scrollable child element and that element
      // can scroll in the swipe direction, don't trigger a snap — let the
      // child handle it.
      const startTarget = touchStartTargetRef.current || container;
      const scrollable = findScrollableAncestor(startTarget);
      if (scrollable && canScrollElement(scrollable, diff)) {
        touchStartRef.current = null;
        lastTouchY = null;
        return;
      }
      const current = findCurrentIndex();
      if (diff > 0) snapToIndex(current + 1);
      else snapToIndex(current - 1);
      touchStartRef.current = null;
      lastTouchY = null;
    };

    const onTouchMove = (ev) => {
      lastTouchY = ev.touches && ev.touches[0] && ev.touches[0].clientY;
    };

    const onKeyDown = (ev) => {
      if (animatingRef.current) return;
      // If focused element is scrollable and can scroll in the key direction,
      // don't intercept — let the element handle keyboard scrolling.
      const active = document.activeElement;
      if (active && container.contains(active)) {
        const scroller = findScrollableAncestor(active);
        if (scroller) {
          if (['ArrowDown', 'PageDown'].includes(ev.key) && canScrollElement(scroller, 1)) return;
          if (['ArrowUp', 'PageUp'].includes(ev.key) && canScrollElement(scroller, -1)) return;
        }
      }
      if (['ArrowDown', 'PageDown'].includes(ev.key)) {
        ev.preventDefault();
        snapToIndex(findCurrentIndex() + 1);
      } else if (['ArrowUp', 'PageUp'].includes(ev.key)) {
        ev.preventDefault();
        snapToIndex(findCurrentIndex() - 1);
      }
    };

    // Attach listeners
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [containerRef, sectionSelector, timeout, minDelta]);
}
