import { Space, Divider } from 'antd'
import beianIcon from '@/assets/imgs/beian_icon.png'
import styles from './index.less'

const Footer = () => {
  const defaultMessage = 'Bowen Zhao'
  const currentYear = new Date().getFullYear()
  const copyright = `Copyright © ${currentYear} ${defaultMessage}`

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
        <a
          href="https://www.bowen.world"
          target="_blank"
          rel="noreferrer"
        >
          <span>View Bowen's Portfolio</span>
        </a>
      </Space>
    </div>
  )
}

export default Footer
