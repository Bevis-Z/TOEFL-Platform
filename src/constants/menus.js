/**
 * @description 菜单配置
 *
 * @member {string} name 菜单名
 * @member {string} to 菜单路由
 * @member {minWidth} number 屏幕最小宽度，当屏幕大于等于minWidth时才显示，用来做媒体查询
 * @member {dev} boolean 是否正在开发，true则点击会有即将上线的弹窗
 * @member {anyAccess} boolean 是否无需登录即可访问，false则点击会出现登录弹窗
 * @member {showNew} boolean 是否展示new标签
 */
const MENUS = [
  {
    name: 'Practice',
    to: '/practice',
    anyAccess: true,
    dev: true,
    minWidth: 520,
  },
  {
    name: 'Mock Exam',
    to: '/mockexam',
    anyAccess: true,
    dev: true,
    minWidth: 620,
  },
  {
    name: 'Personal Set',
    to: '/wrong',
    minWidth: 720,
  },
  {
    name: 'Price',
    to: '/pricing',
    anyAccess: true,
    minWidth: 800,
  },
]

export default MENUS
