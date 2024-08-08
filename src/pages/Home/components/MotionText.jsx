import { useState, useCallback } from 'react'
import styles from './MotionText.less'

const texts = ['Real Exam', 'Level Up', 'Get Ready']

const MotionText = () => {
  const [index, setIndex] = useState(0)

  const textRender = useCallback(() => {
    const text = texts[index] || ''
    const letters = text.split('')
    const textElement = letters.map((str, i) => (
      <span
        // eslint-disable-next-line react/no-array-index-key
        key={i}
        style={{ animationDelay: `0.${i}s` }}
        onAnimationIteration={() => {
          if (i !== 0) return

          if (index >= texts.length - 1) {
            setIndex(0)
          } else {
            setIndex(index + 1)
          }
        }}
      >
        {str}
      </span>
    ))

    return textElement
  }, [index])

  return <div className={styles.motionTextWrap}>{textRender()}</div>
}

export default MotionText
