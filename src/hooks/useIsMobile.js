import { useMediaQuery } from 'react-responsive'

const useIsMobile = () => {
  const isMobile = useMediaQuery({ maxWidth: 575 })

  return isMobile
}

export default useIsMobile
