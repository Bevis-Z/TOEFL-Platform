import { Modal } from 'antd'
import paySuccessImg from '@/assets/imgs/pay_success.png'
import styles from './showExperienceModal.less'

const showExperienceModal = () => {
  Modal.info({
    title: <span className={styles.title}>【新用户专享】3天VIP体验卡已到账！</span>,
    content: (
      <div className={styles.content}>
        <img src={paySuccessImg} />
      </div>
    ),
    icon: null,
    closable: true,
    okButtonProps: {
      className: styles.okButton,
    },
    centered: true,
    maskClosable: true,
  })
}

export default showExperienceModal
