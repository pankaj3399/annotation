"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Pie, PieChart, Cell, Legend, ResponsiveContainer } from "recharts"
import { getTasksSubmittedOfManager } from '@/app/actions/dashboard'

const chartConfig = {
  submitted: {
    label: "Submitted",
    color: "hsl(var(--chart-1))",
  },
  notSubmitted: {
    label: "Not Submitted",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))']

type Data = {
  name: string
  value: number
}

export default function TaskSubmissionChartComponent() {
  const [data, setData] = React.useState<Data[]>([])

  React.useEffect(() => {
    async function init() {
      const data = await getTasksSubmittedOfManager()
      if(data.error) {
        console.error(data.error)
        return
      }
      setData(processData(JSON.parse(data.data as string)) as Data[])
    }
    init()
  }, [])

  const processData = (items) => {
    const submissionCounts = items.reduce((acc, item) => {
      const key = item.submitted ? 'Submitted' : 'Not Submitted'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    return Object.entries(submissionCounts).map(([name, value]) => ({ name, value }))
  }

  const totalTasks = data.reduce((sum, entry) => sum + entry.value, 0)

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Task Submission Status</CardTitle>
        <CardDescription>Distribution of submitted vs. not submitted tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-72 w-72"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>Total Tasks: {totalTasks}</div>
      </CardFooter>
    </Card>
  )
}