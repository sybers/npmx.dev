/**
 * Generate a route object for navigating to a package page.
 *
 * @param pkg - Package name (e.g., "nuxt" or "@nuxt/kit")
 * @param version - Optional version string
 * @returns Route object with name and params
 */
export function getPackageRoute(pkg: string, version: string | null = null) {
  const [org, name] = pkg.startsWith('@') ? pkg.split('/') : [null, pkg]
  if (version) {
    return {
      name: 'package-version',
      params: { org, name, version },
    } as const
  }

  return {
    name: 'package',
    params: {
      org,
      name,
    },
  } as const
}

/**
 * Parse package name and optional version from the route URL.
 *
 * Supported patterns:
 *   /nuxt → packageName: "nuxt", requestedVersion: null
 *   /nuxt/v/4.2.0 → packageName: "nuxt", requestedVersion: "4.2.0"
 *   /@nuxt/kit → packageName: "@nuxt/kit", requestedVersion: null
 *   /@nuxt/kit/v/1.0.0 → packageName: "@nuxt/kit", requestedVersion: "1.0.0"
 *   /axios@1.13.3 → packageName: "axios", requestedVersion: "1.13.3"
 *   /@nuxt/kit@1.0.0 → packageName: "@nuxt/kit", requestedVersion: "1.0.0"
 * @public
 */
export function usePackageRoute() {
  const route = useRoute('package-version')

  const orgName = computed(() => route.params.org)
  const requestedVersion = computed(() => route.params.version || null)
  const packageName = computed(() =>
    orgName.value ? `${orgName.value}/${route.params.name}` : route.params.name,
  )

  return {
    packageName,
    requestedVersion,
    orgName,
  }
}
