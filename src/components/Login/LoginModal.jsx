import { useEffect, useState, useRef } from 'react'
import { LockOutlined, MobileOutlined, MailOutlined, GiftOutlined } from '@ant-design/icons'
import { Alert, message, Modal, Row, Col } from 'antd'
import { ProFormCaptcha, ProFormText, LoginForm } from '@ant-design/pro-form'
import { useModel } from 'umi'
import { userLogin, getPublicKey, postValidateCode } from '@/services/user'
import { setPublicKeyStr, setUserId, setToken, setPhoneNumber } from '@/utils/user'
import { encryption } from '@/utils'
import classNames from 'classnames'
import { ImLoop2 } from 'react-icons/im'
import { useToggle } from 'ahooks'
import showExperienceModal from './showExperienceModal'
import ReactGA from 'react-ga4'
import { sendConversionEvent, sendGaEvent } from '@/utils/ga4'
import styles from './LoginModal.less'

const LoginMessage = ({ status }) => {
  const msgMap = {
    413: '用户不存在',
    414: '验证码错误',
    415: '密码输入错误',
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

const LoginModal = () => {
  const { visible, toggle } = useModel('login')
  const { initialState, setInitialState } = useModel('@@initialState')
  const formRef = useRef(null)

  const [userLoginState, setUserLoginState] = useState(null)
  const [type, { toggle: toggleType, setLeft }] = useToggle('ValidateCode', 'Password')

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.()

    if (userInfo) {
      await setInitialState((s) => ({ ...s, userInfo }))
    }
  }

  useEffect(() => {
    if (!visible) return

    const fetchPublicKey = async () => {
      try {
        const {
          Code,
          Data: { Public = '' },
        } = await getPublicKey()
        if (Code !== 'Succeed') return

        setPublicKeyStr(Public)
      } catch (err) {
        console.log(err)
      }
    }

    fetchPublicKey()
  }, [visible])

  useEffect(() => {
    sendGaEvent({
      category: 'user',
      action: visible ? 'login_modal_show' : 'login_modal_close',
      label: visible ? '显示登录框' : '关闭登录框',
    })
  }, [visible])

  const handleSubmit = async (values) => {
    try {
      // 登录
      const postBody = {
        LoginType: type,
        PhoneNumber: encryption(values.PhoneNumber || ''),
        Password: encryption(values.Password || ''),
        ValidateCode: values.ValidateCode || '',
        ReferenceCode: values.ReferenceCode || '',
      }
      const { Code, Data = {}, status } = await userLogin(postBody)

      if (Code === 'Succeed') {
        message.success({
          content: 'Login Success！',
          style: {
            marginTop: 70,
          },
        })
        setUserLoginState(200)

        const { UserId, Token, FirstLogin } = Data
        setUserId(UserId)
        setToken(Token)
        setPhoneNumber(values.PhoneNumber)

        await fetchUserInfo()

        toggle()

        if (FirstLogin) {
          showExperienceModal()
        }

        ReactGA.set({
          userId: String(UserId),
        })

        if (FirstLogin) {
          sendConversionEvent()
          sendGaEvent({
            category: 'user',
            action: 'first_login',
            label: '首次登录成功',
          })
        } else {
          sendGaEvent({
            category: 'user',
            action: 'login',
            label: 'Login Sucess',
          })
        }

        return
      }

      setUserLoginState(status)
    } catch (error) {
      message.error('Login Failed')
    }
  }

  const onAfterClose = () => {
    formRef.current?.resetFields?.()
    setUserLoginState(null)
    setLeft()
  }

  return (
    <Modal
      visible={visible}
      footer={null}
      centered
      maskClosable={false}
      okText={"Login"}
      className={styles.modal}
      onCancel={toggle}
      afterClose={onAfterClose}
    >
      <Row style={{ width: '100%' }}>
        <Col
          xs={{ span: 24 }}
          sm={{ span: 24 }}
          md={{ span: 24 }}
          lg={{ span: 9 }}
          xl={{ span: 9 }}
        >
          <div className={styles.loginImgWrap}>
            <div className={styles.leftTexts}>
              <span>Prepare TOEFL</span> <span>with us</span>
              <br />
              <span style={{ fontSize: 14 }}>More Real Test</span>
            </div>
          </div>
        </Col>
        <Col
          xs={{ span: 24 }}
          sm={{ span: 24 }}
          md={{ span: 24 }}
          lg={{ span: 15 }}
          xl={{ span: 15 }}
        >
          <div className={styles.formWrap}>
            <LoginForm
              formRef={formRef}
              initialValues={{}}
              actions={[]}
              size="large"
              submitter={{
                submitButtonProps: { shape: 'round', block: true, className: styles.formButton },
                searchConfig: { submitText: 'Login', }
              }}
              onFinish={async (values) => {
                await handleSubmit(values)
              }}
            >
              <div className={styles.titles}>
                <div className={styles.title}>Login</div>
                <div className={styles.subtitle}>
                  New User Login to Get Free Experience
                </div>
              </div>

              <LoginMessage status={userLoginState} />
              <ProFormText
                name="PhoneNumber"
                fieldProps={{
                  prefix: (
                    <div className={styles.inputPrefixWrap}>
                      <MobileOutlined className={styles.icon} />
                    </div>
                  ),
                  className: styles.formInput,
                  allowClear: false,
                }}
                placeholder={'Phone'}
                rules={[
                  {
                    required: true,
                    message: 'Please input your phone number!',
                  },
                ]}
              />
              {type === 'ValidateCode' && (
                <ProFormCaptcha
                  name="ValidateCode"
                  // 手机号的 name，onGetCaptcha 会注入这个值
                  phoneName="PhoneNumber"
                  fieldProps={{
                    prefix: (
                      <div className={styles.inputPrefixWrap}>
                        <MailOutlined />
                      </div>
                    ),
                    className: classNames(styles.formInput, styles.captchaInput),
                    allowClear: false,
                  }}
                  captchaProps={{
                    className: styles.captchaButton,
                    type: 'text',
                  }}
                  rules={[
                    {
                      required: true,
                      message: 'Please input captcha!',
                    },
                  ]}
                  placeholder="Code"
                  // 如果需要失败可以 throw 一个错误出来，onGetCaptcha 会自动停止
                  // throw new Error("获取验证码错误")
                  countDown={60} // 设置倒计时60秒
                  captchaTextRender={(timing, count) => {
                    if (timing) {
                      return `${count} s`;
                    }
                    return 'Send Code';
                  }}                  

                  onGetCaptcha={async (phone) => {
                    const phoneReg = /^1[3-9]\d{9}$/
                    if (!phoneReg.test(phone)) {
                      formRef.current?.setFields?.([
                        { errors: ['Please Input correct phone number'], name: ['PhoneNumber'] },
                      ])
                      throw new Error('非法手机号')
                    }

                    try {
                      const { Code } = await postValidateCode({ PhoneNumber: encryption(phone) })
                      if (Code !== 'Succeed') return

                      message.success(`${phone} Verification code sent successfully`)
                    } catch (err) {
                      console.log(err)
                    }
                  }}
                />
              )}

              {type === 'Password' && (
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
                  placeholder={'Password'}
                  rules={[
                    {
                      required: true,
                      message: 'Please input your password!',
                    },
                  ]}
                />
              )}
              <ProFormText
                name="ReferenceCode"
                fieldProps={{
                  prefix: (
                    <div className={styles.inputPrefixWrap}>
                      <GiftOutlined className={styles.icon} />
                    </div>
                  ),
                  className: styles.formInput,
                  allowClear: false,
                }}
                placeholder={'Reference Code(Optional)'}
              />
              <div className={styles.typeChange}>
                <span style={{ cursor: 'pointer' }} onClick={toggleType}>
                  {type === 'ValidateCode' ? 'Password' : 'ValidateCode'}
                  <ImLoop2 style={{ position: 'relative', top: 2, marginLeft: 6 }} />
                </span>
              </div>
            </LoginForm>
          </div>
        </Col>
      </Row>
    </Modal>
  )
}

export default LoginModal
