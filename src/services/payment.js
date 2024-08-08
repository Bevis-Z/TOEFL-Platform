import { request } from 'umi'

// 创建订单
export async function createOrder(body, options) {
  return request('/console/CreateOrder', {
    method: 'POST',
    data: body,
    ...(options || {}),
  })
}

// 微信支付
export async function wechatPay(body, options) {
  return request('/console/WechatPay', {
    method: 'POST',
    data: body,
    ...(options || {}),
  })
}

// 微信支付订单结果查询
export async function getWechatOrder(query, options) {
  return request('/console/GetWechatOrder', {
    method: 'GET',
    params: query,
    ...(options || {}),
  })
}

// 关闭微信未支付订单
export async function closeWechatOrder(body, options) {
  return request('/console/CloseWechatOrder', {
    method: 'POST',
    data: body,
    ...(options || {}),
  })
}

// 支付宝支付
export async function aliPay(body, options) {
  return request('/console/AliPay', {
    method: 'POST',
    data: body,
    ...(options || {}),
  })
}

// 支付宝支付订单结果查询
export async function getAliOrder(query, options) {
  return request('/console/GetAliOrder', {
    method: 'GET',
    params: query,
    ...(options || {}),
  })
}

// 关闭支付宝未支付订单
export async function closeAliOrder(body, options) {
  return request('/console/CloseAliOrder', {
    method: 'POST',
    data: body,
    ...(options || {}),
  })
}

// 支付宝花呗支付
export async function aliHbPay(body, options) {
  return request('/console/AliHbPay', {
    method: 'POST',
    data: body,
    ...(options || {}),
  })
}

// 获取VIP卡列表
export async function getVipCards(query, options) {
  return request('/console/GetVipCards', {
    method: 'GET',
    params: query,
    ...(options || {}),
  })
}
