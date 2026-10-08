import { PageHeader } from '@/components/shell/page-header'
import { useKids } from '@/features/kids/useKids'

// Stand-in for screens built in later backlog items, so the navigation can be clicked through.
export default function PlaceholderPage({ title }: { title: string }) {
  const { selected } = useKids()
  return (
    <>
      <PageHeader title={title} kidSwitcher />
      <main className="mx-auto max-w-2xl p-6 text-muted-foreground">
        Diese Seite{selected && ` für ${selected.name}`} kommt in einem späteren Schritt.
      </main>
    </>
  )
}
