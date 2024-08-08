import { useState, useEffect } from 'react'
import DragItem from './DragItem'
import DropItem from './DropItem'
import { useAudio } from 'react-use'
import styles from './Sequencing.less'

const Sequencing = ({ question, complete, volume, onAnswerChange, onAudioEnd }) => {
  const { Name, QuestionType, Options, Qid, QuestionAudio } = question
  const [userAnswer, setUserAnswer] = useState([])
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
    const oldAnswers = (complete.Options || '').split('')
    const answerArr = Array.from({ length: Options.length }).map((_, i) => oldAnswers[i] || '')

    setUserAnswer(answerArr)
  }, [Options, complete])

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
    onAnswerChange(userAnswer.join(''))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAnswer])

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>{Name}</div>
      <div className={styles.tips}>
        Drag your answer choices to the spaces where they belong.
        <br />
        To remove an answer choice, click on it.
      </div>
      <div className={styles.optionsWrap}>
        {playEnd && (
          <div>
            <div className={styles.dragArea}>
              {Options.map((item) => (
                <div key={item.Value} className={styles.dragItemWrap}>
                  {!userAnswer.includes(item.Value) && (
                    <DragItem data={item} className={styles.dragItem} />
                  )}
                </div>
              ))}
            </div>
            <div className={styles.dropArea}>
              {userAnswer.map((item, index) => (
                <DropItem
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  qOptions={Options}
                  answer={userAnswer[index]}
                  className={styles.dropItem}
                  onDropped={(Value, oldVal) => {
                    const answers = [...userAnswer]
                    answers[index] = Value
                    setUserAnswer(answers)
                  }}
                  onRepulse={(Value) => {
                    const answers = [...userAnswer]
                    answers[index] = ''
                    setUserAnswer(answers)
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      {audio}
    </div>
  )
}

export default Sequencing
