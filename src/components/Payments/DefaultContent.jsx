// import { Button } from 'antd'
// import moment from 'moment'
// import { sendGaEvent } from '@/utils/ga4'
// import styles from './DefaultContent.less'
// import { DEFAULT_VIP_CARD } from '@/constants/payment'
// import classNames from 'classnames'

// const DefaultContent = ({ onPricingMore, onBuyNow }) => {
//   return (
//     <div className={styles.wrap}>
//       <div className={styles.title}>账户时长已到期</div>
//       <div className={styles.coupon}>
//         <div className={styles.couponLeft}>
//           <div className={styles.couponLeftTop}>
//             <div className={styles.couponName}>{DEFAULT_VIP_CARD.Name}限时优惠</div>
//             <div className={styles.couponAmount}>
//               <span className={styles.symbol}>￥</span>
//               {DEFAULT_VIP_CARD.Amount}
//             </div>
//           </div>
//           <div className={styles.tips}>购买即可解锁我们所有的真题，真题持续更新</div>
//         </div>
//         <div className={styles.couponRight}>
//           <span className={styles.rest}>优惠截止至</span>
//           <br />
//           {moment().add(1, 'day').format('YYYY-MM-DD')}
//         </div>
//       </div>
//       <Button type="text" onClick={onPricingMore} className={styles.moreButton}>
//         查看更多价格方案 &gt;
//       </Button>
//       <div>将于2023年9月15日停止服务，已关闭支付功能</div>
//       <Button
//         type="primary"
//         size="large"
//         disabled
//         onClick={onBuyNow}
//         className={classNames(styles.buyNowButton, 'custom-disabled-button')}
//       >
//         立即购买
//       </Button>
//     </div>
//   )
// }

// export default DefaultContent
import { Button } from 'antd'
import moment from 'moment'
import { sendGaEvent } from '@/utils/ga4'
import styles from './DefaultContent.less'
import { DEFAULT_VIP_CARD } from '@/constants/payment'

const DefaultContent = ({ onPricingMore, onBuyNow }) => {
  return (
    <div className={styles.wrap}>
      <div className={styles.title}>账户时长已到期</div>
      <div className={styles.coupon}>
        <div className={styles.couponLeft}>
          <div className={styles.couponLeftTop}>
            <div className={styles.couponName}>{DEFAULT_VIP_CARD.Name}限时优惠</div>
            <div className={styles.couponAmount}>
              <span className={styles.symbol}>￥</span>
              {DEFAULT_VIP_CARD.Amount}
            </div>
          </div>
          <div className={styles.tips}>购买即可解锁我们所有的真题，真题持续更新</div>
        </div>
        <div className={styles.couponRight}>
          <span className={styles.rest}>优惠截止至</span>
          <br />
          {moment().add(1, 'day').format('YYYY-MM-DD')}
        </div>
      </div>
      <Button type="text" onClick={onPricingMore} className={styles.moreButton}>
        查看更多价格方案 &gt;
      </Button>
      <Button type="primary" size="large" onClick={onBuyNow} className={styles.buyNowButton}>
        立即购买
      </Button>
    </div>
  )
}

export default DefaultContent