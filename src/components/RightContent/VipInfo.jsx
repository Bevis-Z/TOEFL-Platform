import { useMemo } from 'react'
import { useModel, history } from 'umi'
import { isExpired } from '@/utils'
import moment from 'moment'
import classNames from 'classnames'
import { sendGaEvent } from '@/utils/ga4'
import styles from './VipInfo.less'

const VipInfo = () => {
  const { initialState } = useModel('@@initialState')

  const memoExpired = useMemo(() => {
    return isExpired(initialState?.userInfo?.Expiration)
  }, [initialState])

  const memoLastDate = useMemo(() => {
    if (!initialState?.userInfo?.Expiration) return ''
    const expiration = initialState?.userInfo?.Expiration * 1000

    return moment(expiration).add(2, 'seconds').format('YYYY-MM-DD')
  }, [initialState])

  const lastDate = (
    <div className={styles.textWrap}>
      VIP于<span className={styles.time}>{memoLastDate}</span>到期
    </div>
  )

  const expiredText = (
    <div
      className={classNames(styles.textWrap, styles.link)}
      onClick={() => {
        history.push('/pricing')

        sendGaEvent({
          category: 'click',
          action: 'header_expired_click',
          label: '点击头部的【VIP已到期】',
        })
      }}
    >
      VIP已到期
    </div>
  )

  return !!initialState?.userInfo && (memoExpired ? expiredText : lastDate)
}

export default VipInfo
