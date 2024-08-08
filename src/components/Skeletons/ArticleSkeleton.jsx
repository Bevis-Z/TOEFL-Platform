import { Skeleton } from 'antd'

const PlaceholderView = () => {
  return (
    <>
      <Skeleton active />
      <Skeleton active />
      <Skeleton active />
      <Skeleton active />
      <Skeleton active />
    </>
  )
}

const ArticleSkeleton = ({ loading, children }) => {
  return loading ? <PlaceholderView /> : children
}

export default ArticleSkeleton
