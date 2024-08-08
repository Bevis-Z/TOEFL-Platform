import { useState, useEffect } from 'react'
import LeftBrand from './LeftBrand'
import MiddleMenus from './MiddleMenus'
import RightContent from '@/components/RightContent'
import classNames from 'classnames'
import styles from './index.less'

const Header = () => {
  const [isLeaveTop, setIsLeaveTop] = useState(false)

  useEffect(() => {
    const onWindowScroll = () => {
      setIsLeaveTop(window.scrollY >= 80)
    }

    window.addEventListener('scroll', onWindowScroll)

    return () => window.removeEventListener('scroll', onWindowScroll)
  }, [])

  return (
    <div className={classNames(styles.headerWrap, isLeaveTop && styles.leaveTop)}>
      <div className={styles.headerContent}>
        <LeftBrand style={{ padding: 0 }} />
        <div className={styles.menuWrap}>
          <MiddleMenus />
        </div>
        <RightContent />
      </div>
    </div>
  )
}

export default Header
