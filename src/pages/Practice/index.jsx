import { useSessionStorage } from 'react-use'
import classNames from 'classnames'
import { Space } from 'antd'
import Read from './components/Read'
import Listen from './components/Listen'
import Speak from './components/Speak'
import Write from './components/Write'
import Header from '@/components/Header'
import coneImg from '@/assets/bgimgs/practice_cone.png'
import ballImg from '@/assets/bgimgs/practice_ball.png'
import { sendGaEvent } from '@/utils/ga4'
import styles from './index.less'

const examTypes = [
  { value: 'read', label: '阅读' },
  { value: 'listen', label: '听力' },
  { value: 'speak', label: '口语' },
  { value: 'write', label: '写作' },
]

const Practice = () => {
  const [type, setType] = useSessionStorage('practice-type-key', 'read')
  const [classify, setClassify] = useSessionStorage('practice-classify-key', 'One')

  return (
    <div className={styles.practiceWrap}>
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
                    setType(value)

                    sendGaEvent({
                      category: 'click',
                      action: 'practice_types_click',
                      label: value,
                    })
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
            <Space>
              <div
                className={classNames(
                  styles.classifyItem,
                  classify === 'Two' && styles.classifyItemActive,
                )}
                onClick={() => {
                  setClassify('Two')

                  sendGaEvent({
                    category: 'click',
                    action: 'practice_truth_click',
                    label: '真题',
                  })
                }}
              >
                真题
              </div>
              <div
                className={classNames(
                  styles.classifyItem,
                  classify === 'One' && styles.classifyItemActive,
                )}
                onClick={() => {
                  setClassify('One')

                  sendGaEvent({
                    category: 'click',
                    action: 'practice_tpo_click',
                    label: 'TPO',
                  })
                }}
              >
                TPO
                <span className={styles.freeTag}>免费</span>
              </div>
            </Space>
          </div>

          <div style={{ display: type === 'read' ? 'block' : 'none' }}>
            <Read Classification={classify} />
          </div>
          <div style={{ display: type === 'listen' ? 'block' : 'none' }}>
            <Listen Classification={classify} />
          </div>
          <div style={{ display: type === 'speak' ? 'block' : 'none' }}>
            <Speak Classification={classify} />
          </div>
          <div style={{ display: type === 'write' ? 'block' : 'none' }}>
            <Write Classification={classify} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Practice
