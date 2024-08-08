import { useState, useEffect, memo, useMemo } from 'react'
import { Radio, Row, Col, Space, Checkbox } from 'antd'
import { CaretRightOutlined } from '@ant-design/icons'
import { QUESTION_TYPE } from '@/constants/enums'
import { textWrap, isElementInViewport } from '@/utils'
import styles from './ChoicePiece.less'

const ChoicePiece = ({
  Question,
  Complete,
  original,
  originalTitle,
  introducePic,
  qNum,
  onAnswerChange,
}) => {
  // Paragraph 是题目对应的段落索引 string
  const { Name, Options, Qid, Paragraph, QuestionType } = Question
  const [userAnswer, setUserAnswer] = useState('')
  // 右侧文章的高亮随着当前题目的高亮而变化
  const articleArr = useMemo(() => {
    const highlights = (Name.match(/<b>(.*?)<\/b>/g) || []).map((val) => {
      return val.replace(/<\/?b>/g, '')
    })

    return [...original].map((text) => {
      let str = text
        .replace('【A】', '')
        .replace('【B】', '')
        .replace('【C】', '')
        .replace('【D】', '')

      highlights.forEach((s) => {
        str = str.replace(s, `<b>${s}</b>`)
      })

      return str
    })
  }, [Name, original])

  useEffect(() => {
    setUserAnswer(Complete.Options)
  }, [Complete])

  const onChoice = (e) => {
    const val = e.target.value
    setUserAnswer(val)
    onAnswerChange(val)
  }

  const getPTagId = (index) => {
    return `paragraph-${Qid}-${index}`
  }

  useEffect(() => {
    const timeId = setInterval(() => {
      const p = document.getElementById(getPTagId((Paragraph || '').split(',')[0]))
      if (!p) return

      clearInterval(timeId)
      if (!isElementInViewport(p)) {
        p.scrollIntoView({ behavior: 'smooth' })
      }
    }, 50)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Paragraph])

  return (
    <Row className={styles.pieceWrap}>
      <Col
        xs={{ span: 24 }}
        sm={{ span: 24 }}
        md={{ span: 12 }}
        lg={{ span: 12 }}
        xl={{ span: 12 }}
        className={styles.pieceLeft}
      >
        <div className={styles.qName}>
          <p dangerouslySetInnerHTML={{ __html: textWrap(`${qNum}. ${Name}`) }} />
        </div>
        {QuestionType === QUESTION_TYPE.OneWay ? (
          <Radio.Group onChange={onChoice} value={userAnswer}>
            <Space direction="vertical" size={12}>
              {Options.map(({ Value, Label }) => (
                <Radio key={Value} value={Value}>
                  {Value}. {Label}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        ) : (
          <Checkbox.Group
            onChange={(checkedValue) => {
              setUserAnswer(checkedValue.join(''))
              onAnswerChange(checkedValue.join(''))
            }}
            value={(userAnswer || '').split('')}
          >
            <Space direction="vertical" size={12}>
              {Options.map(({ Value, Label }) => (
                <Checkbox key={Value} value={Value}>
                  {Value}. {Label}
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        )}
      </Col>
      <Col
        xs={{ span: 24 }}
        sm={{ span: 24 }}
        md={{ span: 12 }}
        lg={{ span: 12 }}
        xl={{ span: 12 }}
        className={styles.pieceRight}
      >
        <div className={styles.paragraphWrap}>
          <div className={styles.title}>{originalTitle}</div>
          <div className={styles.imgWrap}>{introducePic && <img src={introducePic} alt="" />}</div>
          {articleArr.map((text, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <p key={i} id={getPTagId(i)} className={styles.paragraph}>
              {(Paragraph || '').split(',').includes(String(i)) && (
                <span style={{ marginRight: 2 }}>
                  <CaretRightOutlined style={{ fontSize: 16 }} />
                </span>
              )}
              <span dangerouslySetInnerHTML={{ __html: textWrap(text) }} />
            </p>
          ))}
        </div>
      </Col>
    </Row>
  )
}

export default memo(ChoicePiece)
