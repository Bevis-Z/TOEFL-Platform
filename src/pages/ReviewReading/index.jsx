import { useEffect, useState, useCallback } from 'react'
import { Space, Button, Radio, Checkbox, Row, Col, Empty } from 'antd'
import ProCard from '@ant-design/pro-card'
import { CaretRightOutlined } from '@ant-design/icons'
import AvatarDropdown from '@/components/RightContent/AvatarDropdown'
import { getReadingPractices, getPracticeRecords } from '@/services/practice'
import { getUserId } from '@/utils/user'
import { history } from 'umi'
import { QUESTION_TYPE } from '@/constants/enums'
import { textWrap, timingFormat } from '@/utils'
import useUrlState from '@ahooksjs/use-url-state'
import LeftBrand from '@/components/Header/LeftBrand'
import classNames from 'classnames'
import styles from './index.less'

const ReviewReading = () => {
  const [state, setState] = useUrlState({ Qid: undefined, Tid: undefined })
  const [questions, setQuestions] = useState([])
  const [original, setOriginal] = useState([])
  const [articleArr, setArticleArr] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState({})
  const [records, setRecords] = useState([])
  const [originalTitle, setOriginalTitle] = useState('')
  const [tpo, setTpo] = useState('')
  const [introducePic, setIntroducePic] = useState('')

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        if (!state.Tid) return

        const { Code, Data } = await getReadingPractices({ Tid: state.Tid, UserId: getUserId() })
        if (Code !== 'Succeed') return

        const { Questions, Original, OriginalTitle, Tpo, IntroducePic } = Data
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
        setTpo(Tpo)
        setIntroducePic(IntroducePic)
        if (!state.Qid) {
          setState({ Qid: Questions[0].Qid })
        }
      } catch (err) {
        console.log(err)
      }
    }

    fetchQuestions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  useEffect(() => {
    const question = questions.find(({ Qid }) => Qid === Number(state.Qid))
    if (!question) return

    setCurrentQuestion(question)
  }, [state.Qid, questions])

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
          <Col xs={6} sm={6} md={6} lg={6} xl={8}>
            <LeftBrand />
          </Col>
          <Col xs={12} sm={12} md={12} lg={12} xl={8} className={styles.headerMidCol}>
            <div className={styles.indicator}>
              {tpo ? `${tpo} 阅读` : `阅读真题 ${state.Tid}`}：{originalTitle}
            </div>
          </Col>
          <Col xs={6} sm={6} md={6} lg={6} xl={8} className={styles.headerRightCol}>
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
                      setState({ Qid: q.Qid })
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
            </div>
          </ProCard>
        </ProCard>
      </div>
    </div>
  )
}

export default ReviewReading
