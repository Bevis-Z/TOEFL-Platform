import { useState, useEffect, useCallback } from 'react'
import { Button, Modal, Row, Col } from 'antd'
import vipCardsData from '@/constants/vipCardsData'

import Payment from '@/components/Payments/Payment'
import showPaySuccessModal from '@/components/Payments/showPaySuccessModal'
import { useModel } from 'umi'
import { textWrap } from '@/utils'
import Header from '@/components/Header'
import classNames from 'classnames'
import shopIcon from '@/assets/imgs/pricing_shop_icon.png'
import { sendGaEvent } from '@/utils/ga4'
import styles from './index.less'

const Pricing = () => {
  const { initialState } = useModel('@@initialState')
  const { toggle } = useModel('login')
  const [vipCards, setVipCards] = useState([])


  useEffect(() => {
    const Cards = vipCardsData
    setVipCards(Cards)
  }, [])

  const onBuy = useCallback(
    (Amount, Description, Name, Vid) => {
      if (!initialState?.userInfo) {
        return toggle()
      }

      const modal = Modal.info({
        content: (
          <Payment
            amount={Amount}
            Vid={Vid}
            Name={Name}
            Description={Description}
            onPaySuccess={() => {
              modal.destroy()
              showPaySuccessModal()
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
            category: 'click',
            action: 'buy_modal_close',
            label: `取消了${Name}`,
          })
        },
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [initialState?.userInfo],
  )

  return (
    <div className={styles.pricingWrap}>
      <Header />
      <div className={styles.starsWrap} />
      <div className={styles.content}>
        <div className={styles.title}>Our Plan</div>
        <div className={styles.subtitle}>
          Sign in to view the details of the plan
        </div>
        <Row gutter={[24, 100]} style={{ width: '100%' }}>
          {vipCards.map(({ Amount, Description, Name, Vid }, i) => (
            <Col key={Vid} xs={24} sm={24} md={12} lg={6} xl={6}>
              <div className={classNames(styles.pricingCard, styles[`card${i + 1}`])}>
                <div className={styles.backend} />
                <div className={styles.frontend}>
                  <div className={styles.name}>{Name}</div>
                  <div className={styles.amount}>
                    <span className={styles.symbol}>￥</span> {Amount}
                  </div>
                  <div
                    className={styles.desc}
                    dangerouslySetInnerHTML={{ __html: textWrap(Description) }}
                  />
                  <Button
                    className={styles.buyButton}
                    type="primary"
                    size="large"
                    onClick={() => {
                      sendGaEvent({
                        category: 'click',
                        action: 'buy_modal_show',
                        label: `点击了${Name}`,
                      })

                      onBuy(Amount, Description, Name, Vid)
                    }}
                  >
                    <img src={shopIcon} className={styles.shopIcon} />
                    Subscribe
                  </Button>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  )
}

export default Pricing