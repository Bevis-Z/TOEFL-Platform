import { useMemo } from 'react'
import { textWrap } from '@/utils'
import styles from './PassageIntro.less'

const PassageIntro = ({ passage }) => {
  const { Original = [], OriginalTitle = '', IntroducePic = '' } = passage

  const memoOriginal = useMemo(() => {
    return Original.map((text) => {
      return text
        .replace('【A】', '<span class="option-area" data-answer="A">[■]</span>')
        .replace('【B】', '<span class="option-area" data-answer="B">[■]</span>')
        .replace('【C】', '<span class="option-area" data-answer="C">[■]</span>')
        .replace('【D】', '<span class="option-area" data-answer="D">[■]</span>')
    })
  }, [Original])

  return (
    <div className={styles.wrap}>
      <div className={styles.title}>{OriginalTitle}</div>
      <div className={styles.imgWrap}>{IntroducePic && <img src={IntroducePic} alt="" />}</div>
      {memoOriginal.map((text, i) => (
        <p
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          className={styles.paragraph}
          dangerouslySetInnerHTML={{ __html: textWrap(text) }}
        />
      ))}
    </div>
  )
}

export default PassageIntro
