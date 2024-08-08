import { Avatar } from 'antd'
import classNames from 'classnames'
import { useModel } from 'umi'
import styles from './index.less'

const UserAvatar = ({ className = '', ...restProps }) => {
  const { initialState } = useModel('@@initialState')

  return (
    <Avatar className={classNames(styles.avatar, className)} {...restProps}>
      {initialState?.userInfo?.Username?.charAt?.(0)}
    </Avatar>
  )
}

export default UserAvatar
