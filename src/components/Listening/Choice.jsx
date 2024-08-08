import { useState, useEffect } from 'react'
import { Space, Checkbox, Radio } from 'antd'
import { useAudio } from 'react-use'
import { QUESTION_TYPE } from '@/constants/enums'
import styles from './Choice.less'

const Choice = ({ question, complete, volume, onAnswerChange, onAudioEnd }) => {
  const { Name, QuestionType, Options, Qid, QuestionAudio } = question
  const [playEnd, setPlayEnd] = useState(false)
  const [answer, setAnswer] = useState('')
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
    setAnswer(complete.Options || '')
    setPlayEnd(false)
    if (ref.current) {
      ref.current.src = QuestionAudio
      ref.current.load()
      controls.play()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete, Qid, QuestionAudio])

  useEffect(() => {
    onAnswerChange(answer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answer])

  const getAnswerArea = () => {
    if (QuestionType === QUESTION_TYPE.OneWay) {
      return (
        <Radio.Group
          defaultValue={complete.Options || ''}
          onChange={(e) => {
            setAnswer(e.target.value)
          }}
        >
          <Space direction="vertical" size={12}>
            {Options.map(({ Value, Label }) => (
              <Radio key={Value} value={Value}>
                {Value}. {Label}
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      )
    } else if (QuestionType === QUESTION_TYPE.Many) {
      return (
        <Checkbox.Group
          defaultValue={(complete.Options || '').split('')}
          onChange={(vals) => {
            setAnswer(vals.join(''))
          }}
        >
          <Space direction="vertical" size={12}>
            {Options.map(({ Value, Label }) => (
              <Checkbox key={Value} value={Value}>
                {Value}. {Label}
              </Checkbox>
            ))}
          </Space>
        </Checkbox.Group>
      )
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>
        <p>{Name}</p>
      </div>
      <div className={styles.optionsWrap}>{playEnd && getAnswerArea()}</div>
      {audio}
    </div>
  )
}

export default Choice
