// ===== 순차 이진 트리 메인 구조 =====
class SequentialBinaryTree {
  constructor(maxSize = 15) {
    this.data = new Array(maxSize).fill(null)
    this.maxSize = maxSize
    this.nodeCount = 0
    this.baseAddress = 300
  }

  // 왼쪽 자식 노드 인덱스 계산 함수
  getLeftChildIndex(index) {
    return index * 2
  }

  // 오른쪽 자식 노드 인덱스 계산 함수
  getRightChildIndex(index) {
    return index * 2 + 1
  }
  // 노드 삽입 연산
  insert(value) {
    for (let i = 1; i < this.maxSize; i++) {
      if (this.data[i] === null) {
        this.data[i] = value
        this.nodeCount++
        this.updateVisualization()
        this.highlightIndex(i)

        setTimeout(() => {
          this.clearHighlight()
        }, 3000)

        return true
      }
    }

    alert('트리가 가득 찼습니다.')
    return false
  }

  // 노드 검색 기능
  search(value) {
    for (let i = 1; i < this.maxSize; i++) {
      if (this.data[i] === value) {
        this.highlightIndex(i)

        setTimeout(() => {
          this.clearHighlight()
        }, 3000)

        return i
      }
    }

    alert('값을 찾을 수 없습니다.')
    return -1
  }

  // 노드 삭제 연산
  delete(index) {
    if (index < 1 || index >= this.maxSize || this.data[index] === null) {
      alert('잘못된 인덱스이거나 빈 노드입니다.')
      return false
    }

    this.data[index] = null
    this.nodeCount--
    this.updateVisualization()

    // 삭제된 위치 하이라이트
    this.highlightIndex(index)

    setTimeout(() => {
      this.clearHighlight()
    }, 3000)

    return true
  }

  // 트리 최대 깊이 계산 함수
  getMaxDepth() {
    let maxDepth = 0
    for (let i = 1; i < this.maxSize; i++) {
      if (this.data[i] !== null) {
        const depth = Math.floor(Math.log2(i)) + 1
        maxDepth = Math.max(maxDepth, depth)
      }
    }
    return maxDepth
  }

  // 노드 위치 계산 함수
  calculateNodePositions() {
    const positions = []
    const startX = 400
    const startY = 80
    const levelHeight = 80 // 레벨 간 간격
    const minNodeSpacing = 80 // 노드 간 최소 간격

    // 최대 깊이 계산
    const maxDepth = this.getMaxDepth()
    if (maxDepth === 0) return positions

    // 마지막 레벨의 최대 노드 수 기반 너비 계산
    const maxNodesInLastLevel = Math.pow(2, maxDepth - 1)
    const totalWidth = maxNodesInLastLevel * minNodeSpacing

    for (let i = 1; i < this.maxSize; i++) {
      if (this.data[i] !== null) {
        const level = Math.floor(Math.log2(i)) // 현재 레벨
        const positionInLevel = i - Math.pow(2, level) // 레벨 내 위치
        const nodesInCurrentLevel = Math.pow(2, level) // 현재 레벨 노드 수

        const levelSpacing = totalWidth / nodesInCurrentLevel

        const levelStartX = startX - totalWidth / 2 + levelSpacing / 2

        const x = levelStartX + positionInLevel * levelSpacing
        const y = startY + level * levelHeight

        positions.push({
          index: i,
          value: this.data[i],
          x: x,
          y: y,
          level: level,
        })
      }
    }

    return positions
  }

  // 시각화 업데이트 함수
  updateVisualization() {
    createMemoryVisualization(this.data, this.baseAddress)

    clearCanvas()

    if (this.nodeCount === 0) return

    const positions = this.calculateNodePositions()

    positions.forEach((pos) => {
      const { index, x, y } = pos

      // 왼쪽 자식 노드 연결
      const leftChildIndex = this.getLeftChildIndex(index)
      if (leftChildIndex < this.maxSize && this.data[leftChildIndex] !== null) {
        const leftChildPos = positions.find((p) => p.index === leftChildIndex)
        if (leftChildPos) {
          createTreeConnection(
            { x, y },
            { x: leftChildPos.x, y: leftChildPos.y }
          )
        }
      }

      // 오른쪽 자식 노드 연결
      const rightChildIndex = this.getRightChildIndex(index)
      if (
        rightChildIndex < this.maxSize &&
        this.data[rightChildIndex] !== null
      ) {
        const rightChildPos = positions.find((p) => p.index === rightChildIndex)
        if (rightChildPos) {
          createTreeConnection(
            { x, y },
            { x: rightChildPos.x, y: rightChildPos.y }
          )
        }
      }
    })

    positions.forEach((pos) => {
      const { index, value, x, y } = pos
      createCircle(x, y, value)
    })
  }

  // 인덱스 강조 함수
  highlightIndex(index) {
    if (index >= 0 && index < this.maxSize) {
      highlightMemoryBlock(this.baseAddress + index)

      if (this.data[index] !== null) {
        const positions = this.calculateNodePositions()
        const targetPos = positions.find((pos) => pos.index === index)
        if (targetPos) {
          highlightCircleAtPosition(targetPos.x, targetPos.y)
        }
      }
    }
  }

  // 하이라이트 해제 함수
  clearHighlight() {
    clearMemoryHighlight()
    clearElementHighlight()
  }

  // 트리 초기화 함수
  clear() {
    this.data.fill(null)
    this.nodeCount = 0
    this.updateVisualization()
    clearMemoryVisualization()
  }
}

// 트리 연결선 생성 함수
function createTreeConnection(fromPos, toPos, options = {}) {
  if (!svgGroup) initializeSVG()

  // 연결선 그룹 생성
  const connectionGroup = connectionsGroup
    .append('g')
    .attr('class', 'connection-element')

  // 직선 연결선 데이터 생성
  const pathData = `M ${fromPos.x} ${fromPos.y} L ${toPos.x} ${toPos.y}`

  // 연결선 그리기
  connectionGroup
    .append('path')
    .attr('d', pathData)
    .attr('stroke', options.strokeColor || '#666')
    .attr('stroke-width', options.strokeWidth || 2)
    .attr('fill', 'none')

  return connectionGroup
}

// ===== 전역 트리 인스턴스 생성 =====
let sequentialBinaryTree = null

// ===== 컨트롤 패널 생성 =====
function createTreeControls() {
  const controlsPanel = document.getElementById('controls')
  if (!controlsPanel) return

  controlsPanel.innerHTML = `
    <h3>트리 생성</h3>
    
    <div class="control-group">
      <input type="number" id="tree-size-input" placeholder="트리 크기" min="7" max="31" value="15">
      <button onclick="handleCreateTree()">새 트리 생성</button>
      <button onclick="handleGenerateDemo()">예시 데이터 생성</button>
    </div>
    
    <h3>트리 연산</h3>
      <div class="control-group">
      <input type="text" id="insert-input" placeholder="삽입할 값" maxlength="10">
      <button onclick="handleInsert()" class="btn-gradient btn-green">노드 삽입</button>
    </div>
    
    <div class="control-group">
      <input type="text" id="search-input" placeholder="검색할 값" maxlength="10">
      <button onclick="handleSearch()" class="btn-gradient btn-orange">노드 검색</button>
    </div>
    
    <div class="control-group">
      <input type="number" id="delete-input" placeholder="삭제할 인덱스" min="1">
      <button onclick="handleDelete()" class="btn-gradient btn-red">노드 삭제</button>
    </div>
    
    <div class="control-group">
      <button onclick="handleClear()" class="btn-gradient btn-pink">트리 초기화</button>
    </div>
  `
}

// ===== 이벤트 핸들러 함수 =====

// 트리 생성 핸들러
function handleCreateTree() {
  const input = document.getElementById('tree-size-input')
  const size = parseInt(input.value)

  if (isNaN(size) || size < 2 || size > 50) {
    alert('트리 크기는 2~50 사이로 입력해주세요.')
    return
  }

  // 새 트리 생성
  sequentialBinaryTree = new SequentialBinaryTree(size)
  sequentialBinaryTree.updateVisualization()
}

// 예시 트리 생성 핸들러
function handleGenerateDemo() {
  sequentialBinaryTree = new SequentialBinaryTree(15)

  const demoData = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

  for (const value of demoData) {
    sequentialBinaryTree.insert(value)
  }

  sequentialBinaryTree.clearHighlight()
}

// 노드 삽입 핸들러
function handleInsert() {
  if (!sequentialBinaryTree) {
    alert('먼저 트리를 생성해주세요.')
    return
  }

  const input = document.getElementById('insert-input')
  const value = input.value.trim()

  if (!value) {
    alert('삽입할 값을 입력해주세요.')
    return
  }

  if (sequentialBinaryTree.insert(value)) {
    input.value = ''
  }
}

// 노드 검색 핸들러
function handleSearch() {
  if (!sequentialBinaryTree) {
    alert('먼저 트리를 생성해주세요.')
    return
  }

  const input = document.getElementById('search-input')
  const value = input.value.trim()

  if (!value) {
    alert('검색할 값을 입력해주세요.')
    return
  }

  const result = sequentialBinaryTree.search(value)
  if (result !== -1) {
    alert(`값 '${value}'을(를) 인덱스 [${result}]에서 찾았습니다.`)
  }
  input.value = ''
}

// 노드 삭제 핸들러
function handleDelete() {
  if (!sequentialBinaryTree) {
    alert('먼저 트리를 생성해주세요.')
    return
  }

  const input = document.getElementById('delete-input')
  const index = parseInt(input.value)

  if (isNaN(index) || index < 1) {
    alert('올바른 인덱스를 입력해주세요. (1 이상)')
    return
  }

  if (sequentialBinaryTree.delete(index)) {
    input.value = ''
    alert(`인덱스 [${index}]의 노드가 삭제되었습니다.`)
  }
}

// 트리 초기화 핸들러
function handleClear() {
  if (!sequentialBinaryTree) {
    alert('먼저 트리를 생성해주세요.')
    return
  }

  if (confirm('트리를 초기화하시겠습니까?')) {
    sequentialBinaryTree.clear()
  }
}

// ===== 기본 설정 =====

// Tree 초기화 함수
function initializeTree() {
  console.log('트리 초기화 시작')
  // 트리 초기화
  if (sequentialBinaryTree) {
    sequentialBinaryTree.clear()
  }
  sequentialBinaryTree = null

  // 컨트롤 패널 생성
  createTreeControls()

  // 초기 시각화 정리
  clearMemoryVisualization()
  clearCanvas()

  console.log('트리 초기화 완료')
}

// 초기화 함수 실행
initializeTree()
