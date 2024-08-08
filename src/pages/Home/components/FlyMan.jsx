import model from '@/assets/imgs/fly_man/model.png'
import part1 from '@/assets/imgs/fly_man/part1.png'
import part2 from '@/assets/imgs/fly_man/part2.png'
import part3 from '@/assets/imgs/fly_man/part3.png'
import part4 from '@/assets/imgs/fly_man/part4.png'
import part5 from '@/assets/imgs/fly_man/part5.png'
import styles from './FlyMan.less'

const FlyMan = () => {
  return (
    <div className={styles.flymanWrap}>
      <div className={styles.title}>
        Real Test + Result Analyst
        <br />
        Provide your real experience in the test center!
        <div className={styles.subTitle}>Achieve your goal</div>
      </div>
      <div className={styles.modelWrap}>
        <div className={styles.imagesWrap}>
          <img src={model} className={styles.model} />
          <img src={part1} className={styles.part1} />
          <img src={part2} className={styles.part2} />
          <img src={part3} className={styles.part3} />
          <img src={part4} className={styles.part4} />
          <img src={part5} className={styles.part5} />
        </div>
      </div>
    </div>
  )
}

export default FlyMan
