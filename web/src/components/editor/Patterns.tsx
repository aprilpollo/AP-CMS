import type { Editor } from "@tiptap/react"
import type { ReactNode } from "react"
import {
  Heading,
  Text,
  List,
  ListOrdered,
  Quote,
  Code2,
  Table as TableIcon,
  Minus,
  MessageSquareQuote,
  HelpCircle,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

type Pattern = {
  id: string
  label: string
  description: string
  icon: ReactNode
  content: string
}

const PATTERNS: Pattern[] = [
  {
    id: "section",
    label: "Section",
    description: "Heading with a paragraph",
    icon: <Heading className="size-4" />,
    content:
      "<h2>Section title</h2><p>Start writing this section here…</p>",
  },
  {
    id: "lead",
    label: "Intro",
    description: "Title with a lead paragraph",
    icon: <Text className="size-4" />,
    content:
      "<h1>Article title</h1><p>A short introduction that hooks the reader and sets up what follows.</p>",
  },
  {
    id: "bullets",
    label: "Bullet list",
    description: "Three bullet points",
    icon: <List className="size-4" />,
    content:
      "<ul><li>First point</li><li>Second point</li><li>Third point</li></ul>",
  },
  {
    id: "steps",
    label: "Numbered steps",
    description: "Ordered step-by-step list",
    icon: <ListOrdered className="size-4" />,
    content:
      "<ol><li>First step</li><li>Second step</li><li>Third step</li></ol>",
  },
  {
    id: "quote",
    label: "Quote",
    description: "Highlighted blockquote",
    icon: <Quote className="size-4" />,
    content:
      "<blockquote><p>“A memorable quote goes here.”</p></blockquote><p>— Attribution</p>",
  },
  {
    id: "callout",
    label: "Callout",
    description: "Note / tip block",
    icon: <MessageSquareQuote className="size-4" />,
    content:
      "<blockquote><p><strong>Note:</strong> Add an important tip or warning for the reader here.</p></blockquote>",
  },
  {
    id: "faq",
    label: "FAQ",
    description: "Question and answer pair",
    icon: <HelpCircle className="size-4" />,
    content:
      "<h3>Question goes here?</h3><p>Answer the question clearly and concisely.</p>",
  },
  {
    id: "code",
    label: "Code block",
    description: "Preformatted code snippet",
    icon: <Code2 className="size-4" />,
    content: "<pre><code>// your code here</code></pre>",
  },
  {
    id: "table",
    label: "Table",
    description: "3 × 3 table with header",
    icon: <TableIcon className="size-4" />,
    content:
      "<table><tbody>" +
      "<tr><th>Column 1</th><th>Column 2</th><th>Column 3</th></tr>" +
      "<tr><td>Cell</td><td>Cell</td><td>Cell</td></tr>" +
      "<tr><td>Cell</td><td>Cell</td><td>Cell</td></tr>" +
      "</tbody></table>",
  },
  {
    id: "divider",
    label: "Divider",
    description: "Horizontal separator",
    icon: <Minus className="size-4" />,
    content: "<hr>",
  },
]

export function Patterns({ editor }: { editor: Editor | null }) {
  const insert = (content: string) => {
    if (!editor) return
    editor.chain().focus().insertContent(content).run()
  }

  return (
    <ScrollArea className="h-[calc(100dvh-48px-40px)]">
      <div className="space-y-1.5">
        <p className="px-1 text-xs text-muted-foreground">
          Click a pattern to insert it at the cursor.
        </p>
        <div className="space-y-1">
          {PATTERNS.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={!editor}
              onClick={() => insert(p.content)}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-md border bg-card p-2 text-left transition-colors hover:border-primary/40 hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                {p.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{p.label}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {p.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}
