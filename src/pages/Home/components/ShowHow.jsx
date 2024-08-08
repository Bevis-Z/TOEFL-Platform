import { Row, Col, Space } from 'antd'
import classNames from 'classnames'
import { useVideo } from 'react-use'
import styles from './ShowHow.less'

const TinyBars = () => {
  return (
    <div className={styles.tinyBars}>
      <div className={styles.tinyBarsItem} />
      <div className={styles.tinyBarsItem} />
      <div className={styles.tinyBarsItem} />
      <div className={styles.tinyBarsItem} />
    </div>
  )
}

const ShowHow = () => {
  const [video, videoState, controls, videoRef] = useVideo(
    <video
      src="https://tuofulaile.oss-cn-beijing.aliyuncs.com/首页视频.mp4"
      autoPlay
      muted
      loop
      className={styles.video}
    />,
  )

  return (
    <div className={styles.showHowWrap}>
      <Row gutter={24} style={{ width: '100%' }}>
        <Col
          xs={{ span: 24 }}
          sm={{ span: 24 }}
          md={{ span: 24 }}
          lg={{ span: 7 }}
          xl={{ span: 7 }}
        >
          <Row gutter={[20, 34]} style={{ marginBottom: 42 }}>
            <Col
              xs={{ span: 24 }}
              sm={{ span: 12 }}
              md={{ span: 12 }}
              lg={{ span: 24 }}
              xl={{ span: 24 }}
              style={{ display: 'flex', justifyContent: 'center' }}
            >
              <div className={classNames(styles.bookWrap, styles.trueBook)}>
                <div className={styles.frontend}>
                  <div className={styles.title}>Real questions</div>
                  <div className={styles.desc}>Focus on real test</div>
                </div>
                <div className={styles.backend}>
                  <TinyBars />
                </div>
              </div>
            </Col>
            <Col
              xs={{ span: 24 }}
              sm={{ span: 12 }}
              md={{ span: 12 }}
              lg={{ span: 24 }}
              xl={{ span: 24 }}
              style={{ display: 'flex', justifyContent: 'center' }}
            >
              <div className={classNames(styles.bookWrap, styles.tpoBook)}>
                <div className={styles.frontend}>
                  <div className={styles.title}>
                    <Space align="center" size={10}>
                      <span>TPO</span>
                      <div className={styles.tag}>Free</div>
                    </Space>
                  </div>
                  <div className={styles.desc}>Login to unlock TPO</div>
                </div>
                <div className={styles.backend}>
                  <TinyBars />
                </div>
              </div>
            </Col>
          </Row>
        </Col>
        <Col
          xs={{ span: 24 }}
          sm={{ span: 24 }}
          md={{ span: 24 }}
          lg={{ span: 17 }}
          xl={{ span: 17 }}
        >
          <div className={styles.videoWrap}>
            <div className={styles.videoHeader}>
              <Space>
                <div className={classNames(styles.dot, styles.red)} />
                <div className={classNames(styles.dot, styles.yellow)} />
                <div className={classNames(styles.dot, styles.green)} />
              </Space>
            </div>
            {video}
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default ShowHow
