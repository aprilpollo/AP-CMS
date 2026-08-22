import { useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  ArrowDownToLine,
  Eye,
  MousePointerClick,
  Timer,
  Users,
} from "lucide-react"
import PageContainer from "@/shared/PageContainer"
import KpiCard from "@/shared/KpiCard"
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
  channels,
  devices,
  referrers,
  sessionSeries,
  topPages,
} from "./data"

const RANGES = [
  { label: "Last 7 days", value: "7" },
  { label: "Last 30 days", value: "30" },
  { label: "Last 90 days", value: "90" },
]

const sessionConfig = {
  sessions: { label: "Sessions", color: "var(--chart-1)" },
} satisfies ChartConfig

const channelConfig = {
  sessions: { label: "Sessions", color: "var(--chart-1)" },
} satisfies ChartConfig

const deviceConfig = {
  sessions: { label: "Sessions" },
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
  tablet: { label: "Tablet", color: "var(--chart-4)" },
} satisfies ChartConfig

const number = new Intl.NumberFormat("en-US")

function AnalyticsPage() {
  const [range, setRange] = useState("30")

  const sessions = useMemo(
    () => sessionSeries.slice(-Number(range)),
    [range]
  )

  const totalSessions = useMemo(
    () => sessions.reduce((sum, point) => sum + point.sessions, 0),
    [sessions]
  )

  const deviceTotal = devices.reduce((sum, row) => sum + row.sessions, 0)
  const referrerTotal = referrers.reduce((sum, row) => sum + row.sessions, 0)
  const rangeLabel =
    RANGES.find((item) => item.value === range)?.label.toLowerCase() ?? ""

  return (
    <PageContainer
      title="Analytics"
      description="Where the traffic comes from and what it reads."
      className="p-4 md:p-6"
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
          icon={Users}
          label="Sessions"
          value={number.format(totalSessions)}
          delta={9.6}
          hint="vs previous period"
        />
        <KpiCard
          icon={Eye}
          label="Page views"
          value={number.format(Math.round(totalSessions * 2.4))}
          delta={11.2}
          hint="vs previous period"
        />
        <KpiCard
          icon={Timer}
          label="Avg. session"
          value="2:18"
          delta={3.4}
          hint="vs previous period"
        />
        <KpiCard
          icon={MousePointerClick}
          label="Bounce rate"
          value="41.6%"
          delta={-2.1}
          hint="vs previous period"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sessions over time</CardTitle>
          <CardDescription>Daily sessions over the {rangeLabel}.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={sessionConfig}
            className="aspect-auto h-64 w-full"
          >
            <AreaChart data={sessions} margin={{ left: 4, right: 8, top: 8 }}>
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
                tickFormatter={(value) => number.format(value)}
              />
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
              <Area
                dataKey="sessions"
                type="monotone"
                stroke="var(--color-sessions)"
                fill="var(--color-sessions)"
                fillOpacity={0.12}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Traffic by channel</CardTitle>
            <CardDescription>Sessions per acquisition channel.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={channelConfig}
              className="aspect-auto h-64 w-full"
            >
              <BarChart
                data={channels}
                layout="vertical"
                margin={{ left: 4, right: 48 }}
              >
                <CartesianGrid horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="channel"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={112}
                />
                <ChartTooltip
                  content={<ChartTooltipContent hideLabel indicator="line" />}
                />
                <Bar
                  dataKey="sessions"
                  fill="var(--color-sessions)"
                  radius={4}
                  barSize={16}
                >
                  <LabelList
                    dataKey="sessions"
                    position="right"
                    className="fill-muted-foreground"
                    fontSize={12}
                    formatter={(value: unknown) => number.format(Number(value))}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
            <CardDescription>
              {number.format(deviceTotal)} sessions by device type.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={deviceConfig}
              className="aspect-auto h-64 w-full"
            >
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent nameKey="device" hideLabel />}
                />
                <Pie
                  data={devices}
                  dataKey="sessions"
                  nameKey="device"
                  innerRadius={56}
                  outerRadius={88}
                  paddingAngle={2}
                  stroke="var(--background)"
                  strokeWidth={2}
                />
                <ChartLegend
                  content={<ChartLegendContent nameKey="device" />}
                  className="flex-wrap gap-2"
                />
              </PieChart>
            </ChartContainer>
            <ul className="mt-2 space-y-1 text-sm">
              {devices.map((row) => (
                <li
                  key={row.device}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="tabular-nums">
                    {number.format(row.sessions)} ·{" "}
                    {Math.round((row.sessions / deviceTotal) * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top pages</CardTitle>
            <CardDescription>Most viewed pages in the {rangeLabel}.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Path</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Avg. time</TableHead>
                  <TableHead className="text-right">Bounce</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPages.map((page) => (
                  <TableRow key={page.path} className="hover:bg-transparent">
                    <TableCell className="font-medium">{page.path}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {number.format(page.views)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {page.avgTime}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {page.bounce}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Referrers</CardTitle>
            <CardDescription>Sessions by referring site.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {referrers.map((row) => (
              <div key={row.source} className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">{row.source}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {number.format(row.sessions)}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-[var(--chart-1)]"
                    style={{
                      width: `${Math.round((row.sessions / referrerTotal) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
     
    </PageContainer>
  )
}

export default AnalyticsPage
