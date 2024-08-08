import { Row, Col, Avatar, Space, Divider } from 'antd'
import classNames from 'classnames'
import { getDictum } from '@/utils'
import avatarLi from '@/assets/imgs/comment_avatar_li.jpg'
import avatarZhu from '@/assets/imgs/comment_avatar_zhu.jpg'
import avatarDing from '@/assets/imgs/comment_avatar_ding.jpg'
import avatarZhou from '@/assets/imgs/comment_avatar_zhou.jpeg'
import styles from './CommentCards.less'

const comments = [
  {
    avatar: avatarZhou,
    name: 'Student Zhou',
    score: '112',
    comment:
      '备考时走了不少弯路，但最终还是取得了不错的结果！托福来了的精选题目一直都有在更新，降低了我的备考材料选择成本',
    universals: ['CU', 'Brown U', 'UCLA'],
    tag: '美/加混申请选手',
  },
  {
    avatar: avatarDing,
    name: 'Student Ding',
    score: '113',
    comment: '备考阶段大量的刷题帮我突破了瓶颈，而托福来了就是最好的海量题库提供方。',
    universals: ['NYU', 'WUSTL', 'HKUST'],
    tag: '美/欧/香混申选手',
  },
  {
    avatar: avatarZhu,
    name: 'Student Zhu',
    score: '112',
    comment:
      'Before I tried my 3rd TOEFL test, I found this platform and it helped me a lot. I got 112 finally!',
    universals: ['KCL', 'MELB', 'USYD', 'UBC'],
    tag: 'UK/AUS/CAN',
  },
  {
    avatar: avatarLi,
    name: 'Student LEE',
    score: '118',
    comment: 'I use this platform for 2 months, and ace the test with 118. Highly recommend!',
    universals: ['UCB', 'JHU', 'NU', 'NTU'],
    tag: 'Singapore/USA',
  },
]

const dictum = getDictum()

const CommentCards = () => {
  return (
    <div className={styles.commentsWrap}>
      <Row gutter={10} style={{ width: '100%' }}>
        <Col
          xs={{ span: 24, order: 2 }}
          sm={{ span: 24, order: 2 }}
          md={{ span: 24, order: 2 }}
          lg={{ span: 18, order: 1 }}
          xl={{ span: 18, order: 1 }}
          className={styles.cardsCol}
        >
          <div className={styles.cardsWrap}>
            {comments.map(({ avatar, name, score, comment, universals, tag }, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={i} className={classNames(styles.commentCard, styles[`card${i + 1}`])}>
                <div className={styles.top}>
                  <div className={styles.left}>
                    <Space
                      className={styles.name}
                      split={<Divider type="vertical" style={{ borderLeftColor: '#ccc' }} />}
                    >
                      <span>{name}</span>
                      <span>{score}/120</span>
                    </Space>
                    <div className={styles.tag}>{tag}</div>
                  </div>
                  <Avatar
                    src={avatar}
                    size={50}
                    style={{ backgroundColor: 'rgba(255, 255, 255, .5)' }}
                  />
                </div>
                <Space className={styles.universals}>
                  {universals.map((u) => (
                    <div key={u} className={styles.uitem}>
                      {u}
                    </div>
                  ))}
                </Space>
                <div className={styles.comment}>“{comment}”</div>
              </div>
            ))}
          </div>
        </Col>
        <Col
          xs={{ span: 24, order: 1 }}
          sm={{ span: 24, order: 1 }}
          md={{ span: 24, order: 1 }}
          lg={{ span: 6, order: 2 }}
          xl={{ span: 6, order: 2 }}
        >
          <div className={styles.descWrap}>
            <div className={styles.title}>Real Feedback</div>
            <div className={styles.desc}>You could be the next!</div>
            <div className={styles.dictum}>
              <div className={styles.en}>{dictum.en}</div>
              <div className={styles.cn}>{dictum.cn}</div>
              {dictum.src && <div className={styles.src}>——{dictum.src}</div>}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default CommentCards
