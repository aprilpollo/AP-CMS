import { useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts"
import {
  ArrowDownToLine,
  Eye,
  MessageSquare,
  StickyNote,
  Users,
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  postsByCategory,
  recentActivity,
  recentPosts,
  trafficSeries,
} from "./data"

const RANGES = [
  { label: "Last 7 days", value: "7" },
  { label: "Last 30 days", value: "30" },
  { label: "Last 90 days", value: "90" },
]

const trafficConfig = {
  views: { label: "Page views", color: "var(--chart-1)" },
  visitors: { label: "Visitors", color: "var(--chart-2)" },
} satisfies ChartConfig

const categoryConfig = {
  posts: { label: "Posts", color: "var(--chart-1)" },
} satisfies ChartConfig

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  Published: "default",
  Draft: "secondary",
  Scheduled: "outline",
}

const number = new Intl.NumberFormat("en-US")

function Dashboard() {
  const [range, setRange] = useState("30")

  const traffic = useMemo(
    () => trafficSeries.slice(-Number(range)),
    [range]
  )

  const totals = useMemo(() => {
    const views = traffic.reduce((sum, point) => sum + point.views, 0)
    const visitors = traffic.reduce((sum, point) => sum + point.visitors, 0)
    return { views, visitors }
  }, [traffic])

  const rangeLabel =
    RANGES.find((item) => item.value === range)?.label.toLowerCase() ?? ""

  return (
    <PageContainer
      title="Dashboard"
      description="An overview of traffic, content and activity."
      actions={
        <>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger size="sm" className="w-36 rounded-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {RANGES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="rounded-sm">
            <ArrowDownToLine />
            Export
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={Eye}
          label="Page views"
          value={number.format(totals.views)}
          delta={12.4}
          hint={`vs previous ${rangeLabel.replace("last ", "")}`}
        />
        <KpiCard
          icon={Users}
          label="Visitors"
          value={number.format(totals.visitors)}
          delta={8.1}
          hint="vs previous period"
        />
        <KpiCard
          icon={StickyNote}
          label="Posts published"
          value="86"
          delta={4.9}
          hint="vs previous period"
        />
        <KpiCard
          icon={MessageSquare}
          label="Comments"
          value="342"
          delta={-3.2}
          hint="vs previous period"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Traffic overview</CardTitle>
            <CardDescription>
              Page views and visitors over the {rangeLabel}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={trafficConfig}
              className="aspect-auto h-64 w-full"
            >
              <AreaChart data={traffic} margin={{ left: 4, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={24}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                />
                <ChartTooltip
                  content={<ChartTooltipContent indicator="line" />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Area
                  dataKey="views"
                  type="monotone"
                  stroke="var(--color-views)"
                  fill="var(--color-views)"
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
                <Area
                  dataKey="visitors"
                  type="monotone"
                  stroke="var(--color-visitors)"
                  fill="var(--color-visitors)"
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
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
              className="aspect-auto h-64 w-full"
            >
              <BarChart
                data={postsByCategory}
                layout="vertical"
                margin={{ left: 4, right: 28 }}
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
                  barSize={16}
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
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent posts</CardTitle>
            <CardDescription>The latest five posts.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPosts.map((post) => (
                  <TableRow key={post.id} className="hover:bg-transparent">
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[post.status]}>
                        {post.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{post.author}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {post.views ? number.format(post.views) : "-"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {post.date}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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

      <p className="text-sm text-muted-foreground">
        Looking for traffic sources, devices and top pages?{" "}
        <Link to="/analytics" className="font-medium underline">
          Open analytics
        </Link>
        .
      </p>
    </PageContainer>
  )
}

export default Dashboard
