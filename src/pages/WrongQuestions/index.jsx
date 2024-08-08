import { useState, useMemo } from 'react'
import { useSessionStorage } from 'react-use'
import classNames from 'classnames'
import { Space, Menu, Dropdown, Pagination, Skeleton, Typography, Button, Empty } from 'antd'
import ProCard from '@ant-design/pro-card'
import { history, useModel } from 'umi'
import { isExpired } from '@/utils'
import Header from '@/components/Header'
import coneImg from '@/assets/bgimgs/practice_cone.png'
import ballImg from '@/assets/bgimgs/practice_ball.png'
import { sendGaEvent } from '@/utils/ga4'
import { DownOutlined } from '@ant-design/icons'
import { getWrongQuestions } from '@/services/practice'
import { useRequest } from 'ahooks'
import { getUserId } from '@/utils/user'
import expiredAlert from '@/components/Payments/expiredAlert'
import showOpenInPcModal from '@/components/showOpenInPcModal'
import useIsMobile from '@/hooks/useIsMobile'
import emptyImg from '@/assets/imgs/empty.svg'
import styles from './index.less'

const examTypes = [
  { value: 'Reading', label: '阅读' },
  { value: 'Listening', label: '听力' },
]

const classifyItems = [
  {
    key: 'All',
    label: 'ALL',
  },
  {
    key: 'Two',
    label: '真题',
  },
  {
    key: 'One',
    label: 'TPO',
  },
]

const WrongItemCard = ({ record, type }) => {
  const { Name, Qid, Tid, CreatedAt, IsTpo } = record
  const { initialState } = useModel('@@initialState')
  const isMobile = useIsMobile()

  // 是真题 并且没有账户时长
  const condition = isExpired(initialState?.userInfo?.Expiration) && !IsTpo

  return (
    <ProCard
      className={styles.blurCard}
      gutter={[16, 16]}
      style={{ width: '100%' }}
      bodyStyle={{
        padding: '30px 34px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      bordered
      wrap
    >
      <ProCard colSpan={{ xs: 24, sm: 12, md: 13, lg: 14, xl: 14 }} ghost>
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
        colSpan={{ xs: 24, sm: 12, md: 7, lg: 5, xl: 5 }}
        bodyStyle={{ textAlign: 'right' }}
        ghost
      >
        {CreatedAt}
      </ProCard>
      <ProCard
        colSpan={{ xs: 24, sm: 24, md: 4, lg: 5, xl: 5 }}
        bodyStyle={{ textAlign: 'right' }}
        ghost
      >
        <Button
          type="primary"
          size="middle"
          className={classNames({ 'custom-disabled-button': condition }, styles.reviewButton)}
          onClick={() => {
            if (condition) return expiredAlert()

            if (isMobile) return showOpenInPcModal()

            history.push({
              pathname: type === 'Reading' ? '/reviewreading' : '/reviewlistening',
              query: {
                Tid,
                Qid,
                from: '/wrong',
              },
            })
          }}
        >
          回顾
        </Button>
      </ProCard>
    </ProCard>
  )
}

const WrongQuestions = () => {
  const [type, setType] = useSessionStorage('wrong-type-key', 'Reading')
  const [classify, setClassify] = useSessionStorage('wrong-classify-key', 'All')
  const [PageNum, setPageNum] = useState(1)
  const [PageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [wrongQuestions, setWrongQuestions] = useState([])

  const { loading } = useRequest(
    () =>
      getWrongQuestions({
        UserId: getUserId(),
        Classification: classify,
        Type: type,
        PageNum,
        PageSize,
      }),
    {
      refreshDeps: [type, classify, PageNum, PageSize],
      onSuccess: ({ Code, Data }) => {
        if (Code !== 'Succeed') return

        const { Questions, Total } = Data

        setWrongQuestions(Questions)
        setTotal(Total)
      },
    },
  )

  const memoClassifyLabel = useMemo(() => {
    const matched = classifyItems.find(({ key }) => key === classify)

    return matched?.label
  }, [classify])

  return (
    <div className={styles.wrongWrap}>
      <Header />
      <div className={styles.content}>
        <img src={coneImg} className={styles.coneImg} />
        <img src={ballImg} className={styles.ballImg} />
        <div className={styles.mainWrap}>
          <div className={styles.controls}>
            <div className={styles.controlType}>
              {examTypes.map(({ value, label }) => (
                <div
                  className={classNames(styles.controlTypeItem, type === value && styles.active)}
                  key={value}
                  onClick={() => {
                    setPageNum(1)
                    setType(value)

                    sendGaEvent({
                      category: 'click',
                      action: 'wrong_list_click',
                      label: value,
                    })
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
            <Space wrap>
              <span>错题来源：</span>
              <Dropdown
                overlay={
                  <Menu
                    items={classifyItems}
                    onClick={({ key }) => {
                      setPageNum(1)
                      setClassify(key)
                    }}
                  />
                }
                overlayClassName={styles.overlay}
                trigger={['click']}
              >
                <div className={styles.controlClassify}>
                  <Space>
                    <span>{memoClassifyLabel}</span>
                    <DownOutlined />
                  </Space>
                </div>
              </Dropdown>
            </Space>
          </div>
          <div>
            {/* 加载中则显示骨架屏，加载完成后，有数据则显示列表，无数据则显示Empty组件 */}
            {!loading ? (
              <div>
                {wrongQuestions.length ? (
                  wrongQuestions.map((item) => (
                    <WrongItemCard key={item.Qid} record={item} type={type} />
                  ))
                ) : (
                  <Empty image={emptyImg} imageStyle={{ height: 80 }} description="无错题记录" />
                )}
              </div>
            ) : (
              // eslint-disable-next-line react/no-array-index-key
              Array.from({ length: 3 }).map((item, i) => <Skeleton key={i} active />)
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 60 }}>
            <Pagination
              current={PageNum}
              pageSize={PageSize}
              className={styles.pagination}
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
    </div>
  )
}

export default WrongQuestions
