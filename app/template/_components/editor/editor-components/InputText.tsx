'use client'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { EditorBtns } from '@/lib/constants'
import { EditorElement, useEditor } from '@/providers/editor/editor-provider'
import clsx from 'clsx'
import { Trash } from 'lucide-react'

import React from 'react'

type Props = {
  element: EditorElement
}

const InputText = (props: Props) => {
  const { dispatch, state, subaccountId, funnelId, pageDetails } = useEditor()
  const [name, setName] = React.useState(props.element.name)
  const initialText = React.useMemo(() => {
    if (Array.isArray(props.element.content)) {
      return ''
    }
    return props.element.content?.innerText || ''
  }, [props.element.content])

  console.log(props.element)
  const [text, setText] = React.useState(initialText)
  const handleDragStart = (e: React.DragEvent, type: EditorBtns) => {
    if (type === null) return
    e.dataTransfer.setData('componentType', type)
  }

  const handleOnClickBody = (e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch({
      type: 'CHANGE_CLICKED_ELEMENT',
      payload: {
        elementDetails: props.element,
      },
    })
  }

  const styles = props.element.styles

  const handleDeleteElement = () => {
    dispatch({
      type: 'DELETE_ELEMENT',
      payload: { elementDetails: props.element },
    })
  }

  return (
    <div
      style={styles}
      draggable
      onDragStart={(e) => handleDragStart(e, 'inputText')}
      onClick={handleOnClickBody}
      className={clsx(
        'p-[2px] w-full m-[5px] relative text-[16px] transition-all flex items-center justify-center',
        {
          '!border-blue-500':
            state.editor.selectedElement.id === props.element.id,

          '!border-solid': state.editor.selectedElement.id === props.element.id,
          'border-dashed border-[1px] border-slate-300': !state.editor.liveMode,
        }
      )}
    >
      {state.editor.selectedElement.id === props.element.id &&
        !state.editor.liveMode && (
          <div className="absolute -top-[23px] -left-[1px]  flex ">
            {/* <Badge className=" rounded-none rounded-t-lg">
              {state.editor.selectedElement.name}
            </Badge> */}
            <Input className="w-full h-6 bg-black text-white font-semibold text-xs rounded-none rounded-t-lg" placeholder='title' value={name} onChange={(e) => setName(e.target.value)}
              onBlur={(e) => dispatch({
                type: 'UPDATE_ELEMENT',
                payload: {
                  elementDetails: { ...props.element, name: e.target.value},
                },
              })} />
          </div>
        )}

      <form className="flex w-full items-center space-x-2" >
        <Textarea placeholder="write here" required value={text} disabled={pageDetails.submitted} onChange={(e) => setText(e.target.value)} onBlur={(e) => {
          const inputValue = e.target.value;
          dispatch({
            type: 'UPDATE_ELEMENT',
            payload: {
              elementDetails: {
                ...props.element,
                content: {
                  innerText: inputValue,
                },
              },
            },
          })
        }} />
        {/* <Button type="submit" disabled={pageDetails.submitted}>{pageDetails.submitted ? "Submitted" : "Submit"}</Button> */}
      </form>

      {state.editor.selectedElement.id === props.element.id &&
        !state.editor.liveMode && (
          <div className="absolute bg-primary px-2.5 py-1 text-xs font-bold  -top-[25px] -right-[1px] rounded-none rounded-t-lg !text-white">
            <Trash
              className="cursor-pointer"
              size={16}
              onClick={handleDeleteElement}
            />
          </div>
        )}
    </div>
  )
}

export default InputText
