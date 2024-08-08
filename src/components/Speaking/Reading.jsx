import { useState, useEffect } from 'react'
import { ClockCircleOutlined } from '@ant-design/icons'
import { useAudio } from 'react-use'
import { useCountDown } from 'ahooks'
import styles from './Reading.less'

const Reading = ({ volume, readingAudio, readingOriginal, originalTitle, onReadingEnded }) => {
  const [playEnded, setPlayEnded] = useState(false)
  const [readEndTime, setReadEndTime] = useState()
  const [audio, audioState, controls, ref] = useAudio({
    src: '',
    autoPlay: false,
    onEnded: () => {
      setPlayEnded(true)
      setReadEndTime(Date.now() + 1000 * 45)
    },
  })

  const [countdown] = useCountDown({
    targetDate: readEndTime,
    onEnd: () => {
      onReadingEnded()
    },
  })

  useEffect(() => {
    controls?.volume?.(volume)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume])

  useEffect(() => {
    ref.current.src = readingAudio
    ref.current.load()
    controls.play()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readingAudio])

  return (
    <div className={styles.wrap}>
      <div className={styles.timingTips}>
        <ClockCircleOutlined /> Reading Time: {Math.round(countdown / 1000) || 45}s
      </div>
      {playEnded && (
        <div className={styles.articleWrap}>
          <div className={styles.title}>{originalTitle}</div>
          <p className={styles.article}>{readingOriginal}</p>
        </div>
      )}
      {audio}
    </div>
  )
}

export default Reading
