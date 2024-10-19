'use client'

import { getAllAnnotators } from "@/app/actions/annotator"
import { changeAnnotator, deleteTask, getAllTasks } from "@/app/actions/task"
import { upsertTemplate } from "@/app/actions/template"
import { template } from "@/app/template/page"
import { SheetMenu } from "@/components/admin-panel/sheet-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import Loader from '@/components/ui/Loader/Loader'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { getStatusBadgeVariant } from "@/lib/constants"
import { formatTime } from "@/lib/utils"
import { format, parseISO } from "date-fns"
import { CalendarIcon, NotebookPen, PlusCircle, Shuffle, Trash2Icon } from "lucide-react"
import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Task {
  _id: string
  name: string
  project: string
  content: string
  created_at: string
  status: string
  submitted: boolean
  annotator?: string
  timeTaken: number
  feedback: string
}

export interface Annotator {
  _id: string
  name: string
  email: string
}

export default function Component() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTemplateName, setNewTemplateName] = useState('')
  const [annotators, setAnnotators] = useState<Annotator[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const pathName = usePathname();
  const projectId = pathName.split("/")[3];
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast()

  useEffect(() => {
    async function init() {
      setTasks(JSON.parse(await getAllTasks(projectId)))
      setAnnotators(JSON.parse(await getAllAnnotators()))
    }
    init();
  }, [projectId]);

  if (!session) {
    return <Loader />;
  }

  if (session?.user?.role === 'annotator') router.push('/tasks');

  async function handleAssignUser(annotatorId: string, taskId: string) {
    await changeAnnotator(taskId, annotatorId)
    setTasks(tasks.map(task => task._id === taskId ? { ...task, annotator: annotatorId } : task))
  }

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    const defaultTemplate = {
      name: newTemplateName.trim(),
      project: projectId
    }
    const template: template = JSON.parse(await upsertTemplate(projectId as string, defaultTemplate as template, undefined, true))
    router.push(`/template?Id=${template._id}`)
  }

  const handleDeleteTemplate = async (e: React.MouseEvent, _id: string) => {
    e.stopPropagation()
    try {
      await deleteTask(_id)
      setTasks(tasks.filter(project => project._id !== _id))
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message,
      });
    }
  }

  const handleAutoAssign = async () => {
    if (annotators.length === 0) {
      toast({
        variant: "destructive",
        title: "Auto-assign failed",
        description: "There are no annotators available.",
      });
      return;
    }

    const unassignedTasks = tasks.filter(task => !task.annotator);
    const updatedTasks = [...tasks];

    for (let i = 0; i < unassignedTasks.length; i++) {
      const task = unassignedTasks[i];
      const annotatorIndex = i % annotators.length;
      const annotatorId = annotators[annotatorIndex]._id;

      await changeAnnotator(task._id, annotatorId);
      const taskIndex = updatedTasks.findIndex(t => t._id === task._id);
      updatedTasks[taskIndex] = { ...task, annotator: annotatorId };
    }

    setTasks(updatedTasks);
    toast({
      title: "Auto-assign completed",
      description: `${unassignedTasks.length} tasks have been assigned.`,
    });
  }

  const filteredTasks = {
    all: tasks,
    submitted: tasks.filter(task => task.submitted),
    unassigned: tasks.filter(task => !task.annotator)
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tasks</h1>
          <SheetMenu />
        </div>
      </header>
      <main className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <form onSubmit={handleCreateTemplate} className="mb-8">
          <div className="flex gap-4">
            <Input
              type="text"
              required
              placeholder="New Template name"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Template
            </Button>
          </div>
        </form>
        {tasks.length === 0 ? (
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold text-gray-900">No Tasks yet</h2>
            <p className="mt-2 text-gray-600">Create your first Template to get started!</p>
          </div>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="all">All Tasks</TabsTrigger>
                  <TabsTrigger value="submitted">Submitted Tasks</TabsTrigger>
                  <TabsTrigger value="unassigned">Unassigned Tasks</TabsTrigger>
                </TabsList>
                <Button onClick={handleAutoAssign} variant="outline">
                  <Shuffle className="mr-2 h-4 w-4" /> Auto-assign Tasks
                </Button>
              </div>
              <TabsContent value="all">
                <TaskTable tasks={filteredTasks.all} annotators={annotators} handleAssignUser={handleAssignUser} handleDeleteTemplate={handleDeleteTemplate} router={router} />
              </TabsContent>
              <TabsContent value="submitted">
                <TaskTable tasks={filteredTasks.submitted} annotators={annotators} handleAssignUser={handleAssignUser} handleDeleteTemplate={handleDeleteTemplate} router={router} />
              </TabsContent>
              <TabsContent value="unassigned">
                <TaskTable tasks={filteredTasks.unassigned} annotators={annotators} handleAssignUser={handleAssignUser} handleDeleteTemplate={handleDeleteTemplate} router={router} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  )
}

interface TaskTableProps {
  tasks: Task[]
  annotators: Annotator[]
  handleAssignUser: (annotatorId: string, taskId: string) => void
  handleDeleteTemplate: (e: React.MouseEvent, _id: string) => void
  router: any
}

function TaskTable({ tasks, annotators, handleAssignUser, handleDeleteTemplate, router }: TaskTableProps) {
  const [dialog, setDialog] = useState(false)
  const [feedback, setFeedback] = useState('')
  function handleclick(e: React.MouseEvent,feedback: string) {
    e.stopPropagation() 
    setFeedback(feedback)
    setDialog(true)
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tasks Name</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Time Taken</TableHead>
            <TableHead className="text-center">Submitted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow
              key={task._id}
              onClick={() => router.push(`/task/${task._id}`)}
              className="cursor-pointer hover:bg-gray-50"
            >
              <TableCell className="font-medium">{task.name}</TableCell>
              <TableCell>
                <div className="flex items-center text-sm text-gray-500">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(parseISO(task.created_at), 'PPP')}
                </div>
              </TableCell>
              <TableCell>
                <Select
                  value={task.annotator || ""}
                  onValueChange={(value) => handleAssignUser(value, task._id)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Assign user" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* <SelectItem value="">Unassigned</SelectItem> */}
                    {annotators.map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="font-medium">
                <Badge variant={getStatusBadgeVariant(task.status)}>
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="font-medium text-center">
                {formatTime(task.timeTaken)}
              </TableCell>
              <TableCell className="font-medium text-center">
                <span role="img" aria-label={task.submitted ? "Submitted" : "Not submitted"}>
                  {task.submitted ? '✔️' : '❌'}
                </span>
              </TableCell>
              <TableCell className="text-right">
              {task.feedback &&  <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e)=>handleclick(e,task.feedback)}
                >
                  <NotebookPen className="h-4 w-4" />
                  <span className="sr-only">feedback</span>
                </Button>}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDeleteTemplate(e, task._id)}
                >
                  <Trash2Icon className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <Dialog open={dialog} onOpenChange={setDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Feedback</DialogTitle>
              <DialogDescription>
                {feedback}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-start">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Table>
    </div>
  )
}