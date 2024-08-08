import { Link } from 'umi'
import Logo from './Logo'
import classNames from 'classnames'
import styles from './LeftBrand.less'

const LeftBrand = ({ className = '', style = {}, ...restProps }) => {
  return (
    <Link
      className={classNames(styles.brandWrap, className)}
      to="/home"
      style={{ ...style }}
      {...restProps}
    >
      <Logo />
    </Link>
  )
}

export default LeftBrand
