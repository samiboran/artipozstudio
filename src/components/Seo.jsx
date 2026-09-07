import { Helmet } from 'react-helmet-async'
import { SITE_URL } from '../lib/siteUrl'

export { SITE_URL }
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-cover-artipoz.jpg`

// Her sayfa kendi title/description/OG/canonical'ını buradan yazar —
// react-helmet-async prerender snapshot'ında da (headless tarayıcı DOM'u
// yakaladığı için) aynen görünür, ekstra bir SSR mekanizmasına gerek yok.
export default function Seo({ title, description, path, image = DEFAULT_OG_IMAGE, jsonLd }) {
  const url = `${SITE_URL}${path}`
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  )
}
