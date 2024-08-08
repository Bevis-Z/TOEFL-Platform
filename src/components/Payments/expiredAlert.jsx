import { Modal } from 'antd'
import { history } from 'umi'
import DefaultContent from './DefaultContent'
import Payment from './Payment'
import showPaySuccessModal from './showPaySuccessModal'
import { sendGaEvent } from '@/utils/ga4'
import { DEFAULT_VIP_CARD } from '@/constants/payment'
import styles from './expiredAlert.less'

function expiredAlert() {
  sendGaEvent({
    category: 'modal',
    action: 'expired_modal_show',
    label: '时长到期弹框-显示',
  })

  const modal = Modal.info({
    content: (
      <DefaultContent
        onPricingMore={() => {
          sendGaEvent({
            category: 'click',
            action: 'more_pricing_click',
            label: '查看更多价格方案',
          })

          modal.destroy()
          history.push('/pricing')
        }}
        onBuyNow={() => {
          sendGaEvent({
            category: 'click',
            action: 'buy_now_click',
            label: '立即购买',
          })

          modal.update({
            content: (
              <Payment
                amount={DEFAULT_VIP_CARD.Amount}
                Vid={DEFAULT_VIP_CARD.Vid}
                Name={DEFAULT_VIP_CARD.Name}
                Description={DEFAULT_VIP_CARD.Description}
                onPaySuccess={() => {
                  modal.destroy()
                  showPaySuccessModal()
                }}
              />
            ),
          })
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
    onCancel: () => {
      sendGaEvent({
        category: 'modal',
        action: 'expired_modal_close',
        label: '时长到期弹框-取消',
      })
    },
  })
}

export default expiredAlert
