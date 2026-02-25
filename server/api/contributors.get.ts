interface AtprotoProfile {
  did: string
  handle: string
  displayName?: string
  avatar?: string
}

export default defineCachedEventHandler(
  async (): Promise<AtprotoProfile[]> => {
    const response = await fetch('https://npmx.social/xrpc/com.atproto.sync.listRepos?limit=1000')
    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        message: 'Failed to fetch PDS repos',
      })
    }

    const listRepos = (await response.json()) as { repos: { did: string; active: boolean }[] }
    const activeOnlyDids = listRepos.repos.filter(repo => repo.active).map(repo => repo.did)

    const getProfilesUrl = 'https://public.api.bsky.app/xrpc/app.bsky.actor.getProfiles'
    const allProfiles: AtprotoProfile[] = []

    // Batch DIDs into groups of 25 (API limit)
    for (let i = 0; i < activeOnlyDids.length; i += 25) {
      const batch = activeOnlyDids.slice(i, i + 25)
      const params = new URLSearchParams()
      for (const did of batch) {
        params.append('actors', did)
      }

      try {
        const profilesResponse = await fetch(`${getProfilesUrl}?${params.toString()}`)
        if (!profilesResponse.ok) {
          console.warn(`Failed to fetch atproto profiles: ${profilesResponse.status}`)
          continue
        }

        const { profiles } = (await profilesResponse.json()) as { profiles: AtprotoProfile[] }

        allProfiles.push(...profiles)
      } catch (error) {
        console.warn('Failed to fetch atproto profiles:', error)
      }
    }

    return allProfiles
  },
  {
    maxAge: 1,
    name: 'pds-contributors',
    getKey: () => 'pds-contributors',
  },
)
