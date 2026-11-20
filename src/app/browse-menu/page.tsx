import BrowseMenu from "@/app/components/BrowseMenu"

type SearchParams = Record<string, string | string[] | undefined>

const first = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v[0] : v)?.trim() ?? ""

export default async function BrowseMenuPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  return (
    <BrowseMenu
      initial={{
        // ?search=sides (also accepts the old ?name=sides)
        name: first(params.search) || first(params.name),
        category: first(params.category),
        location: first(params.location),
      }}
    />
  )
}
