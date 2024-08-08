import { useEffect } from 'react'
import { timingFormat } from '@/utils'
import { Slider } from 'antd'
import { PauseCircleFilled, PlayCircleFilled } from '@ant-design/icons'
import { useAudio } from 'react-use'
import styles from './ReviewPlayer.less'

const ReviewPlayer = ({ audioSrc, wrapStyle = {}, isCurrent, onPlayToggle }) => {
  const [audio, audioState, controls, audioRef] = useAudio({
    src: '',
    autoPlay: false,
    onEnded: () => {
      controls.seek(0)
    },
  })

  useEffect(() => {
    if (!audioSrc) return

    audioRef.current.src = audioSrc
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioSrc])

  useEffect(() => {
    if (!isCurrent) controls.pause()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCurrent])

  return (
    <div className={styles.playerWrap} style={{ ...wrapStyle }}>
      <div
        className={styles.control}
        onClick={() => {
          audioState.playing ? controls.pause() : controls.play()
          onPlayToggle && onPlayToggle()
        }}
      >
        {audioState.playing ? <PauseCircleFilled /> : <PlayCircleFilled />}
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
      <div>
        {timingFormat(Math.round(audioState.time))}
        <span style={{ margin: '0 4px' }}>/</span>
        {timingFormat(Math.round(audioState.duration))}
      </div>
      {audio}
    </div>
  )
}

export default ReviewPlayer
