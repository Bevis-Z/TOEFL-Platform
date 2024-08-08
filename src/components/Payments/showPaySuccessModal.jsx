import { Modal, Button } from 'antd'
import paySuccessImg from '@/assets/imgs/pay_success.png'
import styles from './showPaySuccessModal.less'

const showPaySuccessModal = () => {
  Modal.success({
    content: (
      <div className={styles.contentWrap}>
        <div className={styles.title}>VIP购买成功，已解锁全部真题！</div>
        <div className={styles.contentInner}>
          <img src={paySuccessImg} />
          <div>快去练习吧</div>
        </div>
        <Button
          type="primary"
          size="large"
          onClick={() => {
            // TODO 因为无法通过useModel('@@initialState')调用fetchUserInfo刷新用户信息，故用跳转方式
            // history.push('/practice')
            location.href = '/practice'
          }}
          className={styles.goPracticeBtn}
        >
          去练习
        </Button>
      </div>
    ),
    width: 540,
    className: styles.container,
    centered: true,
    title: null,
    icon: null,
    closable: false,
    keyboard: false,
    maskClosable: false,
  })
}

export default showPaySuccessModal
