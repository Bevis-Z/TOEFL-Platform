import { useState, useCallback } from 'react'
import { Modal, Input, Button, message } from 'antd'
import { MessageOutlined } from '@ant-design/icons'
import { postFeedback } from '@/services/user'
import { getUserId } from '@/utils/user'
import platform from 'platform'
import styles from './showFeedbackModal.less'

const FeedbackContent = ({ onSubmitted }) => {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)

  const onChange = useCallback((e) => {
    setValue(e.target.value)
  }, [])

  const onSubmit = useCallback(async () => {
    const trimedStr = value.trim()
    if (!trimedStr) return

    try {
      setLoading(true)
      const body = {
        UserId: getUserId(),
        Content: trimedStr,
        Browser: platform.name,
        System: platform.os.family,
        ScreenSize: `${window.innerWidth} * ${window.innerHeight}`,
      }
      const { Code } = await postFeedback(body)
      setLoading(false)
      if (Code !== 'Succeed') return

      onSubmitted()
      message.success('提交成功，感谢您的反馈！')
      setValue('')
    } catch (err) {
      setLoading(false)
      console.log(err)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <div className={styles.wrap}>
      <div className={styles.titleWrap}>
        <MessageOutlined className={styles.icon} />
        <span>留言反馈</span>
      </div>
      <div className={styles.textAreaWrap}>
        <Input.TextArea
          className={styles.textArea}
          value={value}
          placeholder="欢迎留下任何反馈~"
          maxLength={300}
          showCount
          onChange={onChange}
        />
      </div>
      <div className={styles.submitWrap}>
        <Button
          type="primary"
          size="large"
          loading={loading}
          onClick={onSubmit}
          className={styles.submitButton}
        >
          提交
        </Button>
      </div>
    </div>
  )
}

const showFeedbackModal = () => {
  const modal = Modal.info({
    content: (
      <FeedbackContent
        onSubmitted={() => {
          modal.destroy()
        }}
      />
    ),
    width: 600,
    className: styles.container,
    centered: true,
    title: null,
    icon: null,
    closable: true,
    keyboard: false,
    maskClosable: false,
  })
}

export default showFeedbackModal
