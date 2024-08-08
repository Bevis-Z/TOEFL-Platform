import { CONVERSION_CODE } from '@/constants/ga4'
import ReactGA from 'react-ga4'
import { getUserId } from './user'

export const sendGaEvent = (params = {}) => {
  ReactGA.event({
    UserId: getUserId(),
    ...params,
  })
}

export const sendConversionEvent = () => {
  ReactGA.event('conversion', { send_to: CONVERSION_CODE, UserId: getUserId() })
}
