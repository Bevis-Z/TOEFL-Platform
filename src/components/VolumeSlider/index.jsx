import { Slider } from 'antd'
import { MdVolumeDown, MdVolumeUp } from 'react-icons/md'
import styles from './index.less'

const VolumeSlider = ({ volume, onVolumeChange }) => {
  const onChange = (val) => {
    onVolumeChange(val)
  }

  return (
    <div className={styles.volumeWrap}>
      <MdVolumeDown size={18} />
      <div className={styles.sliderWrap}>
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={volume}
          tipFormatter={null}
          onChange={onChange}
        />
      </div>
      <MdVolumeUp size={18} />
    </div>
  )
}

export default VolumeSlider
