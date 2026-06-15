import { useState } from "react"
import { LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

type NotificationItem = {
  key: string
  label: string
  description: string
}

type NotificationGroup = {
  title: string
  items: NotificationItem[]
}

const groups: NotificationGroup[] = [
  {
    title: "Email",
    items: [
      {
        key: "email_product",
        label: "Product updates",
        description: "News about features and improvements.",
      },
      {
        key: "email_security",
        label: "Security alerts",
        description: "Important notifications about your account security.",
      },
      {
        key: "email_newsletter",
        label: "Newsletter",
        description: "Our monthly newsletter and announcements.",
      },
    ],
  },
  {
    title: "Push",
    items: [
      {
        key: "push_mentions",
        label: "Mentions",
        description: "When someone mentions you in a comment.",
      },
      {
        key: "push_activity",
        label: "Activity",
        description: "Updates on content you follow.",
      },
    ],
  },
]

const defaultPreferences: Record<string, boolean> = {
  email_product: true,
  email_security: true,
  email_newsletter: false,
  push_mentions: true,
  push_activity: false,
}

export default function Notifications() {
  const [preferences, setPreferences] =
    useState<Record<string, boolean>>(defaultPreferences)
  const [isLoading, setIsLoading] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const onToggle = (key: string, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
    setIsDirty(true)
  }

  const onSave = async () => {
    try {
      setIsLoading(true)
      // TODO: wire to notification preferences endpoint
      console.log("save notifications", preferences)
      await new Promise((resolve) => setTimeout(resolve, 600))
      setIsDirty(false)
      toast.success("Notification preferences saved")
    } catch (error) {
      toast.error((error as Error).message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="pl-1">
      <header className="border-b p-4">
        <h1 className="text-2xl">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Choose how you want to be notified.
        </p>
      </header>
      <div className="space-y-6 p-4">
        {groups.map((group) => (
          <div key={group.title} className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground">
              {group.title}
            </h2>
            <div className="space-y-3">
              {group.items.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-0.5 pr-4">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <Switch
                    checked={preferences[item.key]}
                    onCheckedChange={(value) => onToggle(item.key, value)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <Separator />
        <footer className="flex justify-end">
          <Button onClick={onSave} disabled={!isDirty || isLoading}>
            Save Changes
            {isLoading && <LoaderCircle className="animate-spin" />}
          </Button>
        </footer>
      </div>
    </main>
  )
}
