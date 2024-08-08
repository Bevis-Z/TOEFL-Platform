import UserAvatar from '@/components/UserAvatar'
import ProForm, { ProFormText } from '@ant-design/pro-form'
import { UserOutlined } from '@ant-design/icons'
import { useModel } from 'umi'
import styles from './Profile.less'

const Profile = () => {
  const { initialState } = useModel('@@initialState')

  return (
    <div className={styles.profileWrap}>
      <div className={styles.title}>
        账户信息
        <div className={styles.subtitle}>您的账户信息</div>
      </div>
      <div className={styles.avatarSection}>
        <UserAvatar size={60} gap={4} className={styles.avatar} />
        <span className={styles.avatarDesc}>您的头像</span>
      </div>
      <div className={styles.formWrap}>
        <ProForm
          size="large"
          disabled
          initialValues={{ Username: initialState?.userInfo?.Username }}
          // submitter={{
          //   resetButtonProps: false,
          //   searchConfig: { submitText: '保存改动' },
          //   submitButtonProps: { shape: 'round', block: true, className: styles.formButton },
          // }}
          submitter={false}
          // onFinish={(values) => {}}
        >
          <ProFormText
            name="Username"
            disabled
            label="用户名"
            fieldProps={{
              prefix: (
                <div className={styles.inputPrefixWrap}>
                  <UserOutlined className={styles.icon} />
                </div>
              ),
              className: styles.formInput,
              allowClear: false,
            }}
            placeholder={'用户名'}
          />
        </ProForm>
      </div>
    </div>
  )
}

export default Profile
