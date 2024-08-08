import { useState, useEffect, useRef } from 'react'
import { Space, Button } from 'antd'
import MicRecorder from 'mic-recorder-to-mp3'
import { useAudio } from 'react-use'
import micCheck from '@/assets/imgs/recorder_check.jpg'
import styles from './RecorderCheck.less'

const RecorderCheck = ({ volume, onStart }) => {
  const recorder = useRef(null)

  // check | stop | play
  const [btnType, setBtnType] = useState('check')
  const [startBtnLoading, setStartBtnLoading] = useState(false)

  const [audio, audioState, controls, audioRef] = useAudio({
    src: '',
    autoPlay: false,
  })

  useEffect(() => {
    controls?.volume?.(volume)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume])

  useEffect(() => {
    recorder.current = new MicRecorder({ bitRate: 128 })
  }, [])

  const startRecording = () => {
    setStartBtnLoading(true)
    recorder.current
      .start()
      .then(() => {
        console.log('recording start')
        setBtnType('stop')
        setStartBtnLoading(false)
      })
      .catch((err) => {
        console.log(err)
        setStartBtnLoading(false)
      })
  }

  const stopRecording = () => {
    recorder.current
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        const blobUrl = URL.createObjectURL(blob)
        audioRef.current.src = blobUrl
        console.log('recording end')
        setBtnType('play')
      })
      .catch((e) => console.log(e))
  }

  return (
    <div className={styles.wrap}>
      <img src={micCheck} />
      <div style={{ margin: '24px 0' }}>
        页面请求使用麦克风时，请点击允许。若无法测试录音，请检查是否已插入耳机，或刷新页面
      </div>
      <Space size="large">
        <div style={{ height: 80, textAlign: 'center' }}>
          {btnType === 'check' && (
            <Button
              type="primary"
              className={styles.operationBtn}
              loading={startBtnLoading}
              onClick={() => {
                startRecording()
              }}
            >
              录音测试
            </Button>
          )}
          {btnType === 'stop' && (
            <Button
              type="primary"
              className={styles.operationBtn}
              onClick={() => {
                stopRecording()
              }}
            >
              停止录音
            </Button>
          )}
          {btnType === 'play' && (
            <Button
              type="primary"
              className={styles.operationBtn}
              onClick={() => {
                controls.seek(0)
                controls.play()
              }}
            >
              播放录音
            </Button>
          )}
          {btnType === 'stop' && (
            <div style={{ paddingTop: 10 }}>
              录音中
              <span className={styles.motionDots} />
            </div>
          )}
          {audioState.playing && (
            <div style={{ paddingTop: 10 }}>
              播放中
              <span className={styles.motionDots} />
            </div>
          )}
        </div>
        <div style={{ height: 80 }}>
          <Button
            type="primary"
            className={styles.operationBtn}
            disabled={btnType !== 'play'}
            onClick={onStart}
          >
            开始答题
          </Button>
        </div>
      </Space>
      {audio}
    </div>
  )
}

export default RecorderCheck
