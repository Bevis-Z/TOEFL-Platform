import { timingFormat } from '@/utils'
import { Slider } from 'antd'
import { PauseCircleFilled, PlayCircleFilled } from '@ant-design/icons'
import styles from './ReviewPlayer.less'

const ReviewPlayer = ({ audioState, controls, wrapStyle = {}, onSlideChange, onChange }) => {
  return (
    <div className={styles.playerWrap} style={{ ...wrapStyle }}>
      <div
        className={styles.control}
        onClick={() => {
          audioState.playing ? controls.pause() : controls.play()
          onChange(audioState.playing)
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
            onSlideChange(rate)
            onChange(audioState.playing)
          }}
        />
      </div>
      <div>
        {timingFormat(audioState.time)} / {timingFormat(audioState.duration)}
      </div>
    </div>
  )
}

export default ReviewPlayer
