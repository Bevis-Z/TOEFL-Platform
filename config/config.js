// https://umijs.org/config/
import { defineConfig } from 'umi'
// import defaultSettings from './defaultSettings'
import proxy from './proxy'
import routes from './routes'
import zhCN from 'antd/lib/locale/zh_CN'

const { REACT_APP_ENV } = process.env

export default defineConfig({
  hash: true,
  antd: {
    config: {
      locale: zhCN,
    },
  },
  dva: {
    hmr: true,
  },
  // layout: {
  //   // https://umijs.org/zh-CN/plugins/plugin-layout
  //   locale: true,
  //   siderWidth: 208,
  //   ...defaultSettings,
  // },
  layout: false,
  // https://umijs.org/zh-CN/plugins/plugin-locale
  // locale: {
  //   // default zh-CN
  //   default: 'zh-CN',
  //   antd: true,
  //   // default true, when it is true, will use `navigator.language` overwrite default
  //   baseNavigator: true,
  // },
  dynamicImport: {
    loading: '@ant-design/pro-layout/es/PageLoading',
  },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes,
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    'root-entry-name': 'variable',
    'font-size-base': '16px',
    'border-radius-base': '6px',
    'slider-track-background-color': 'rgba(158, 154, 255, 0.8)', // 淡紫色
    'slider-track-background-color-hover': 'rgba(158, 154, 255, 1)',
    'slider-handle-color': 'rgba(158, 154, 255, 0.8)',
    'slider-handle-color-hover': 'rgba(158, 154, 255, 1)',
    'slider-handle-color-focus': 'rgba(158, 154, 255, 1)',
    'slider-handle-color-focus-shadow': 'rgba(158, 154, 255, 0.2)',
    'checkbox-border-radius': '4px',
  },
  // esbuild is father build tools
  // https://umijs.org/plugins/plugin-esbuild
  esbuild: {},
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
  // Fast Refresh 热更新
  fastRefresh: {},
  // openAPI: [
  //   {
  //     requestLibPath: "import { request } from 'umi'",
  //     // 或者使用在线的版本
  //     // schemaPath: "https://gw.alipayobjects.com/os/antfincdn/M%24jrzTTYJN/oneapi.json"
  //     schemaPath: join(__dirname, 'oneapi.json'),
  //     mock: false,
  //   },
  //   {
  //     requestLibPath: "import { request } from 'umi'",
  //     schemaPath: 'https://gw.alipayobjects.com/os/antfincdn/CA1dOm%2631B/openapi.json',
  //     projectName: 'swagger',
  //   },
  // ],
  nodeModulesTransform: {
    type: 'none',
  },
  // mfsu: {},
  webpack5: {},
  exportStatic: {},
})
