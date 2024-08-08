import { useCallback } from 'react'
import { Space, Divider } from 'antd'
import { FiMoreHorizontal } from 'react-icons/fi'
import { NavLink, useModel } from 'umi'
import MENUS from '@/constants/menus'
import showWaitModal from '../showWaitModal'
import MediaQuery from 'react-responsive'
import HeaderDropdown from '../HeaderDropdown'
import classNames from 'classnames'
import { sendGaEvent } from '@/utils/ga4'
import { ReactComponent as CutPriceSvg } from '@/assets/imgs/tehui.svg'
import styles from './MiddleMenus.less'

const MiddleMenus = () => {
  const { initialState } = useModel('@@initialState')
  const { toggle } = useModel('login')
  const { userInfo } = initialState

  const onLinkClick = useCallback(
    (e, anyAccess, dev, name) => {
      sendGaEvent({
        category: 'click',
        action: 'menu_click',
        label: name,
      })

      if (dev) {
        e.preventDefault()
        return showWaitModal(name)
      }

      if (!userInfo && !anyAccess) {
        e.preventDefault()
        toggle()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userInfo],
  )

  // 媒体查询 外层隐藏的菜单将出现在这里
  const dropdownOverlay = (
    <div className={styles.overlayWrap}>
      {MENUS.map(({ name, to, anyAccess, dev, minWidth, showNew }, i) => (
        <MediaQuery key={to} maxWidth={minWidth - 1}>
          <>
            <Divider className={styles.splitor} />
            <NavLink
              to={to}
              className={styles.menuItem}
              activeClassName={styles.active}
              onClick={(e) => onLinkClick(e, anyAccess, dev, name)}
            >
              <div className={styles.menuItemName}>{name}</div>
              {showNew && <span className={styles.newTag}>NEW</span>}
              {to === '/pricing' && <CutPriceSvg className={styles.cutPrice} />}
            </NavLink>
          </>
        </MediaQuery>
      ))}
    </div>
  )

  return (
    <Space>
      {MENUS.map(({ name, to, anyAccess, dev, minWidth, showNew }) => (
        <MediaQuery key={to} minWidth={minWidth}>
          <NavLink
            to={to}
            className={styles.menuItem}
            activeClassName={styles.active}
            onClick={(e) => onLinkClick(e, anyAccess, dev, name)}
          >
            <div className={styles.menuItemName}>{name}</div>
            {showNew && <span className={styles.newTag}>NEW</span>}
            {to === '/pricing' && <CutPriceSvg className={styles.cutPrice} />}
          </NavLink>
        </MediaQuery>
      ))}
      {/* 屏幕宽度小于最后一个菜单 则显示更多···按钮 */}
      <MediaQuery maxWidth={MENUS[MENUS.length - 1].minWidth - 1}>
        <HeaderDropdown overlay={dropdownOverlay} placement="bottomRight" trigger={['click']}>
          <div className={classNames(styles.moreWrap)}>
            <FiMoreHorizontal className={styles.moreIcon} />
          </div>
        </HeaderDropdown>
      </MediaQuery>
    </Space>
  )
}

export default MiddleMenus
