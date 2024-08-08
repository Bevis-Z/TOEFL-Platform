import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { Row, Col, Button, Space, Modal } from 'antd'
import useUrlState from '@ahooksjs/use-url-state'
import { history, useLocation } from 'umi'
import { getUserId } from '@/utils/user'
import { getTiming, timingFormat } from '@/utils'
import { QUESTION_TYPE } from '@/constants/enums'
import classNames from 'classnames'
import LeftBrand from '@/components/Header/LeftBrand'
import { useRequest, useCountDown } from 'ahooks'
import { getReadingExamQuestions, readingMockCommit } from '@/services/mockexam'
import { uniqueId } from 'lodash'
import ChoicePiece from '@/components/Reading/ChoicePiece'
import InsertPiece from '@/components/Reading/InsertPiece'
import DragPiece from '@/components/Reading/DragPiece'
import MockIntro from './components/MockIntro'
import PassageIntro from './components/PassageIntro'
import styles from './index.less'

const STEP_TYPE = {
  mockIntro: 'mockIntro', // 模考介绍页
  passageIntro: 'passageIntro', // 篇阅读材料展示页
  examing: 'examing', // 小题作答页
}

/**
 * 阅读模考的流程：
 * 阅读介绍页 → 第一篇阅读展示页 → Q1 → Q2 → ... → Q10 → 第二篇阅读展示页 → Q11 → ... → Q20 → 第三篇阅读展示页 → Q21 → ... → Q30
 */
const MockReading = () => {
  const location = useLocation()
  const { Ename } = location.query

  // 上一题的提交时间 首次为入场时间
  const prevCommitTime = useRef(Date.now())

  const [urlState, setUrlState] = useUrlState({ stepIndex: '0' })
  const [passages, setPassages] = useState([])
  // 包含了模考介绍、阅读材料、做题 等所有节点
  const [stepNodes, setStepNodes] = useState([])
  const [currentPassage, setCurrentPassage] = useState({})
  const [currentStepNode, setCurrentStepNode] = useState({})
  const [currentAnswer, setCurrentAnswer] = useState({})
  const [qStatic, setQStatic] = useState({ qNum: 1, qCounts: 30 })
  const [questions, setQuestions] = useState([])
  const [reviewVisible, setReviewVisible] = useState(false)
  const [isTimeShow, setIsTimeShow] = useState(true)
  const [targetDate, setTargetDate] = useState()
  const [examTiming, setExamTiming] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (currentStepNode.stepType === STEP_TYPE.mockIntro) return

    setTargetDate(Date.now() + (1000 * 60 * 54 - examTiming * 1000))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examTiming])

  // 根据当前的 stepIndex 更新当前的 currentStepNode
  useEffect(() => {
    const index = Number(urlState.stepIndex)
    const node = stepNodes[index]
    if (!node) return

    setCurrentStepNode(node)
  }, [urlState.stepIndex, stepNodes])

  // 根据当前的 currentStepNode 更新当前的 currentPassage
  useEffect(() => {
    const matchedPsg = passages.find(({ psgId }) => psgId === currentStepNode.psgId)
    if (!matchedPsg) return

    setCurrentPassage(matchedPsg)
  }, [currentStepNode.psgId, passages])

  // 获取模考题目
  useRequest(
    () => {
      if (!Ename) return {}
      return getReadingExamQuestions({ Ename, UserId: getUserId() })
    },
    {
      onSuccess: ({ Code, Data }) => {
        if (Code !== 'Succeed') return

        const { Passages = [], ExamTiming } = Data
        const nodes = [{ stepType: STEP_TYPE.mockIntro }]

        Passages.forEach((passage) => {
          const psgId = uniqueId()
          passage.psgId = psgId
          passage.stepType = STEP_TYPE.passageIntro
          const { Questions = [], ...restPsgProps } = passage
          Questions.forEach((q) => {
            q.psgId = psgId
            q.stepType = STEP_TYPE.examing
          })

          nodes.push(restPsgProps, ...Questions)
        })

        setPassages(Passages)
        setStepNodes(nodes)
        setExamTiming(ExamTiming)
      },
    },
  )

  useEffect(() => {
    const list = stepNodes.filter((item) => item.stepType === STEP_TYPE.examing)

    setQuestions(list)
  }, [stepNodes])

  useEffect(() => {
    const { stepType, Qid } = currentStepNode
    if (stepType !== STEP_TYPE.examing) return

    const index = questions.findIndex((item) => item.Qid === Qid)

    setQStatic({ qNum: index, qCounts: questions.length })
  }, [currentStepNode, questions])

  const currentComplete = useMemo(() => {
    const { stepType, Qid } = currentStepNode
    if (stepType !== STEP_TYPE.examing) return {}

    const { Completes = [] } = currentPassage
    const complete = Completes.find((item) => item.Qid === Qid) || {}

    return complete
  }, [currentPassage, currentStepNode])

  const contentRender = useCallback(() => {
    const { stepType } = currentStepNode

    if (stepType === STEP_TYPE.mockIntro) {
      return <MockIntro />
    } else if (stepType === STEP_TYPE.passageIntro) {
      return <PassageIntro passage={currentStepNode} />
    } else if (stepType === STEP_TYPE.examing) {
      const { Original = [], OriginalTitle = '', IntroducePic = '', Tid } = currentPassage
      const { QuestionType: t, Qid } = currentStepNode
      const pieceProps = {
        key: Qid,
        Question: currentStepNode,
        Complete: currentComplete,
        original: Original,
        originalTitle: OriginalTitle,
        introducePic: IntroducePic,
        qNum: qStatic.qNum + 1,
        onAnswerChange: (val) => {
          // hack 拖拽题的空项用'-'表示 但在提交给后端时要替换掉
          const answerStr = (val || '').replaceAll('-', '')

          setCurrentAnswer({
            Tid,
            UserId: getUserId(),
            Qid,
            Options: answerStr,
            Ename,
          })

          // 修改答案数组
          setPassages((psgs) => {
            psgs.some((psg) => {
              if (psg.Tid === Tid) {
                const { Completes = [], ...rest } = psg
                const matchedComplete = Completes?.find?.((item) => item.Qid === Qid)

                if (matchedComplete) {
                  matchedComplete.Options = val
                } else {
                  Completes.push({ Qid, Options: val })
                }

                return true
              }
            })

            return psgs
          })
        },
      }

      if (t === QUESTION_TYPE.OneWay) {
        return <ChoicePiece {...pieceProps} />
      }
      if (t === QUESTION_TYPE.Many) {
        return <ChoicePiece {...pieceProps} />
      }
      if (t === QUESTION_TYPE.Insert) {
        return <InsertPiece {...pieceProps} />
      }
      if (t === QUESTION_TYPE.Drag) {
        return <DragPiece {...pieceProps} />
      }
    } else {
      return null
    }
  }, [Ename, currentComplete, currentPassage, currentStepNode, qStatic.qNum])

  const nextStep = () => {
    const index = Number(urlState.stepIndex)
    if (index >= stepNodes.length - 1) return

    setUrlState({ stepIndex: index + 1 })
  }

  const postAnswer = async (type) => {
    try {
      setSubmitting(true)
      const body = Object.keys(currentAnswer).length
        ? currentAnswer
        : {
            Tid: currentPassage.Tid,
            UserId: getUserId(),
            Qid: currentStepNode.Qid,
            Options: (currentComplete.Options || '').replaceAll('-', ''),
            Ename,
          }

      // 当前小题的所用时长 非累计
      body.Timing = getTiming(prevCommitTime.current)
      body.Type = type
      // 对答案排序 主要是为了拖拽题
      if (currentStepNode.QuestionType === QUESTION_TYPE.Drag) {
        body.Options = (body.Options || '').split('').sort().join('')
      }

      const { Code } = await readingMockCommit(body)
      setSubmitting(false)
      if (Code !== 'Succeed') return

      const { Options, Tid, Qid } = body
      const index = Number(urlState.stepIndex)

      if (index >= stepNodes.length - 1) {
        return history.push({
          pathname: '/mockreadscore',
          query: {
            Ename,
          },
        })
      }
      setUrlState({ stepIndex: index + 1 })
      setCurrentAnswer({})
      prevCommitTime.current = Date.now()
    } catch (err) {
      console.log(err)
    }
  }

  const [countdown] = useCountDown({
    targetDate,
    onEnd: () => {
      postAnswer('Submit')
    },
  })

  const onNext = () => {
    const { stepType } = currentStepNode

    if (stepType === STEP_TYPE.passageIntro) {
      nextStep()
    } else if (stepType === STEP_TYPE.examing) {
      const type = Number(urlState.stepIndex) === stepNodes.length - 1 ? 'Submit' : 'Next'

      postAnswer(type)
    }
  }

  const actionsRender = () => {
    const stepType = currentStepNode.stepType

    if (stepType === STEP_TYPE.mockIntro) {
      return (
        <Button
          className={styles.actionButton}
          onClick={() => {
            setTargetDate(Date.now() + (1000 * 60 * 54 - examTiming * 1000))
            nextStep()
          }}
        >
          CONTINUE
        </Button>
      )
    } else if (stepType === STEP_TYPE.passageIntro || stepType === STEP_TYPE.examing) {
      return (
        <Space>
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
            disabled={Number(urlState.stepIndex) <= 1}
            onClick={() => {
              setUrlState(({ stepIndex }) => {
                const index = Number(stepIndex)
                const i = index - 1

                return { stepIndex: i }
              })
            }}
          >
            BACK
          </Button>
          <Button className={styles.actionButton} loading={submitting} onClick={onNext}>
            {Number(urlState.stepIndex) === stepNodes.length - 1 ? 'SUBMIT' : 'NEXT'}
          </Button>
          <div className={styles.timingWrap}>
            <div className={styles.timing}>{isTimeShow && timingFormat(countdown / 1000)}</div>
            <Button
              className={classNames(styles.actionButton, styles.timingToggleBtn)}
              onClick={() => setIsTimeShow((show) => !show)}
            >
              {isTimeShow ? 'HIDE TIME' : 'SHOW TIME'}
            </Button>
          </div>
        </Space>
      )
    }

    return null
  }

  const titleRender = useCallback(() => {
    const stepType = currentStepNode.stepType

    if (stepType === STEP_TYPE.passageIntro || stepType === STEP_TYPE.examing) {
      return (
        <>
          <div className={styles.indicator}>
            Question {qStatic.qNum + 1} of {qStatic.qCounts}
          </div>
          <div className={styles.examName}>{Ename}</div>
        </>
      )
    } else {
      return null
    }
  }, [Ename, currentStepNode.stepType, qStatic.qCounts, qStatic.qNum])

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <Row align="middle" className={styles.headerRow}>
          <Col xs={4} sm={4} md={4} lg={4} xl={8}>
            <LeftBrand />
          </Col>
          <Col xs={6} sm={6} md={6} lg={4} xl={8} className={styles.headerMidCol}>
            {titleRender()}
          </Col>
          <Col xs={14} sm={14} md={14} lg={16} xl={8} className={styles.headerRightCol}>
            {actionsRender()}
          </Col>
        </Row>
      </div>
      <div className={styles.content}>
        <div className={styles.pieceContainer}>{contentRender()}</div>
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
                  <div className={styles.timing}>
                    {isTimeShow && timingFormat(countdown / 1000)}
                  </div>
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
            {questions.map(({ Qid, psgId }, i) => {
              const matchedPsg = passages.find((psg) => psg.psgId === psgId) || {}
              const { Completes = [] } = matchedPsg
              const complete = Completes.find((item) => item.Qid === Qid) || {}
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
                        const index = stepNodes.findIndex((node) => node.Qid === Qid)

                        setUrlState({ stepIndex: index })
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

export default MockReading
