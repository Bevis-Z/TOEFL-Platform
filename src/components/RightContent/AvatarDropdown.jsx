import { useState, useRef } from 'react'
import {
  LogoutOutlined,
  SettingOutlined,
  LockOutlined,
  MessageOutlined,
  CaretDownOutlined,
} from '@ant-design/icons'
import { Menu, Button, Badge } from 'antd'
import { history, useModel } from 'umi'
import HeaderDropdown from '../HeaderDropdown'
import { toHomePage } from '@/utils'
import { userLogout } from '@/services/user'
import { getUserId, removePhoneNumber, removeToken, removeUserId } from '@/utils/user'
import UserAvatar from '../UserAvatar'
import showFeedbackModal from './showFeedbackModal'
import { useClickAway } from 'ahooks'
import VipInfo from './VipInfo'
import MediaQuery from 'react-responsive'
import { sendGaEvent } from '@/utils/ga4'
import styles from './index.less'

const AvatarDropdown = () => {
  const dropdownChildRef = useRef(null)
  const overlayRef = useRef(null)

  const { initialState, setInitialState } = useModel('@@initialState')
  const { toggle } = useModel('login')
  const [overlayVisible, setOverlayVisible] = useState(false)

  useClickAway(() => {
    setOverlayVisible(false)
  }, [dropdownChildRef, overlayRef])

  const unLoggedIn = (
    <span className={`${styles.action} ${styles.account}`}>
      <Button
        type="primary"
        size="large"
        shape="round"
        className={styles.loginButton}
        onClick={() => {
          toggle()
        }}
      >
        Sign In
      </Button>
    </span>
  )

  if (!initialState) {
    return unLoggedIn
  }

  const { userInfo } = initialState

  if (!userInfo || !userInfo.Username) {
    return unLoggedIn
  }

  const dropdownOverlay = (
    <div className={styles.overlayWrap} ref={overlayRef}>
      <MediaQuery maxWidth={768}>
        <div className={styles.infoWrap}>{userInfo.Username}</div>
      </MediaQuery>
      <MediaQuery maxWidth={899}>
        <div className={styles.infoWrap}>
          <VipInfo />
        </div>
      </MediaQuery>
      <Menu
        className={styles.menu}
        onClick={({ key }) => {
          sendGaEvent({
            category: 'click',
            action: `avatar_menu_click_${key}`,
            label: key,
          })

          setOverlayVisible(false)
        }}
        items={[
          {
            key: 'settings',
            icon: <SettingOutlined style={{ fontSize: 16 }} />,
            label: '设置',
            onClick: () => {
              history.push('/settings')
            },
          },
          {
            key: 'set-password',
            icon: <LockOutlined style={{ fontSize: 16 }} />,
            label: (
              <Badge dot={!userInfo.HasPassword}>
                <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {userInfo.HasPassword ? '修改密码' : '设置密码'}
                </span>
              </Badge>
            ),
            onClick: () => {
              history.push({
                pathname: '/settings',
                query: {
                  key: 'password',
                },
              })
            },
          },
          {
            key: 'feedback',
            icon: <MessageOutlined style={{ fontSize: 16 }} />,
            label: '留言反馈',
            onClick: () => {
              showFeedbackModal()
            },
          },
          {
            type: 'divider',
            style: {
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
            },
          },
          {
            key: 'logout',
            icon: <LogoutOutlined style={{ fontSize: 16 }} />,
            label: '退出登录',
            onClick: () => {
              userLogout({ UserId: getUserId() })
                .catch((err) => console.log(err))
                .finally(() => {
                  removeToken()
                  removeUserId()
                  removePhoneNumber()

                  setInitialState((s) => ({
                    ...s,
                    userInfo: undefined,
                  }))

                  toHomePage()
                })
            },
          },
        ]}
        selectedKeys={[]}
      />
    </div>
  )
  return (
    <HeaderDropdown visible={overlayVisible} overlay={dropdownOverlay} placement="bottomRight">
      <div
        ref={dropdownChildRef}
        className={`${styles.action} ${styles.account}`}
        onClick={() => {
          setOverlayVisible((v) => !v)
        }}
      >
        <Badge dot={!userInfo.HasPassword} offset={[-4, 4]}>
          <UserAvatar size={32} gap={4} className={styles.avatar} />
        </Badge>
        <span className={styles.name}>{userInfo.Username}</span>
        <CaretDownOutlined className={styles.downIcon} />
      </div>
    </HeaderDropdown>
  )
}

export default AvatarDropdown
