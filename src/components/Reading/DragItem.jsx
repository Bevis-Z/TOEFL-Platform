import { useRef, useState } from 'react'
import { useDrag } from 'ahooks'

const DragItem = ({ data, style = {}, className = '' }) => {
  const dragRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  useDrag(JSON.stringify(data), dragRef, {
    onDragStart: () => {
      setDragging(true)
    },
    onDragEnd: () => {
      setDragging(false)
    },
  })

  return (
    <div
      ref={dragRef}
      style={{
        ...style,
      }}
      className={className}
    >
      {data.Value}. {data.Label}
    </div>
  )
}

export default DragItem
