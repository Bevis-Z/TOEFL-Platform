import { useEffect } from 'react'
import LoginModal from '@/components/Login/LoginModal'
import { history, useModel } from 'umi'
import { getUserId, getToken } from '@/utils/user'
import { GA_MEASUREMENT_ID, ADS_ID } from '@/constants/ga4'
import ReactGA from 'react-ga4'
import { sendGaEvent } from '@/utils/ga4'
import { addListener, launch } from 'devtools-detector'

const RootLayout = ({ children, route }) => {
  const { setInitialState } = useModel('@@initialState')
  const { routes = [] } = route

  useEffect(() => {
    const setTitleByPathname = (pathname) => {
      const matchedRoute = routes.find(({ path }) => path === pathname) || {}
      const routeName = matchedRoute.name || '托福来了'

      document.title = `${routeName} - 托福来了在线备考平台`
    }

    setTitleByPathname(history.location.pathname)

    const uid = getUserId()

    ReactGA.initialize(GA_MEASUREMENT_ID, {
      gaOptions: {
        userId: uid && String(uid),
      },
    })
    ReactGA.send({
      hitType: 'pageview',
      UserId: getUserId(),
      page: history.location.pathname,
      search: history.location.search,
    })

    if (process.env.NODE_ENV !== 'development') {
      addListener((isOpen) => {
        if (isOpen) {
          sendGaEvent({
            category: 'tech',
            action: 'console_open',
            label: '打开浏览器控制台',
          })
        }
      })

      launch()
    }

    const unlisten = history.listen((location, action) => {
      window.scrollTo(0, 0)

      setTitleByPathname(location.pathname)

      ReactGA.send({
        hitType: 'pageview',
        UserId: getUserId(),
        page: location.pathname,
        search: location.search,
      })

      if (!getUserId() || !getToken()) {
        setInitialState((s) => ({
          ...s,
          userInfo: undefined,
        }))
      }
    })

    return () => unlisten()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="root-layout">
      {children}
      <LoginModal />
    </div>
  )
}

export default RootLayout
