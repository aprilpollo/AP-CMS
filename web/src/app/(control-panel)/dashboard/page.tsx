import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

function Dashboard() {
  return (
    <ScrollArea className="h-[calc(100dvh-48px)]">
      <main className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Starter skeleton — layout, theme, auth and the UI kit are wired up.
            Add your own pages under{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              src/app
            </code>
            .
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add a page</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Create <code>src/app/&lt;name&gt;/page.tsx</code> and a sibling{" "}
              <code>route.tsx</code>. Routes are auto-discovered.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">UI components</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              shadcn/ui primitives live in{" "}
              <code>src/components/ui</code>. Import via{" "}
              <code>@/components/ui/*</code>.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Theme</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Light/dark is handled by the theme provider. Press{" "}
              <kbd className="rounded border px-1">D</kbd> to toggle.
            </CardContent>
          </Card>
        </div>
      </main>
    </ScrollArea>
  )
}

export default Dashboard
