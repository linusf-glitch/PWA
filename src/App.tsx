import { Button } from '@/components/ui/button'

// Placeholder Home. The real Home state machine arrives in backlog item 5.
export default function App() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Sizeless</h1>
      <p className="text-muted-foreground">The right size for growing feet. Coming soon.</p>
      <Button size="lg" disabled>
        Start scan
      </Button>
    </main>
  )
}
