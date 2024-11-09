"use client"

import { getTasksStatusOfManager } from "@/app/actions/dashboard"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp } from "lucide-react"
import { init } from "next/dist/compiled/webpack/webpack"
import * as React from "react"
import { Label, Pie, PieChart, Cell } from "recharts"

export const description = "A donut chart with text"

const chartConfig = {
  accepted: {
    label: "Accepted",
    color: "hsl(var(--chart-1))",
  },
  pending: {
    label: "Pending",
    color: "hsl(var(--chart-4))",
  },
  rejected: {
    label: "Rejected",
    color: "hsl(var(--chart-2))",
  },
  reassigned: {
    label: "Reassigned",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-4))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))']

type Data = { name: string; value: number }[]

export default function ChartComponent() {
  const [data, setData] = React.useState<Data>([])

  React.useEffect(() => {
    async function init() {
      const data = await getTasksStatusOfManager()
      if(data.error) {
        console.error(data.error)
        return
      }
      setData(processData(JSON.parse(data.data as string)) as Data)
    }
    init()
  }, [])

  const processData = (items) => {
    const statusCounts = items.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  };

  const totalTasks = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <Card className="w-full flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Task Status </CardTitle>
        <CardDescription>Current Status Overview</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-72 w-72"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalTasks}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Tasks
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {/* <TrendingUp className="h-4 w-4" /> Task distribution overview */}
        </div>
        {/* <div className="leading-none text-muted-foreground">
          Showing current status of all tasks
        </div> */}
      </CardFooter>
    </Card>
  )
}