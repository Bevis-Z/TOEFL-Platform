import { useEffect, useState } from 'react'
import { useSessionStorage } from 'react-use'
import { getCategories, getReadingTitles, retest } from '@/services/practice'
import { Skeleton, Typography, Space, Button, Pagination } from 'antd'
import ProCard from '@ant-design/pro-card'
import { getUserId } from '@/utils/user'
import { history, useModel } from 'umi'
import classNames from 'classnames'
import { isExpired } from '@/utils'
import expiredAlert from '@/components/Payments/expiredAlert'
import CategoriesGroup from './CategoriesGroup'
import practiceStyles from '../index.less'
import useIsMobile from '@/hooks/useIsMobile'
import showOpenInPcModal from '@/components/showOpenInPcModal'
import { STATUS_TYPE } from '@/constants/enums'
import styles from './Read.less'

const Type = 'Reading'

const CategoriesSkeleton = () => {
  return <Skeleton.Button active size="small" block className={styles.catesSkeleton} />
}

const ListSkeleton = () => {
  return [
    <Skeleton key={1} active />,
    <Skeleton key={2} active />,
    <Skeleton key={3} active />,
    <Skeleton key={4} active />,
  ]
}

const generateOptions = (arr) => {
  if (!Array.isArray(arr)) return []
  if (arr.length === 0) return []

  return arr.map(({ Cid, Name }) => ({ value: Cid, label: Name }))
}

const ReviewButton = ({ Tid, condition }) => {
  const { initialState } = useModel('@@initialState')
  const { toggle } = useModel('login')
  const isMobile = useIsMobile()

  return (
    <Button
      type="default"
      className={classNames({ 'custom-disabled-button': condition }, practiceStyles.reviewButton)}
      size="middle"
      onClick={() => {
        if (!initialState?.userInfo) return toggle()

        if (condition) return expiredAlert()

        if (isMobile) return showOpenInPcModal()

        history.push({
          pathname: '/reviewreading',
          query: {
            Tid,
          },
        })
      }}
    >
      复习
    </Button>
  )
}

const GenerateActions = ({ Status, Tid, classify }) => {
  const { initialState } = useModel('@@initialState')
  const { toggle } = useModel('login')
  const isMobile = useIsMobile()

  let buttons = []
  // 是真题 并且没有账户时长
  const condition = isExpired(initialState?.userInfo?.Expiration) && classify === 'Two'

  if (Status === STATUS_TYPE.Initial) {
    buttons = [
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
            pathname: '/practicereading',
            query: {
              Tid,
              startAt: Date.now(),
            },
          })
        }}
      >
        一键开刷
      </Button>,
    ]
  } else if (Status === STATUS_TYPE.Submited || Status === STATUS_TYPE.Again) {
    buttons = [
      <Button
        type="primary"
        className={classNames({ 'custom-disabled-button': condition }, practiceStyles.startButton)}
        size="middle"
        key="submitted-restart"
        onClick={async () => {
          if (!initialState?.userInfo) return toggle()

          if (condition) return expiredAlert()

          if (isMobile) return showOpenInPcModal()

          try {
            const { Code } = await retest({ Tid: Number(Tid), UserId: getUserId() })
            if (Code !== 'Succeed') return

            history.push({
              pathname: '/practicereading',
              query: {
                Tid,
                startAt: Date.now(),
              },
            })
          } catch (err) {
            console.log(err)
          }
        }}
      >
        重新练习
      </Button>,
    ]
  } else if (Status === STATUS_TYPE.Progressing) {
    buttons = [
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
            pathname: '/practicereading',
            query: {
              Tid,
              startAt: Date.now(),
            },
          })
        }}
      >
        继续刷题
      </Button>,
      <Button
        type="primary"
        className={classNames({ 'custom-disabled-button': condition }, practiceStyles.startButton)}
        size="middle"
        key="progressing-restart"
        onClick={async () => {
          if (!initialState?.userInfo) return toggle()

          if (condition) return expiredAlert()

          if (isMobile) return showOpenInPcModal()

          try {
            const { Code } = await retest({ Tid: Number(Tid), UserId: getUserId() })
            if (Code !== 'Succeed') return

            history.push({
              pathname: '/practicereading',
              query: {
                Tid,
                startAt: Date.now(),
              },
            })
          } catch (err) {
            console.log(err)
          }
        }}
      >
        重新练习
      </Button>,
    ]
  }

  return (
    <Space wrap>
      {[<ReviewButton key="review" Tid={Tid} condition={condition} />, ...buttons]}
    </Space>
  )
}

const ReadingItemCard = ({ record, classify }) => {
  const { Tid, CorrectCounts, Name, Status, TopicCounts, Level } = record

  return (
    <ProCard
      gutter={[24, 24]}
      style={{ width: '100%' }}
      className={practiceStyles.blurCard}
      bodyStyle={{
        padding: '30px 34px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      bordered
      wrap
    >
      {Level === '1' && <div className={practiceStyles.chosenBadge}>精选</div>}
      <ProCard colSpan={{ xs: 12, sm: 12, md: 12, lg: 10, xl: 10 }} ghost>
        <Typography.Text
          style={{
            width: '100%',
          }}
          ellipsis={{ tooltip: Name }}
        >
          {Name}
        </Typography.Text>
      </ProCard>
      <ProCard
        colSpan={{ xs: 12, sm: 12, md: 12, lg: 3, xl: 3 }}
        bodyStyle={{ textAlign: 'right' }}
        ghost
      >
        <span>
          <Typography.Text type={CorrectCounts > 0 ? 'success' : 'default'}>
            {CorrectCounts}
          </Typography.Text>
          /{TopicCounts}
        </span>
      </ProCard>
      <ProCard
        colSpan={{ xs: 24, sm: 24, md: 24, lg: 11, xl: 11 }}
        bodyStyle={{ textAlign: 'right' }}
        ghost
      >
        <GenerateActions {...{ Status, Tid, classify }} />
      </ProCard>
    </ProCard>
  )
}

const TPORead = () => {
  const Classification = 'One'
  const { initialState } = useModel('@@initialState')
  const [cateId, setCateId] = useSessionStorage('practice-tpo-read-cate-id', undefined)
  const [catesLoading, setCatesLoading] = useState(false)
  const [cates, setCates] = useState([])
  const [tpos, setTpos] = useState([])
  const [tposLoading, setTposLoading] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCatesLoading(true)
        const { Code, Data } = await getCategories({ Classification, Type })
        setCatesLoading(false)
        if (Code !== 'Succeed') return

        const { Categories = [] } = Data
        setCates(Categories)
        if (!cateId) {
          setCateId(Categories[0]?.Cid)
        }
      } catch (err) {
        console.log(err)
      }
    }

    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const fetchPracticeTitles = async () => {
      if (!cateId) return
      try {
        const params = {
          Classification,
          UserId: getUserId() || 0,
          Cid: cateId,
        }
        setTposLoading(true)
        const { Code, Data } = await getReadingTitles(params)
        setTposLoading(false)
        if (Code !== 'Succeed') return

        const { Tpos = [] } = Data
        setTpos(Tpos)
      } catch (err) {
        console.log(err)
      }
    }

    fetchPracticeTitles()
  }, [cateId, initialState.userInfo])

  return (
    <div>
      {catesLoading ? (
        <CategoriesSkeleton />
      ) : (
        <CategoriesGroup
          value={cateId}
          onChange={(v) => setCateId(v)}
          options={generateOptions(cates)}
        />
      )}
      <div className={styles.titlesWrap}>
        {tposLoading ? (
          <ListSkeleton />
        ) : (
          tpos.map(({ Tpo, Titles }) => (
            <div key={Tpo}>
              <div className={styles.tpoTitle}>{Tpo}</div>
              {Titles.sort((a, b) => a.Index - b.Index).map((item) => (
                <ReadingItemCard key={item.Tid} record={item} classify={Classification} />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const TrueRead = () => {
  const Classification = 'Two'
  const { initialState } = useModel('@@initialState')
  const [catesLoading, setCatesLoading] = useState(false)
  const [cates, setCates] = useState([])
  const [cateId, setCateId] = useSessionStorage('practice-true-read-cate-id', undefined)
  const [topics, setTopics] = useState([])
  const [topicsLoading, setTopicsLoading] = useState(false)
  const [PageNum, setPageNum] = useState(1)
  const [PageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCatesLoading(true)
        const { Code, Data } = await getCategories({ Classification, Type })
        setCatesLoading(false)
        if (Code !== 'Succeed') return

        const { Categories = [] } = Data
        Categories.unshift({ Cid: 0, Name: 'ALL' })
        setCates(Categories)
        if (cateId === null || cateId === undefined) {
          setCateId(Categories[0]?.Cid)
        }
      } catch (err) {
        console.log(err)
      }
    }

    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const fetchPracticeTitles = async () => {
      if (cateId === null || cateId === undefined) return
      try {
        const params = {
          Classification,
          UserId: getUserId() || 0,
          PageNum,
          PageSize,
          Cid: cateId,
        }
        setTopicsLoading(true)
        const { Code, Data } = await getReadingTitles(params)
        setTopicsLoading(false)
        if (Code !== 'Succeed') return

        const { Titles = [], Total } = Data
        setTopics(Titles)
        setTotal(Total)
      } catch (err) {
        console.log(err)
      }
    }

    fetchPracticeTitles()
  }, [cateId, PageNum, PageSize, initialState.userInfo])

  return (
    <div>
      {catesLoading ? (
        <CategoriesSkeleton />
      ) : (
        <CategoriesGroup
          value={cateId}
          onChange={(v) => {
            setPageNum(1)
            setCateId(v)
          }}
          options={generateOptions(cates)}
        />
      )}
      <div className={styles.titlesWrap}>
        {topicsLoading ? (
          <ListSkeleton />
        ) : (
          topics.map((item) => (
            <ReadingItemCard key={item.Tid} record={item} classify={Classification} />
          ))
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
    </div>
  )
}

const Read = ({ Classification: c }) => {
  return c === 'One' ? <TPORead /> : <TrueRead />
}

export default Read
