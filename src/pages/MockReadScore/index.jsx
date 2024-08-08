import { useState } from 'react'
import { Row, Col, Button, Space, Skeleton } from 'antd'
import { history, useLocation } from 'umi'
import { getUserId } from '@/utils/user'
import { timingFormat } from '@/utils'
import classNames from 'classnames'
import LeftBrand from '@/components/Header/LeftBrand'
import { useRequest } from 'ahooks'
import { getReadingExamPractices } from '@/services/mockexam'
import { HiOutlineArrowRight } from 'react-icons/hi'
import AvatarDropdown from '@/components/RightContent/AvatarDropdown'
import styles from './index.less'

const MockReadScore = () => {
  const location = useLocation()
  const { Ename } = location.query

  const [passages, setPassages] = useState([])
  const [correctCounts, setCorrectCounts] = useState(0)
  const [topicCounts, setTopicCounts] = useState(0)
  const [scores, setScores] = useState(0)
  const [examTiming, setExamTiming] = useState(0)

  const { loading } = useRequest(
    () => {
      if (!Ename) return {}
      return getReadingExamPractices({ Ename, UserId: getUserId() })
    },
    {
      onSuccess: ({ Code, Data }) => {
        if (Code !== 'Succeed') return

        const { Passages = [], CorrectCounts, TopicCounts, Scores, ExamTiming } = Data

        setPassages(Passages)
        setCorrectCounts(CorrectCounts)
        setTopicCounts(TopicCounts)
        setScores(Scores)
        setExamTiming(ExamTiming)
      },
    },
  )

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <Row align="middle" className={styles.headerRow}>
          <Col xs={6} sm={6} md={6} lg={6} xl={7}>
            <LeftBrand />
          </Col>
          <Col xs={12} sm={12} md={12} lg={12} xl={10} className={styles.headerMidCol}>
            <div className={styles.indicator}>{Ename}</div>
          </Col>
          <Col xs={6} sm={6} md={6} lg={6} xl={7} className={styles.headerRightCol}>
            <Space size="middle">
              <Button
                type="primary"
                className={styles.actionButton}
                onClick={() => {
                  history.push('/mockexam')
                }}
              >
                返回
              </Button>
              <AvatarDropdown />
            </Space>
          </Col>
        </Row>
      </div>
      <div className={styles.content}>
        <div className={styles.pieceContainer}>
          <Skeleton
            title
            active
            loading={loading}
            style={{ maxWidth: 400, margin: '0 auto', paddingTop: 50, paddingBottom: 20 }}
            paragraph={{ rows: 1 }}
          >
            <div className={styles.scoreWrap}>
              {scores}
              <span> 分</span>
            </div>
            <div className={styles.timingAndCounts}>
              <div>
                <span>总用时: </span>
                <span>{timingFormat(examTiming)}</span>
              </div>
              <div>
                <span>正确数: </span>
                <span>
                  <span className={styles.correctCount}>{correctCounts}</span>/{topicCounts}
                </span>
              </div>
            </div>
          </Skeleton>
          <div className={styles.passagesWrap}>
            <Skeleton
              loading={loading}
              active
              title={false}
              paragraph={{ rows: 4 }}
              className={styles.skeletonWrap}
            >
              {passages.map(({ Questions = [] }, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <div className={styles.passage} key={i}>
                  <div className={styles.passageName}>Passage {i + 1}</div>
                  <Space wrap>
                    {Questions.map(({ Correct, Index, Qid }) => (
                      <Button
                        className={classNames(
                          styles.questionItem,
                          Correct === 'Correct' ? styles.correct : styles.error,
                        )}
                        key={Qid}
                      >
                        {Index}
                      </Button>
                    ))}
                  </Space>
                </div>
              ))}
            </Skeleton>
          </div>
          <div className={styles.toReviewBtnWrap}>
            <Button
              type="primary"
              shape="round"
              className={styles.toReviewBtn}
              onClick={() => {
                history.push({
                  pathname: '/mockreadreview',
                  query: {
                    Ename,
                  },
                })
              }}
            >
              <span>回 顾</span>
              <HiOutlineArrowRight className={styles.arrowRightIcon} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MockReadScore
