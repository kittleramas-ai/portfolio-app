import { Reveal } from './Reveal'
import { AnimatedText } from './AnimatedText'

export function QuoteSection() {
  return (
    <section
      className="py-28 md:py-36 px-6 md:px-12 relative overflow-hidden border-b border-slate-border"
      style={{
        background:
          'radial-gradient(800px 400px at 20% 10%, var(--portfolio-quote-glint), transparent 60%), radial-gradient(700px 380px at 85% 90%, var(--portfolio-quote-shadow), transparent 60%), var(--portfolio-quote-bg)',
      }}
    >
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <AnimatedText
          as="blockquote"
          split="words"
          mode="scrub"
          stagger={0.06}
          className="tracking-tight leading-[1.18] md:leading-[1.15] text-2xl sm:text-4xl md:text-5xl lg:text-[54px] font-extrabold"
          style={{ fontFamily: '"Space Grotesk", sans-serif' }}
        >
          <span className="text-teal-100/70 inline">
            “Technology creates possibilities,
          </span>
          <span className="text-white inline">
            {' '}
            but people create impact.”
          </span>
        </AnimatedText>
        <Reveal>
        <div className="mt-10 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-white/80 shadow-lg shrink-0">
            <img
              alt="Dr. R. Surendiran"
              className="w-full h-full object-cover grayscale contrast-125"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHt-GFa9dNcxzSQIPTzFtGZugzZXCsvmWUvaqptV3qQcHQQYDqNzfMo7KKVdXQkA80dq9Nn4yb-_AlK94JMjQDCyVXNLPSrJs8y1rPtrLu7C7EuDrAnm3keIkJSnYgXalwhTBmHAPamsx5UZK_L4PJ0d359cuEDwQstjoUbJJDsHmNdpGtFtBjOu9RNrveJRQbHvZyhCDT77BNJcKE43ohJGvXLQDTWIc-L3795cw"
            />
          </div>
          <div className="text-center sm:text-left">
            <div
              className="text-[16px] md:text-[18px] font-bold text-white leading-snug"
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}
            >
              Dr. R. Surendiran — Leadership Philosophy
            </div>
            <div className="text-[12px] md:text-[13px] text-teal-100/80 font-mono-metric font-medium tracking-wide mt-0.5">
              Founder &amp; CEO, Infodazz • Kittle • Seventh Sense • Kaster Trust
            </div>
          </div>
        </div>
        <p className="mt-6 text-[13px] md:text-sm text-teal-100/70 font-mono-metric leading-relaxed max-w-2xl mx-auto">
          Vision: to build organizations that combine innovation, business growth,
          education and social responsibility.
        </p>
        </Reveal>
      </div>
    </section>
  )
}
