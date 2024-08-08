import Header from '@/components/Header'
import { Divider } from 'antd'
import { FaUser, FaLock } from 'react-icons/fa'
import useUrlState from '@ahooksjs/use-url-state'
import classNames from 'classnames'
import { ModifyPassword, Profile } from './components'
import { useMediaQuery } from 'react-responsive'
import styles from './index.less'

const Settings = () => {
  // 是否小屏
  const isMaxWidth550 = useMediaQuery({ maxWidth: 550 })
  // profile | password
  const [state, setState] = useUrlState({ key: 'profile' })

  return (
    <div className={styles.settingsWrap}>
      <Header />
      <div className={styles.starsWrap} />
      <div className={styles.settingsLayout}>
        <div className={styles.settingsCard}>
          <div className={styles.setTabs}>
            <div
              className={classNames(styles.setTabsItem, state.key === 'profile' && styles.active)}
              onClick={() => setState({ key: 'profile' })}
            >
              <FaUser className={styles.icon} />
              账户信息
            </div>
            {isMaxWidth550 ? (
              <Divider
                type="vertical"
                style={{ borderLeftColor: 'rgba(255, 255, 255, 0.2)', height: 'auto' }}
              />
            ) : (
              <Divider
                type="horizontal"
                style={{ borderTopColor: 'rgba(255, 255, 255, 0.2)', margin: '6px 0' }}
              />
            )}
            <div
              className={classNames(styles.setTabsItem, state.key === 'password' && styles.active)}
              onClick={() => setState({ key: 'password' })}
            >
              <FaLock className={styles.icon} />
              设置密码
            </div>
          </div>
          {isMaxWidth550 && (
            <Divider
              style={{
                borderTopColor: 'rgba(255, 255, 255, 0.2)',
                margin: '1px auto',
                width: 'calc(100% - 48px)',
                minWidth: 10,
              }}
            />
          )}
          <div className={styles.setContent}>
            {state.key === 'profile' && <Profile />}
            {state.key === 'password' && <ModifyPassword />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
