import { useState, useEffect } from 'react'
import { debounce } from 'lodash'

const useViewportWidth = () => {
  const [vw, setVw] = useState(0)

  useEffect(() => {
    const handleResize = debounce(() => {
      setVw(window.innerWidth)
    }, 200)

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return vw
}

export default useViewportWidth
