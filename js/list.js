// ===== 순차 리스트 메인 구조 =====
class SequentialList {
  constructor(maxSize = 10) {
    this.data = new Array(maxSize).fill(null)
    this.size = 0
    this.maxSize = maxSize
    this.baseAddress = 100
  }
  // insert 연산
  insert(index, value) {
    if (this.size >= this.maxSize) {
      alert('리스트가 가득 찼습니다.')
      return false
    }

    if (index < 0 || index > this.size) {
      alert('잘못된 인덱스입니다.')
      return false
    }

    for (let i = this.size; i > index; i--) {
      this.data[i] = this.data[i - 1]
    }

    this.data[index] = value
    this.size++
    this.updateVisualization()

    this.highlightIndex(index)
    setTimeout(() => {
      this.clearHighlight()
    }, 3000)

    return true
  }

  // delete 연산
  delete(index) {
    if (index < 0 || index >= this.size) {
      alert('잘못된 인덱스입니다.')
      return false
    }

    for (let i = index; i < this.size - 1; i++) {
      this.data[i] = this.data[i + 1]
    }

    this.data[this.size - 1] = null
    this.size--
    this.updateVisualization()

    this.highlightIndex(index)
    setTimeout(() => {
      this.clearHighlight()
    }, 3000)

    return true
  }

  // 검색 기능
  search(value) {
    for (let i = 0; i < this.size; i++) {
      if (this.data[i] === value) {
        this.highlightIndex(i)
        return i
      }
    }
    alert('값을 찾을 수 없습니다.')
    return -1
  }

  // 인덱스 값 가져오기 기능
  get(index) {
    if (index < 0 || index >= this.size) {
      alert('잘못된 인덱스입니다.')
      return null
    }
    this.highlightIndex(index)
    return this.data[index]
  }

  // 시각화 업데이트 함수
  updateVisualization() {
    createMemoryVisualization(this.data, this.baseAddress)

    clearCanvas()

    if (this.size > 0) {
      const visibleData = this.data.slice(0, this.size)
      const boxData = visibleData.map((value, index) => ({
        data: value,
        label: `[${index}]`,
      }))

      createBoxSequence(50, 150, boxData, 'horizontal', 0)
    }
  }

  // 인덱스 강조 함수
  highlightIndex(index) {
    if (index >= 0 && index < this.maxSize) {
      highlightMemoryBlock(this.baseAddress + index)
      highlightBoxAtIndex(index)
    }
  }

  // 하이라이트 해제 함수
  clearHighlight() {
    clearMemoryHighlight()
    clearElementHighlight()
  }

  // 리스트 초기화 함수
  clear() {
    this.data.fill(null)
    this.size = 0
    this.updateVisualization()
    clearMemoryVisualization()
  }
}

// ===== 전역 리스트 인스턴스 생성 =====
let sequentialList = null

// ===== 컨트롤 패널 생성 =====
function createListControls() {
  const controlsPanel = document.getElementById('controls')
  if (!controlsPanel) return

  controlsPanel.innerHTML = `
    <h3>리스트 생성</h3>
    
    <div class="control-group">
      <input type="number" id="list-size-input" placeholder="리스트 크기" min="3" max="15" value="10">
      <button onclick="handleCreateList()">새 리스트 생성</button>
      <button onclick="handleGenerateDemo()">예시 데이터 생성</button>
    </div>
    
    <h3>리스트 연산</h3>
      <div class="control-group">
      <input type="text" id="append-input" placeholder="끝에 추가할 값" maxlength="10">
      <button onclick="handleAppend()" class="btn-gradient btn-green">끝에 추가</button>
    </div>
    
    <div class="control-group">
      <input type="number" id="insert-index" placeholder="인덱스" min="0">
      <input type="text" id="insert-value" placeholder="값" maxlength="10">
      <button onclick="handleInsert()" class="btn-gradient btn-green">Insert (삽입)</button>
    </div>
    
    <div class="control-group">
      <input type="number" id="delete-index" placeholder="삭제할 인덱스" min="0">
      <button onclick="handleDelete()" class="btn-gradient btn-red">Delete (삭제)</button>
    </div>
    
    <div class="control-group">
      <input type="text" id="search-value" placeholder="검색할 값" maxlength="10">
      <button onclick="handleSearch()" class="btn-gradient btn-orange">검색</button>
    </div>
    
    <div class="control-group">
      <input type="number" id="get-index" placeholder="인덱스" min="0">
      <button onclick="handleGet()" class="btn-gradient btn-purple">값 가져오기</button>
    </div>
      <div class="control-group">
      <button onclick="handleClear()" class="btn-gradient btn-pink">리스트 초기화</button>
    </div>
  `
}

// ===== 이벤트 핸들러 함수 =====

// 리스트 생성 핸들러
function handleCreateList() {
  const input = document.getElementById('list-size-input')
  const size = parseInt(input.value)

  if (isNaN(size) || size < 2 || size > 50) {
    alert('리스트 크기는 2~50 사이로 입력해주세요.')
    return
  }

  sequentialList = new SequentialList(size)
  sequentialList.updateVisualization()

  updateInputMaxValues(size - 1)
}

// 예시 리스트 생성 핸들러
function handleGenerateDemo() {
  sequentialList = new SequentialList(8)

  const demoData = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  for (let i = 0; i < demoData.length; i++) {
    sequentialList.insert(sequentialList.size, demoData[i])
  }

  sequentialList.updateVisualization()
  updateInputMaxValues(7)
}

// '끝에 추가' 핸들러
function handleAppend() {
  if (!sequentialList) {
    alert('먼저 리스트를 생성해주세요.')
    return
  }

  const input = document.getElementById('append-input')
  const value = input.value.trim()

  if (!value) {
    alert('값을 입력해주세요.')
    return
  }

  if (sequentialList.insert(sequentialList.size, value)) {
    input.value = ''
  }
}

// Insert 핸들러
function handleInsert() {
  if (!sequentialList) {
    alert('먼저 리스트를 생성해주세요.')
    return
  }

  const indexInput = document.getElementById('insert-index')
  const valueInput = document.getElementById('insert-value')
  const index = parseInt(indexInput.value)
  const value = valueInput.value.trim()

  if (isNaN(index)) {
    alert('인덱스를 입력해주세요.')
    return
  }

  if (!value) {
    alert('값을 입력해주세요.')
    return
  }

  if (sequentialList.insert(index, value)) {
    indexInput.value = ''
    valueInput.value = ''
  }
}

// Delete 핸들러
function handleDelete() {
  if (!sequentialList) {
    alert('먼저 리스트를 생성해주세요.')
    return
  }

  const input = document.getElementById('delete-index')
  const index = parseInt(input.value)

  if (isNaN(index)) {
    alert('인덱스를 입력해주세요.')
    return
  }

  if (sequentialList.delete(index)) {
    input.value = ''
  }
}

// 검색 핸들러
function handleSearch() {
  if (!sequentialList) {
    alert('먼저 리스트를 생성해주세요.')
    return
  }

  const input = document.getElementById('search-value')
  const value = input.value.trim()

  if (!value) {
    alert('검색할 값을 입력해주세요.')
    return
  }

  const index = sequentialList.search(value)
  if (index !== -1) {
    alert(`값 '${value}'을(를) 인덱스 ${index}에서 찾았습니다.`)
  } else {
    sequentialList.clearHighlight()
  }
  input.value = ''
}

// '값 가져오기' 핸들러
function handleGet() {
  if (!sequentialList) {
    alert('먼저 리스트를 생성해주세요.')
    return
  }

  const input = document.getElementById('get-index')
  const index = parseInt(input.value)

  if (isNaN(index)) {
    alert('인덱스를 입력해주세요.')
    return
  }

  const value = sequentialList.get(index)
  if (value !== null) {
    alert(`인덱스 ${index}의 값: '${value}'`)
  } else {
    sequentialList.clearHighlight()
  }
  input.value = ''
}

// 초기화(clear) 핸들러
function handleClear() {
  if (!sequentialList) {
    alert('먼저 리스트를 생성해주세요.')
    return
  }

  if (confirm('리스트를 초기화하시겠습니까?')) {
    sequentialList.clear()
  }
}

// Max값 업데이트 함수
function updateInputMaxValues(maxIndex) {
  const insertIndexInput = document.getElementById('insert-index')
  const deleteIndexInput = document.getElementById('delete-index')
  const getIndexInput = document.getElementById('get-index')

  if (insertIndexInput) insertIndexInput.max = maxIndex
  if (deleteIndexInput) deleteIndexInput.max = maxIndex
  if (getIndexInput) getIndexInput.max = maxIndex
}

// ========== 기본 설정 ==========

// List 초기화 함수
function initializeList() {
  console.log('리스트 초기화 시작')

  // 리스트 초기화
  if (sequentialList) {
    sequentialList.clear()
  }
  sequentialList = null

  // 컨트롤 패널 생성
  createListControls()

  // 초기 시각화 정리
  clearMemoryVisualization()
  clearCanvas()

  console.log('리스트 초기화 완료')
}

// 초기화 함수 실행
initializeList()
