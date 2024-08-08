import styles from './MockIntro.less'

const MockIntro = () => {
  return (
    <div className={styles.wrap}>
      <div className={styles.title}>Reading Section Directions</div>
      <p>
        This section measures your ability to understand academic passages in English. You will read
        3 passages. In an actual test you will have 54 minutes to read the passages and answer the
        questions.
      </p>
      <p>
        Most questions are worth 1 point, but the last question in each passage is worth more than 1
        point. The directions indicate how many points you may receive.
      </p>
      <p>
        Some passages include a word or phrase that is underlined in blue. Click on the word of
        phrase to see a definition or an explanation.
      </p>
      <p>
        Within this section, you can go to the next question by click Next. You may skip questions
        and go back later. If you want to return to previous questions, click on Back. You can click
        on Review at any time and the review screen will show you which questions you have answered
        and which you have not answered. From this review screen, you may go directly to any
        question you have already seen in the Reading section.
      </p>
      <p>
        You may now begin the Reading section. In an actual test 54 minutes to read the 3 passages
        and answer the questions. NOTE: Also, in an actual test, some test takers may receive 4
        passages; those test takers will have 72 minutes to answer the questions.
      </p>
      <div>
        Click on <b>Continue</b> to go on.
      </div>
    </div>
  )
}

export default MockIntro
