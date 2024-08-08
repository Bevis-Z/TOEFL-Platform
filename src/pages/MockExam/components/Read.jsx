import { useState } from 'react'
import { Skeleton, Typography, Space, Button, Pagination } from 'antd'
import ProCard from '@ant-design/pro-card'
import { getUserId } from '@/utils/user'
import { history, useModel } from 'umi'
import classNames from 'classnames'
import { isExpired } from '@/utils'
import expiredAlert from '@/components/Payments/expiredAlert'
import useIsMobile from '@/hooks/useIsMobile'
import showOpenInPcModal from '@/components/showOpenInPcModal'
import { examRetest, getReadingExamTitles } from '@/services/mockexam'
import { useRequest } from 'ahooks'
import practiceStyles from '../../Practice/index.less'
import { STATUS_TYPE } from '@/constants/enums'
import styles from './Read.less'

const ListSkeleton = () => {
  return [
    <Skeleton key={1} active />,
    <Skeleton key={2} active />,
    <Skeleton key={3} active />,
    <Skeleton key={4} active />,
  ]
}

const GenerateActions = ({ Ename, Status, classify }) => {
  const { initialState } = useModel('@@initialState')
  const { toggle } = useModel('login')
  const isMobile = useIsMobile()

  // 是真题 并且没有账户时长
  const condition = isExpired(initialState?.userInfo?.Expiration) && classify === 'Two'

  if (Status === STATUS_TYPE.Initial) {
    return (
      <Button
        type="primary"
        className={classNames({ 'custom-disabled-button': condition }, practiceStyles.startButton)}
        size="middle"
        key="start"
        onClick={() => {
          if (!initialState?.userInfo) return toggle()

          if (condition) return expiredAlert()

          if (isMobile) return showOpenInPcModal()

          history.push({
            pathname: '/mockreading',
            query: { Ename },
          })
        }}
      >
        开始模考
      </Button>
    )
  } else if (Status === STATUS_TYPE.Submited || Status === STATUS_TYPE.Again) {
    return (
      <Space wrap>
        <Button
          type="default"
          className={classNames(
            { 'custom-disabled-button': condition },
            practiceStyles.reviewButton,
          )}
          size="middle"
          onClick={() => {
            if (!initialState?.userInfo) return toggle()

            if (condition) return expiredAlert()

            if (isMobile) return showOpenInPcModal()

            history.push({
              pathname: '/mockreadscore',
              query: { Ename },
            })
          }}
        >
          复习
        </Button>
        <Button
          type="primary"
          className={classNames(
            { 'custom-disabled-button': condition },
            practiceStyles.startButton,
          )}
          size="middle"
          key="submited-restart"
          onClick={async () => {
            if (!initialState?.userInfo) return toggle()

            if (condition) return expiredAlert()

            if (isMobile) return showOpenInPcModal()

            try {
              const { Code } = await examRetest({ Ename, UserId: getUserId() })
              if (Code !== 'Succeed') return

              history.push({
                pathname: '/mockreading',
                query: { Ename },
              })
            } catch (err) {
              console.log(err)
            }
          }}
        >
          重新模考
        </Button>
      </Space>
    )
  } else if (Status === STATUS_TYPE.Progressing) {
    return (
      <Space wrap>
        <Button
          type="primary"
          className={classNames(
            { 'custom-disabled-button': condition },
            practiceStyles.continueButton,
          )}
          size="middle"
          key="go-on"
          onClick={() => {
            if (!initialState?.userInfo) return toggle()

            if (condition) return expiredAlert()

            if (isMobile) return showOpenInPcModal()

            history.push({
              pathname: '/mockreading',
              query: { Ename },
            })
          }}
        >
          继续考试
        </Button>
        <Button
          type="primary"
          className={classNames(
            { 'custom-disabled-button': condition },
            practiceStyles.startButton,
          )}
          size="middle"
          key="progressing-restart"
          onClick={async () => {
            if (!initialState?.userInfo) return toggle()

            if (condition) return expiredAlert()

            if (isMobile) return showOpenInPcModal()

            try {
              const { Code } = await examRetest({ Ename, UserId: getUserId() })
              if (Code !== 'Succeed') return

              history.push({
                pathname: '/mockreading',
                query: { Ename },
              })
            } catch (err) {
              console.log(err)
            }
          }}
        >
          重新模考
        </Button>
      </Space>
    )
  }

  return null
}

const Read = ({ Classification }) => {
  const { initialState } = useModel('@@initialState')
  const [topics, setTopics] = useState([])
  const [PageNum, setPageNum] = useState(1)
  const [PageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)

  const { loading: topicsLoading } = useRequest(
    () =>
      getReadingExamTitles({
        UserId: getUserId() || 0,
        PageNum,
        PageSize,
      }),
    {
      refreshDeps: [Classification, PageNum, PageSize, initialState.userInfo],
      onSuccess: ({ Code, Data }) => {
        if (Code !== 'Succeed') return

        const { Titles = [], Total } = Data

        setTopics(Titles)
        setTotal(Total)
      },
    },
  )

  return (
    <div className={styles.titlesWrap}>
      {topicsLoading ? (
        <ListSkeleton />
      ) : (
        <ProCard gutter={24} ghost wrap>
          {topics.map(({ Ename, Status, CorrectCounts, Index, TopicCounts }) => (
            <ProCard
              key={Ename}
              className={practiceStyles.blurCard}
              colSpan={{ xs: 24, sm: 12, md: 8, lg: 8, xl: 8 }}
              bodyStyle={{
                padding: '30px 24px',
              }}
              bordered
            >
              <div className={styles.examInfoWrap}>
                <span>{Ename}</span>
                <span>
                  <Typography.Text type={CorrectCounts > 0 ? 'success' : 'default'}>
                    {CorrectCounts}
                  </Typography.Text>
                  /{TopicCounts}
                </span>
              </div>
              <div className={styles.actionsWrap}>
                <GenerateActions Ename={Ename} Status={Status} classify={Classification} />
              </div>
            </ProCard>
          ))}
        </ProCard>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 60 }}>
        <Pagination
          current={PageNum}
          pageSize={PageSize}
          className={practiceStyles.pagination}
          showQuickJumper
          showSizeChanger
          pageSizeOptions={[10, 20]}
          total={total}
          onChange={(page, pageSize) => {
            setPageNum(page)
            setPageSize(pageSize)
          }}
        />
      </div>
    </div>
  )
}

export default Read
