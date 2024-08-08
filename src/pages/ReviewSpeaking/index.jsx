import { useState, useEffect, useRef } from 'react'
import { Row, Col, Space, Button, Switch, Divider, Tabs, Collapse, Empty } from 'antd'
import AvatarDropdown from '@/components/RightContent/AvatarDropdown'
import ProCard from '@ant-design/pro-card'
import { useLocation, history } from 'umi'
import { getSpeakingPractices, getSpeakingPracticeRecords } from '@/services/practice'
import { getUserId } from '@/utils/user'
import { SPEAK_TYPE } from '@/constants/enums'
import ReviewPlayer from './components/ReviewPlayer'
import { textWrap } from '@/utils'
import LeftBrand from '@/components/Header/LeftBrand'
import styles from './index.less'

const ReviewSpeaking = () => {
  const location = useLocation()
  const { Tid, Type } = location.query
  const audioOriginalRef = useRef(null)

  const [practice, setPractice] = useState({
    ReadingOriginal: '',
    IntroduceAudio: '',
    AudioOriginal: '',
    Name: '',
    OriginalTitle: '',
    Tpo: '',
    Qid: null,
    Parsing: '',
    TextExamples: [],
    SpeakingExamples: [],
  })
  const [records, setRecords] = useState([])
  const [showAudioOriginal, setShowAudioOriginal] = useState(false)
  const [playingSrc, setPlayingSrc] = useState('')

  const fetchSpeakingRecords = async (Qid) => {
    try {
      const { Code, Data } = await getSpeakingPracticeRecords({ Tid, Qid, UserId: getUserId() })
      if (Code !== 'Succeed') return

      const { Records = [] } = Data
      setRecords(Records)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    const fetchSpeakingPractice = async () => {
      try {
        const { Code, Data } = await getSpeakingPractices({ Tid, UserId: getUserId() })
        if (Code !== 'Succeed') return

        setPractice(Data)
        fetchSpeakingRecords(Data.Qid)
      } catch (err) {
        console.log(err)
      }
    }

    fetchSpeakingPractice()
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
              {practice.Tpo ? `${practice.Tpo} 口语` : `口语真题 ${Tid}`}：{practice.OriginalTitle}
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
          split="vertical"
          className={styles.pieceContainer}
          bodyStyle={{ height: '100%', padding: 32 }}
        >
          <ProCard
            colSpan={12}
            style={{ height: '100%' }}
            bodyStyle={{ height: '100%', padding: '0 24px 0 0' }}
          >
            {Type === SPEAK_TYPE.A && (
              <div>
                <p
                  className={styles.paragraph}
                  dangerouslySetInnerHTML={{ __html: textWrap(practice.ReadingOriginal) }}
                />
                <Divider />
              </div>
            )}
            {Type !== SPEAK_TYPE.C && (
              <div className={styles.listeningPart}>
                <b className={styles.partTitle}>听力材料</b>
                <ReviewPlayer
                  audioSrc={practice.IntroduceAudio}
                  isCurrent={practice.IntroduceAudio === playingSrc}
                  onPlayToggle={() => {
                    setPlayingSrc(practice.IntroduceAudio)
                  }}
                />
                <br />
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
                <br />
                <br />
                <div ref={audioOriginalRef}>
                  {showAudioOriginal && (
                    <p
                      dangerouslySetInnerHTML={{ __html: textWrap(practice.AudioOriginal) }}
                      className={styles.paragraph}
                    />
                  )}
                </div>
                <Divider />
              </div>
            )}
            <div className={styles.questionWrap}>
              <b>Question:</b>
              <p
                dangerouslySetInnerHTML={{ __html: textWrap(practice.Name) }}
                className={styles.paragraph}
              />
            </div>
          </ProCard>
          <ProCard
            colSpan={12}
            style={{ height: '100%' }}
            bodyStyle={{ height: '100%', padding: '0 0 0 24px' }}
          >
            <Tabs defaultActiveKey="userAnswers">
              <Tabs.TabPane tab="我的答案" key="userAnswers">
                <div className={styles.answers}>
                  {records.length ? (
                    records.map(({ SpeakRecord, CreatedAt }, i) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <div key={i} className={styles.playerItemWrap}>
                        <b>回答{records.length - i}：</b>
                        <ReviewPlayer
                          audioSrc={SpeakRecord}
                          isCurrent={SpeakRecord === playingSrc}
                          onPlayToggle={() => {
                            setPlayingSrc(SpeakRecord)
                          }}
                        />
                        <div className={styles.createAt}>作答时间：{CreatedAt}</div>
                      </div>
                    ))
                  ) : (
                    <Empty description={<span style={{ fontSize: 14 }}>无答题记录</span>} />
                  )}
                </div>
              </Tabs.TabPane>
              {!!practice.TextExamples.length && (
                <Tabs.TabPane tab="示例文本" key="textExamples">
                  <Collapse defaultActiveKey={[0]}>
                    {practice.TextExamples.map((item, i) => (
                      <Collapse.Panel
                        header={`示例${i + 1}`}
                        // eslint-disable-next-line react/no-array-index-key
                        key={i}
                      >
                        <p className={styles.paragraph}>{item}</p>
                      </Collapse.Panel>
                    ))}
                  </Collapse>
                </Tabs.TabPane>
              )}
              {!!practice.SpeakingExamples.length && (
                <Tabs.TabPane tab="示例音频" key="speakingExamples">
                  {practice.SpeakingExamples.map((item, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <div key={i} className={styles.playerItemWrap}>
                      <b>示例{i + 1}：</b>
                      <ReviewPlayer
                        audioSrc={item}
                        isCurrent={item === playingSrc}
                        onPlayToggle={() => {
                          setPlayingSrc(item)
                        }}
                      />
                    </div>
                  ))}
                </Tabs.TabPane>
              )}
            </Tabs>
          </ProCard>
        </ProCard>
      </div>
    </div>
  )
}

export default ReviewSpeaking
