import { useState, useEffect, useRef } from 'react'
import { Row, Col, Space, Button, Switch, Tabs, Collapse, Empty } from 'antd'
import AvatarDropdown from '@/components/RightContent/AvatarDropdown'
import ProCard from '@ant-design/pro-card'
import { getWritingPractices, getWritingPracticeRecords } from '@/services/practice'
import { useLocation, history } from 'umi'
import { getUserId } from '@/utils/user'
import AudioPlayer from './components/AudioPlayer'
import { useAudio } from 'react-use'
import classNames from 'classnames'
import { textWrap, timingFormat } from '@/utils'
import LeftBrand from '@/components/Header/LeftBrand'
import styles from './index.less'

const ReviewWriting = () => {
  const [practice, setPractice] = useState({})
  const [showAudioOriginal, setShowAudioOriginal] = useState(false)
  const location = useLocation()
  // Type: 综合-Comprehensive 独立-Independent
  const { Tid, Type } = location.query
  const [audio, audioState, controls, audioRef] = useAudio({
    src: '',
    autoPlay: false,
  })
  const audioOriginalRef = useRef(null)
  const [records, setRecords] = useState([])

  const fetchWritingRecords = async (Qid) => {
    try {
      const { Code, Data } = await getWritingPracticeRecords({ Tid, Qid, UserId: getUserId() })
      if (Code !== 'Succeed') return

      const { Records = [] } = Data
      setRecords(Records)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    const fetchWritingPractice = async () => {
      try {
        const { Code, Data } = await getWritingPractices({ Tid, UserId: getUserId() })
        if (Code !== 'Succeed') return

        setPractice(Data)
        audioRef.current.src = Data.IntroduceAudio
        fetchWritingRecords(Data.Qid)
      } catch (err) {
        console.log(err)
      }
    }

    fetchWritingPractice()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <Row align="middle" className={styles.headerRow}>
          <Col span={8}>
            <LeftBrand />
          </Col>
          <Col span={8} className={styles.headerMidCol}>
            <div className={styles.indicator}>
              {practice.Tpo ? `${practice.Tpo} 写作` : `写作真题 卷${practice.Paper}`}：
              {practice.OriginalTitle}
            </div>
          </Col>
          <Col span={8} className={styles.headerRightCol}>
            <Space size="middle">
              <Button
                className={styles.actionButton}
                onClick={() => {
                  history.push('/practice')
                }}
              >
                Back
              </Button>
              <AvatarDropdown />
            </Space>
          </Col>
        </Row>
      </div>
      <div className={styles.content}>
        <ProCard
          split="horizontal"
          className={styles.pieceContainer}
          bodyStyle={{ height: '100%', padding: 32 }}
        >
          <ProCard bodyStyle={{ paddingTop: 0 }}>
            <div className={styles.directions}>
              Directions: You have 20 minutes to plan and write your response. Your response will be
              judged on the basis of the quality of your writing and on how well your response
              presents the points in the lecture and their relationship to the reading passage.
              Typically, an effective response will be 150 to 225 words.
              <br />
              <br />
              Summarize the points made in the lecture, being sure to explain how they cast doubt on
              the specific points made in the reading passage.
            </div>
          </ProCard>
          <ProCard split="vertical" bodyStyle={{ paddingTop: 24, paddingBottom: 24 }}>
            <ProCard colSpan={12} bodyStyle={{ paddingTop: 0, paddingBottom: 0 }}>
              <div className={styles.original}>
                <b>阅读原文：</b>
                <p
                  className={styles.article}
                  dangerouslySetInnerHTML={{ __html: textWrap(practice.Original) }}
                />
              </div>
              {Type === 'Comprehensive' && (
                <div>
                  <b>题目音频：</b>
                  <AudioPlayer
                    audioState={audioState}
                    controls={controls}
                    wrapStyle={{ marginBottom: 24 }}
                    onChange={(rate) => {
                      controls.seek(audioState.duration * rate)
                      controls.play()
                    }}
                  />
                  <Space>
                    <b>听力原文：</b>
                    <Switch
                      checked={showAudioOriginal}
                      onChange={(checked) => {
                        setShowAudioOriginal(!showAudioOriginal)
                        if (checked) {
                          setTimeout(() => {
                            audioOriginalRef.current.scrollIntoView({ behavior: 'smooth' })
                          }, 200)
                        }
                      }}
                    />
                  </Space>
                  <div ref={audioOriginalRef}>
                    {showAudioOriginal && (
                      <p
                        dangerouslySetInnerHTML={{ __html: textWrap(practice.AudioOriginal) }}
                        className={styles.article}
                      />
                    )}
                  </div>
                </div>
              )}
            </ProCard>
            <ProCard colSpan={12} bodyStyle={{ paddingTop: 0, paddingBottom: 0 }}>
              <Tabs defaultActiveKey="userAnswers">
                <Tabs.TabPane tab="我的答案" key="userAnswers">
                  {records.length ? (
                    <Collapse defaultActiveKey={[0]} className={styles.recordsCollapse}>
                      {records.map(({ CreatedAt, WriteRecord, Timing, WordCount }, i) => (
                        <Collapse.Panel
                          header={
                            <div className={styles.panelHeader}>
                              <div>我的答案{i + 1}</div>
                              <div style={{ width: 100 }}>Time：{timingFormat(Timing)}</div>
                              <div style={{ width: 140 }}>Word Count：{WordCount}</div>
                              <div>{CreatedAt}</div>
                            </div>
                          }
                          // eslint-disable-next-line react/no-array-index-key
                          key={i}
                        >
                          <p className={classNames(styles.article, styles.userAnswer)}>
                            {WriteRecord}
                          </p>
                        </Collapse.Panel>
                      ))}
                    </Collapse>
                  ) : (
                    <Empty description={<span style={{ fontSize: 14 }}>无答题记录</span>} />
                  )}
                </Tabs.TabPane>
                {(practice.ModelEssays || []).map((item, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <Tabs.TabPane tab={`范文${i + 1}`} key={String(i)}>
                    <p className={classNames(styles.article, styles.modelEssay)}>{item}</p>
                  </Tabs.TabPane>
                ))}
              </Tabs>
            </ProCard>
          </ProCard>
        </ProCard>
      </div>
      {audio}
    </div>
  )
}

export default ReviewWriting
