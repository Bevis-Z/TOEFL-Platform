import { useCallback } from 'react'
import { history, useModel } from 'umi'
import MotionText from './MotionText'
import styles from './Slogan.less'
import { sendGaEvent } from '@/utils/ga4'

const Slogan = () => {
  const { initialState } = useModel('@@initialState')
  const { userInfo } = initialState
  const onStart = useCallback(() => {
    sendGaEvent({
      category: 'click',
      action: 'get_start_click',
      label: '开始冲分',
    })

    history.push('/practice')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo])

  return (
    <div className={styles.sloganWrap}>
      <h1 className={styles.slogan}>
        Prepare TOEFL?
        <br />
        TRY US!
        <br />
        <MotionText />
      </h1>
      <div className={styles.descript}>
        New Users Login to get Free Mock Exam，
        <br />
        Receive 1 Free Mock Exam every day
      </div>
      <div className={styles.startButton} onClick={onStart}>
        Let's Go
      </div>
    </div>
  )
}

export default Slogan
