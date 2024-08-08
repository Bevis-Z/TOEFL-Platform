import { useEffect } from 'react'
import { useAudio } from 'react-use'
import taskIntro from '@/assets/imgs/speaking_task_intro.jpg'
import styles from './Introduction.less'

// 口语的介绍音频
const TASK_1_AUDIO = 'https://tuofulaile.oss-cn-beijing.aliyuncs.com/static/口语Task1题型介绍.mp3'
const TASK_2_AUDIO = 'https://tuofulaile.oss-cn-beijing.aliyuncs.com/static/口语Task2题型介绍.mp3'
const TASK_3_AUDIO = 'https://tuofulaile.oss-cn-beijing.aliyuncs.com/static/口语Task3题型介绍.mp3'
const TASK_4_AUDIO = 'https://tuofulaile.oss-cn-beijing.aliyuncs.com/static/口语Task4题型介绍.mp3'

const Introduction = ({ volume, speed, task, onPlayEnded }) => {
  const [audio, audioState, controls, ref] = useAudio({
    src: '',
    autoPlay: false,
    onEnded: () => {
      onPlayEnded()
    },
  })

  useEffect(() => {
    controls?.volume?.(volume)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume])

  useEffect(() => {
    if (ref.current) {
      ref.current.playbackRate = speed
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed])

  useEffect(() => {
    let src = ''

    if (task === 'Task1') src = TASK_1_AUDIO
    else if (task === 'Task2') src = TASK_2_AUDIO
    else if (task === 'Task3') src = TASK_3_AUDIO
    else if (task === 'Task4') src = TASK_4_AUDIO

    ref.current.src = src
    ref.current.load()
    controls.play()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task])

  return (
    <div className={styles.wrap}>
      <img src={taskIntro} />
      <div className={styles.text}>播放{task}题型介绍中，您可以点击右上角的Continue跳过</div>
      {audio}
    </div>
  )
}

export default Introduction
