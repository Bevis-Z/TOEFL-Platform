import { useEffect } from 'react'
import { Divider, Space } from 'antd'
import { SPEAK_TYPE } from '@/constants/enums'
import { IoMdHeadset } from 'react-icons/io'
import { useAudio } from 'react-use'
import styles from './Question.less'

export const getPrepAndRespTime = (type) => {
  if (type === SPEAK_TYPE.C) {
    return {
      preparationTime: 15,
      responseTime: 45,
    }
  } else if (type === SPEAK_TYPE.A) {
    return {
      preparationTime: 30,
      responseTime: 60,
    }
  } else if (type === SPEAK_TYPE.B) {
    return {
      preparationTime: 20,
      responseTime: 60,
    }
  } else {
    return {
      preparationTime: 0,
      responseTime: 0,
    }
  }
}

const PREP_BEEP_AUDIO = 'https://tuofulaile.oss-cn-beijing.aliyuncs.com/static/口语准备作答音频.mp3'

const Question = ({ volume, name, questionAudio, type, onPlayEnded }) => {
  const [beepAudio, beepAudioState, beepControls, beepRef] = useAudio({
    src: PREP_BEEP_AUDIO,
    autoPlay: false,
    onEnded: () => {
      onPlayEnded()
    },
  })

  const [audio, audioState, controls, ref] = useAudio({
    src: questionAudio,
    autoPlay: true,
    onEnded: () => {
      beepControls.play()
    },
  })

  useEffect(() => {
    controls?.volume?.(volume)
    beepControls?.volume?.(volume)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume])

  return (
    <div className={styles.wrap}>
      <p className={styles.qName}>{name}</p>
      <Divider />
      <div style={{ textAlign: 'center' }}>
        <Space direction="vertical">
          <div className={styles.timeTips}>
            <IoMdHeadset className={styles.headset} />
            <span>Preparation Time: {getPrepAndRespTime(type).preparationTime} Seconds</span>
          </div>
          <div className={styles.timeTips}>
            <IoMdHeadset className={styles.headset} />
            <span>Response TIme: {getPrepAndRespTime(type).responseTime} Seconds</span>
          </div>
        </Space>
      </div>
      {audio}
      {beepAudio}
    </div>
  )
}

export default Question
