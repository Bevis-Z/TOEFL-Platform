import { request } from 'umi'

// 获取模考标题列表 ------------------------------------------
export async function getReadingExamTitles(query, options) {
  return request('/console/GetReadingExamTitles', {
    method: 'GET',
    params: query,
    ...(options || {}),
  })
}

export async function getListeningExamTitles(query, options) {
  return request('/console/GetListeningExamTitles', {
    method: 'GET',
    params: query,
    ...(options || {}),
  })
}

export async function getSpeakingExamTitles(query, options) {
  return request('/console/GetSpeakingExamTitles', {
    method: 'GET',
    params: query,
    ...(options || {}),
  })
}

export async function getWritingExamTitles(query, options) {
  return request('/console/GetWritingExamTitles', {
    method: 'GET',
    params: query,
    ...(options || {}),
  })
}

// 获取模考题目 ------------------------------------------------
export async function getReadingExamQuestions(query, options) {
  return request('/console/GetReadingExamQuestions', {
    method: 'GET',
    params: query,
    ...(options || {}),
  })
}

// 获取模考复习和打分数据 ---------------------------------------
export async function getReadingExamPractices(query, options) {
  return request('/console/GetReadingExamPractices', {
    method: 'GET',
    params: query,
    ...(options || {}),
  })
}

// 模考答题接口 -----------------------------------------------
export async function readingMockCommit(body, options) {
  return request('/console/ReadingMockCommit', {
    method: 'POST',
    data: body,
    ...(options || {}),
  })
}

// 删除已做试卷，重新模考前调用 --------------------------------
export async function examRetest(body, options) {
  return request('/console/ExamRetest', {
    method: 'POST',
    data: body,
    ...(options || {}),
  })
}

// 答题记录接口 --------------------------------------------
export async function getExamRecords(query, options) {
  return request('/console/GetExamRecords', {
    method: 'GET',
    params: query,
    ...(options || {}),
  })
}
