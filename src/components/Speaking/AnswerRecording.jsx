import { useState, useEffect, useRef } from 'react'
import { Divider, Progress } from 'antd'
import { getPrepAndRespTime } from './Question'
import { useCountDown } from 'ahooks'
import MicRecorder from 'mic-recorder-to-mp3'
import { speakingPracticeExam, uploadSpeakingAudio } from '@/services/practice'
import { getUserId } from '@/utils/user'
import { history } from 'umi'
import { useAudio } from 'react-use'
import styles from './AnswerRecording.less'

const REC_BEEP_AUDIO = 'https://tuofulaile.oss-cn-beijing.aliyuncs.com/static/口语开始作答音频.mp3'

const AnswerRecording = ({ volume, name, type, Tid, Qid }) => {
  const recorder = useRef(null)

  const [duration, setDuration] = useState(0)
  const [targetDate, setTargetDate] = useState()
  // recording | uploading | successed
  const [status, setStatus] = useState('')

  const [beepAudio, beepAudioState, beepControls, beepRef] = useAudio({
    src: REC_BEEP_AUDIO,
    autoPlay: true,
    onEnded: () => {
      const dur = getDuration()

      startRecording(() => {
        setDuration(dur)
        setTargetDate(Date.now() + dur)
        setStatus('recording')
      })
    },
  })

  useEffect(() => {
    beepControls?.volume?.(volume)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume])

  function getDuration() {
    return getPrepAndRespTime(type).responseTime * 1000
  }

  useEffect(() => {
    recorder.current = new MicRecorder({ bitRate: 128 })
  }, [])

  const postAnswer = async (SpeakRecord) => {
    try {
      const body = {
        Tid,
        UserId: getUserId(),
        Qid,
        SpeakRecord,
      }
      const { Code } = await speakingPracticeExam(body)
      if (Code !== 'Succeed') return

      setStatus('successed')
      setTimeout(() => {
        history.push({
          pathname: '/reviewspeaking',
          query: {
            Tid,
            Type: type,
          },
        })
      }, 1500)
    } catch (err) {
      console.log(err)
    }
  }

  const uploadFile = async (file) => {
    setStatus('uploading')
    try {
      const formData = new FormData()
      formData.append('File', file)
      formData.append('Tid', Tid)
      formData.append('UserId', getUserId())

      const { Code, Data } = await uploadSpeakingAudio(formData, { requestType: 'form' })
      if (Code !== 'Succeed') return
      postAnswer(Data.FileUrl)
    } catch (err) {
      console.log(err)
    }
  }

  const startRecording = (callback) => {
    recorder.current
      .start()
      .then(() => {
        console.log('answer recording start')
        callback && callback()
      })
      .catch((err) => console.log(err))
  }

  const stopRecording = () => {
    recorder.current
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        console.log('answer recording end')
        const audioFile = new File(buffer, 'speaking.mp3', {
          type: blob.type,
          lastModified: Date.now(),
        })

        uploadFile(audioFile)
      })
      .catch((e) => console.log(e))
  }

  const [countdown] = useCountDown({
    targetDate,
    interval: 100,
    onEnd: () => {
      stopRecording()
    },
  })

  return (
    <div className={styles.wrap}>
      <p className={styles.qName}>{name}</p>
      <Divider />
      <div className={styles.timeTips}>
        Recording Time:{' '}
        <span className={styles.timing}>
          {Math.round((countdown || (!status ? getDuration() : 0)) / 1000)}
        </span>{' '}
        Seconds
      </div>
      <div className={styles.progressWrap}>
        <Progress
          style={{ width: 400 }}
          showInfo={false}
          status="normal"
          trailColor="#f2f6ff"
          strokeLinecap="square"
          strokeColor="#9e9aff"
          strokeWidth={30}
          percent={((duration - countdown) / duration || 0) * 100}
        />
      </div>
      <div className={styles.tips}>
        {status === 'recording' && (
          <div>
            录音中
            <span className={styles.motionDots} />
          </div>
        )}
        {status === 'uploading' && (
          <div>
            上传中
            <span className={styles.motionDots} />
          </div>
        )}
        {status === 'successed' && <span>上传成功</span>}
      </div>
      {beepAudio}
    </div>
  )
}

export default AnswerRecording
