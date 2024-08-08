import { textWrap } from '@/utils'
import styles from './Article.less'

const Article = ({ article }) => {
  return <p className={styles.article} dangerouslySetInnerHTML={{ __html: textWrap(article) }} />
}

export default Article
