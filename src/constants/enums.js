// 阅读/听力 小题题型枚举
export const QUESTION_TYPE = {
  OneWay: 'OneWay',
  Insert: 'Insert',
  Drag: 'Drag',
  Many: 'Many',
  Sequencing: 'Sequencing',
  Judge: 'Judge',
}

// 口语类型枚举
export const SPEAK_TYPE = {
  C: 'C', // 独立口语
  A: 'A', // 综A口语
  B: 'B', // 综B口语
}

// 试卷状态枚举
export const STATUS_TYPE = {
  Initial: 'Initial', // 试卷初始状态
  Submited: 'Submited', // 试卷已提交
  Again: 'Again', // 点击了重新练习 但未答题就退出 后端删除了对应试卷表数据
  Progressing: 'Progressing', // 做题时中途退出 继续练习状态
}
