"use client"

import React, { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getTasksAverageTimeOfManager } from '@/app/actions/dashboard'

interface Task {
  _id: string
  timeTaken: number
}

export default function AverageTaskTimeCardComponent() {
  const [fetchedData, setFetchedData ] = React.useState<Task[]>([])
  const [averageTime, setAverageTime] = React.useState(0)
  const [totalTasks, setTotalTasks] = React.useState(0)

  React.useEffect(() => {
    // Simulating data fetch. Replace this with your actual data fetching logic
    
    async function init() {
      const data = await getTasksAverageTimeOfManager()
      if(data.error) {
        console.error(data.error)
        return
      }
      setFetchedData(JSON.parse(data.data as string) as Task[])
    }
    init()
  }, [])

  useEffect(() => {
    const total = fetchedData.reduce((sum, task) => sum + task.timeTaken, 0)
    setAverageTime(total / fetchedData.length)
    setTotalTasks(fetchedData.length)
  }, [fetchedData])

  const formatTime = (seconds: number) => {
    const totalMinutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60); // Round the seconds
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
  
    if (hours > 0) {
      return secs > 0 ? `${hours}h ${mins}m ${secs}s` : `${hours}h ${mins}m`;
    } else {
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    }
  };
  

  const clockHandRotation = (averageTime / 60) * 360 // 360 degrees for 60 minutes

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Average Time per Task</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative w-32 h-32 mb-4">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Clock face */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="2"
            />
            {/* Clock hand */}
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="10"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeLinecap="round"
              transform={`rotate(${clockHandRotation} 50 50)`}
            />
            {/* Center dot */}
            <circle
              cx="50"
              cy="50"
              r="3"
              fill="hsl(var(--primary))"
            />
          </svg>
        </div>
        <div className="text-4xl font-bold">{formatTime(averageTime)}</div>
        <p className="mt-2 text-sm text-muted-foreground">
          Average time spent on each task
        </p>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-xs text-muted-foreground">
          Based on data from {totalTasks} tasks
        </p>
      </CardFooter>
    </Card>
  )
}