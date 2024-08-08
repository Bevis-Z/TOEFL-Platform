import { Row, Col } from 'antd'
import Header from '@/components/Header'
import { Mockups, Slogan, CommentCards, FlyMan, ShowHow } from './components'
import { ReactComponent as Wave } from '@/assets/bgimgs/home_wave.svg'
import { ReactComponent as WaveLight } from '@/assets/bgimgs/home_wave_light.svg'
import Footer from '@/components/Footer'
import styles from './index.less'

const Home = () => {
  return (
    <div className={styles.homeWrap}>
      <Header />
      <div className={styles.topSection}>
        <div className={styles.starsWrap} />
        <div className={styles.main}>
          <Row className={styles.mainRow} gutter={[16, 100]}>
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
              <Slogan />
            </Col>
            <Col xs={24} sm={24} md={16} lg={16} xl={16}>
              <Mockups />
            </Col>
          </Row>
        </div>
        <div className={styles.waveWrap}>
          <Wave />
        </div>
        <div className={styles.waveLightWrap}>
          <WaveLight />
        </div>
      </div>
      <div className={styles.secondSection}>
        <CommentCards />
        <FlyMan />
        <ShowHow />
      </div>
      <Footer />
    </div>
  )
}

export default Home
