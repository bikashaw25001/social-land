import { useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { Trash2 } from 'lucide-react'

type ActivitySwipeRowProps = {
  className: string
  label: string
  children: ReactNode
  onOpen: () => void
  onDelete: () => Promise<boolean>
}

export default function ActivitySwipeRow({ className, label, children, onOpen, onDelete }: ActivitySwipeRowProps) {
  const startRef = useRef<{ x: number; y: number; offset: number } | null>(null)
  const offsetRef = useRef(0)
  const ignoreClickRef = useRef(false)
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const setPosition = (next: number) => {
    const clamped = Math.max(-144, Math.min(0, next))
    offsetRef.current = clamped
    setOffset(clamped)
  }

  const deleteRow = async () => {
    if (deleting) return
    setDeleting(true)
    const deleted = await onDelete()
    setDeleting(false)
    if (!deleted) setPosition(-78)
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    startRef.current = { x: event.clientX, y: event.clientY, offset: offsetRef.current }
    ignoreClickRef.current = false
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = startRef.current
    if (!start) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (!dragging && (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy))) return
    if (dx >= 0 && start.offset === 0) return
    event.preventDefault()
    ignoreClickRef.current = true
    setDragging(true)
    setPosition(start.offset + dx)
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = startRef.current
    startRef.current = null
    setDragging(false)
    if (!start) return

    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return

    const finalOffset = start.offset + dx
    ignoreClickRef.current = true
    if (finalOffset <= -122) {
      setPosition(-144)
      void deleteRow()
    } else if (finalOffset <= -48) {
      setPosition(-78)
    } else {
      setPosition(0)
    }
  }

  const onPointerCancel = () => {
    const start = startRef.current
    startRef.current = null
    setDragging(false)
    if (start) setPosition(start.offset)
  }

  const activateRow = () => {
    if (ignoreClickRef.current) {
      ignoreClickRef.current = false
      return
    }
    if (offsetRef.current < 0) {
      setPosition(0)
      return
    }
    onOpen()
  }

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      activateRow()
    }
  }

  return (
    <div
      className="activity-swipe-row"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <button
        type="button"
        className="activity-swipe-delete"
        aria-label={`Delete notification: ${label}`}
        aria-hidden={offset > -16}
        tabIndex={offset <= -16 ? 0 : -1}
        disabled={deleting || offset > -16}
        onPointerDown={event => event.stopPropagation()}
        onClick={event => {
          event.stopPropagation()
          void deleteRow()
        }}
      >
        <span><Trash2 size={17} /><small>{deleting ? 'Deleting' : 'Delete'}</small></span>
      </button>
      <div
        className={`${className}${dragging ? ' is-swiping' : ''}`}
        role="button"
        tabIndex={0}
        aria-label={`Open notification: ${label}`}
        style={{ transform: `translateX(${offset}px)` }}
        onClick={activateRow}
        onKeyDown={onKeyDown}
      >
        {children}
      </div>
    </div>
  )
}
