import { useCallback, useEffect, useState } from 'react'
import classNames from 'classnames'
import { isCurrentSentence } from '@/utils'
import { PauseCircleFilled, PlayCircleFilled } from '@ant-design/icons'
import { useKeyPress } from 'ahooks'
import styles from './IntensiveItem.less'

const IntensiveItem = ({ record, index, id, hideCN, audioState, controls, show, onShowToggle }) => {
  const { Chinese, English } = record
  const [active, setActive] = useState(false)

  // 快捷键 正斜杠 切换遮罩
  useKeyPress(
    ['forwardslash'],
    () => {
      active && onShowToggle(index)
    },
    {
      exactMatch: true,
    },
  )

  useEffect(() => {
    const { StartTime, EndTime } = record
    setActive(isCurrentSentence(audioState.time, StartTime, EndTime))
  }, [audioState.time, record])

  const getStyle = useCallback(() => {
    if (show) {
      if (active) {
        return styles.showActive
      } else {
        return styles.showUnactive
      }
    } else {
      if (active) {
        return styles.unshowActive
      } else {
        return styles.unshowUnactive
      }
    }
  }, [show, active])

  return (
    <div className={styles.itemWrap} id={id}>
      <div className={styles.preArea}>
        <span className={styles.index}>{index + 1}</span>
        <span
          className={styles.iconWrap}
          onClick={() => {
            if (active && audioState.playing) {
              controls.pause()
            } else {
              controls.seek(Number(record.StartTime))
              setTimeout(() => {
                controls.play()
              }, 100)
            }
          }}
        >
          {active && audioState.playing ? (
            <PauseCircleFilled className={classNames(styles.icon, styles.blink)} />
          ) : (
            <PlayCircleFilled className={styles.icon} />
          )}
        </span>
      </div>
      <div
        className={classNames(styles.content, getStyle())}
        onClick={() => {
          onShowToggle(index)
        }}
      >
        <div className={styles.english}>{English}</div>
        {hideCN || <div className={styles.chinese}>{Chinese}</div>}
      </div>
    </div>
  )
}

export default IntensiveItem
