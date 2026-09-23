/** Fixed premium animated backdrop: aurora blobs + grid + vignette. */
export function SiteBackdrop() {
  return (
    <div aria-hidden="true" className="site-backdrop">
      <div className="site-backdrop-aurora site-backdrop-aurora-a" />
      <div className="site-backdrop-aurora site-backdrop-aurora-b" />
      <div className="site-backdrop-aurora site-backdrop-aurora-c" />
      <div className="site-backdrop-grid" />
      <div className="site-backdrop-vignette" />
    </div>
  )
}
