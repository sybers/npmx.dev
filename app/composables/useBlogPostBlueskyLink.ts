import { Constellation } from '#shared/utils/constellation'
import { NPMX_SITE } from '#shared/utils/constants'

const BLOG_BACKLINK_TTL_IN_SECONDS = 60 * 5

export interface BlogPostBlueskyLink {
  did: string
  rkey: string
  postUri: string
}

export function useBlogPostBlueskyLink(slug: MaybeRefOrGetter<string | null | undefined>) {
  const cachedFetch = useCachedFetch()

  const blogUrl = computed(() => {
    const s = toValue(slug)
    if (!s) return null
    return `${NPMX_SITE}/blog/${s}`
  })

  return useLazyAsyncData<BlogPostBlueskyLink | null>(
    () => (blogUrl.value ? `blog-bsky-link:${blogUrl.value}` : 'blog-bsky-link:none'),
    async () => {
      const url = blogUrl.value
      if (!url) return null

      const constellation = new Constellation(cachedFetch)

      try {
        // Try embed.external.uri first (link card embeds)
        const { data: embedBacklinks } = await constellation.getBackLinks(
          url,
          'app.bsky.feed.post',
          'embed.external.uri',
          1,
          undefined,
          true,
          [['did:plc:jbeaa5kdaladzwq3r7f5xgwe']],
          BLOG_BACKLINK_TTL_IN_SECONDS,
        )

        const embedRecord = embedBacklinks.records[0]
        if (embedRecord) {
          return {
            did: embedRecord.did,
            rkey: embedRecord.rkey,
            postUri: `at://${embedRecord.did}/app.bsky.feed.post/${embedRecord.rkey}`,
          }
        }

        // Try facets.features.uri (URLs in post text)
        const { data: facetBacklinks } = await constellation.getBackLinks(
          url,
          'app.bsky.feed.post',
          'facets[].features[app.bsky.richtext.facet#link].uri',
          1,
          undefined,
          true,
          [['did:plc:jbeaa5kdaladzwq3r7f5xgwe']],
          BLOG_BACKLINK_TTL_IN_SECONDS,
        )

        const facetRecord = facetBacklinks.records[0]
        if (facetRecord) {
          return {
            did: facetRecord.did,
            rkey: facetRecord.rkey,
            postUri: `at://${facetRecord.did}/app.bsky.feed.post/${facetRecord.rkey}`,
          }
        }
      } catch {
        // Constellation unavailable or error - fail silently
      }

      return null
    },
  )
}
