import { Reveal } from './Reveal'

export function QuoteSection() {
  return (
    <section
      className="py-28 md:py-36 px-6 md:px-12 relative overflow-hidden border-b border-slate-border"
      style={{
        background:
          'radial-gradient(800px 400px at 20% 10%, rgba(255,255,255,0.14), transparent 60%), radial-gradient(700px 380px at 85% 90%, rgba(0,0,0,0.35), transparent 60%), rgb(30, 63, 235)',
      }}
    >
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <Reveal>
        <blockquote
          className="tracking-tight leading-[1.18] md:leading-[1.15] text-2xl sm:text-4xl md:text-5xl lg:text-[54px] font-extrabold"
          style={{ fontFamily: '"Space Grotesk", sans-serif' }}
        >
          <span className="text-blue-100/70 inline">
            “Technology without ecosystem is dormant; business without trust is
            fragile.”
          </span>
          <span className="text-white inline">
            {' '}
            Infodazz and BNI Madurai are our proof that when you engineer resilient
            tech and nurture relentless trust, exponential scale follows.
          </span>
        </blockquote>
        <div className="mt-10 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-white/80 shadow-lg shrink-0">
            <img
              alt="Dr. S. K."
              className="w-full h-full object-cover grayscale contrast-125"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHt-GFa9dNcxzSQIPTzFtGZugzZXCsvmWUvaqptV3qQcHQQYDqNzfMo7KKVdXQkA80dq9Nn4yb-_AlK94JMjQDCyVXNLPSrJs8y1rPtrLu7C7EuDrAnm3keIkJSnYgXalwhTBmHAPamsx5UZK_L4PJ0d359cuEDwQstjoUbJJDsHmNdpGtFtBjOu9RNrveJRQbHvZyhCDT77BNJcKE43ohJGvXLQDTWIc-L3795cw"
            />
          </div>
          <div className="text-center sm:text-left">
            <div
              className="text-[16px] md:text-[18px] font-bold text-white leading-snug"
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}
            >
              Dr. S. K., Ph.D.
            </div>
            <div className="text-[12px] md:text-[13px] text-blue-200/90 font-mono-metric font-medium tracking-wide mt-0.5">
              Founder &amp; CEO, Infodazz • BNI Madurai • SSRG
            </div>
          </div>
        </div>
        </Reveal>
      </div>
    </section>
  )
}
