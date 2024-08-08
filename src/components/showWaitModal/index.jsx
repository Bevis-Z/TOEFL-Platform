import { Modal } from 'antd'
import waitImg from '@/assets/imgs/please_wait.png'
import styles from './index.less'
import { sendGaEvent } from '@/utils/ga4'

const showWaitModal = (subject) => {
  sendGaEvent({
    category: 'modal',
    action: 'please_wait_modal_show',
    label: `${subject}-显示`,
  })

  Modal.info({
    title: <span className={styles.title}>{subject} Service maintenance</span>,
    content: (
      <div className={styles.content}>
        <img src={waitImg} />
      </div>
    ),
    icon: null,
    closable: true,
    okButtonProps: {
      className: styles.okButton,
    },
    wrapClassName: styles.modalWrap,
    centered: true,
    maskClosable: true,
    onCancel: () => {
      sendGaEvent({
        category: 'modal',
        action: 'please_wait_modal_close',
        label: `${subject}-关闭`,
      })
    },
  })
}

export default showWaitModal
