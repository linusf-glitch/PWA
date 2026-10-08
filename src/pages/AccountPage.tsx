import { PageHeader } from '@/components/shell/page-header'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/AuthProvider'

// Placeholder Account. Children, notifications, data export and delete come in backlog item 13.
export default function AccountPage() {
  const { signOut } = useAuth()
  return (
    <>
      <PageHeader title="Konto" />
      <main className="mx-auto flex max-w-2xl flex-col items-start gap-4 p-6">
        <p className="text-muted-foreground">Kinder, Benachrichtigungen und deine Daten kommen in einem späteren Schritt.</p>
        <Button variant="outline" onClick={() => void signOut()}>
          Abmelden
        </Button>
      </main>
    </>
  )
}
