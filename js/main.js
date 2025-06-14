function goToVisualization(dataType) {
  window.location.href = `/pages/visualization.html?type=${dataType}`
}

window.addEventListener('load', function () {
  initializeApp()
})

async function initializeApp() {
  // URL 파라미터 타입 읽기
  const urlParams = new URLSearchParams(window.location.search)
  const dataType = urlParams.get('type')
  console.log('자료구조:', dataType)

  // 자료구조별 JS 파일 동적 로드
  if (dataType) {
    await loadDataStructureScript(dataType)
  }

  // 페이지 제목 업데이트
  if (dataType) {
    const typeNames = {
      list: '리스트',
      stack: '스택',
      queue: '큐',
      tree: '트리',
      graph: '그래프',
    }
    const pageTitleElement = document.getElementById('page-title')
    if (pageTitleElement && typeNames[dataType]) {
      pageTitleElement.textContent = `${typeNames[dataType]} 시각화`
    }
  }
}

function loadDataStructureScript(dataType) {
  return new Promise((resolve, reject) => {
    if (!dataType) {
      resolve()
      return
    }

    const scriptPath = `/js/${dataType}.js`

    // 이미 로드되었는지 확인
    const existingScript = document.querySelector(`script[src="${scriptPath}"]`)
    if (existingScript) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = scriptPath
    script.onload = () => {
      console.log(`${dataType}.js 로드 완료`)
      resolve()
    }
    script.onerror = () => {
      console.warn(`${dataType}.js 로드 실패: ${scriptPath}`)
      resolve()
    }

    document.head.appendChild(script)
  })
}
