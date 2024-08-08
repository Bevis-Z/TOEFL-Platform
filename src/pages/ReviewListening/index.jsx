import { useEffect, useState } from 'react'
import { Space, Button, Divider, Radio, Checkbox, Row, Col, Empty } from 'antd'
import ProCard from '@ant-design/pro-card'
import AvatarDropdown from '@/components/RightContent/AvatarDropdown'
import { getListeningPractices, getPracticeRecords } from '@/services/practice'
import { getUserId } from '@/utils/user'
import { history } from 'umi'
import { QUESTION_TYPE } from '@/constants/enums'
import { isCurrentSentence, textWrap, timingFormat } from '@/utils'
import useUrlState from '@ahooksjs/use-url-state'
import ReviewPlayer from './components/ReviewPlayer'
import { useAudio } from 'react-use'
import classNames from 'classnames'
import { MdCheckCircle } from 'react-icons/md'
import LeftBrand from '@/components/Header/LeftBrand'
import showWaitModal from '@/components/showWaitModal'
import { PauseCircleFilled, PlayCircleFilled } from '@ant-design/icons'
import styles from './index.less'

const ReviewReading = () => {
  const [state, setState] = useUrlState({ Qid: undefined, Tid: undefined })
  const [questions, setQuestions] = useState([])
  const [intensives, setIntensives] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState({})
  const [records, setRecords] = useState([])
  const [originalTitle, setOriginalTitle] = useState('')
  const [tpo, setTpo] = useState('')

  const [audio, audioState, controls, audioRef] = useAudio({
    src: '',
    autoPlay: false,
  })

  const [repeatAudio, repeatAudioState, repeatControls, repeatAudioRef] = useAudio({
    src: '',
    autoPlay: false,
  })

  const [qAudio, qAudioState, qControls, qAudioRef] = useAudio({
    src: '',
    autoPlay: false,
  })

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        if (!state.Tid) return

        const { Code, Data } = await getListeningPractices({ Tid: state.Tid, UserId: getUserId() })
        if (Code !== 'Succeed') return

        const { Questions, Audios, IntroduceAudio, OriginalTitle, Tpo } = Data
        setQuestions(Questions.sort((a, b) => a.Index - b.Index))
        setIntensives(Audios)
        setOriginalTitle(OriginalTitle)
        setTpo(Tpo)
        audioRef.current.src = IntroduceAudio
        if (!state.Qid) {
          setState({ Qid: Questions[0]?.Qid })
        }
      } catch (err) {
        console.log(err)
      }
    }

    fetchQuestions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const question = questions.find(({ Qid }) => Qid === Number(state.Qid))
    if (!question) return

    setCurrentQuestion(question)
  }, [state.Qid, questions])

  useEffect(() => {
    const { RepeatAudio = '', QuestionAudio = '' } = currentQuestion

    repeatAudioRef.current.src = RepeatAudio
    qAudioRef.current.src = QuestionAudio
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion])

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const { Tid, Qid } = state
        if (!Qid || !Tid) return

        const { Code, Data } = await getPracticeRecords({ Tid, Qid, UserId: getUserId() })
        if (Code !== 'Succeed') return

        const { Records = [] } = Data
        setRecords(Records)
      } catch (err) {
        console.log(err)
      }
    }

    fetchRecords()
  }, [state])

  const answerConvert = (options) => {
    const { QuestionType } = currentQuestion
    const judgeMap = {
      A: 'Yes',
      B: 'No',
    }
    let userAnswer = ''

    if (QuestionType === QUESTION_TYPE.Judge) {
      userAnswer = (
        <Space split={<Divider type="vertical" />}>
          {options.split('').map((str, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <span key={i}>{judgeMap[str]}</span>
          ))}
        </Space>
      )
    } else {
      userAnswer = options
    }

    return userAnswer || 'Not Answer'
  }

  const getAnswerView = () => {
    const { QuestionType, Options = [], Correct, CorrectAnswer, PracticeOptions } = currentQuestion

    if (QuestionType === QUESTION_TYPE.OneWay) {
      return (
        <Space direction="vertical">
          {Options.map(({ Value, Label }) => {
            const isCorrectOption = (CorrectAnswer || '').includes(Value)
            const isChoice = (PracticeOptions || '').includes(Value)
            let color = ''
            if (isCorrectOption) {
              color = '#52c41a'
            } else if (isChoice) {
              color = '#ff4d4f'
            }

            return (
              <Space key={Value}>
                <Radio checked={isChoice} disabled className={styles.disabledRadio} />
                <span style={{ color }} className={styles.answerLabel}>
                  {Value}. {Label}
                </span>
              </Space>
            )
          })}
        </Space>
      )
    } else if (QuestionType === QUESTION_TYPE.Many) {
      return (
        <Space direction="vertical">
          {Options.map(({ Value, Label }) => {
            const isCorrectOption = (CorrectAnswer || '').includes(Value)
            const isChoice = (PracticeOptions || '').includes(Value)
            let color = ''
            if (isCorrectOption) {
              color = '#52c41a'
            } else if (isChoice) {
              color = '#ff4d4f'
            }

            return (
              <Space key={Value}>
                <Checkbox checked={isChoice} disabled className={styles.disabledCheckbox} />
                <span style={{ color }} className={styles.answerLabel}>
                  {Value}. {Label}
                </span>
              </Space>
            )
          })}
        </Space>
      )
    } else if (QuestionType === QUESTION_TYPE.Sequencing) {
      // 用户答案 'ABD' 转为 [{Value: 'A', Label: 'xxx'}, {Value: 'B', Label: 'xxx'}, ...]
      const userAnswers = PracticeOptions.split('').map((v) =>
        Options.find(({ Value }) => Value === v),
      )

      return (
        <div>
          <Space direction="vertical" style={{ display: 'flex', width: '100%' }}>
            {userAnswers.map(({ Value, Label }) => (
              <div key={Value} className={styles.sequencingItem}>
                <span>
                  {Value}. {Label}
                </span>
              </div>
            ))}
          </Space>
          <div style={{ marginTop: 24 }}>
            <span style={{ fontWeight: 600 }}>正确答案：</span>
            <span>{CorrectAnswer}</span>
          </div>
        </div>
      )
    } else if (QuestionType === QUESTION_TYPE.Judge) {
      const userAnswers = PracticeOptions.split('')
      const correctAnswers = CorrectAnswer.split('')

      return (
        <div className={styles.judgeWrap}>
          <div className={styles.judgeItem}>
            <div className={styles.option} />
            <div className={styles.answer}>
              <span>YES</span>
            </div>
            <div className={styles.answer}>
              <span>NO</span>
            </div>
          </div>
          {Options.map((item, i) => {
            const isCorrect = userAnswers[i] === correctAnswers[i]
            const color = isCorrect ? '#52c41a' : '#ff4d4f'

            return (
              // eslint-disable-next-line react/no-array-index-key
              <div key={i} className={styles.judgeItem}>
                <div className={styles.option}>{item}</div>
                <div className={styles.answer}>
                  {userAnswers[i] === 'A' && <MdCheckCircle size={18} color={color} />}
                </div>
                <div className={styles.answer}>
                  {userAnswers[i] === 'B' && <MdCheckCircle size={18} color={color} />}
                </div>
              </div>
            )
          })}
        </div>
      )
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <Row align="middle" className={styles.headerRow}>
          <Col span={8}>
            <LeftBrand />
          </Col>
          <Col span={8} className={styles.headerMidCol}>
            <div className={styles.indicator}>
              {tpo ? `${tpo} 听力` : `听力真题 ${state.Tid}`}：{originalTitle}
            </div>
          </Col>
          <Col span={8} className={styles.headerRightCol}>
            <Space size="middle">
              <Button
                className={styles.actionButton}
                onClick={() => {
                  history.push(history.location.query.from || '/practice')
                }}
              >
                Back
              </Button>
              <AvatarDropdown />
            </Space>
          </Col>
        </Row>
      </div>
      <div className={styles.content}>
        <ProCard
          split="vertical"
          className={styles.pieceContainer}
          bodyStyle={{ height: '100%', padding: 32 }}
        >
          <ProCard
            colSpan={12}
            style={{ height: '100%' }}
            bodyStyle={{ height: '100%', overflow: 'auto', padding: '0 24px 0 0' }}
          >
            <div className={styles.navWrap}>
              <Space wrap className={styles.qNumsWrap}>
                {questions.map((q, i) => {
                  // Correct 正确-Correct 错误-Error
                  const { Correct } = q

                  let fontColor = ''
                  if (currentQuestion.Qid === q.Qid) {
                    fontColor = '#fff'
                  } else if (Correct === 'Correct') {
                    fontColor = '#52c41a'
                  } else {
                    fontColor = '#ff4d4f'
                  }

                  let bgc = ''
                  if (currentQuestion.Qid === q.Qid) {
                    if (Correct === 'Correct') {
                      bgc = '#52c41a'
                    } else {
                      bgc = '#ff4d4f'
                    }
                  } else {
                    bgc = 'transparent'
                  }

                  return (
                    <Button
                      key={q.Qid}
                      style={{
                        borderColor: Correct === 'Correct' ? '#52c41a' : '#ff4d4f',
                        color: fontColor,
                        backgroundColor: bgc,
                        padding: '2.4px 12px',
                      }}
                      onClick={() => {
                        setState({ Qid: q.Qid })

                        repeatControls.seek(0)
                        repeatControls.pause()

                        qControls.seek(0)
                        qControls.pause()
                      }}
                    >
                      {i + 1}
                    </Button>
                  )
                })}
              </Space>
              <Button
                className={styles.intensiveBtn}
                type="primary"
                onClick={() => {
                  // TODO 有tpo精听数据后 删除此逻辑
                  if (tpo) return showWaitModal('TPO精听')

                  history.push({
                    pathname: '/intensivelistening',
                    query: {
                      Tid: state.Tid,
                    },
                  })
                }}
              >
                精听训练
              </Button>
            </div>
            {currentQuestion.RepeatAudio && (
              <div className={styles.repeatAudioWrapper}>
                <span>重听音频:</span>
                <ReviewPlayer
                  audioState={repeatAudioState}
                  controls={repeatControls}
                  wrapStyle={{ flex: 1, maxWidth: 500, minWidth: 250 }}
                  onSlideChange={(rate) => {
                    repeatControls.seek(repeatAudioState.duration * rate)
                    repeatControls.play()
                  }}
                  onChange={() => {
                    if (audioState.playing) {
                      controls.pause()
                    }

                    if (qAudioState.playing) {
                      qControls.pause()
                    }
                  }}
                />
              </div>
            )}
            <div className={styles.questionInfo}>
              <div className={styles.qName}>
                <div
                  className={styles.qAudioControl}
                  onClick={() => {
                    // 先暂停其他音频播放
                    if (audioState.playing) {
                      controls.pause()
                    }

                    if (repeatAudioState.playing) {
                      repeatControls.pause()
                    }

                    qAudioState.playing ? qControls.pause() : qControls.play()
                  }}
                >
                  {qAudioState.playing ? <PauseCircleFilled /> : <PlayCircleFilled />}
                </div>
                {currentQuestion.Name}
              </div>
              {getAnswerView()}
            </div>
            <div className={styles.recordsArea}>
              <div className={classNames(styles.recordsAreaTitle, styles.titleDecoration)}>
                答题记录
              </div>
              <div className={styles.recordsWrap}>
                {records.length ? (
                  records.map(({ CreatedAt, Options, Timing }, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <div key={i} className={styles.recordItem}>
                      <div>{CreatedAt}</div>
                      <div>{answerConvert(Options)}</div>
                      <div>{timingFormat(Timing || '0')}</div>
                    </div>
                  ))
                ) : (
                  <Empty description={<span style={{ fontSize: 14 }}>无答题记录</span>} />
                )}
              </div>
            </div>
            <div className={styles.parsingArea}>
              <div className={classNames(styles.parsingAreaTitle, styles.titleDecoration)}>
                题目解析
              </div>
              <div className={styles.correctAnswer}>
                正确答案为：{currentQuestion.CorrectAnswer}
              </div>
              {currentQuestion.Parsing ? (
                <p
                  className={styles.parsingContent}
                  dangerouslySetInnerHTML={{ __html: textWrap(currentQuestion.Parsing) }}
                />
              ) : (
                <Empty
                  description={<span style={{ fontSize: 14 }}>这道题目暂时没有解析哦~</span>}
                />
              )}
            </div>
          </ProCard>
          <ProCard
            colSpan={12}
            style={{ height: '100%' }}
            bodyStyle={{ height: '100%', overflow: 'auto', padding: '0 0 0 24px' }}
          >
            <ReviewPlayer
              audioState={audioState}
              controls={controls}
              wrapStyle={{ marginBottom: 24 }}
              onSlideChange={(rate) => {
                controls.seek(audioState.duration * rate)
                controls.play()
              }}
              onChange={() => {
                if (repeatAudioState.playing) {
                  repeatControls.pause()
                }

                if (qAudioState.playing) {
                  qControls.pause()
                }
              }}
            />
            <p className={styles.paragraphWrap}>
              {intensives.map(({ English, Chinese, StartTime, EndTime }, i) => (
                <span
                  // eslint-disable-next-line react/no-array-index-key
                  key={i}
                  className={classNames(styles.sentence, {
                    [styles.activedSentence]: isCurrentSentence(
                      audioState.time,
                      StartTime,
                      EndTime,
                    ),
                  })}
                >
                  {English}
                </span>
              ))}
            </p>
          </ProCard>
        </ProCard>
      </div>
      {audio}
      {repeatAudio}
      {qAudio}
    </div>
  )
}

export default ReviewReading
