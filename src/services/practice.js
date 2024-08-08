import { request } from 'umi'

// 获取分类 -------------------------------------------
export async function getCategories(query, options) {
  return request('/console/GetCategories', {
    method: 'GET',
    params: query,
    ...(options || {}),
  })
}

// 获取标题列表 ------------------------------------------
export async function getReadingTitles(query, options) {
  return request('/console/GetReadingTitles', {
    method: 'GET',
    params: query,
    ...(options || {}),
  })
}

export async function getListeningTitles(query, options) {
  return request('/console/GetListeningTitles', {
    method: 'GET',
    params: query,
    ...(options || {}),
  })
}

export async function getSpeakingTitles(query, options) {
  return request('/console/GetSpeakingTitles', {
    method: 'GET',
    params: query,
    ...(options || {}),
  })
}

export async function getWritingTitles(query, options) {
  return request('/console/GetWritingTitles', {
    method: 'GET',
    params: query,
    ...(options || {}),
  })
}

// 获取题目 ------------------------------------------------
export async function getReadingQuestions(query, options) {
  return request('/console/GetReadingQuestions', {
    method: 'GET',
    params: query,
    ...(options || {}),
  })
}

export async function getListeningQuestions(query, options) {
  return request('/console/GetListeningQuestions', {
    method: 'GET',
    params: query,
    ...(options || {}),
  })
}

export async function getSpeakingQuestions(query, options) {
  return request('/console/GetSpeakingQuestions', {
    method: 'GET',
    params: query,
    ...(options || {}),
  })
}

export async function getWritingQuestions(query, options) {
  return request('/console/GetWritingQuestions', {
    method: 'GET',
    params: query,
    ...(options || {}),
  })
}

// 答题接口 -----------------------------------------------
export async function readingPracticeExam(body, options) {
  return request('/console/ReadingPracticeExam', {
    method: 'POST',
    data: body,
    ...(options || {}),
  })
}

export async function listeningPracticeExam(body, options) {
  return request('/console/ListeningPracticeExam', {
    method: 'POST',
    data: body,
    ...(options || {}),
  })
}

export async function speakingPracticeExam(body, options) {
  return request('/console/SpeakingPracticeExam', {
    method: 'POST',
    data: body,
    ...(options || {}),
  })
}

export async function WritingPracticeExam(body, options) {
  return request('/console/WritingPracticeExam', {
    method: 'POST',
    data: body,
    ...(options || {}),
  })
}

// 删除已做试卷，重新刷题前调用 --------------------------
export async function retest(body, options) {
  return request('/console/Retest', {
    method: 'POST',
    data: body,
    ...(options || {}),
  })
}

// 获取复习 -------------------------------------------
export async function getReadingPractices(query, options) {
  return request('/console/GetReadingPractices', {
    method: 'GET',
    params: query,
    ...(options || {}),
  })
}

export async function getListeningPractices(query, options) {
  return request('/console/GetListeningPractices', {
    method: 'GET',
    params: query,
    ...(options || {}),
  })
}

export async function getSpeakingPractices(query, options) {
  return request('/console/GetSpeakingPractices', {
    method: 'GET',
    params: query,
    ...(options || {}),
  })
}

export async function getWritingPractices(query, options) {
  return request('/console/GetWritingPractices', {
    method: 'GET',
    params: query,
    ...(options || {}),
  })
}

// 获取这道题的答题记录 --------------------------------------
// 阅读/听力 共用一个答题记录接口
export async function getPracticeRecords(query, options) {
  return request('/console/GetPracticeRecords', {
    method: 'GET',
    params: query,
    ...(options || {}),
  })
}

// 写作 答题记录接口
export async function getWritingPracticeRecords(query, options) {
  return request('/console/GetWritingPracticeRecords', {
    method: 'GET',
    params: query,
    ...(options || {}),
  })
}

// 口语 答题记录接口
export async function getSpeakingPracticeRecords(query, options) {
  return request('/console/GetSpeakingPracticeRecords', {
    method: 'GET',
    params: query,
    ...(options || {}),
  })
}

// 上传口语录音mp3到阿里云OSS
export async function uploadSpeakingAudio(body, options) {
  return request('/console/UploadSpeakingAudio', {
    method: 'POST',
    data: body,
    ...(options || {}),
  })
}

// 获取错题列表
export async function getWrongQuestions(query, options) {
  return request('/console/GetWrongQuestions', {
    method: 'GET',
    params: query,
    ...(options || {}),
  })
}
