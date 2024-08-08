import { useState, useEffect } from 'react'
import { Divider, Progress } from 'antd'
import { getPrepAndRespTime } from './Question'
import { useCountDown } from 'ahooks'
import styles from './Preparation.less'

const Preparation = ({ name, type, onTimeEnd }) => {
  const [duration, setDuration] = useState(0)
  const [targetDate, setTargetDate] = useState()

  useEffect(() => {
    if (!type) return

    const dur = getPrepAndRespTime(type).preparationTime * 1000
    setDuration(dur)
    setTargetDate(Date.now() + dur)
  }, [type])

  const [countdown] = useCountDown({
    targetDate,
    interval: 100,
    onEnd: () => {
      onTimeEnd()
    },
  })

  return (
    <div className={styles.wrap}>
      <p className={styles.qName}>{name}</p>
      <Divider />
      <div className={styles.timeTips}>
        Preparation Time: <span className={styles.timing}>{Math.round(countdown / 1000)}</span>{' '}
        Seconds
      </div>
      <div className={styles.progressWrap}>
        <Progress
          style={{ width: 400 }}
          showInfo={false}
          status="normal"
          trailColor="#f2f6ff"
          strokeLinecap="square"
          strokeColor="#9e9aff"
          strokeWidth={30}
          percent={((duration - countdown) / duration || 0) * 100}
        />
      </div>
    </div>
  )
}

export default Preparation
