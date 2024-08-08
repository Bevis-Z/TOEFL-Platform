import { useEffect, useState, useRef } from 'react'
import { Row, Col, Button, Space, Modal } from 'antd'
import useUrlState from '@ahooksjs/use-url-state'
import { history } from 'umi'
import { getReadingQuestions, readingPracticeExam } from '@/services/practice'
import { getUserId } from '@/utils/user'
import ChoicePiece from '@/components/Reading/ChoicePiece'
import InsertPiece from '@/components/Reading/InsertPiece'
import DragPiece from '@/components/Reading/DragPiece'
import { getTiming, timingFormat } from '@/utils'
import { QUESTION_TYPE } from '@/constants/enums'
import classNames from 'classnames'
import LeftBrand from '@/components/Header/LeftBrand'
import styles from './index.less'

const PracticeReading = () => {
  // 上一题的提交时间 首次为入场时间
  const prevCommitTime = useRef(Date.now())

  const [state, setState] = useUrlState({
    Tid: undefined,
    Index: undefined,
    startAt: undefined,
  })
  const [completes, setCompletes] = useState([])
  const [questions, setQuestions] = useState([])
  const [original, setOriginal] = useState([])
  const [originalTitle, setOriginalTitle] = useState('')
  const [introducePic, setIntroducePic] = useState('')
  const [currentComplete, setCurrentComplete] = useState({})
  const [currentQuestion, setCurrentQuestion] = useState({})
  const [currentAnswer, setCurrentAnswer] = useState({})
  const [hhmmss, setHhmmss] = useState('')
  const [isTimeShow, setIsTimeShow] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [reviewVisible, setReviewVisible] = useState(false)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { Tid } = state
        if (!Tid) return

        const { Code, Data } = await getReadingQuestions({ Tid, UserId: getUserId() })
        if (Code !== 'Succeed') return

        const { Completes = [], Questions, Original, OriginalTitle, IntroducePic } = Data
        const sortedQs = Questions.sort((a, b) => a.Index - b.Index)

        setQuestions(sortedQs)
        setCompletes(Completes)
        setOriginal(Original)
        setOriginalTitle(OriginalTitle)
        setIntroducePic(IntroducePic)

        if (state.Index === undefined || state.Index === null) {
          // 找到第一道没做的题的索引
          const firstEmptyIndex = sortedQs.findIndex(({ Qid }) => {
            // 有两种情况都算没做 1.Qid不在Completes数组里 2.Qid在Completes数组里，但没有答案
            const idx = Completes.findIndex((comp) => comp.Qid === Qid)
            if (idx === -1) return true
            if (!Completes[idx].Options) return true
            return false
          })

          setState({ Index: firstEmptyIndex === -1 ? 0 : firstEmptyIndex })
        }
      } catch (err) {
        console.log(err)
      }
    }

    fetchQuestions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (state.Index === undefined || state.Index === null) return

    const i = Number(state.Index)
    const question = questions[i]
    if (!question) return

    setCurrentQuestion(question)
    const complete = completes.find(({ Qid }) => Qid === question.Qid) || {}
    setCurrentComplete(complete)
  }, [state.Index, completes, questions])

  useEffect(() => {
    const setTiming = () => {
      const formatStr = timingFormat((Date.now() - Number(state.startAt)) / 1000)

      setHhmmss(formatStr)
    }
    const timerId = setInterval(() => {
      setTiming()
    }, 1000)

    setTiming()

    return () => {
      clearInterval(timerId)
    }
  }, [state.startAt])

  // 生成当前的做题组件
  const getPiece = () => {
    const { QuestionType: t, Qid } = currentQuestion
    const pieceProps = {
      key: Qid,
      Question: currentQuestion,
      Complete: currentComplete,
      original: original,
      originalTitle,
      introducePic,
      qNum: Number(state.Index) + 1,
      onAnswerChange: (val) => {
        // hack 拖拽题的空项用'-'表示 但在提交给后端时要替换掉
        const answerStr = (val || '').replaceAll('-', '')

        setCurrentAnswer({
          Tid: Number(state.Tid),
          UserId: getUserId(),
          Qid,
          Options: answerStr,
          Type: Number(state.Index) === questions.length - 1 ? 'Submit' : 'Next',
        })

        // 修改答案数组
        setCompletes((prev) => {
          const finded = prev.find((item) => item.Qid === Qid)
          if (finded) {
            finded.Options = val
            return prev
          } else {
            return [...prev, { Qid, Options: val }]
          }
        })
      },
    }

    if (t === QUESTION_TYPE.OneWay) {
      return <ChoicePiece {...pieceProps} key="one-way" />
    }
    if (t === QUESTION_TYPE.Many) {
      return <ChoicePiece {...pieceProps} key="many" />
    }
    if (t === QUESTION_TYPE.Insert) {
      return <InsertPiece {...pieceProps} key="insert" />
    }
    if (t === QUESTION_TYPE.Drag) {
      return <DragPiece {...pieceProps} key="drag" />
    }
  }

  const onNext = async () => {
    try {
      setSubmitting(true)
      const body = Object.keys(currentAnswer).length
        ? currentAnswer
        : {
            Tid: Number(state.Tid),
            UserId: getUserId(),
            Qid: currentQuestion.Qid,
            Options: (currentComplete.Options || '').replaceAll('-', ''),
            Type: Number(state.Index) === questions.length - 1 ? 'Submit' : 'Next',
          }

      // 当前小题的所用时长 非累计
      body.Timing = getTiming(prevCommitTime.current)
      // 对答案排序 主要是为了拖拽题
      if (currentQuestion.QuestionType === QUESTION_TYPE.Drag) {
        body.Options = (body.Options || '').split('').sort().join('')
      }

      const { Code } = await readingPracticeExam(body)
      setSubmitting(false)
      if (Code !== 'Succeed') return

      const { Options, Tid, Qid } = body
      const index = Number(state.Index)

      if (index >= questions.length - 1) {
        return history.push({
          pathname: '/reviewreading',
          query: {
            Tid,
          },
        })
      }
      setState({ Index: index + 1 })
      setCurrentAnswer({})
      prevCommitTime.current = Date.now()
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <Row align="middle" className={styles.headerRow}>
          <Col xs={4} sm={4} md={4} lg={4} xl={8}>
            <LeftBrand />
          </Col>
          <Col xs={6} sm={6} md={6} lg={4} xl={8} className={styles.headerMidCol}>
            <div className={styles.indicator}>
              Question {Number(state.Index) + 1} of {questions.length}
            </div>
          </Col>
          <Col xs={14} sm={14} md={14} lg={16} xl={8} className={styles.headerRightCol}>
            <Space>
              <Button
                className={styles.actionButton}
                onClick={() => {
                  history.push('/practice')
                }}
              >
                退出练习
              </Button>
              <Button
                className={styles.actionButton}
                onClick={() => {
                  setReviewVisible(true)
                }}
              >
                REVIEW
              </Button>
              <Button
                className={styles.actionButton}
                onClick={() => {
                  setState(({ Index }) => {
                    const index = Number(Index)
                    const i = index <= 0 ? index : index - 1

                    return { Index: i }
                  })
                }}
              >
                BACK
              </Button>
              <Button className={styles.actionButton} loading={submitting} onClick={onNext}>
                {Number(state.Index) === questions.length - 1 ? 'SUBMIT' : 'NEXT'}
              </Button>
              <div className={styles.timingWrap}>
                <div className={styles.timing}>{isTimeShow && hhmmss}</div>
                <Button
                  className={classNames(styles.actionButton, styles.timingToggleBtn)}
                  onClick={() => setIsTimeShow((show) => !show)}
                >
                  {isTimeShow ? 'HIDE TIME' : 'SHOW TIME'}
                </Button>
              </div>
            </Space>
          </Col>
        </Row>
      </div>
      <div className={styles.content}>
        <div className={styles.pieceContainer}>{getPiece()}</div>
      </div>
      <Modal
        className={styles.reviewModal}
        wrapClassName="normal-modal"
        visible={reviewVisible}
        width="100%"
        bodyStyle={{ padding: 0, height: '100%', overflow: 'auto' }}
        footer={null}
        closable={false}
      >
        <div className={classNames(styles.header, styles.reviewHeader)}>
          <Row align="middle" className={styles.headerRow}>
            <Col span={8}>
              <LeftBrand />
            </Col>
            <Col span={8} className={styles.headerMidCol}>
              <div className={styles.indicator}>Review List</div>
            </Col>
            <Col span={8} className={styles.headerRightCol}>
              <Space className={styles.reviewHeaderRight}>
                <Button
                  className={styles.actionButton}
                  onClick={() => {
                    setReviewVisible(false)
                  }}
                >
                  Close Review List
                </Button>
                <div className={styles.timingWrap}>
                  <div className={styles.timing}>{isTimeShow && hhmmss}</div>
                  <Button
                    className={classNames(styles.actionButton, styles.timingToggleBtn)}
                    onClick={() => setIsTimeShow((show) => !show)}
                  >
                    {isTimeShow ? 'HIDE TIME' : 'SHOW TIME'}
                  </Button>
                </div>
              </Space>
            </Col>
          </Row>
        </div>
        <div className={styles.reviewContent}>
          <div className={styles.reviewListContainer}>
            {questions.map(({ Qid }, i) => {
              const complete = completes.find((item) => item.Qid === Qid) || {}
              const answer = (complete.Options || '').replaceAll('-', '') || 'Not Answer'

              return (
                <div key={Qid} className={styles.reviewItem}>
                  <div className={styles.reviewItemIndex}>Q{i + 1}</div>
                  <div className={styles.reviewItemAnswer}>{answer}</div>
                  <div className={styles.reviewItemRight}>
                    <Button
                      className={styles.reviewCheckBtn}
                      type="primary"
                      onClick={() => {
                        setState({ Index: i })
                        setReviewVisible(false)
                      }}
                    >
                      Check
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default PracticeReading
