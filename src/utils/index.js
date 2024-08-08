import { history } from 'umi'
import JsEncrypt from 'jsencrypt/bin/jsencrypt.min.js'
import moment from 'moment'
import { getPublicKeyStr } from './user'
import dictums from '@/constants/dictums'

/**
 * 对明文进行加密
 * @param {string} plaintext 明文
 * @returns {string} 密文
 */
export function encryption(plaintext) {
  if (!plaintext) return ''

  const publicKey = getPublicKeyStr()
  const encryptor = new JsEncrypt()
  encryptor.setPublicKey(publicKey)
  const ciphertext = encryptor.encrypt(plaintext)

  return ciphertext
}

/**
 * 判断用户账号是否到期
 * @returns {boolean}
 */
export function isExpired(Expiration) {
  const expiration = Expiration * 1000
  const current = Date.now()
  const expire = expiration < current

  return expire
}

/**
 * 跳转到首页
 */
export function toHomePage() {
  if (window.location.pathname !== '/home') {
    history.push({
      pathname: '/home',
    })
  }
}

/**
 * 计算时长(秒)
 * @param {number | string} startAt 开始时间戳 毫秒
 * @returns {string} 时长 秒
 */
export function getTiming(startAt) {
  const duration = moment.duration(Date.now() - Number(startAt))

  return String(parseInt(duration.as('seconds')))
}

/**
 * 对秒进行格式化展示
 * @param {string | number} timing 秒
 * @returns {string} 格式化后的时间 mm:ss
 */
export function timingFormat(timing) {
  const str = moment.utc(parseInt(Number(timing) * 1000)).format('mm:ss')

  return str
}

/**
 * 判断正在播放的是不是当前句子
 * @param {number} time 正在播放的时间
 * @param {number | string} startTime 当前句子的开始时间
 * @param {number | string} endTime 当前句子的结束时间
 * @returns {boolean}
 */
export function isCurrentSentence(time, startTime, endTime) {
  const start = Number(startTime)
  const end = Number(endTime)

  return start <= time && time < end
}

/**
 * 计算单词数量
 * @param {string} text 文本
 * @returns {number}
 */
export function countWords(text) {
  let str = (text || '').replace(/(^\s*)|(\s*$)/gi, '')
  str = str.replace(/[ ]{2,}/gi, ' ')
  str = str.replace(/\n /, '\n')

  return str.split(' ').filter((v) => !!v).length
}

// 用户承担手续费花呗分期费率
const RATE_MAP = {
  3: 0.023,
  6: 0.045,
  12: 0.075,
}

/**
 * 通过商品价格和分期数算出每期总费用
 * 支付宝文档: https://opendocs.alipay.com/open/277/105952#买家分期费用计算规则
 * @param {number} amount 商品价格-单位元
 * @param {number} stages 分期数
 * @returns {number} 每期总费用-单位元
 */
export function getEachCostByStages(amount, stages) {
  const rate = RATE_MAP[stages]
  if (!rate) return null

  // 价格元转分
  const cent = amount * 100
  // 每期本金
  const eachPrin = Math.floor(cent / stages)
  // 总的手续费
  const totalFee = Math.round(cent * rate)
  // 每期手续费
  const eachFee = Math.floor(totalFee / stages)
  // 每期总费用
  const eachCost = eachFee + eachPrin

  return eachCost / 100
}

/**
 * 将文本里的\n替换为 br
 * @param {string} str 原文本
 * @returns 替换后的文本
 */
export function textWrap(str = '') {
  return str.replace(/\n/g, '<br />')
}

/**
 * 随机获取一条格言数据
 * @returns {{ en: string, cn: string, src?: string }} 格言
 */
export function getDictum() {
  const dictum = dictums[Math.floor(Math.random() * dictums.length)]

  return dictum
}

/**
 * 判断元素是否在可视区域
 * @param {Element} el
 * @returns {boolean}
 */
export function isElementInViewport(el) {
  const rect = el.getBoundingClientRect()

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}
