import { timingFormat } from '@/utils'
import { Slider, Space } from 'antd'
import {
  CaretLeftFilled,
  CaretRightFilled,
  PauseCircleFilled,
  PlayCircleFilled,
} from '@ant-design/icons'
import classNames from 'classnames'
import styles from './IntensivePlayer.less'

const IntensivePlayer = ({
  audioState,
  controls,
  unprevable,
  unnextable,
  wrapStyle = {},
  onChange,
  onPlayToggle,
  onPrev,
  onNext,
}) => {
  return (
    <div className={styles.playerWrap} style={{ ...wrapStyle }}>
      <Space align="center">
        <div
          className={classNames(styles.control, styles.prev, { [styles.disable]: unprevable })}
          onClick={onPrev}
        >
          <CaretLeftFilled />
        </div>
        <div
          className={classNames(styles.control, styles.play)}
          onClick={() => {
            onPlayToggle()
          }}
        >
          {audioState.playing ? <PauseCircleFilled /> : <PlayCircleFilled />}
        </div>
        <div
          className={classNames(styles.control, styles.next, { [styles.disable]: unnextable })}
          onClick={onNext}
        >
          <CaretRightFilled />
        </div>
      </Space>
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

export default IntensivePlayer
