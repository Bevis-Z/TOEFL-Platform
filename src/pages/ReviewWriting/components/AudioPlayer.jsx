import { timingFormat } from '@/utils'
import { Slider } from 'antd'
import { PauseCircleFilled, PlayCircleFilled } from '@ant-design/icons'
import styles from './AudioPlayer.less'

const AudioPlayer = ({ audioState, controls, wrapStyle = {}, onChange }) => {
  return (
    <div className={styles.playerWrap} style={{ ...wrapStyle }}>
      <div
        className={styles.control}
        onClick={() => {
          audioState.playing ? controls.pause() : controls.play()
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
            onChange && onChange(rate)
          }}
        />
      </div>
      <div>
        {timingFormat(audioState.time)} / {timingFormat(audioState.duration)}
      </div>
    </div>
  )
}

export default AudioPlayer
