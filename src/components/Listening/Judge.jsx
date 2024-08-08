import { useState, useEffect } from 'react'
import { MdCheckCircle } from 'react-icons/md'
import { useAudio } from 'react-use'
import styles from './Judge.less'

const Judge = ({ question, complete, volume, onAnswerChange, onAudioEnd }) => {
  const { Name, QuestionType, Options, Qid, QuestionAudio } = question
  const [answer, setAnswer] = useState([])
  const [playEnd, setPlayEnd] = useState(false)
  const [audio, audioState, controls, ref] = useAudio({
    src: '',
    autoPlay: false,
    onEnded: () => {
      setPlayEnd(true)
      onAudioEnd()
    },
  })

  useEffect(() => {
    controls?.volume?.(volume)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume])

  useEffect(() => {
    setPlayEnd(false)
    if (ref.current) {
      ref.current.src = QuestionAudio
      ref.current.load()
      controls.play()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Qid, QuestionAudio])

  useEffect(() => {
    setAnswer(Options.map(() => ''))
  }, [Options])

  useEffect(() => {
    if (answer.length && answer.every((e) => !!e)) {
      onAnswerChange(answer.join(''))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answer])

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>{Name}</div>
      <div className={styles.optionsWrap}>
        {playEnd && (
          <div>
            <div className={styles.judgeItem}>
              <div className={styles.option} />
              <div className={styles.answer}>
                <span>YES</span>
              </div>
              <div className={styles.answer}>
                <span>NO</span>
              </div>
            </div>
            {Options.map((item, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={i} className={styles.judgeItem}>
                <div className={styles.option}>{item}</div>
                <div
                  className={styles.answer}
                  onClick={() => {
                    const arr = [...answer]
                    arr[i] = 'A'
                    setAnswer(arr)
                  }}
                >
                  {answer[i] === 'A' && <MdCheckCircle size={20} color={'#9e9aff'} />}
                </div>
                <div
                  className={styles.answer}
                  onClick={() => {
                    const arr = [...answer]
                    arr[i] = 'B'
                    setAnswer(arr)
                  }}
                >
                  {answer[i] === 'B' && <MdCheckCircle size={20} color={'#9e9aff'} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {audio}
    </div>
  )
}

export default Judge
