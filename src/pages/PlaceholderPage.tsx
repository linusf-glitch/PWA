import { ShoeSticker } from '@/components/illustration/shoe-sticker'
import { PageHeader } from '@/components/shell/page-header'
import { useKids } from '@/features/kids/useKids'

// Stand-in for screens built in later backlog items, so the navigation can be clicked through.
export default function PlaceholderPage({ title }: { title: string }) {
  const { selected } = useKids()
  return (
    <>
      <PageHeader title={title} kidSwitcher />
      <main className="mx-auto flex max-w-2xl flex-col items-center gap-4 p-6 text-center text-muted-foreground">
        <ShoeSticker size={150} tilt={-8} animate className="my-4" />
        <p>Diese Seite{selected && ` für ${selected.name}`} kommt in einem späteren Schritt.</p>
      </main>
    </>
  )
}
