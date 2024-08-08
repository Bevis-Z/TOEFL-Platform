import { Modal } from 'antd'
import openInPcImg from '@/assets/imgs/open_in_pc.png'
import { sendGaEvent } from '@/utils/ga4'
import styles from './index.less'

const showOpenInPcModal = () => {
  sendGaEvent({
    category: 'modal',
    action: 'open_in_pc_modal_show',
    label: '请在电脑端打开-显示',
  })

  Modal.info({
    title: <span className={styles.title}>为了您的最佳体验，请在电脑端操作~</span>,
    content: (
      <div className={styles.content}>
        <img src={openInPcImg} />
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
        action: 'open_in_pc_modal_close',
        label: '请在电脑端打开-关闭',
      })
    },
  })
}

export default showOpenInPcModal
