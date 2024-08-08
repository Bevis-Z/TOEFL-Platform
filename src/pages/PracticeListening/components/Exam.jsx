import { useEffect, useState } from 'react'
import Choice from '@/components/Listening/Choice'
import Judge from '@/components/Listening/Judge'
import Sequencing from '@/components/Listening/Sequencing'
import ListeningPlay from '@/components/Listening/ListeningPlay'
import { QUESTION_TYPE } from '@/constants/enums'
import repeatAudioImg from '@/assets/imgs/repeat_audio_img.jpg'

const Exam = ({ volume, question, complete, onAnswerChange, onAudioEnd }) => {
  /**
   * @name RepeatAudio 有值则是重听题，特殊处理
   */
  const { Name, Options, QuestionType, Pic, Qid, RepeatAudio, QuestionAudio } = question
  const [showRepeat, setShowRepeat] = useState(false)

  useEffect(() => {
    setShowRepeat(!!RepeatAudio)
  }, [RepeatAudio])

  const getPiece = () => {
    const pieceProps = {
      question,
      complete,
      volume,
      onAnswerChange,
      onAudioEnd,
    }

    if (QuestionType === QUESTION_TYPE.OneWay) {
      return <Choice {...pieceProps} key="radio" />
    } else if (QuestionType === QUESTION_TYPE.Many) {
      return <Choice {...pieceProps} key="checkbox" />
    } else if (QuestionType === QUESTION_TYPE.Judge) {
      return <Judge {...pieceProps} key="judge" />
    } else if (QuestionType === QUESTION_TYPE.Sequencing) {
      return <Sequencing {...pieceProps} key="sequencing" />
    }
  }

  return (
    <div>
      {showRepeat ? (
        <ListeningPlay
          volume={volume}
          speed={1}
          imgSrc={repeatAudioImg}
          audioSrc={RepeatAudio}
          onPlayEnded={() => {
            setShowRepeat(false)
          }}
        />
      ) : (
        getPiece()
      )}
    </div>
  )
}

export default Exam
