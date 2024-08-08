import { useEffect, useState } from 'react'
import ProCard from '@ant-design/pro-card'
import DragItem from './DragItem'
import DropItem from './DropItem'
import styles from './DragPiece.less'

const DragPiece = ({
  Question,
  Complete,
  original,
  originalTitle,
  introducePic,
  qNum,
  onAnswerChange,
}) => {
  const { Name, Options, Qid, Paragraph } = Question
  const [userAnswer, setUserAnswer] = useState(['-', '-', '-'])

  useEffect(() => {
    const arr = (Complete.Options || '').split('')
    setUserAnswer([arr[0] || '-', arr[1] || '-', arr[2] || '-'])
  }, [Complete])

  return (
    <div className={styles.pieceWrap}>
      <div className={styles.qName}>
        {qNum}. Directions: An introductory sentence for a brief summary of the passage is provided
        below. Complete the summary by selecting the THREE answer choices that express the most
        important ideas in the passage. Some sentences do not belong in the summary because they
        express ideas that are not presented in the passage or are minor ideas in the passage.
        <br />
        This question is worth 2 points. Drag your answer choices to the spaces where they belong.
        To remove an answer choice, click on it. To review the passage, click VIEW TEXT
        <div className={styles.qStr}>
          <b>{Name}</b>
        </div>
      </div>
      <div className={styles.dropArea}>
        {[0, 1, 2].map((num) => (
          <DropItem
            key={num}
            qOptions={Options}
            answer={userAnswer[num]}
            className={styles.dropItem}
            placeholder={num + 1}
            onDropped={(Value, oldVal) => {
              const answers = [...userAnswer]
              answers[num] = Value
              onAnswerChange([...answers].join(''))
              setUserAnswer(answers)
            }}
            onRepulse={(Value) => {
              const answers = [...userAnswer]
              answers[num] = '-'
              onAnswerChange([...answers].join(''))
              setUserAnswer(answers)
            }}
          />
        ))}
      </div>
      <ProCard gutter={[20, 20]} ghost wrap>
        {Options.map((item) => (
          <ProCard
            key={item.Value}
            className={styles.dragItemCard}
            colSpan={12}
            bodyStyle={{ padding: 0, minHeight: 80 }}
            bordered
          >
            {!userAnswer.includes(item.Value) && (
              <DragItem data={item} className={styles.dragItem} />
            )}
          </ProCard>
        ))}
      </ProCard>
    </div>
  )
}

export default DragPiece
