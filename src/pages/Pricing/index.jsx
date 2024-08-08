// import { useState, useEffect, useCallback } from 'react'
// import { Button, Modal, Row, Col } from 'antd'
// import { getVipCards } from '@/services/payment'
// import Payment from '@/components/Payments/Payment'
// import showPaySuccessModal from '@/components/Payments/showPaySuccessModal'
// import { useModel } from 'umi'
// import { textWrap } from '@/utils'
// import Header from '@/components/Header'
// import classNames from 'classnames'
// import shopIcon from '@/assets/imgs/pricing_shop_icon.png'
// import { sendGaEvent } from '@/utils/ga4'
// import styles from './index.less'

// const Pricing = () => {
//   const { initialState } = useModel('@@initialState')
//   const { toggle } = useModel('login')
//   const [vipCards, setVipCards] = useState([])

//   useEffect(() => {
//     const fetchVipCards = async () => {
//       try {
//         const { Code, Data } = await getVipCards()
//         if (Code !== 'Succeed') return

//         const { Cards } = Data
//         setVipCards(Cards)
//       } catch (err) {
//         console.log(err)
//       }
//     }

//     fetchVipCards()
//   }, [])

//   const onBuy = useCallback(
//     (Amount, Description, Name, Vid) => {
//       if (!initialState?.userInfo) {
//         return toggle()
//       }

//       const modal = Modal.info({
//         content: (
//           <Payment
//             amount={Amount}
//             Vid={Vid}
//             Name={Name}
//             Description={Description}
//             onPaySuccess={() => {
//               modal.destroy()
//               showPaySuccessModal()
//             }}
//           />
//         ),
//         width: 600,
//         className: styles.container,
//         centered: true,
//         title: null,
//         icon: null,
//         closable: true,
//         keyboard: false,
//         maskClosable: false,
//         onCancel: () => {
//           sendGaEvent({
//             category: 'click',
//             action: 'buy_modal_close',
//             label: `取消了${Name}`,
//           })
//         },
//       })
//     },
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     [initialState?.userInfo],
//   )

//   return (
//     <div className={styles.pricingWrap}>
//       <Header />
//       <div className={styles.starsWrap} />
//       <div className={styles.content}>
//         <div className={styles.title}>价格方案</div>
//         <div className={styles.subtitle}>
//           <div style={{ textDecoration: 'line-through' }}>
//             购买后即可解锁我们所有的真题，并获得优先服务
//             <br />
//             可结合自身情况合理选择价格方案
//           </div>
//           <div style={{ marginTop: 10, color: '#ff1b1b', fontSize: 16 }}>
//             将于2023年9月15日停止服务，已关闭支付功能
//           </div>
//         </div>
//         <Row gutter={[24, 100]} style={{ width: '100%' }}>
//           {vipCards.map(({ Amount, Description, Name, Vid }, i) => (
//             <Col key={Vid} xs={24} sm={24} md={12} lg={6} xl={6}>
//               <div className={classNames(styles.pricingCard, styles[`card${i + 1}`])}>
//                 <div className={styles.backend} />
//                 <div className={styles.frontend}>
//                   <div className={styles.name}>{Name}</div>
//                   <div className={styles.amount}>
//                     <span className={styles.symbol}>￥</span> {Amount}
//                   </div>
//                   <div
//                     className={styles.desc}
//                     dangerouslySetInnerHTML={{ __html: textWrap(Description) }}
//                   />
//                   <Button
//                     className={classNames(styles.buyButton, 'custom-disabled-button')}
//                     type="primary"
//                     size="large"
//                     disabled
//                     onClick={() => {
//                       sendGaEvent({
//                         category: 'click',
//                         action: 'buy_modal_show',
//                         label: `点击了${Name}`,
//                       })

//                       onBuy(Amount, Description, Name, Vid)
//                     }}
//                   >
//                     <img src={shopIcon} className={styles.shopIcon} />
//                     立即购买
//                   </Button>
//                 </div>
//               </div>
//             </Col>
//           ))}
//         </Row>
//       </div>
//     </div>
//   )
// }

// export default Pricing
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
        <div className={styles.title}>价格方案</div>
        <div className={styles.subtitle}>
          购买后即可解锁我们所有的真题，并获得优先服务
          <br />
          可结合自身情况合理选择价格方案
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
                    立即购买
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