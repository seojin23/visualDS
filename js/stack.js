// ===== 스택 메인 구조 =====
class Stack {
  constructor(maxSize = 10) {
    this.data = new Array(maxSize).fill(null)
    this.top = -1
    this.maxSize = maxSize
    this.baseAddress = 200
  }

  // Push 연산
  push(value) {
    if (this.isFull()) {
      alert('스택이 가득 찼습니다.')
      return false
    }

    this.top++
    this.data[this.top] = value
    this.updateVisualization()

    this.highlightTop()
    setTimeout(() => {
      this.clearHighlight()
    }, 3000)

    return true
  }

  // Pop 연산
  pop() {
    if (this.isEmpty()) {
      alert('스택이 비어있습니다.')
      return null
    }

    const value = this.data[this.top]
    this.data[this.top] = null
    this.top--
    this.updateVisualization()

    this.highlightIndex(this.top + 1)
    setTimeout(() => {
      this.clearHighlight()
    }, 3000)

    return value
  }

  // Peek 연산
  peek() {
    if (this.isEmpty()) {
      alert('스택이 비어있습니다.')
      return null
    }

    this.highlightTop()
    setTimeout(() => {
      this.clearHighlight()
    }, 3000)

    return this.data[this.top]
  }

  // 검색 기능
  search(value) {
    for (let i = this.top; i >= 0; i--) {
      if (this.data[i] === value) {
        this.highlightIndex(i)
        setTimeout(() => {
          this.clearHighlight()
        }, 3000)

        return this.top - i
      }
    }
    alert('값을 찾을 수 없습니다.')
    return -1
  }

  // 스택 상태 반환 함수
  isEmpty() {
    return this.top === -1
  }

  isFull() {
    return this.top >= this.maxSize - 1
  }

  size() {
    return this.top + 1
  }

  // 스택 초기화 함수
  clear() {
    this.data.fill(null)
    this.top = -1
    this.updateVisualization()
    clearMemoryVisualization()
  }

  // 시각화 업데이트 함수
  updateVisualization() {
    createMemoryVisualization(this.data, this.baseAddress)

    clearCanvas()
    if (!this.isEmpty()) {
      const visibleData = []
      for (let i = this.top; i >= 0; i--) {
        visibleData.push({
          data: this.data[i],
          label: i === this.top ? 'TOP' : '', // 최상단 TOP 라벨
        })
      }

      createBoxSequence(300, 100, visibleData, 'vertical', 0)
    }
  }

  // 인덱스 강조 함수
  highlightIndex(index) {
    if (index >= 0 && index < this.maxSize) {
      highlightMemoryBlock(this.baseAddress + index)
      highlightBoxAtIndex(this.top - index)
    }
  }

  // top 요소 강조 함수
  highlightTop() {
    if (!this.isEmpty()) {
      this.highlightIndex(this.top)
    }
  }

  // 하이라이트 해제 함수
  clearHighlight() {
    clearMemoryHighlight()
    clearElementHighlight()
  }
}

// ===== 전역 스택 인스턴스 생성 =====
let stack = null

// ===== 컨트롤 패널 생성 =====
function createStackControls() {
  const controlsPanel = document.getElementById('controls')
  if (!controlsPanel) return

  controlsPanel.innerHTML = `
    <h3>스택 생성</h3>
    
    <div class="control-group">
      <input type="number" id="stack-size-input" placeholder="스택 크기" min="3" max="15" value="10">
      <button onclick="handleCreateStack()">새 스택 생성</button>
      <button onclick="handleGenerateDemo()">예시 데이터 생성</button>
    </div>
    
    <h3>스택 연산</h3>
      <div class="control-group">
      <input type="text" id="push-input" placeholder="추가할 값" maxlength="10">
      <button onclick="handlePush()" class="btn-gradient btn-green">Push (추가)</button>
    </div>

    <div class="control-group">
      <button onclick="handlePop()" class="btn-gradient btn-red">Pop (제거)</button>
      <button onclick="handlePeek()" class="btn-gradient btn-orange">Peek (최상단 확인)</button>
    </div>
    
    <div class="control-group">
      <input type="text" id="search-value" placeholder="검색할 값" maxlength="10">
      <button onclick="handleSearch()" class="btn-gradient btn-purple">검색</button>
      <button onclick="handleClear()" class="btn-gradient btn-pink">스택 초기화</button>
    </div>
  `
}

// ===== 이벤트 핸들러 함수 =====

// 스택 생성 핸들러
function handleCreateStack() {
  const input = document.getElementById('stack-size-input')
  const size = parseInt(input.value)

  if (isNaN(size) || size < 2 || size > 50) {
    alert('스택 크기는 2~50 사이로 입력해주세요.')
    return
  }

  stack = new Stack(size)
  stack.updateVisualization()
}

// 예시 스택 생성 핸들러
function handleGenerateDemo() {
  stack = new Stack(8)

  const demoData = ['A', 'B', 'C', 'D', 'E', 'F']

  for (const value of demoData) {
    stack.push(value)
  }

  stack.updateVisualization()
}

// Push 핸들러
function handlePush() {
  if (!stack) {
    alert('먼저 스택을 생성해주세요.')
    return
  }

  const input = document.getElementById('push-input')
  const value = input.value.trim()

  if (!value) {
    alert('값을 입력해주세요.')
    return
  }

  if (stack.push(value)) {
    input.value = ''
  }
}

// Pop 핸들러
function handlePop() {
  if (!stack) {
    alert('먼저 스택을 생성해주세요.')
    return
  }

  const value = stack.pop()
  if (value !== null) {
    alert(`Pop된 값: '${value}'`)
  }
}

// Peek 핸들러
function handlePeek() {
  if (!stack) {
    alert('먼저 스택을 생성해주세요.')
    return
  }

  const value = stack.peek()
  if (value !== null) {
    alert(`최상단 값: '${value}'`)
  }
}

// 검색 핸들러
function handleSearch() {
  if (!stack) {
    alert('먼저 스택을 생성해주세요.')
    return
  }

  const input = document.getElementById('search-value')
  const value = input.value.trim()

  if (!value) {
    alert('검색할 값을 입력해주세요.')
    return
  }

  const distance = stack.search(value)
  if (distance !== -1) {
    alert(`값 '${value}'을(를) 찾았습니다. (TOP에서 ${distance}번째)`)
  }
  input.value = ''
}

// 초기화(clear) 핸들러
function handleClear() {
  if (!stack) {
    alert('먼저 스택을 생성해주세요.')
    return
  }

  if (confirm('스택을 초기화하시겠습니까?')) {
    stack.clear()
  }
}

// ========== 기본 설정 ==========

// Stack 초기화 함수
function initializeStack() {
  console.log('스택 초기화 시작')

  // 스택 초기화
  if (stack) {
    stack.clear()
  }
  stack = null

  // 컨트롤 패널 생성
  createStackControls()

  // 초기 시각화 정리
  clearMemoryVisualization()
  clearCanvas()

  console.log('스택 초기화 완료')
}

// 초기화 함수 실행
initializeStack()
