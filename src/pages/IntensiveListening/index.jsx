import { useEffect, useState } from 'react'
import { Space, Button, Row, Col, Menu, Dropdown } from 'antd'
import { useLocation, history } from 'umi'
import { useAudio } from 'react-use'
import AvatarDropdown from '@/components/RightContent/AvatarDropdown'
import { getListeningPractices } from '@/services/practice'
import IntensivePlayer from './components/IntensivePlayer'
import IntensiveItem from './components/IntensiveItem'
import { getUserId } from '@/utils/user'
import { isCurrentSentence } from '@/utils'
import { useKeyPress } from 'ahooks'
import { ImLoop2 } from 'react-icons/im'
import LeftBrand from '@/components/Header/LeftBrand'
import styles from './index.less'

const generateID = (num) => `sentenceIndex${num}`

// 确保在下一句开始前暂停
const safetyValue = 0.6

const IntensiveListening = () => {
  const location = useLocation()
  const { query } = location
  const [intensives, setIntensives] = useState([])
  const [speed, setSpeed] = useState(1)
  const speedOptions = [0.5, 0.8, 1, 1.5, 1.75, 2]
  const [hideCN, setHideCN] = useState(false)
  const [originalTitle, setOriginalTitle] = useState('')
  const [tpo, setTpo] = useState('')
  const [totalPlay, setTotalPlay] = useState(false)
  const [currentAudio, setCurrentAudio] = useState({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [audio, audioState, controls, audioRef] = useAudio({
    src: '',
    autoPlay: false,
    onTimeUpdate: () => {
      if (totalPlay) return
      if (!currentAudio.EndTime) return

      // 因为 currentAudio 也在动态变化
      const endTime = Number(currentAudio.EndTime) - safetyValue

      if (audioState.time >= endTime) {
        controls.pause()
      }
    },
    onEnded: () => {
      if (totalPlay) {
        controls.seek(0)
      }
    },
  })
  const [showList, setShowList] = useState([])

  useEffect(() => {
    // if (totalPlay) return

    const index = intensives.findIndex(({ StartTime, EndTime }) =>
      isCurrentSentence(audioState.time, StartTime, EndTime),
    )

    setCurrentIndex(index)
    setCurrentAudio(intensives[index] || {})
  }, [audioState.time, intensives, totalPlay])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed])

  useEffect(() => {
    const fetchIntensive = async () => {
      try {
        const { Code, Data } = await getListeningPractices({ Tid: query.Tid, UserId: getUserId() })
        if (Code !== 'Succeed') return

        const { IntroduceAudio, Audios, OriginalTitle, Tpo } = Data

        audioRef.current.src = IntroduceAudio
        setIntensives(Audios)
        setOriginalTitle(OriginalTitle)
        setTpo(Tpo)
      } catch (err) {
        console.log(err)
      }
    }

    fetchIntensive()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const timeId = setInterval(() => {
      const ele = document.getElementById(generateID(currentIndex))
      if (!ele) return

      clearInterval(timeId)
      ele.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 200)
  }, [currentIndex])

  const onPlayToggle = (e) => {
    e?.preventDefault?.()

    if (audioState.playing) {
      controls.pause()
    } else {
      if (!totalPlay) {
        const { StartTime, EndTime } = currentAudio
        const diffTime = Number(EndTime) - audioState.time

        if (diffTime <= safetyValue) {
          // 小于一定的值 就认为播放到当前句的结束部分了 再播放就会从当前句的开始时间播放
          controls.seek(Number(StartTime))
        }
      }

      setTimeout(() => {
        controls.play()
      }, 100)
    }
  }

  const onPrev = () => {
    if (currentIndex === 0) return

    const prevAudio = intensives[currentIndex - 1]
    const prevStart = Number(prevAudio.StartTime)

    controls.seek(prevStart)
    setTimeout(() => {
      controls.play()
    }, 100)
  }

  const onNext = () => {
    if (currentIndex === intensives.length - 1) return

    const nextAudio = intensives[currentIndex + 1]
    const nextStart = Number(nextAudio.StartTime)

    controls.seek(nextStart)
    setTimeout(() => {
      controls.play()
    }, 100)
  }

  const onShowCNToggle = () => {
    setHideCN((s) => !s)
  }

  const onTotalPlayToggle = () => {
    setTotalPlay((s) => !s)
  }

  const onAllShowToggle = () => {
    if (intensives.length === showList.length) {
      // 当前全都显示 则切换为全都不显示
      setShowList([])
    } else {
      // 否则（全都不显示 或 有不显示的） 就全都显示
      setShowList(intensives.map((e, i) => i))
    }
  }

  // 绑定快捷键
  useKeyPress(['space'], onPlayToggle, {
    exactMatch: true,
  })

  useKeyPress(['leftarrow'], onPrev, {
    exactMatch: true,
  })

  useKeyPress(['rightarrow'], onNext, {
    exactMatch: true,
  })

  useKeyPress(['shift'], onShowCNToggle, {
    exactMatch: true,
  })

  useKeyPress(['enter'], onTotalPlayToggle, {
    exactMatch: true,
  })

  useKeyPress(
    ['ctrl'],
    () => {
      controls.seek(Number(currentAudio.StartTime || '0'))
      setTimeout(() => {
        controls.play()
      }, 100)
    },
    {
      exactMatch: true,
    },
  )

  useKeyPress(
    ['uparrow'],
    (e) => {
      e?.preventDefault?.()

      const index = speedOptions.findIndex((s) => s === speed)
      if (index >= speedOptions.length - 1) return
      setSpeed(speedOptions[index + 1])
    },
    {
      exactMatch: true,
    },
  )

  useKeyPress(
    ['downarrow'],
    (e) => {
      e?.preventDefault?.()

      const index = speedOptions.findIndex((s) => s === speed)
      if (index <= 0) return
      setSpeed(speedOptions[index - 1])
    },
    {
      exactMatch: true,
    },
  )

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <Row align="middle" className={styles.headerRow}>
          <Col span={8}>
            <LeftBrand />
          </Col>
          <Col span={8} className={styles.headerMidCol}>
            <div className={styles.indicator}>
              {tpo ? `精听 ${tpo}` : `精听 真题${query.Tid}`}：{originalTitle}
            </div>
          </Col>
          <Col span={8} className={styles.headerRightCol}>
            <Space size="middle">
              <Button
                className={styles.actionButton}
                onClick={() => {
                  history.push('/practice')
                }}
                onKeyUp={(e) => e.preventDefault()}
              >
                Back
              </Button>
              <AvatarDropdown />
            </Space>
          </Col>
        </Row>
      </div>
      <div className={styles.content}>
        <div className={styles.pieceContainer}>
          <div className={styles.cardTop}>
            <Row gutter={16} align="middle" style={{ width: '100%' }}>
              <Col xs={24} sm={24} md={24} lg={15} xl={15}>
                <IntensivePlayer
                  audioState={audioState}
                  controls={controls}
                  unprevable={currentIndex === 0}
                  unnextable={currentIndex === intensives.length - 1}
                  onChange={(rate) => {
                    controls.seek(audioState.duration * rate)
                    controls.play()
                  }}
                  onPlayToggle={onPlayToggle}
                  onPrev={onPrev}
                  onNext={onNext}
                />
                <Space className={styles.shortcuts} size="middle" wrap>
                  <span>快捷键</span>
                  <div>
                    <span>ctrl：</span>
                    <span>重听此句</span>
                  </div>
                  <div>
                    <span>空格：</span>
                    <span>播放/暂停</span>
                  </div>
                  <div>
                    <span>←：</span>
                    <span>上一句</span>
                  </div>
                  <div>
                    <span>→：</span>
                    <span>下一句</span>
                  </div>
                  <div>
                    <span>↑：</span>
                    <span>加速</span>
                  </div>
                  <div>
                    <span>↓：</span>
                    <span>减速</span>
                  </div>
                  <div>
                    <span>/：</span>
                    <span>切换遮罩</span>
                  </div>
                  <div>
                    <span>shift：</span>
                    <span>显隐中文</span>
                  </div>
                  <div>
                    <span>enter：</span>
                    <span>是否全文播放</span>
                  </div>
                </Space>
              </Col>
              <Col
                xs={24}
                sm={24}
                md={24}
                lg={9}
                xl={9}
                style={{ display: 'flex', justifyContent: 'flex-end' }}
              >
                <Space wrap>
                  <Button
                    className={styles.operationBtn}
                    onClick={onShowCNToggle}
                    onKeyUp={(e) => e.preventDefault()}
                  >
                    {hideCN ? '显示中文' : '隐藏中文'}
                  </Button>
                  <Button
                    className={styles.operationBtn}
                    onClick={onAllShowToggle}
                    onKeyUp={(e) => e.preventDefault()}
                  >
                    切换全部遮罩
                  </Button>
                  <Button
                    className={styles.operationBtn}
                    onClick={onTotalPlayToggle}
                    onKeyUp={(e) => e.preventDefault()}
                  >
                    <ImLoop2 style={{ position: 'relative', top: 2, marginRight: 6 }} />
                    {totalPlay ? '全文播放' : '分句播放'}
                  </Button>
                  <Dropdown
                    overlay={
                      <Menu
                        items={speedOptions.map((s) => ({ key: s, label: `x ${s}` }))}
                        onClick={({ key }) => {
                          setSpeed(Number(key))
                        }}
                      />
                    }
                  >
                    <Button className={styles.operationBtn} onKeyUp={(e) => e.preventDefault()}>
                      速度 x{speed}
                    </Button>
                  </Dropdown>
                </Space>
              </Col>
            </Row>
          </div>
          <div className={styles.cardContent}>
            {intensives.map((item, i) => (
              <IntensiveItem
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                id={generateID(i)}
                record={item}
                index={i}
                hideCN={hideCN}
                audioState={audioState}
                controls={controls}
                show={showList.includes(i)}
                onShowToggle={(index) => {
                  setShowList((list) => {
                    if (list.includes(index)) {
                      return list.filter((e) => e !== index)
                    } else {
                      return [...list, index]
                    }
                  })
                }}
              />
            ))}
          </div>
        </div>
      </div>
      {audio}
    </div>
  )
}

export default IntensiveListening
