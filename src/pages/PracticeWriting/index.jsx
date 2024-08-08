import { useState, useEffect, useRef } from 'react'
import { Space, Button, Dropdown, Menu, Popover, Row, Col } from 'antd'
import { getWritingQuestions } from '@/services/practice'
import { getUserId } from '@/utils/user'
import { useLocation, history } from 'umi'
import useUrlState from '@ahooksjs/use-url-state'
import { Article, AudioPlay, Exam } from '@/components/Writing'
import { useCountDown } from 'ahooks'
import { timingFormat } from '@/utils'
import VolumeSlider from '@/components/VolumeSlider'
import classNames from 'classnames'
import LeftBrand from '@/components/Header/LeftBrand'
import styles from './index.less'

const PracticeWriting = () => {
  const location = useLocation()
  const { Tid } = location.query
  /**
   * @name step 'read' | 'listen' | 'exam'
   */
  const [state, setState] = useUrlState({ step: '' })
  const [volume, setVolume] = useState(0.5)
  const [speed, setSpeed] = useState(1)
  const speedOptions = [0.5, 0.8, 1, 1.5, 1.75, 2]
  const [examTiming, setExamTiming] = useState(0)
  const examTimerId = useRef(null)
  const [question, setQuestion] = useState({
    Qid: null,
    WriteRecord: '',
    IntroduceAudio: '',
    IntroducePic: '',
    Original: '',
    Type: '', // 综合-Comprehensive 独立-Independent
  })
  const [readEndTime, setReadEndTime] = useState()

  const [readCountDown] = useCountDown({
    targetDate: readEndTime,
    onEnd: () => {
      setState({ step: 'listen' })
    },
  })

  const examRef = useRef(null)

  const startExamTiming = () => {
    examTimerId.current = setInterval(() => {
      setExamTiming((t) => t + 1)
    }, 1000)
  }

  const stopExamTiming = () => {
    setExamTiming(0)
    if (examTimerId.current !== null) {
      clearInterval(examTimerId.current)
    }
  }

  useEffect(() => {
    if (state.step === 'read') {
      setReadEndTime(Date.now() + 1000 * 60 * 3)
    }

    if (state.step === 'exam') {
      startExamTiming()
    } else {
      stopExamTiming()
    }
  }, [state])

  useEffect(() => {
    return () => {
      stopExamTiming()
    }
  }, [examTimerId])

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        if (!Tid) return

        const { Code, Data } = await getWritingQuestions({ Tid, UserId: getUserId() })
        if (Code !== 'Succeed') return

        const { Type } = Data
        setQuestion(Data)
        if (!state.step) {
          setState({ step: Type === 'Comprehensive' ? 'read' : 'exam' })
        }
      } catch (err) {
        console.log(err)
      }
    }

    fetchQuestions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const actionsRender = () => {
    if (state.step === 'read') {
      return [
        <Button
          className={styles.actionButton}
          key="read-next"
          onClick={() => {
            setReadEndTime(undefined)
            setState({ step: 'listen' })
          }}
        >
          Next
        </Button>,
        <span className={styles.timing} key="read-timing">
          {timingFormat(readCountDown / 1000)}
        </span>,
      ]
    } else if (state.step === 'listen') {
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
          key="speed"
        >
          <Button className={styles.actionButton}>速度 x{speed}</Button>
        </Dropdown>,
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
        </Popover>,
        <Button
          className={styles.actionButton}
          key="listen-next"
          onClick={() => setState({ step: 'exam' })}
        >
          Next
        </Button>,
      ]
    } else if (state.step === 'exam') {
      return [
        <Button
          className={styles.actionButton}
          key="submit"
          onClick={() => {
            if (examRef.current) {
              examRef.current.submit(() => {
                history.push({
                  pathname: '/reviewwriting',
                  query: {
                    Tid,
                    Type: question.Type,
                  },
                })
              })
            }
          }}
        >
          提交
        </Button>,
        <span className={styles.timing} key="exam-timing">
          {timingFormat(examTiming)}
        </span>,
      ]
    }
  }

  const getPiece = () => {
    if (state.step === 'read') {
      return <Article article={question.Original} />
    } else if (state.step === 'listen') {
      return (
        <AudioPlay
          volume={volume}
          speed={speed}
          imgSrc={question.IntroducePic}
          audioSrc={question.IntroduceAudio}
          onPlayEnded={() => {
            setState({ step: 'exam' })
          }}
        />
      )
    } else if (state.step === 'exam') {
      return (
        <Exam
          ref={examRef}
          original={question.Original}
          writeRecord={question.WriteRecord}
          Tid={Number(Tid)}
          Qid={question.Qid}
          Timing={String(examTiming)}
        />
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
            {/* eslint-disable-next-line react/self-closing-comp */}
            <div className={styles.indicator}></div>
          </Col>
          <Col span={8} className={styles.headerRightCol}>
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
        <div
          className={classNames(
            styles.pieceContainer,
            state.step !== 'exam' && styles.centerLayout,
          )}
        >
          {getPiece()}
        </div>
      </div>
    </div>
  )
}

export default PracticeWriting
