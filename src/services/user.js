import { request } from 'umi'

export async function userLogin(body, options) {
  return request('/console/UserLogin', {
    method: 'POST',
    data: body,
    ...(options || {}),
  })
}

export async function userLogout(body, options) {
  return request('/console/UserLogout', {
    method: 'POST',
    data: body,
    ...(options || {}),
  })
}

export async function getPublicKey(query, options) {
  return request('/console/GetPublicKey', {
    method: 'GET',
    params: query,
    ...(options || {}),
  })
}

export async function setPassword(body, options) {
  return request('/console/SetPassword', {
    method: 'POST',
    data: body,
    ...(options || {}),
  })
}

export async function postValidateCode(body, options) {
  return request('/console/PostValidateCode', {
    method: 'POST',
    data: body,
    ...(options || {}),
  })
}

export async function getUserInfo(query, options) {
  return request('/console/GetUserInfo', {
    method: 'GET',
    params: query,
    ...(options || {}),
  })
}

export async function postFeedback(body, options) {
  return request('/console/PostFeedback', {
    method: 'POST',
    data: body,
    ...(options || {}),
  })
}
