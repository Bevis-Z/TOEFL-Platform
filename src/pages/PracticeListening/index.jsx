import { useState, useEffect, useRef } from 'react'
import { Button, Space, Popover, Row, Col, Menu, Dropdown } from 'antd'
import AudioCheck from '@/components/Listening/AudioCheck'
import ListeningPlay from '@/components/Listening/ListeningPlay'
import { useLocation, history } from 'umi'
import { getListeningQuestions, listeningPracticeExam } from '@/services/practice'
import { getUserId } from '@/utils/user'
import useUrlState from '@ahooksjs/use-url-state'
import Exam from './components/Exam'
import { getTiming, timingFormat } from '@/utils'
import { useBoolean } from 'ahooks'
import VolumeSlider from '@/components/VolumeSlider'
import classNames from 'classnames'
import LeftBrand from '@/components/Header/LeftBrand'
import styles from './index.less'

const PracticeListening = () => {
  const location = useLocation()
  const { Tid } = location.query

  // 听力小题所用时长 在入场、小题音频播放结束、作答后分别记录当前时间 再在作答时计算时间差 即是这道小题所用时长
  const prevCommitTime = useRef(Date.now())

  /**
   * @name step 'audioCheck' | 'listeningPlay' | 'exam'
   * @name index 题目索引
   */
  const [state, setState] = useUrlState({ step: 'audioCheck', index: 0 })
  const [volume, setVolume] = useState(0.5)
  const [speed, setSpeed] = useState(1)
  const speedOptions = [0.5, 0.8, 1, 1.5, 1.75, 2]
  const [introducePic, setIntroducePic] = useState('')
  const [introduceAudio, setIntroduceAudio] = useState('')
  const [completes, setCompletes] = useState([])
  const [questions, setQuestions] = useState([])
  const [currentComplete, setCurrentComplete] = useState({})
  const [currentQuestion, setCurrentQuestion] = useState({})
  const [currentAnswer, setCurrentAnswer] = useState({})
  /**
   * @name actionStatus 'browsing' | 'answered' | 'nexting'
   */
  const [actionStatus, setActionStatus] = useState('browsing')
  const [seconds, setSeconds] = useState(0)
  const [timerId, setTimerId] = useState(null)
  const [showTime, { toggle: toggleShowTime }] = useBoolean(true)
  const [okLoading, setOkLoading] = useState(false)

  const startTiming = () => {
    const tid = setInterval(() => {
      setSeconds((s) => s + 1)
    }, 1000)

    setTimerId(tid)
  }

  const stopTiming = () => {
    clearInterval(timerId)
  }

  useEffect(() => {
    return () => {
      stopTiming()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerId])

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        if (!Tid) return

        const { Code, Data } = await getListeningQuestions({ Tid, UserId: getUserId() })
        if (Code !== 'Succeed') return

        const { IntroducePic, IntroduceAudio, Completes, Questions } = Data
        setQuestions(Questions.sort((a, b) => a.Index - b.Index))
        setCompletes(Completes)
        setIntroducePic(IntroducePic)
        setIntroduceAudio(IntroduceAudio)
      } catch (err) {
        console.log(err)
      }
    }

    fetchQuestions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (state.step !== 'exam') return

    const i = Number(state.index)
    const question = questions[i]
    if (!question) return

    setCurrentQuestion(question)
    const complete = completes.find(({ Qid }) => Qid === question.Qid) || {}
    setCurrentComplete(complete)
  }, [state, questions, completes])

  const getPiece = () => {
    if (state.step === 'audioCheck') {
      return <AudioCheck volume={volume} />
    } else if (state.step === 'listeningPlay') {
      return (
        <ListeningPlay
          volume={volume}
          speed={speed}
          imgSrc={introducePic}
          audioSrc={introduceAudio}
          onPlayEnded={() => {
            setState({ step: 'exam' })
          }}
        />
      )
    } else {
      const { Qid, QuestionType } = currentQuestion

      return (
        <Exam
          volume={volume}
          question={currentQuestion}
          complete={currentComplete}
          onAudioEnd={() => {
            startTiming()
            prevCommitTime.current = Date.now()
          }}
          onAnswerChange={(val) => {
            if (val) {
              setActionStatus('answered')
            }

            setCurrentAnswer({
              Tid: Number(Tid),
              UserId: getUserId(),
              Qid,
              Options: val,
              Type: Number(state.index) === questions.length - 1 ? 'Submit' : 'Next',
              QuestionType,
            })
          }}
        />
      )
    }
  }

  const volumeButton = (
    <Popover
      key="volume"
      content={
        <VolumeSlider
          volume={volume}
          onVolumeChange={(val) => {
            setVolume(val)
          }}
        />
      }
      trigger="click"
    >
      <Button className={styles.actionButton}>Volume</Button>
    </Popover>
  )

  const onCommitAnswer = async () => {
    try {
      setOkLoading(true)
      const body = {
        ...currentAnswer,
        Timing: getTiming(prevCommitTime.current),
      }
      const { Code } = await listeningPracticeExam(body)
      setOkLoading(false)
      if (Code !== 'Succeed') return

      stopTiming()
      const index = Number(state.index)
      if (index >= questions.length - 1) {
        return history.push({
          pathname: '/reviewlistening',
          query: {
            Tid,
          },
        })
      }
      prevCommitTime.current = Date.now()
      setCurrentAnswer({})
      setState({ index: index + 1 })
      setActionStatus('browsing')
    } catch (err) {
      setOkLoading(false)
      console.log(err)
    }
  }

  const actionsRender = () => {
    if (state.step === 'audioCheck') {
      return [
        volumeButton,
        <Button
          key="check-next"
          className={styles.actionButton}
          onClick={() => {
            setState({ step: 'listeningPlay' })
          }}
        >
          Next
        </Button>,
      ]
    } else if (state.step === 'listeningPlay') {
      return [
        <Dropdown
          overlay={
            <Menu
              items={speedOptions.map((s) => ({ key: s, label: `x ${s}` }))}
              onClick={({ key }) => {
                setSpeed(Number(key))
              }}
            />
          }
          key="listening-speed"
        >
          <Button className={styles.actionButton}>速度 x{speed}</Button>
        </Dropdown>,
        volumeButton,
      ]
    } else {
      // 做题状态的按钮
      return [
        volumeButton,
        <Button
          key="exam-ok"
          className={styles.actionButton}
          loading={okLoading}
          disabled={actionStatus !== 'nexting'}
          onClick={onCommitAnswer}
        >
          OK
        </Button>,
        <Button
          key="exam-next"
          className={styles.actionButton}
          disabled={actionStatus !== 'answered'}
          onClick={() => {
            setActionStatus('nexting')
          }}
        >
          Next
        </Button>,
        <div key="timing" className={styles.timingWrap}>
          <div className={styles.timing}>{showTime && timingFormat(seconds)}</div>
          <Button
            className={classNames(styles.actionButton, styles.timingToggleBtn)}
            onClick={toggleShowTime}
          >
            {showTime ? 'Hide Time' : 'Show Time'}
          </Button>
        </div>,
      ]
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
            {state.step === 'exam' && (
              <div className={styles.indicator}>
                Question {Number(state.index) + 1} of {questions.length}
              </div>
            )}
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
              {actionsRender()}
            </Space>
          </Col>
        </Row>
      </div>
      <div className={styles.content}>
        <div className={classNames(styles.pieceContainer, styles.centerLayout)}>{getPiece()}</div>
      </div>
    </div>
  )
}

export default PracticeListening
