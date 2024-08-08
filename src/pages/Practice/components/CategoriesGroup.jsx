import classNames from 'classnames'
import styles from './CategoriesGroup.less'

const CategoriesGroup = ({ value, onChange, options = [] }) => {
  return (
    <div className={styles.groupWrap}>
      {options.map(({ value: val, label }) => (
        <div
          key={val}
          className={classNames(styles.groupItem, value === val && styles.active)}
          onClick={() => onChange(val)}
        >
          {label}
        </div>
      ))}
    </div>
  )
}

export default CategoriesGroup
