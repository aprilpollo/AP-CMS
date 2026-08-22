import { Area, AreaChart, Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
import {
  ArrowRight,
  CalendarClock,
  Check,
  FileClock,
  HardDrive,
  MessageSquare,
  StickyNote,
  Trash2,
} from "lucide-react"
import PageContainer from "@/shared/PageContainer"
import KpiCard from "@/shared/KpiCard"
import Link from "@/shared/Link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  pendingComments,
  postsByCategory,
  publishingQueue,
  recentActivity,
  storage,
  trafficSeries,
} from "./data"

const categoryConfig = {
  posts: { label: "Posts", color: "var(--chart-1)" },
} satisfies ChartConfig

const trafficConfig = {
  views: { label: "Page views", color: "var(--chart-1)" },
} satisfies ChartConfig

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  Scheduled: "default",
  "In review": "outline",
  Draft: "secondary",
}

const number = new Intl.NumberFormat("en-US")

function Dashboard() {
  const trafficWeek = trafficSeries.slice(-7)
  const weekViews = trafficWeek.reduce((sum, point) => sum + point.views, 0)
  const scheduled = publishingQueue.filter((item) => item.status === "Scheduled")
  const inReview = publishingQueue.filter((item) => item.status === "In review")
  const storagePercent = Math.round((storage.usedGb / storage.totalGb) * 100)

  return (
    <PageContainer
      title="Dashboard"
      description="What your team is working on right now."
      className="p-4 md:p-6"
      actions={
        <Button size="sm" variant="outline" className="rounded-sm" asChild>
          <Link to="/posts/new">
            <StickyNote />
            New post
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={StickyNote}
          label="Posts published"
          value="86"
          delta={4.9}
          hint="vs previous month"
        />
        <KpiCard
          icon={FileClock}
          label="Awaiting review"
          value={String(inReview.length)}
          hint="drafts submitted by authors"
        />
        <KpiCard
          icon={CalendarClock}
          label="Scheduled"
          value={String(scheduled.length)}
          hint={scheduled[0] ? `next ${scheduled[0].date.slice(0, 10)}` : "none"}
        />
        <KpiCard
          icon={MessageSquare}
          label="Comments to moderate"
          value={String(pendingComments.length)}
          hint="oldest 2 days ago"
        />
      </div>

      {/* Two independent columns so cards stack with an even gap instead of
          aligning row by row against a taller neighbour. */}
      <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Publishing queue</CardTitle>
              <CardDescription>
                Everything that is not live yet, newest first.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {publishingQueue.map((item) => (
                    <TableRow key={item.id} className="hover:bg-transparent">
                      <TableCell className="font-medium">
                        {item.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[item.status]}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.author}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {item.date}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comments to moderate</CardTitle>
              <CardDescription>
                Waiting for approval before they appear on the site.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingComments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex items-start justify-between gap-4 border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{comment.author}</span>{" "}
                      <span className="text-muted-foreground">
                        on {comment.post}
                      </span>
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      “{comment.excerpt}”
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {comment.timestamp}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button size="icon-sm" variant="ghost" aria-label="Approve">
                      <Check />
                    </Button>
                    <Button size="icon-sm" variant="ghost" aria-label="Delete">
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>
                What the team changed most recently.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4 border-l pl-4">
                {recentActivity.map((entry) => (
                  <li key={entry.id} className="relative">
                    <span className="absolute top-1.5 -left-[21px] size-2 rounded-full bg-border ring-4 ring-background" />
                    <p className="text-sm">
                      <span className="font-medium">{entry.actor}</span>{" "}
                      {entry.action}{" "}
                      <span className="font-medium">{entry.target}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {entry.timestamp}
                    </p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Traffic this week</CardTitle>
              <CardDescription>
                Page views over the last 7 days.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-2xl leading-none font-semibold tracking-tight">
                {number.format(weekViews)}
              </div>
              <ChartContainer
                config={trafficConfig}
                className="aspect-auto h-20 w-full"
              >
                <AreaChart
                  data={trafficWeek}
                  margin={{ left: 0, right: 0, top: 4, bottom: 0 }}
                >
                  <XAxis dataKey="date" hide />
                  <YAxis hide domain={["dataMin - 200", "dataMax + 200"]} />
                  <Area
                    dataKey="views"
                    type="monotone"
                    stroke="var(--color-views)"
                    fill="var(--color-views)"
                    fillOpacity={0.12}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/analytics">
                  Open analytics
                  <ArrowRight />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Posts by category</CardTitle>
              <CardDescription>Published posts, all time.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={categoryConfig}
                className="aspect-auto h-44 w-full"
              >
                <BarChart
                  data={postsByCategory}
                  layout="vertical"
                  margin={{ left: 4, right: 28, top: 0, bottom: 0 }}
                >
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="category"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={84}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent hideLabel indicator="line" />}
                  />
                  <Bar
                    dataKey="posts"
                    fill="var(--color-posts)"
                    radius={4}
                    barSize={14}
                  >
                    <LabelList
                      dataKey="posts"
                      position="right"
                      className="fill-muted-foreground"
                      fontSize={12}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media storage</CardTitle>
              <CardDescription>
                {number.format(storage.files)} files in the library.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <HardDrive className="size-4 text-muted-foreground" />
                <span className="text-sm tabular-nums">
                  {storage.usedGb} GB of {storage.totalGb} GB used
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-[var(--chart-1)]"
                  style={{ width: `${storagePercent}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {storagePercent}% of your plan.{" "}
                <Link to="/media" className="font-medium underline">
                  Manage media
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}

export default Dashboard
