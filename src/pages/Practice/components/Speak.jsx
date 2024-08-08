import { useEffect, useState } from 'react'
import { useSessionStorage } from 'react-use'
import { getCategories, getSpeakingTitles } from '@/services/practice'
import { Skeleton, Typography, Space, Button, Pagination, Row, Col } from 'antd'
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
import styles from './Speak.less'

const Type = 'Speaking'

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

const ReviewButton = ({ Tid, SpeakType, condition }) => {
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
          pathname: '/reviewspeaking',
          query: {
            Tid,
            Type: SpeakType,
          },
        })
      }}
    >
      复习
    </Button>
  )
}

const GenerateActions = ({ Status, Tid, SpeakType, Name, classify }) => {
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
            pathname: '/practicespeaking',
            query: {
              Tid,
              Type: SpeakType,
              Task: Name,
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
        key="restart"
        size="middle"
        onClick={() => {
          if (!initialState?.userInfo) return toggle()

          if (condition) return expiredAlert()

          if (isMobile) return showOpenInPcModal()

          history.push({
            pathname: '/practicespeaking',
            query: {
              Tid,
              Type: SpeakType,
              Task: Name,
            },
          })
        }}
      >
        重新练习
      </Button>,
    ]
  }

  return (
    <Space wrap>
      {[
        <ReviewButton key="review" Tid={Tid} SpeakType={SpeakType} condition={condition} />,
        ...buttons,
      ]}
    </Space>
  )
}

const TPOSpeak = () => {
  const Classification = 'One'
  const { initialState } = useModel('@@initialState')
  const [catesLoading, setCatesLoading] = useState(false)
  const [cates, setCates] = useState([])
  const [cateId, setCateId] = useSessionStorage('practice-tpo-speak-cate-id', undefined)
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
        setCateId(Categories[0]?.Cid)
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
          Cid: cateId,
        }
        setTposLoading(true)
        const { Code, Data } = await getSpeakingTitles(params)
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
              <ProCard gutter={24} ghost wrap>
                {Titles.sort((a, b) => a.Index - b.Index).map(
                  ({ Name, Status, Tid, SpeakType, Level }) => (
                    <ProCard
                      key={Tid}
                      className={practiceStyles.blurCard}
                      colSpan={{ xs: 24, sm: 12, md: 8, lg: 8, xl: 8 }}
                      bodyStyle={{
                        padding: '30px 24px',
                      }}
                      bordered
                    >
                      {Level === '1' && <div className={practiceStyles.chosenBadge}>精选</div>}
                      <Row gutter={[16, 16]} style={{ width: '100%' }}>
                        <Col
                          xs={{ span: 24 }}
                          sm={{ span: 24 }}
                          md={{ span: 24 }}
                          lg={{ span: 6 }}
                          xl={{ span: 6 }}
                        >
                          <Typography.Text
                            style={{
                              width: '100%',
                            }}
                            ellipsis={{ tooltip: Name }}
                          >
                            {Name}
                          </Typography.Text>
                        </Col>
                        <Col
                          xs={{ span: 24 }}
                          sm={{ span: 24 }}
                          md={{ span: 24 }}
                          lg={{ span: 18 }}
                          xl={{ span: 18 }}
                          className={styles.actionsCol}
                        >
                          <GenerateActions
                            {...{ Status, Tid, SpeakType, Name, classify: Classification }}
                          />
                        </Col>
                      </Row>
                    </ProCard>
                  ),
                )}
              </ProCard>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const TrueSpeak = () => {
  const Classification = 'Two'
  const { initialState } = useModel('@@initialState')
  const [catesLoading, setCatesLoading] = useState(false)
  const [cates, setCates] = useState([])
  const [cateId, setCateId] = useSessionStorage('practice-true-speak-cate-id', undefined)
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
        const { Code, Data } = await getSpeakingTitles(params)
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
          topics.map(({ Tid, Name, Status, SpeakType, Level }) => (
            <ProCard
              key={Tid}
              className={practiceStyles.blurCard}
              bodyStyle={{
                padding: '30px 34px',
              }}
              bordered
            >
              {Level === '1' && <div className={practiceStyles.chosenBadge}>精选</div>}
              <Row gutter={[16, 16]} style={{ width: '100%' }}>
                <Col
                  xs={{ span: 24 }}
                  sm={{ span: 8 }}
                  md={{ span: 8 }}
                  lg={{ span: 8 }}
                  xl={{ span: 8 }}
                >
                  <Typography.Text
                    style={{
                      width: '100%',
                    }}
                    ellipsis={{ tooltip: `No.${Tid} ${Name}` }}
                  >
                    {`No.${Tid} ${Name}`}
                  </Typography.Text>
                </Col>
                <Col
                  xs={{ span: 24 }}
                  sm={{ span: 16 }}
                  md={{ span: 16 }}
                  lg={{ span: 16 }}
                  xl={{ span: 16 }}
                  className={styles.actionsCol}
                >
                  <GenerateActions
                    {...{ Status, Tid, SpeakType, Name, classify: Classification }}
                  />
                </Col>
              </Row>
            </ProCard>
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

const Speak = ({ Classification: c }) => {
  return c === 'One' ? <TPOSpeak /> : <TrueSpeak />
}

export default Speak
