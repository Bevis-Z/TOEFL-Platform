import { useRef, useCallback } from 'react'
import { Button, Spin } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useState } from 'react'
import {
  createOrder,
  wechatPay,
  getWechatOrder,
  aliPay,
  getAliOrder,
  closeWechatOrder,
  closeAliOrder,
  aliHbPay,
} from '@/services/payment'
import { getUserId } from '@/utils/user'
import { useRequest, useUnmount } from 'ahooks'
import { getEachCostByStages } from '@/utils'
import { IoIosArrowForward, IoIosArrowDown } from 'react-icons/io'
import { ReactComponent as WechatPayIcon } from '@/assets/imgs/wechatpay_icon.svg'
import { ReactComponent as AliPayIcon } from '@/assets/imgs/alipay_icon.svg'
import { ReactComponent as HuaBeiPayIcon } from '@/assets/imgs/huabei_icon.svg'
import showAgreementContent from './showAgreementContent'
import styles from './Payment.less'

// amount 金额-元
const Payment = ({ onPaySuccess, amount = 0, Vid, Name, Description }) => {
  const wechatTimerIdRef = useRef(null)
  const alipayTimerIdRef = useRef(null)

  // selection | paying
  const [step, setStep] = useState('selection')
  const [qrcode, setQrcode] = useState('')
  // Wechat | Alipay | AliHb
  const [payType, setPayType] = useState('')
  const [paySuccess, setPaySuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')

  // 微信支付状态轮询
  const {
    run: runCheckWechatOrder,
    refresh: refreshCheckWechatOrder,
    cancel: cancelCheckWechatOrder,
  } = useRequest((OrderNumber) => getWechatOrder({ OrderNumber }), {
    manual: true,
    onSuccess: async (res) => {
      const { Code, Data } = res
      if (Code !== 'Succeed') return

      // TradeState枚举: SUCCESS：支付成功 REFUND：转入退款 NOTPAY：未支付 CLOSED：已关闭
      const { TradeState } = Data?.Order || {}

      if (TradeState === 'SUCCESS') {
        setPaySuccess(true)
        onPaySuccess()
      } else {
        wechatTimerIdRef.current = setTimeout(() => {
          refreshCheckWechatOrder()
        }, 1000)
      }
    },
    onError: (err, params) => {
      console.log('checking wechat order error >>> ', 'error: ', err, ' params: ', params)
    },
  })

  // 支付宝支付状态轮询
  const {
    run: runCheckAliOrder,
    refresh: refreshCheckAliOrder,
    cancel: cancelCheckAliOrder,
  } = useRequest((OrderNumber) => getAliOrder({ OrderNumber }), {
    manual: true,
    onSuccess: async (res) => {
      const { Code, Data } = res
      if (Code !== 'Succeed') return

      // TradeStatus枚举: WAIT_BUYER_PAY（交易创建，等待买家付款）、TRADE_CLOSED（未付款交易超时关闭，或支付完成后全额退款）、TRADE_SUCCESS（交易支付成功）、TRADE_FINISHED（交易结束，不可退款）、undefined（用户还未扫码）
      const { TradeStatus } = Data?.Order || {}

      if (TradeStatus === 'TRADE_SUCCESS') {
        setPaySuccess(true)
        onPaySuccess()
      } else {
        alipayTimerIdRef.current = setTimeout(() => {
          refreshCheckAliOrder()
        }, 1000)
      }
    },
    onError: (err, params) => {
      console.log('checking wechat order error >>> ', 'error: ', err, ' params: ', params)
    },
  })

  const closeTheWechatOrder = async () => {
    try {
      const { Code } = await closeWechatOrder({ OrderNumber: orderNumber })
      if (Code !== 'Succeed') return
    } catch (err) {
      console.log(err)
    }
  }

  const closeTheAliOrder = async () => {
    try {
      const { Code } = await closeAliOrder({ OrderNumber: orderNumber })
      if (Code !== 'Succeed') return
    } catch (err) {
      console.log(err)
    }
  }

  const closeOrder = () => {
    if (!paySuccess) {
      if (payType === 'Wechat') {
        closeTheWechatOrder()
      } else if (payType === 'Alipay' || payType === 'AliHb') {
        closeTheAliOrder()
      }
    }
  }

  const handleDestory = () => {
    if (wechatTimerIdRef.current) {
      clearTimeout(wechatTimerIdRef.current)
    }
    if (alipayTimerIdRef.current) {
      clearTimeout(alipayTimerIdRef.current)
    }
    cancelCheckWechatOrder()
    cancelCheckAliOrder()
    closeOrder()
    setQrcode('')
  }

  useUnmount(() => {
    handleDestory()
  })

  /**
   * 发起微信支付
   * @param {{ OrderId: number, OrderNumber: string }} data
   * @returns {void}
   */
  const postWechatPay = async (data) => {
    try {
      const { Code, Data } = await wechatPay(data)
      if (Code !== 'Succeed') return

      const { CodeUrl } = Data
      setQrcode(CodeUrl)
      runCheckWechatOrder(data.OrderNumber)
    } catch (err) {
      console.log(err)
    }
  }

  /**
   * 发起支付宝支付
   * @param {{ OrderId: number, OrderNumber: string }} data
   * @returns {void}
   */
  const postAliPay = async (data) => {
    try {
      const { Code, Data } = await aliPay(data)
      if (Code !== 'Succeed') return

      const { CodeUrl } = Data
      setQrcode(CodeUrl)
      runCheckAliOrder(data.OrderNumber)
    } catch (err) {
      console.log(err)
    }
  }

  /**
   * 发起花呗分期支付
   * @param {{ OrderId: number, OrderNumber: string }} data
   * @returns {void}
   */
  const postAliHbPay = async (data, stages) => {
    try {
      const { Code, Data } = await aliHbPay({
        ...data,
        ExtendParams: {
          hb_fq_num: String(stages),
          hb_fq_seller_percent: '0',
        },
      })
      if (Code !== 'Succeed') return

      const { CodeUrl } = Data
      setQrcode(CodeUrl)
      runCheckAliOrder(data.OrderNumber)
    } catch (err) {
      console.log(err)
    }
  }

  const createOrderByType = async (Type, stages = null) => {
    try {
      const body = {
        UserId: getUserId(),
        Vid,
        Type,
      }
      const { Code, Data } = await createOrder(body)
      if (Code !== 'Succeed') return

      setOrderNumber(Data.OrderNumber)

      if (stages) {
        postAliHbPay(Data, stages)
      } else if (Type === 'Wechat') {
        postWechatPay(Data)
      } else if (Type === 'Alipay') {
        postAliPay(Data)
      }
    } catch (err) {
      console.log(err)
    }
  }

  const onHuabeiPay = (stages) => {
    createOrderByType('Alipay', stages)
    setTimeout(() => {
      setStep('paying')
    }, 200)
  }

  const getIcon = useCallback(() => {
    if (payType === 'Wechat') {
      return <WechatPayIcon className={styles.payBrandIcon} />
    } else if (payType === 'Alipay') {
      return <AliPayIcon className={styles.payBrandIcon} />
    } else if (payType === 'AliHb') {
      return <HuaBeiPayIcon className={styles.payBrandIcon} />
    }
  }, [payType])

  const platformSelection = (
    <div className={styles.platformsWrap}>
      <div className={styles.goodsInfo}>
        <div className={styles.infoLeft}>
          {Name}
          <div className={styles.desc}>{Description.replace(/\\n/g, ' ')}</div>
        </div>
        <div className={styles.amount}>
          <span className={styles.symbol}>￥</span>
          {amount}
        </div>
      </div>
      <div className={styles.selectText}>支付方式选择</div>
      <div className={styles.selectTypesWrap}>
        <div
          className={styles.selectTypesItem}
          onClick={() => {
            createOrderByType('Wechat')
            setPayType('Wechat')
            setTimeout(() => {
              setStep('paying')
            }, 200)
          }}
        >
          <div>
            <WechatPayIcon className={styles.payBrandIcon} />
            微信支付
          </div>
          <IoIosArrowForward />
        </div>

        <div
          className={styles.selectTypesItem}
          onClick={() => {
            createOrderByType('Alipay')
            setPayType('Alipay')
            setTimeout(() => {
              setStep('paying')
            }, 200)
          }}
        >
          <div>
            <AliPayIcon className={styles.payBrandIcon} />
            支付宝支付
          </div>
          <IoIosArrowForward />
        </div>

        <div
          className={styles.selectTypesItem}
          onClick={() => {
            setPayType('AliHb')
          }}
        >
          <div>
            <HuaBeiPayIcon className={styles.payBrandIcon} />
            花呗分期
          </div>
          {payType === 'AliHb' ? <IoIosArrowDown /> : <IoIosArrowForward />}
        </div>
      </div>
      {payType === 'AliHb' && (
        <div className={styles.stagesWrap}>
          <div onClick={() => onHuabeiPay(3)}>
            ￥{getEachCostByStages(amount, 3)} x 3期
            <br />
            <span>含服务费</span>
          </div>
          <div onClick={() => onHuabeiPay(6)}>
            ￥{getEachCostByStages(amount, 6)} x 6期
            <br />
            <span>含服务费</span>
          </div>
          <div onClick={() => onHuabeiPay(12)}>
            ￥{getEachCostByStages(amount, 12)} x 12期
            <br />
            <span>含服务费</span>
          </div>
        </div>
      )}
      <div className={styles.agreementWrap}>
        支付即代表您已阅读并同意
        <span
          onClick={() => {
            showAgreementContent()
          }}
        >
          《服务协议》
        </span>
      </div>
    </div>
  )

  const QRCodePaying = (
    <div className={styles.qrcodeWrap}>
      <div className={styles.goodsInfo}>
        <div className={styles.infoLeft}>
          {Name}
          <div className={styles.desc}>{Description.replace(/\n/g, ' ')}</div>
        </div>
        <div className={styles.amount}>
          <span className={styles.symbol}>￥</span>
          {amount}
        </div>
      </div>
      <Button
        type="text"
        className={styles.back}
        onClick={() => {
          handleDestory()
          setStep('selection')
        }}
      >
        <ArrowLeftOutlined />
        Back
      </Button>
      <div className={styles.codeContainer}>
        <Spin spinning={!qrcode}>
          <div style={{ width: 250, height: 250 }}>{qrcode && <img src={qrcode} />}</div>
        </Spin>
      </div>
      <div className={styles.scanTips}>
        {getIcon()}
        使用{payType === 'Wechat' ? '微信' : '支付宝'}扫码支付
      </div>
    </div>
  )

  return step === 'selection' ? platformSelection : QRCodePaying
}

export default Payment
