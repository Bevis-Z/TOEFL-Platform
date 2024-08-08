import classNames from 'classnames'
import speakingIcon from '@/assets/imgs/mockup_speaking_icon.png'
import speakingImg from '@/assets/imgs/mockups_speaking.png'
import readingIcon from '@/assets/imgs/mockup_reading_icon.png'
import listeningImg from '@/assets/imgs/mockups_listening.png'
import listeningIcon from '@/assets/imgs/mockup_listening_icon.png'
import writingIcon from '@/assets/imgs/mockup_writing_icon.png'
import writingImg from '@/assets/imgs/mockups_writing.png'
import styles from './Mockups.less'

const ReadingItem = ({ title, index }) => {
  const isFirst = index === 0

  return (
    <div className={styles.readingItem}>
      <div className={classNames(styles.indexWrap, isFirst && styles.specialIndex)}>
        {index + 1}
      </div>
      <div className={styles.content}>
        <div className={styles.readingItemTitle}>{title}</div>
        <div style={{ width: isFirst ? '100%' : '86%' }}>
          <div className={classNames(styles.bar, isFirst && styles.specialBar)} />
          <div className={styles.bar} />
          <div className={styles.bar} />
        </div>
      </div>
    </div>
  )
}

const TinyBars = () => {
  return (
    <div className={styles.tinyBars}>
      <div className={styles.tinyBarsItem} />
      <div className={styles.tinyBarsItem} />
      <div className={styles.tinyBarsItem} />
    </div>
  )
}

const readingTitles = [
  'European Context of the Scientific Revolution',
  'Mesolithic Complexity in Scandinavia',
  'Accounting for the High Density of Planet Mercury',
  'Evolution of the Flowering Plants',
]

const Mockups = () => {
  return (
    <div className={styles.mockupsWrap}>
      <div className={styles.mockupSpeaking}>
        <div className={styles.mockupLeft}>
          <img src={speakingIcon} />
          <div className={styles.desc}>
            <div className={styles.cardTitle}>Speaking</div>
            <div className={styles.subTitle}>Real questions</div>
          </div>
        </div>
        <img src={speakingImg} className={styles.mockupRightImg} />
      </div>

      <div className={styles.mockupReading}>
        <div className={styles.cardTitle}>Reading</div>
        <img src={readingIcon} className={styles.readingIcon} />
        {readingTitles.map((t, i) => (
          <ReadingItem key={t} title={t} index={i} />
        ))}
      </div>

      <div className={styles.mockupListening}>
        <div className={styles.mockupLeft}>
          <img src={listeningIcon} className={styles.icon} />
          <div className={styles.desc}>
            <div className={styles.cardTitle}>Listening</div>
            <div className={styles.subTitle}>Through Listening block</div>
          </div>
          <TinyBars />
        </div>
        <img src={listeningImg} className={styles.mockupRightImg} />
      </div>

      <div className={styles.mockupWriting}>
        <div className={styles.mockupLeft}>
          <img src={writingIcon} className={styles.icon} />
          <div className={styles.desc}>
            <div className={styles.cardTitle}>Writing</div>
            <div className={styles.subTitle}>No fake test, only true questions</div>
          </div>
          <TinyBars />
        </div>
        <img src={writingImg} className={styles.mockupRightImg} />
      </div>
    </div>
  )
}

export default Mockups
