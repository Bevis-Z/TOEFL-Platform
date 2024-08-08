import defaultSettings from '../config/defaultSettings'
import { removeToken, removeUserId, getToken, getUserId, removePhoneNumber } from './utils/user'
import expiredAlert from './components/Payments/expiredAlert'
import { history } from 'umi'
import { getUserInfo } from './services/user'
import { notification } from 'antd'

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState() {
  const fetchUserInfo = async () => {
    try {
      const UserId = getUserId()
      if (!UserId || !getToken()) return undefined
      const { Code, Data } = await getUserInfo({ UserId })
      if (Code !== 'Succeed') return undefined

      return Data
    } catch (err) {
      console.log(err)
      return undefined
    }
  }

  // 在任何页面都首先尝试获取userInfo，未登录则获取失败，遂没有userInfo对象
  const userInfo = await fetchUserInfo()

  if (userInfo) {
    return {
      fetchUserInfo,
      settings: defaultSettings,
      userInfo,
    }
  }

  return {
    fetchUserInfo,
    settings: defaultSettings,
  }
}

let flagCount = 0
export const request = {
  errorConfig: {},
  middlewares: [],
  requestInterceptors: [
    (url, options) => {
      const token = getToken()

      // eslint-disable-next-line no-param-reassign
      if (token) options.headers.Authorization = `JWT ${token}`

      return {
        url,
        options,
      }
    },
  ],
  responseInterceptors: [],
  errorHandler: (error) => {
    const { response } = error

    if (response && response.status) {
      const { status, url } = response
      const tokenErrCodes = [417, 418, 419, 420]

      if (tokenErrCodes.includes(status)) {
        flagCount++
        if (flagCount === 1) {
          if (status === 417) {
            notification.warning({
              message: '登录过期，请重新登录~',
            })
          } else if (status === 418) {
            notification.warning({
              message: '您的账号已在另一台设备登录，请重新登录~',
            })
          }
        }

        removeToken()
        removeUserId()
        removePhoneNumber()
        history.push('/home')

        setTimeout(() => {
          flagCount = 0
        }, 1000)
      } else if (status === 423) {
        flagCount++
        if (flagCount === 1) {
          expiredAlert()
        }

        setTimeout(() => {
          flagCount = 0
        }, 1000)
      }
    } else if (!response) {
      console.log({
        description: 'Your network is abnormal and cannot connect to the server',
        message: 'Network anomaly',
      })
    }

    return response
  },
}
