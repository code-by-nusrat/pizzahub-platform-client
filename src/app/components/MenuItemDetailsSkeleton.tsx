export default function MenuItemDetailsSkeleton() {
    return (
        <main className="min-h-screen bg-[#FBF5E6] px-4 py-2 sm:px-8">
            <div className="mx-auto max-w-5xl animate-pulse">
                <div className="flex h-14 items-center justify-between">
                    <div className="h-4 w-28 rounded bg-green-900/10" />
                    <div className="h-3 w-20 rounded bg-green-900/10" />
                </div>

                <div className="mt-8 grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
                    <div className="mx-auto aspect-square w-full max-w-md rounded-full bg-green-900/10" />

                    <div className="space-y-4">
                        <div className="h-3 w-32 rounded bg-green-900/10" />
                        <div className="h-12 w-3/4 rounded bg-green-900/15" />
                        <div className="h-4 w-full rounded bg-green-900/10" />
                        <div className="h-4 w-5/6 rounded bg-green-900/10" />
                        <div className="h-4 w-2/3 rounded bg-green-900/10" />
                        <div className="mt-6 h-24 w-full rounded bg-white/70" />
                    </div>
                </div>

                <span className="sr-only">Loading dish details…</span>
            </div>
        </main>
    )
}
