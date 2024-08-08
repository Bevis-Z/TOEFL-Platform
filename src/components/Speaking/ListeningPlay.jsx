import { useEffect } from 'react'
import { Slider } from 'antd'
import classNames from 'classnames'
import { useAudio } from 'react-use'
import { timingFormat } from '@/utils'
import styles from './ListeningPlay.less'

const ListeningPlay = ({ volume, speed, onPlayEnded, imgSrc, audioSrc }) => {
  const [audio, audioState, controls, ref] = useAudio({
    src: audioSrc,
    autoPlay: true,
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

  return (
    <div>
      <div className={styles.imgWrap}>
        <img src={imgSrc} alt="" />
      </div>
      <div className={classNames(styles.textCenter, styles.midText)}>
        如音频长时间未载入，或有重音，请尝试刷新
      </div>
      <div className={styles.sliderWrap}>
        <Slider
          value={audioState.time / audioState.duration}
          min={0}
          max={1}
          step={0.001}
          tipFormatter={null}
          disabled={false}
          onChange={(rate) => {
            controls.seek(audioState.duration * rate)
            controls.play()
          }}
        />
      </div>
      <div className={styles.textCenter}>
        {timingFormat(audioState.time)} / {timingFormat(audioState.duration)}
      </div>
      {audio}
    </div>
  )
}

export default ListeningPlay
