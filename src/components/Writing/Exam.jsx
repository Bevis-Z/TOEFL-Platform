import { useState, useEffect, useImperativeHandle, useRef, memo, forwardRef } from 'react'
import { useDebounceFn, useDebounceEffect } from 'ahooks'
import { Space, Button, Input } from 'antd'
import { countWords, textWrap } from '@/utils'
import { WritingPracticeExam } from '@/services/practice'
import { getUserId } from '@/utils/user'
import styles from './Exam.less'

const Exam = ({ original, writeRecord, Tid, Qid, Timing }, ref) => {
  const [value, setValue] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [clipData, setClipData] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const textAreaRef = useRef(null)

  useDebounceEffect(
    () => {
      setWordCount(countWords(value))
    },
    [value],
    { wait: 200 },
  )

  useEffect(() => {
    setValue(writeRecord || '')
  }, [writeRecord])

  /**
   * 提交答案
   * @param {string} val 用户的写作答案
   * @param {string} Type Next:存为草稿 Submit:交卷
   */
  const postAnswer = async (val, Type) => {
    try {
      await WritingPracticeExam({
        WriteRecord: val,
        Type,
        Tid,
        Qid,
        UserId: getUserId(),
        Timing,
        WordCount: wordCount,
      })
    } catch (err) {
      console.log(err)
    }
  }

  useImperativeHandle(ref, () => ({
    submit: async (callback) => {
      setIsSubmitted(true)
      await postAnswer(value, 'Submit')
      callback && callback()
    },
  }))

  const saveDraft = (val) => {
    if (isSubmitted) return

    postAnswer(val, 'Next')
  }

  const { run: autoSave } = useDebounceFn(saveDraft, { wait: 3000 })

  const onInputChange = (e) => {
    const val = e.target.value
    setValue(val)
    autoSave(val)
  }

  /**
   * 获取文本域的选中位置
   * @returns {{ start: number end: number }}
   */
  const getCaretPosition = () => {
    const caretPos = {
      start: 0,
      end: 0,
    }
    const textArea = textAreaRef.current?.resizableTextArea?.textArea || {}

    if (textArea.selectionStart) {
      caretPos.start = textArea.selectionStart
    }
    if (textArea.selectionEnd) {
      caretPos.end = textArea.selectionEnd
    }

    return caretPos
  }

  const onCopy = () => {
    textAreaRef.current.focus()
    const { start, end } = getCaretPosition()
    const copiedStr = (value || '').substring(start, end)

    setClipData(copiedStr)
  }

  const { run: onCut } = useDebounceFn(
    () => {
      const textarea = textAreaRef.current.resizableTextArea.textArea
      const { start, end } = getCaretPosition()
      const before = value.substring(0, start)
      const after = value.substring(end)
      const cutedStr = value.substring(start, end)

      setClipData(cutedStr)
      setValue(before + after)
      setTimeout(() => {
        textAreaRef.current.focus()
        textarea.setSelectionRange(start, start)
      }, 200)
    },
    { wait: 200 },
  )

  const { run: onPaste } = useDebounceFn(
    () => {
      const textarea = textAreaRef.current.resizableTextArea.textArea
      const { start, end } = getCaretPosition()
      const before = value.substring(0, start)
      const after = value.substring(end)
      const final = start + clipData.length

      setValue(before + clipData + after)
      setTimeout(() => {
        textAreaRef.current.focus()
        textarea.setSelectionRange(final, final)
      }, 200)
    },
    { wait: 200 },
  )

  return (
    <div className={styles.examWrap}>
      <div className={styles.directions}>
        Directions: You have 20 minutes to plan and write your response. Your response will be
        judged on the basis of the quality of your writing and on how well your response presents
        the points in the lecture and their relationship to the reading passage. Typically, an
        effective response will be 150 to 225 words.
        <br />
        <br />
        Summarize the points made in the lecture, being sure to explain how they cast doubt on the
        specific points made in the reading passage.
      </div>
      <div className={styles.main}>
        <div className={styles.original}>
          <b className={styles.sectionTitle}>阅读原文：</b>
          <p className={styles.article} dangerouslySetInnerHTML={{ __html: textWrap(original) }} />
        </div>
        <div className={styles.answerArea}>
          <div className={styles.actions}>
            <Space wrap>
              <Button className={styles.operationBtn} onClick={onCopy}>
                Copy
              </Button>
              <Button className={styles.operationBtn} onClick={onCut}>
                Cut
              </Button>
              <Button className={styles.operationBtn} onClick={onPaste}>
                Paste
              </Button>
            </Space>
            <div className={styles.wordCountWrap}>Word Count: {wordCount}</div>
          </div>
          <Input.TextArea
            value={value}
            ref={textAreaRef}
            placeholder="input here..."
            className={styles.textArea}
            onChange={onInputChange}
          />
        </div>
      </div>
    </div>
  )
}

export default memo(forwardRef(Exam))
