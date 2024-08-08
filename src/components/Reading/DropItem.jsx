import { useEffect, useRef, useState } from 'react'
import { useDrop } from 'ahooks'
import classNames from 'classnames'
import styles from './DropItem.less'

const DropItem = ({
  style = {},
  placeholder,
  className = '',
  qOptions,
  answer,
  onDropped,
  onRepulse,
}) => {
  const [isHovering, setIsHovering] = useState(false)
  const dropRef = useRef(null)
  const [data, setData] = useState({})

  useEffect(() => {
    if (!answer) return
    const finded = qOptions.find(({ Value }) => Value === answer)
    if (!finded) return

    setData({ ...finded })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answer])

  useDrop(dropRef, {
    onDom: (content) => {
      const option = JSON.parse(content)
      onDropped(option.Value, data.Value)
      setIsHovering(false)
    },
    onDragEnter: () => {
      setIsHovering(true)
    },
    onDragLeave: () => {
      setIsHovering(false)
    },
  })

  const getText = () => {
    const { Value, Label } = data
    return Value ? `${Value}. ${Label}` : placeholder
  }

  return (
    <div
      ref={dropRef}
      style={{ ...style }}
      className={classNames(className, { [styles.hoveringDropItem]: isHovering })}
      onClick={() => {
        onRepulse(data.Value)
        setData({})
      }}
    >
      {isHovering ? 'release here' : getText()}
    </div>
  )
}

export default DropItem
