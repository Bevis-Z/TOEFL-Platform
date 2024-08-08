import { useState, useEffect, useMemo, memo } from 'react'
import { Row, Col } from 'antd'
import { CaretRightOutlined } from '@ant-design/icons'
import { isElementInViewport, textWrap } from '@/utils'
import styles from './InsertPiece.less'

const InsertPiece = ({
  Question,
  Complete,
  original,
  originalTitle,
  introducePic,
  qNum,
  onAnswerChange,
}) => {
  // Paragraph 是题目对应的段落索引 string
  const { Name, Options, Qid, Paragraph } = Question
  const [userAnswer, setUserAnswer] = useState('')

  const insertText = useMemo(() => {
    return (Options[0] || '').replace(/(<b>|<\/b>)/g, '')
  }, [Options])

  const articleArr = useMemo(() => {
    return [...original].map((text) => {
      let str = text
        .replace('【A】', '<span class="option-area" data-answer="A">[■]</span>')
        .replace('【B】', '<span class="option-area" data-answer="B">[■]</span>')
        .replace('【C】', '<span class="option-area" data-answer="C">[■]</span>')
        .replace('【D】', '<span class="option-area" data-answer="D">[■]</span>')

      return str
    })
  }, [original])

  useEffect(() => {
    setUserAnswer(Complete.Options)
  }, [Complete])

  /**
   * 实现两个逻辑：
   * 1.刷新或者back的时候显示已选答案
   * 2.点击插入作答(若存在已选答案，则先还原已选答案)
   */
  useEffect(() => {
    // 没有答案 不作任何处理
    if (!userAnswer) return
    // 有答案 则用定时器循环尝试获取 用户答案对应的目标元素 (主要是为了兼容页面刷新和back)
    const timeId = setInterval(() => {
      const insertTarget = document.querySelector(`.option-area[data-answer="${userAnswer}"]`)
      if (!insertTarget) return

      // 获取到目标元素则停止定时器
      clearInterval(timeId)
      // 若存在已选答案，则先还原已选答案
      const selectedArea = document.querySelector(`.selected-area[data-answer]`)
      if (selectedArea) {
        const selectedAnswer = selectedArea.dataset.answer
        const insertArea = document.createElement('span')
        const content = document.createTextNode('[■]')
        insertArea.appendChild(content)
        insertArea.className = 'option-area'
        insertArea.dataset.answer = selectedAnswer
        selectedArea.parentNode.replaceChild(insertArea, selectedArea)
      }
      // 将占位符 替换为答案句子文本
      const answerArea = document.createElement('span')
      const answerContent = document.createTextNode(insertText)
      answerArea.appendChild(answerContent)
      answerArea.className = 'selected-area'
      answerArea.dataset.answer = userAnswer
      insertTarget.parentNode.replaceChild(answerArea, insertTarget)
    }, 100)
  }, [userAnswer, insertText])

  const onClickInsert = (e) => {
    if (!(e.target.className === 'option-area' && e.target.nodeName === 'SPAN')) return

    const answer = e.target.dataset.answer
    setUserAnswer(answer)
    onAnswerChange(answer)
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
          {qNum}. Look at the four squares[■]that indicate where the following sentence could be
          added to the passage. Where would the sentence best fit? Click on a square[■]to add the
          sentence to the passage.
        </div>
        <div className={styles.insertAnswer}>{insertText}</div>
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
            <div key={i} id={getPTagId(i)} className={styles.paragraph} onClick={onClickInsert}>
              {(Paragraph || '').split(',').includes(String(i)) && (
                <span style={{ marginRight: 2 }}>
                  <CaretRightOutlined style={{ fontSize: 16 }} />
                </span>
              )}
              <span dangerouslySetInnerHTML={{ __html: textWrap(text) }} />
            </div>
          ))}
        </div>
      </Col>
    </Row>
  )
}

export default memo(InsertPiece)
