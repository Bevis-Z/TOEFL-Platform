import { Space, Divider } from 'antd'
import beianIcon from '@/assets/imgs/beian_icon.png'
import styles from './index.less'

const Footer = () => {
  const defaultMessage = 'Bowen'
  const currentYear = new Date().getFullYear()
  const copyright = `©${currentYear} ${defaultMessage}`

  return (
    <div className={styles.footerWrap}>
      <Space
        wrap
        split={
          <Divider
            type="vertical"
            style={{ borderLeftColor: 'rgba(255, 255, 255, 0.5)', margin: 0 }}
          />
        }
      >
        <span>{copyright}</span>
        <a href="https://tsm.miit.gov.cn/dxxzsp/" target="_blank" rel="noreferrer">
          京 ICP 证 B2-20222686号
        </a>
        <a href="https://beian.miit.gov.cn" target="_blank" rel="noreferrer">
          京 ICP 备 2022010633号
        </a>
        <a
          href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=11010602104239"
          target="_blank"
          rel="noreferrer"
        >
          <img src={beianIcon} className={styles.beianIcon} />
          <span>京公网安备 11010602104239号</span>
        </a>
      </Space>
    </div>
  )
}

export default Footer
