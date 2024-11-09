"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PlayIcon, PauseIcon } from 'lucide-react'
import useTimer from '@/hooks/use-timer'
import { formatTime } from '@/lib/utils'

export default function Timer() {
  const [isRunning, setIsRunning] = useState(true)
  const { inc, running, setRunning } = useTimer()
  const [time, setTime] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (running) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1)
        inc(1)
      }, 1000)
    } else if (interval) {
      clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [running])

  const toggleTimer = () => {
    setRunning(!running)
  }

  return (
    <div className="fixed bottom-4 left-[50%] translate-x-[-50%] z-50">
      <Card className="p-3 bg-white border border-gray-200 shadow-lg rounded-full hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center space-x-3">
          <div className="text-2xl font-bold font-mono text-black">
            {formatTime(time)}
          </div>
          <Button 
            onClick={toggleTimer} 
            variant="outline"
            size="icon"
            className="bg-white hover:bg-gray-100 text-black border-gray-200 rounded-full"
          >
            {running ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
          </Button>
        </div>
      </Card>
    </div>
  )
}