import { useBoolean } from 'react-use'

export default () => {
  const [visible, toggle] = useBoolean(false)

  return { visible, toggle }
}
