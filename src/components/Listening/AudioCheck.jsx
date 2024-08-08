import { useEffect } from 'react'
import { Button } from 'antd'
import { SoundOutlined } from '@ant-design/icons'
import classNames from 'classnames'
import { useAudio } from 'react-use'
import headset from '@/assets/imgs/audio_check_headset.webp'
import styles from './AudioCheck.less'

const AudioCheck = ({ volume }) => {
  const [audio, audioState, controls, ref] = useAudio({
    src: 'https://tuofulaile.oss-cn-beijing.aliyuncs.com/listening/Concept in Architectural Sociology.mp3',
    autoPlay: true,
  })

  useEffect(() => {
    controls?.volume?.(volume)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume])

  return (
    <div>
      <div className={styles.imgWrap}>
        <img src={headset} />
      </div>
      <div className={classNames(styles.textCenter, styles.title)}>Now put on your headset</div>
      <div className={classNames(styles.textCenter, styles.midText)}>
        <Button
          type="primary"
          size="small"
          className={styles.replayBtn}
          icon={<SoundOutlined />}
          onClick={() => {
            controls.seek(0)
            controls.play()
          }}
        />
        正在播放<b>试音音频</b>，点击左侧喇叭可以重播
      </div>
      <div className={classNames(styles.textCenter, styles.marginBottom)}>
        您可以通过右上角的<b>Volume</b>按钮调节音量，或直接调节电脑音量
      </div>
      <div className={classNames(styles.textCenter)}>
        点击右上角<b>Next</b>正式开始做题
      </div>
      {audio}
    </div>
  )
}

export default AudioCheck
