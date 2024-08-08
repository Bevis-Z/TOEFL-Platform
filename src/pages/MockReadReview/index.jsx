import { useEffect, useState, useCallback } from 'react'
import { Space, Button, Radio, Checkbox, Row, Col, Empty } from 'antd'
import ProCard from '@ant-design/pro-card'
import { CaretRightOutlined } from '@ant-design/icons'
import AvatarDropdown from '@/components/RightContent/AvatarDropdown'
import { getUserId } from '@/utils/user'
import { history, useLocation } from 'umi'
import { QUESTION_TYPE } from '@/constants/enums'
import { textWrap, timingFormat } from '@/utils'
import { useRequest } from 'ahooks'
import { getReadingExamPractices, getExamRecords } from '@/services/mockexam'
import useUrlState from '@ahooksjs/use-url-state'
import LeftBrand from '@/components/Header/LeftBrand'
import { ArticleSkeleton } from '@/components/Skeletons'
import classNames from 'classnames'
import styles from './index.less'

const MockReadReview = () => {
  const location = useLocation()
  const { Ename } = location.query

  // pIndex: passage-index qIndex: question-index
  const [urlState, setUrlState] = useUrlState({ pIndex: '0', qIndex: '0' })

  const [passages, setPassages] = useState([])
  const [correctCounts, setCorrectCounts] = useState(0)
  const [topicCounts, setTopicCounts] = useState(0)
  const [scores, setScores] = useState(0)
  const [examTiming, setExamTiming] = useState(0)
  const [currentPassage, setCurrentPassage] = useState({})

  const [questions, setQuestions] = useState([])
  const [original, setOriginal] = useState([])
  const [articleArr, setArticleArr] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState({})
  const [records, setRecords] = useState([])
  const [originalTitle, setOriginalTitle] = useState('')
  const [introducePic, setIntroducePic] = useState('')

  useEffect(() => {
    const pIndex = Number(urlState.pIndex)
    const psg = passages[pIndex]

    if (!psg) return

    setCurrentPassage(psg)
  }, [passages, urlState.pIndex])

  useEffect(() => {
    const qIndex = Number(urlState.qIndex)
    const qst = questions[qIndex]

    if (!qst) return

    setCurrentQuestion(qst)
  }, [questions, urlState.qIndex])

  useEffect(() => {
    const { IntroducePic = '', Original = [], OriginalTitle = '', Questions = [] } = currentPassage

    setQuestions(Questions.sort((a, b) => a.Index - b.Index))
    setOriginal(
      Original.map((text) => {
        return text
          .replace('【A】', '<span class="option-area" data-answer="A">[■]</span>')
          .replace('【B】', '<span class="option-area" data-answer="B">[■]</span>')
          .replace('【C】', '<span class="option-area" data-answer="C">[■]</span>')
          .replace('【D】', '<span class="option-area" data-answer="D">[■]</span>')
      }),
    )
    setOriginalTitle(OriginalTitle)
    setIntroducePic(IntroducePic)
  }, [currentPassage])

  useEffect(() => {
    const { Name } = currentQuestion
    if (Name === null || Name === undefined || !original.length) return

    const highlights = (Name.match(/<b>(.*?)<\/b>/g) || []).map((val) => {
      return val.replace(/<\/?b>/g, '')
    })
    const paragraghs = [...original].map((text) => {
      let str = text
      highlights.forEach((s) => {
        str = str.replace(s, `<b>${s}</b>`)
      })

      return str
    })

    setArticleArr(paragraghs)
  }, [original, currentQuestion])

  const { loading: practiceLoading } = useRequest(
    () => {
      if (!Ename) return {}
      return getReadingExamPractices({ Ename, UserId: getUserId() })
    },
    {
      onSuccess: ({ Code, Data }) => {
        if (Code !== 'Succeed') return

        const { Passages = [], CorrectCounts, TopicCounts, Scores, ExamTiming } = Data

        setPassages(Passages)
        setCorrectCounts(CorrectCounts)
        setTopicCounts(TopicCounts)
        setScores(Scores)
        setExamTiming(ExamTiming)
      },
    },
  )

  useRequest(
    () => {
      const { Tid } = currentPassage
      const { Qid } = currentQuestion
      const UserId = getUserId()

      if (!Tid || !Qid || !UserId || !Ename) return {}

      return getExamRecords({ Tid, Qid, UserId, Ename })
    },
    {
      refreshDeps: [currentPassage, currentQuestion],
      onSuccess: ({ Code, Data }) => {
        if (Code !== 'Succeed') return

        const { Records = [] } = Data

        setRecords(Records)
      },
    },
  )

  const getPTagId = (index) => {
    return `paragraph-${currentQuestion.Qid}-${index}`
  }

  useEffect(() => {
    const timeId = setInterval(() => {
      const p = document.getElementById(getPTagId((currentQuestion.Paragraph || '').split(',')[0]))
      if (!p) return

      clearInterval(timeId)
      p.scrollIntoView({ behavior: 'smooth' })
    }, 200)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion.Paragraph])

  const getOptions = (QuestionType, Options) => {
    if (QuestionType === QUESTION_TYPE.Insert) {
      return [
        { Value: 'A', Label: '' },
        { Value: 'B', Label: '' },
        { Value: 'C', Label: '' },
        { Value: 'D', Label: '' },
      ]
    }

    return Options
  }

  const getAnswerView = () => {
    const { QuestionType, Options = [], CorrectAnswer, PracticeOptions } = currentQuestion

    if (QuestionType === QUESTION_TYPE.Drag || QuestionType === QUESTION_TYPE.Many) {
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
              <Space key={Value} align="start">
                <Checkbox checked={isChoice} disabled className={styles.disabledCheckbox} />
                <span style={{ color }} className={styles.answerLabel}>
                  {Value}. {Label}
                </span>
              </Space>
            )
          })}
        </Space>
      )
    } else {
      return (
        <Space direction="vertical">
          {getOptions(QuestionType, Options).map(({ Value, Label }) => {
            const isCorrectOption = (CorrectAnswer || '').includes(Value)
            const isChoice = (PracticeOptions || '').includes(Value)
            let color = ''
            if (isCorrectOption) {
              color = '#52c41a'
            } else if (isChoice) {
              color = '#ff4d4f'
            }

            return (
              <Space key={Value} align="start">
                <Radio checked={isChoice} disabled className={styles.disabledRadio} />
                <span style={{ color }} className={styles.answerLabel}>
                  {Value}.{QuestionType !== QUESTION_TYPE.Insert && <span> {Label}</span>}
                </span>
              </Space>
            )
          })}
        </Space>
      )
    }
  }

  const getQuestionTitle = useCallback(() => {
    const { QuestionType, Name, Options } = currentQuestion

    if (QuestionType === QUESTION_TYPE.Insert) {
      const insertText = (Options[0] || '').replace(/(<b>|<\/b>)/g, '')

      return (
        <div className={styles.qName}>
          <div>
            Look at the four squares[■]that indicate where the following sentence could be added to
            the passage. Where would the sentence best fit? Click on a square[■]to add the sentence
            to the passage.
          </div>
          <div className={styles.qStr}>{insertText}</div>
        </div>
      )
    } else if (QuestionType === QUESTION_TYPE.Drag) {
      return (
        <div className={styles.qName}>
          <div>
            Directions: An introductory sentence for a brief summary of the passage is provided
            below. Complete the summary by selecting the THREE answer choices that express the most
            important ideas in the passage. Some sentences do not belong in the summary because they
            express ideas that are not presented in the passage or are minor ideas in the passage.
            <br />
            This question is worth 2 points. Drag your answer choices to the spaces where they
            belong. To remove an answer choice, click on it.To review the passage, click VIEW TEXT
          </div>
          <div className={styles.qStr}>
            <b>{Name}</b>
          </div>
        </div>
      )
    } else {
      return (
        <div className={classNames(styles.qName, styles.qStr)}>
          <p dangerouslySetInnerHTML={{ __html: textWrap(Name) }} />
        </div>
      )
    }
  }, [currentQuestion])

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <Row align="middle" className={styles.headerRow}>
          <Col xs={6} sm={6} md={6} lg={6} xl={7}>
            <LeftBrand />
          </Col>
          <Col xs={12} sm={12} md={12} lg={12} xl={10} className={styles.headerMidCol}>
            <div className={styles.indicator}>{Ename}</div>
            <div>分数：{scores}</div>
            <div>总用时：{timingFormat(examTiming)}</div>
            <div>
              正确数：{correctCounts}/{topicCounts}
            </div>
          </Col>
          <Col xs={6} sm={6} md={6} lg={6} xl={7} className={styles.headerRightCol}>
            <Space size="middle">
              <Button
                className={styles.actionButton}
                onClick={() => {
                  history.push({
                    pathname: '/mockreadscore',
                    query: { Ename },
                  })
                }}
              >
                返回
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
            <ul className={styles.passageItemWrap}>
              {passages.map((psg, i) => (
                <li
                  // eslint-disable-next-line react/no-array-index-key
                  key={i}
                  className={classNames(
                    styles.passageItem,
                    Number(urlState.pIndex) === i && styles.passageItemActive,
                  )}
                  onClick={() => {
                    setUrlState({ pIndex: i, qIndex: '0' })
                  }}
                >
                  <span>Passage {i + 1}</span>
                </li>
              ))}
            </ul>
            <Space wrap>
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
                      setUrlState({ qIndex: i })
                    }}
                  >
                    {i + 1}
                  </Button>
                )
              })}
            </Space>
            <div className={styles.questionInfo}>
              {getQuestionTitle()}
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
                      <div>{Options || 'Not Answer'}</div>
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
            <div className={styles.paragraphWrap}>
              <ArticleSkeleton loading={practiceLoading}>
                <div className={styles.title}>{originalTitle}</div>
                <div className={styles.imgWrap}>
                  {introducePic && <img src={introducePic} alt="" />}
                </div>
                {articleArr.map((text, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <p key={i} id={getPTagId(i)} className={styles.paragraph}>
                    {(currentQuestion.Paragraph || '').split(',').includes(String(i)) && (
                      <span style={{ marginRight: 2 }}>
                        <CaretRightOutlined style={{ fontSize: 16 }} />
                      </span>
                    )}
                    <span dangerouslySetInnerHTML={{ __html: textWrap(text) }} />
                  </p>
                ))}
              </ArticleSkeleton>
            </div>
          </ProCard>
        </ProCard>
      </div>
    </div>
  )
}

export default MockReadReview
