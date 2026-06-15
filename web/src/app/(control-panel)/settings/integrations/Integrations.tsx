import { useState } from "react"
import { FolderGit2, Mail, MessageSquare, Layers, type LucideIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

type Integration = {
  key: string
  name: string
  description: string
  icon: LucideIcon
  connected: boolean
}

const initialIntegrations: Integration[] = [
  {
    key: "github",
    name: "GitHub",
    description: "Sync issues and pull requests with your content.",
    icon: FolderGit2,
    connected: true,
  },
  {
    key: "slack",
    name: "Slack",
    description: "Get notifications in your Slack channels.",
    icon: Layers,
    connected: false,
  },
  {
    key: "discord",
    name: "Discord",
    description: "Send updates to your Discord server.",
    icon: MessageSquare,
    connected: false,
  },
  {
    key: "mailchimp",
    name: "Mailchimp",
    description: "Sync subscribers and send campaigns.",
    icon: Mail,
    connected: false,
  },
]

export default function Integrations() {
  const [integrations, setIntegrations] =
    useState<Integration[]>(initialIntegrations)

  const onToggle = (key: string) => {
    setIntegrations((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, connected: !item.connected } : item
      )
    )
    const target = integrations.find((item) => item.key === key)
    if (target) {
      toast.success(
        target.connected
          ? `${target.name} disconnected`
          : `${target.name} connected`
      )
    }
  }

  return (
    <main className="pl-1">
      <header className="border-b p-4">
        <h1 className="text-2xl">Integrations</h1>
        <p className="text-sm text-muted-foreground">
          Connect third-party services to your workspace.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
        {integrations.map((item) => (
          <div
            key={item.key}
            className="flex flex-col justify-between gap-4 rounded-lg border p-4"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-md border bg-muted p-2">
                <item.icon className="size-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
            <Button
              variant={item.connected ? "outline" : "default"}
              size="sm"
              className="w-full"
              onClick={() => onToggle(item.key)}
            >
              {item.connected ? "Disconnect" : "Connect"}
            </Button>
          </div>
        ))}
      </div>
    </main>
  )
}
