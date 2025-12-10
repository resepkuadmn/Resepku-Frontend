import { useEffect, useState } from 'react';

export default function SectionDots({ containerRef, sectionSelector = 'section' }) {
  const [sections, setSections] = useState([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const container = containerRef && containerRef.current;
    if (!container) return;

    const updateSections = () => {
      const nodes = Array.from(container.querySelectorAll(sectionSelector));
      setSections(nodes.map(n => ({ id: n.id || '', title: n.dataset.title || n.id || '' })));
    };

    updateSections();
    const resizeObserver = new ResizeObserver(updateSections);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [containerRef, sectionSelector]);

  useEffect(() => {
    const container = containerRef && containerRef.current;
    if (!container) return;

    let raf = null;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const nodes = Array.from(container.querySelectorAll(sectionSelector));
        if (!nodes.length) return setActive(0);
        const scrollTop = container.scrollTop;
        let best = 0;
        let bestDist = Infinity;
        nodes.forEach((n, i) => {
          const d = Math.abs(n.offsetTop - scrollTop);
          if (d < bestDist) { best = i; bestDist = d; }
        });
        setActive(best);
      });
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      container.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [containerRef, sectionSelector]);

  // Notify the app about the currently active section. Dashboard (or any
  // layout) can listen to this event to update other UI — like the nav.
  useEffect(() => {
    const id = (sections[active] && sections[active].id) || '';
    try {
      window.dispatchEvent(new CustomEvent('section-change', { detail: { id } }));
    } catch (err) {
      // ignore in environments where CustomEvent is not available
    }
  }, [active, sections]);

  const onClick = (index) => {
    const container = containerRef && containerRef.current;
    const nodes = Array.from(container.querySelectorAll(sectionSelector));
    const target = nodes[index];
    if (!target) return;
    container.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
  };

  if (!sections.length) return null;

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 hidden md:flex flex-col gap-3">
      {sections.map((s, i) => (
        <button
          key={`${s.id}-${i}`}
          aria-label={s.title || `Section ${i + 1}`}
          onClick={() => onClick(i)}
          className={`w-3 h-3 rounded-full transition-all duration-200 ${i === active ? 'bg-resepku-orange w-4 h-4 scale-110' : 'bg-gray-300 hover:bg-gray-400'}`}
        />
      ))}
    </div>
  );
}
