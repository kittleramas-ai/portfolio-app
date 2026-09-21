export function Footer() {
  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer
      className="w-full max-w-7xl mx-auto px-6 md:px-12 py-16 bg-obsidian-base border-t border-slate-border"
      style={{ backgroundColor: 'rgb(0, 0, 0)' }}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-slate-border">
        {/* Brand & Executive Metadata */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-slate-surface border border-slate-border flex items-center justify-center text-primary font-bold text-mono-metric">
              S
            </div>
            <span className="text-headline-sm font-headline-sm font-bold text-text-primary">
              Arun Raj
            </span>
          </div>
          <p className="text-body-sm font-body-sm text-text-secondary max-w-md">
            Architecting resilient enterprise software solutions at Infodazz,
            driving multi-crore regional business expansion with BNI Madurai, and
            stewarding world-class academic research through SSRG International
            Journals.
          </p>
        </div>

        {/* Links Grid */}
        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
          {/* Column 1 */}
          <div className="space-y-3">
            <span className="text-label-badge font-label-badge text-text-primary block">
              GOVERNANCE
            </span>
            <ul className="space-y-2 text-mono-metric font-mono-metric">
              <li>
                <a
                  className="text-primary font-medium hover:text-primary transition-colors duration-200"
                  href="#about"
                >
                  Executive Profile
                </a>
              </li>
              <li>
                <a
                  className="text-text-tertiary hover:text-text-secondary transition-colors duration-150"
                  href="#governance"
                >
                  Board Advisory
                </a>
              </li>
              <li>
                <a
                  className="text-text-tertiary hover:text-text-secondary transition-colors duration-150"
                  href="#keynotes"
                >
                  Keynotes &amp; Summits
                </a>
              </li>
              <li>
                <a
                  className="text-text-tertiary hover:text-text-secondary transition-colors duration-150"
                  href="#perspectives"
                >
                  Publications
                </a>
              </li>
              <li>
                <a
                  className="text-text-tertiary hover:text-text-secondary transition-colors duration-150"
                  href="https://infodazz.org"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Infodazz Enterprise
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2 */}
          <div className="space-y-3">
            <span className="text-label-badge font-label-badge text-text-primary block">
              NETWORKS
            </span>
            <ul className="space-y-2 text-mono-metric font-mono-metric">
              <li>
                <a
                  className="text-text-tertiary hover:text-text-secondary transition-colors duration-150"
                  href="#bni"
                >
                  BNI Madurai Network
                </a>
              </li>
              <li>
                <a
                  className="text-text-tertiary hover:text-text-secondary transition-colors duration-150"
                  href="https://internationaljournalssrg.org"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  SSRG Publications
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="space-y-3">
            <span className="text-label-badge font-label-badge text-text-primary block">
              ENGAGEMENT
            </span>
            <ul className="space-y-2 text-mono-metric font-mono-metric">
              <li>
                <a
                  className="text-text-tertiary hover:text-text-secondary transition-colors duration-150"
                  href="#about"
                >
                  Advisory Governance
                </a>
              </li>
              <li>
                <a
                  className="text-text-tertiary hover:text-text-secondary transition-colors duration-150"
                  href="#advisory"
                >
                  Direct Consultation
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-mono-metric font-mono-metric text-text-tertiary text-[12px]">
          © 2025 Arun Raj. Infodazz Technologies • BNI Madurai • SSRG
          International Journals. All Rights Reserved.
        </div>
        <a
          className="inline-flex items-center gap-2 text-mono-metric font-mono-metric text-text-secondary hover:text-primary transition-colors text-[13px] cursor-pointer"
          href="#hero"
          onClick={scrollToTop}
        >
          <span>Back to Top</span>
          <span className="material-symbols-outlined text-[16px]">north</span>
        </a>
      </div>
    </footer>
  )
}
