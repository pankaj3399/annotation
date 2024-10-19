'use client'

import { createTasks } from "@/app/actions/task"
import { Project } from "@/app/(maneger)/page"
import { template } from "@/app/template/page"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { Minus, Plus, Upload } from "lucide-react"
import { useEffect, useRef, useState } from 'react'
import Papa from 'papaparse'

interface Task {
  id: number
  values: { [key: string]: string }
  count: number
}

interface Placeholder {
  type: 'text' | 'video' | 'img' | 'audio'
  index: number
  name: string
}

export function TaskDialog({ template, isDialogOpen, setIsDialogOpen, project }: { template: template, isDialogOpen: boolean, setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>, project: Project}) {
  const [placeholders, setPlaceholders] = useState<Placeholder[]>([])
  const [tasks, setTasks] = useState<Task[]>([{ id: 1, values: {}, count: 1 }])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      const content = JSON.parse(template.content)
      const extractedPlaceholders: Placeholder[] = content[0].content.reduce((acc: Placeholder[], item: any, index: number) => {
        if (item.type.startsWith('dynamic')) {
          let type: 'text' | 'video' | 'img' | 'audio'
          switch (item.type) {
            case 'dynamicText':
              type = 'text'
              break
            case 'dynamicVideo':
              type = 'video'
              break
            case 'dynamicImage':
              type = 'img'
              break
            case 'dynamicAudio':
              type = 'audio'
              break
            default:
              return acc
          }
          acc.push({
            type,
            index,
            name: item.name
          })
        }
        return acc
      }, [])
      setPlaceholders(extractedPlaceholders)
    } catch (error) {
      console.error("Error parsing template content:", error)
      toast({
        title: "Template Error",
        description: "Failed to parse template content. Please check the template format.",
        variant: "destructive",
      })
    }
  }, [template])

  const handleAddTask = () => {
    setTasks(prevTasks => [...prevTasks, { id: prevTasks.length + 1, values: {}, count: 1 }])
  }

  const handleRemoveTask = (id: number) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id))
  }

  const handleInputChange = (taskId: number, placeholder: Placeholder, value: string) => {
    setTasks(prevTasks => prevTasks.map(task =>
      task.id === taskId
        ? { ...task, values: { ...task.values, [placeholder.index]: value } }
        : task
    ))
  }

  const handleCountChange = (taskId: number, count: number) => {
    setTasks(prevTasks => prevTasks.map(task =>
      task.id === taskId
        ? { ...task, count: Math.max(1, count) }
        : task
    ))
  }

  const renderFilledTemplate = (values: { [key: string]: string }) => {
    try {
      let content = JSON.parse(template.content)
      content[0].content = content[0].content.map((item: any, index: number) => {
        const placeholder = placeholders.find(p => p.index === index)
        if (placeholder) {
          if (item.type === 'dynamicText') {
            item.content.innerText = values[index] || `{{${placeholder.type}}}`
          } else {
            item.content.src = values[index] || `{{${placeholder.type}}}`
          }
        }
        return item
      })
      return JSON.stringify(content)
    } catch (error) {
      console.error("Error rendering filled template:", error)
      toast({
        title: "Render Error",
        description: "Failed to render filled template. Please check the input values.",
        variant: "destructive",
      })
      return ''
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          const headers = results.data[0] as string[]
          
          if (headers.length !== placeholders.length) {
            toast({
              title: "CSV Error",
              description: "The number of columns in the CSV does not match the number of placeholders in the template.",
              variant: "destructive",
            })
            return
          }

          const newTasks = (results.data as string[][]).slice(1).map((row, index) => {
            return {
              id: index + 1,
              values: Object.fromEntries(placeholders.map((placeholder, i) => [placeholder.index, row[i] || ''])),
              count: 1
            }
          })
          setTasks(newTasks)
        },
        error: (error) => {
          toast({
            title: "CSV Parsing Error",
            description: error.message,
            variant: "destructive",
          })
        }
      })
    }
  }

  const generateFilledTemplates = async () => {
    const filledTasks: { project: string, name: string, content: string }[] = []
    tasks.forEach((task, taskIndex) => {
      const filled = renderFilledTemplate(task.values)
      for (let i = 0; i < task.count; i++) {
        filledTasks.push({
          project: project._id,
          name: `${project.name} - ${template.name} - ${taskIndex + 1}.${i + 1}`,
          content: filled
        })
      }
    })
    
    try {
      await createTasks(filledTasks)
      toast({
        title: "Tasks created successfully",
        description: `Created ${filledTasks.length} tasks successfully`,
      })
      setTasks([{ id: 1, values: {}, count: 1 }])
      setIsDialogOpen(false)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message,
      })
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[425px] md:max-w-fit">
        <DialogHeader>
          <DialogTitle>Ingest Data</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {tasks.map((task) => (
            <div key={task.id} className="mb-4 p-2 border rounded">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Task {task.id}</h3>
                <div className="flex items-center">
                  <label htmlFor={`task-${task.id}-count`} className="mr-2 text-sm font-medium text-gray-700">
                    Repeat:
                  </label>
                  <Input
                    id={`task-${task.id}-count`}
                    type="number"
                    min="1"
                    value={task.count}
                    onChange={(e) => handleCountChange(task.id, parseInt(e.target.value, 10))}
                    className="w-20 mr-2"
                  />
                  <Button variant="ghost" size="icon" onClick={() => { handleRemoveTask(task.id) }}>
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {placeholders.map((placeholder) => (
                <div key={placeholder.index} className="mb-2">
                  <label htmlFor={`${task.id}-${placeholder.index}`} className="block text-sm font-medium text-gray-700">
                    {placeholder.name} ({placeholder.type})
                  </label>
                  <Input
                    id={`${task.id}-${placeholder.index}`}
                    value={task.values[placeholder.index] || ""}
                    onChange={(e) => handleInputChange(task.id, placeholder, e.target.value)}
                    placeholder={`Enter ${placeholder.type} content for ${placeholder.name}`}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
        <DialogFooter className="flex w-full">
          <Button onClick={handleAddTask} className="mr-auto">
            <Plus className="mr-2 h-4 w-4" /> Add More Task
          </Button>
          <div className="flex ">
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" /> Upload CSV
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".csv"
              onChange={handleFileUpload}
            />
          </div>
          <Button onClick={() => generateFilledTemplates()}>Save Tasks</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}