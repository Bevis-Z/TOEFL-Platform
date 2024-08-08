import logo from '@/assets/imgs/logos/logo.png'
import classNames from 'classnames'
import styles from './Logo.less'

const Logo = ({ style = {}, className = '', ...restProps }) => {
  return (
    <img
      src={logo}
      alt="TOEFL is Coming"
      className={classNames(styles.logo, className)}
      style={{ ...style }}
      {...restProps}
    />
  )
}

export default Logo
