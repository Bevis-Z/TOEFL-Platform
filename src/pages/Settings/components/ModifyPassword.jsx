import { LockOutlined, MobileOutlined } from '@ant-design/icons'
import { Alert, message } from 'antd'
import { useState, useRef } from 'react'
import { ProFormText, LoginForm } from '@ant-design/pro-form'
import { setPassword } from '@/services/user'
import { encryption } from '@/utils'
import { getPhoneNumber, getUserId } from '@/utils/user'
import { useModel } from 'umi'
import styles from './ModifyPassword.less'

const ErrorMessage = ({ status }) => {
  const msgMap = {
    421: '两次密码不一致',
  }
  const msg = msgMap[status]

  return (
    <>
      {msg && (
        <Alert
          style={{
            marginBottom: 24,
          }}
          message={msg}
          type="error"
          showIcon
        />
      )}
    </>
  )
}

const ModifyPassword = () => {
  const { initialState, setInitialState } = useModel('@@initialState')
  const [passwordState, setPasswordState] = useState(null)
  const formRef = useRef(null)

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.()

    if (userInfo) {
      await setInitialState((s) => ({ ...s, userInfo }))
    }
  }

  const handleSubmit = async (values) => {
    try {
      const postBody = {
        PhoneNumber: encryption(values.PhoneNumber),
        Password: encryption(values.Password),
        ConfirmPassword: encryption(values.ConfirmPassword),
        UserId: getUserId(),
      }
      const { Code, status } = await setPassword(postBody)

      if (Code === 'Succeed') {
        message.success('设置密码成功！')
        setPasswordState(200)
        formRef.current?.resetFields?.()

        await fetchUserInfo()

        return
      }

      setPasswordState(status)
    } catch (error) {
      message.error('设置密码失败，请重试！')
    }
  }

  return (
    <div className={styles.formWrap}>
      <div className={styles.title}>
        设置密码
        <div className={styles.subtitle}>管理您的登录密码</div>
      </div>
      <LoginForm
        size="large"
        formRef={formRef}
        initialValues={{ PhoneNumber: getPhoneNumber() }}
        submitter={{
          searchConfig: { submitText: '保存密码' },
          submitButtonProps: { shape: 'round', block: true, className: styles.formButton },
        }}
        onFinish={async (values) => {
          await handleSubmit(values)
        }}
      >
        <ErrorMessage status={passwordState} />
        <ProFormText
          name="PhoneNumber"
          disabled
          fieldProps={{
            prefix: (
              <div className={styles.inputPrefixWrap}>
                <MobileOutlined className={styles.icon} />
              </div>
            ),
            className: styles.formInput,
            allowClear: false,
          }}
          placeholder={'手机号'}
        />

        <ProFormText.Password
          fieldProps={{
            prefix: (
              <div className={styles.inputPrefixWrap}>
                <LockOutlined className={styles.icon} />
              </div>
            ),
            className: styles.formInput,
            allowClear: false,
          }}
          name="Password"
          hasFeedback
          placeholder={'新密码'}
          rules={[
            {
              required: true,
              message: '请填写新密码',
            },
            {
              min: 6,
              max: 16,
              message: '密码长度应为 6 ~ 16',
            },
          ]}
        />
        <ProFormText.Password
          fieldProps={{
            prefix: (
              <div className={styles.inputPrefixWrap}>
                <LockOutlined className={styles.icon} />
              </div>
            ),
            className: styles.formInput,
            allowClear: false,
          }}
          name="ConfirmPassword"
          dependencies={['Password']}
          hasFeedback
          placeholder={'确认密码'}
          rules={[
            {
              required: true,
              message: '请再次输入密码',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('Password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('您输入的两个密码不匹配！'))
              },
            }),
          ]}
        />
      </LoginForm>
    </div>
  )
}

export default ModifyPassword
