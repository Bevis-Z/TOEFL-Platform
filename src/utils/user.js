const TOKEN = 'APP_USER_TOKEN'
const USER_ID = 'APP_USER_ID'
const USERNAME = 'APP_USERNAME'
const PUBLICKEY = 'APP_PUBLICKEY'
const EXPIRATION = 'USER_EXPIRATION'
const PHONE_NUMBER = 'PHONE_NUMBER'

export function setToken(val) {
  window.localStorage.setItem(TOKEN, val)
}

export function getToken() {
  return window.localStorage.getItem(TOKEN)
}

export function removeToken() {
  window.localStorage.removeItem(TOKEN)
}

export function setUserId(val) {
  window.localStorage.setItem(USER_ID, val)
}

export function getUserId() {
  const uid = window.localStorage.getItem(USER_ID)
  const res = uid ? Number(uid) : undefined

  return res
}

export function removeUserId() {
  window.localStorage.removeItem(USER_ID)
}

export function setPublicKeyStr(val) {
  window.localStorage.setItem(PUBLICKEY, val)
}

export function getPublicKeyStr() {
  return window.localStorage.getItem(PUBLICKEY)
}

export function removePublickeyStr() {
  window.localStorage.removeItem(PUBLICKEY)
}

export function setPhoneNumber(val) {
  window.localStorage.setItem(PHONE_NUMBER, window.btoa(val || ''))
}

export function getPhoneNumber() {
  const val = window.localStorage.getItem(PHONE_NUMBER) || ''
  return window.atob(val)
}

export function removePhoneNumber() {
  window.localStorage.removeItem(PHONE_NUMBER)
}
