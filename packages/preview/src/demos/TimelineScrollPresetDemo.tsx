import { useEffect, useRef } from 'react';
import {
  Surface,
  Heading,
  Text,
  timeline,
  scrollTimelinePreset,
  type TimelineController,
  useScrubOnScroll,
  useTimelineScope,
} from '@pixonui/react';

export default function TimelineScrollPresetDemo() {
  const { ref, createTimeline } = useTimelineScope<HTMLDivElement>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<TimelineController | null>(null);

  const flow = scrollTimelinePreset('staggerSection', {
    duration: 620,
    stagger: 90,
    from: 0.08,
    to: 0.94,
  });

  useScrubOnScroll(ctrlRef.current, {
    ...flow.scrub,
    container: scrollRef,
    axis: 'y',
  });

  useEffect(() => {
    const run = createTimeline({ scrub: true, autoplay: false })
      .set('.tl-card', { opacity: 0, transform: 'translate3d(0, 26px, 0) scale(0.97)' }, 0)
      .add('.tl-card', flow.timeline.keyframes, { ...flow.timeline.options, at: 0 })
      .play();

    ctrlRef.current = run;
    return () => {
      ctrlRef.current = null;
      run.cancel();
    };
  }, [createTimeline, flow.timeline.keyframes, flow.timeline.options]);

  return (
    <Surface className="rounded-3xl border border-white/10 bg-[#04112d]/75 p-6 md:p-8">
      <Heading as="h3" className="mb-2 text-xl font-semibold text-white">
        scrollTimelinePreset + useTimelineScope
      </Heading>
      <Text className="mb-5 text-sm text-white/65">
        Timeline com scrub por container, sem loop imperativo por frame e com stagger declarativo.
      </Text>

      <div
        ref={scrollRef}
        className="h-72 overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-3 md:p-4"
      >
        <div ref={ref} className="space-y-3 pr-1">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="tl-card rounded-xl border border-cyan-400/20 bg-cyan-500/8 px-4 py-4 text-sm text-white/80"
            >
              Card #{index + 1} — stagger + scrub progressivo
            </div>
          ))}
          <div className="h-16" />
        </div>
      </div>
    </Surface>
  );
}
