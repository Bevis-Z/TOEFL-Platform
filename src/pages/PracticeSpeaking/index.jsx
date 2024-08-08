import { useState, useEffect } from 'react'
import { Space, Button, Popover, Dropdown, Menu, Row, Col } from 'antd'
import {
  RecorderCheck,
  Introduction,
  Reading,
  ListeningPlay,
  Question,
  Preparation,
  AnswerRecording,
} from '@/components/Speaking'
import { useLocation, history } from 'umi'
import { SPEAK_TYPE } from '@/constants/enums'
import useUrlState from '@ahooksjs/use-url-state'
import VolumeSlider from '@/components/VolumeSlider'
import { getSpeakingQuestions } from '@/services/practice'
import { getUserId } from '@/utils/user'
import classNames from 'classnames'
import LeftBrand from '@/components/Header/LeftBrand'
import styles from './index.less'

// 独立口语 流程
const C_FLOWS = ['rec_check', 'intro', 'question', 'prepare', 'answer_rec']
// 综A口语 流程
const A_FLOWS = ['rec_check', 'intro', 'reading', 'listening', 'question', 'prepare', 'answer_rec']
// 综B口语 流程
const B_FLOWS = ['rec_check', 'intro', 'listening', 'question', 'prepare', 'answer_rec']

// 不需要中心布局的步骤
const decentreLayouts = ['reading']

const PracticeSpeaking = () => {
  const location = useLocation()
  const { Tid, Type, Task } = location.query
  const [state, setState] = useUrlState({ step: 'rec_check' })
  const [workflows, setWorkflows] = useState([])
  const [volume, setVolume] = useState(0.5)
  const [speed, setSpeed] = useState(1)
  const speedOptions = [0.5, 0.8, 1, 1.5, 1.75, 2]
  const [question, setQuestion] = useState({
    ReadingAudio: '',
    IntroduceAudio: '',
    IntroducePic: '',
    ReadingOriginal: '',
    OriginalTitle: '',
    Name: '',
    Qid: null,
    QuestionAudio: '',
  })

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        if (!Tid) return

        const { Code, Data } = await getSpeakingQuestions({ Tid, UserId: getUserId() })
        if (Code !== 'Succeed') return

        setQuestion(Data)
      } catch (err) {
        console.log(err)
      }
    }

    fetchQuestions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (Type === SPEAK_TYPE.A) setWorkflows(A_FLOWS)
    else if (Type === SPEAK_TYPE.B) setWorkflows(B_FLOWS)
    else if (Type === SPEAK_TYPE.C) setWorkflows(C_FLOWS)
  }, [Type])

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

  const speedButton = (
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
    </Dropdown>
  )

  const actionsRender = () => {
    const { step } = state

    if (step === 'rec_check') {
      return volumeButton
    } else if (step === 'intro') {
      return [
        speedButton,
        volumeButton,
        <Button
          key="intro-continue"
          className={styles.actionButton}
          onClick={() => {
            nextStep()
          }}
        >
          continue
        </Button>,
      ]
    } else if (step === 'reading') {
      return volumeButton
    } else if (step === 'listening') {
      return [speedButton, volumeButton]
    } else if (step === 'question') {
      return volumeButton
    } else if (step === 'prepare') {
      return volumeButton
    } else if (step === 'answer_rec') {
      return volumeButton
    }
  }

  const nextStep = () => {
    const index = workflows.findIndex((item) => item === state.step)
    if (index === -1 || index === workflows.length - 1) return

    setState({ step: workflows[index + 1] })
    setSpeed(1)
  }

  const getPiece = () => {
    const { step } = state

    if (step === 'rec_check') {
      return (
        <RecorderCheck
          volume={volume}
          onStart={() => {
            nextStep()
          }}
        />
      )
    } else if (step === 'intro') {
      return (
        <Introduction
          volume={volume}
          speed={speed}
          task={Task}
          onPlayEnded={() => {
            nextStep()
          }}
        />
      )
    } else if (step === 'reading') {
      return (
        <Reading
          volume={volume}
          readingAudio={question.ReadingAudio}
          readingOriginal={question.ReadingOriginal}
          originalTitle={question.OriginalTitle}
          onReadingEnded={() => {
            nextStep()
          }}
        />
      )
    } else if (step === 'listening') {
      return (
        <ListeningPlay
          volume={volume}
          speed={speed}
          imgSrc={question.IntroducePic}
          audioSrc={question.IntroduceAudio}
          onPlayEnded={() => {
            nextStep()
          }}
        />
      )
    } else if (step === 'question') {
      return (
        <Question
          volume={volume}
          name={question.Name}
          questionAudio={question.QuestionAudio}
          type={Type}
          onPlayEnded={() => {
            nextStep()
          }}
        />
      )
    } else if (step === 'prepare') {
      return (
        <Preparation
          name={question.Name}
          type={Type}
          onTimeEnd={() => {
            nextStep()
          }}
        />
      )
    } else if (step === 'answer_rec') {
      return (
        <AnswerRecording
          volume={volume}
          name={question.Name}
          type={Type}
          Tid={Tid}
          Qid={question.Qid}
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
            !decentreLayouts.includes(state.step) && styles.centerLayout,
          )}
        >
          {getPiece()}
        </div>
      </div>
    </div>
  )
}

export default PracticeSpeaking
