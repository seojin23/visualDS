// 메인 시각화 엔진

// ========== D3.js 시각화 기능==========
// ========== (1. SVG 생성 및 도형 그리기) ==========

// 시각화 요소 기본 크기 상수
const DEFAULT_BOX_WIDTH = 80
const DEFAULT_BOX_HEIGHT = 50
const DEFAULT_CIRCLE_RADIUS = 25

// SVG 컨테이너
let svgContainer = null
let svgGroup = null
let connectionsGroup = null
let elementsGroup = null
let zoom = null
const SVG_WIDTH = 800
const SVG_HEIGHT = 600

// SVG 초기화 함수
function initializeSVG() {
  const canvasArea = document.querySelector('.canvas-area')

  // SVG 생성
  d3.select('.canvas-area svg').remove()

  svgContainer = d3
    .select('.canvas-area')
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', `0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`)
    .style('border', '1px solid #ddd')
    .style('border-radius', '8px')
    .style('background-color', '#ffffff')

  // 줌 기능 설정
  zoom = d3
    .zoom()
    .scaleExtent([0.5, 3])
    .on('zoom', function (event) {
      svgGroup.attr('transform', event.transform)
    })

  svgContainer.call(zoom)
  // 메인 그룹 생성
  svgGroup = svgContainer.append('g').attr('class', 'main-group')

  // 연결선 그룹
  connectionsGroup = svgGroup.append('g').attr('class', 'connections-layer')

  // 요소 그룹
  elementsGroup = svgGroup.append('g').attr('class', 'elements-layer')
}

// 박스 생성 함수
function createBox(x, y, data = '', label = '', options = {}) {
  if (!svgGroup || !elementsGroup) {
    initializeSVG()
  }

  const boxGroup = elementsGroup
    .append('g')
    .attr('class', 'box-element')
    .attr('transform', `translate(${x}, ${y})`)

  // 박스 배경
  boxGroup
    .append('rect')
    .attr('width', DEFAULT_BOX_WIDTH)
    .attr('height', DEFAULT_BOX_HEIGHT)
    .attr('fill', options.fillColor || 'white')
    .attr('stroke', options.strokeColor || 'black')
    .attr('stroke-width', options.strokeWidth || 2)
    .style('cursor', 'pointer')

  // 상단 라벨
  if (label) {
    boxGroup
      .append('text')
      .attr('x', DEFAULT_BOX_WIDTH / 2)
      .attr('y', -8)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', options.labelColor || '#666')
      .text(label)
  }

  // 내부 텍스트
  if (data) {
    boxGroup
      .append('text')
      .attr('x', DEFAULT_BOX_WIDTH / 2)
      .attr('y', DEFAULT_BOX_HEIGHT / 2 + 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', options.fontSize || '14px')
      .attr('font-weight', options.fontWeight || 'normal')
      .attr('fill', options.textColor || '#333')
      .text(data)
  }

  return boxGroup
}

// 원 생성 함수
function createCircle(x, y, data = '', options = {}) {
  if (!svgGroup) initializeSVG()

  const circleGroup = elementsGroup
    .append('g')
    .attr('class', 'circle-element')
    .attr('transform', `translate(${x}, ${y})`)

  // 원 배경
  circleGroup
    .append('circle')
    .attr('r', DEFAULT_CIRCLE_RADIUS)
    .attr('fill', options.fillColor || 'white')
    .attr('stroke', options.strokeColor || 'black')
    .attr('stroke-width', options.strokeWidth || 2)
    .style('cursor', 'pointer')

  // 내부 텍스트
  if (data) {
    circleGroup
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', options.fontSize || '14px')
      .attr('font-weight', options.fontWeight || 'normal')
      .attr('fill', options.textColor || '#333')
      .text(data)
  }

  return circleGroup
}

// 박스 연속 생성 함수
function createBoxSequence(
  startX,
  startY,
  dataArray,
  direction = 'horizontal',
  spacing = 0,
  options = {}
) {
  if (!svgGroup) initializeSVG()

  const sequenceGroup = elementsGroup.append('g').attr('class', 'box-sequence')

  const boxes = []
  dataArray.forEach((item, index) => {
    let x, y

    if (direction === 'horizontal') {
      x = startX + index * (DEFAULT_BOX_WIDTH + spacing)
      y = startY
    } else {
      // (vertical)
      x = startX
      y = startY + index * (DEFAULT_BOX_HEIGHT + spacing)
    }

    const data = typeof item === 'object' ? item.data : item
    const label = typeof item === 'object' ? item.label : `[${index}]`

    const box = createBox(x, y, data, label, options)
    boxes.push({
      element: box,
      x: x,
      y: y,
      index: index,
      data: data,
    })
  })

  return {
    group: sequenceGroup,
    boxes: boxes,
  }
}

// 연결선 생성 함수
function createConnection(fromElement, toElement, options = {}) {
  if (!svgGroup) initializeSVG()
  // 요소의 중심점 계산 함수
  function getElementCenter(element) {
    const transform = element.attr('transform')
    const coords = getTransformCoords(transform)

    // 박스 또는 원에 따라 다른 방식 적용
    const isCircle = element.classed('circle-element')

    if (isCircle) {
      // 원: transform의 translate 좌표를 그대로 중심점으로 사용
      return {
        x: coords.x,
        y: coords.y,
      }
    } else {
      // 박스: 라벨 텍스트 제외하고 순수 사각형 부분만
      const rect = element.select('rect')
      const width = parseFloat(rect.attr('width')) || 80
      const height = parseFloat(rect.attr('height')) || 50
      return {
        x: coords.x + width / 2,
        y: coords.y + height / 2,
      }
    }
  }

  // 시작요소와 끝요소의 중심점 계산
  const fromCenter = getElementCenter(fromElement)
  const toCenter = getElementCenter(toElement)

  // 연결선 그룹 생성 (connectionsGroup에 추가)
  const connectionGroup = connectionsGroup
    .append('g')
    .attr('class', 'connection-element')

  // 연결선 데이터 생성
  const pathData = `M ${fromCenter.x} ${fromCenter.y} L ${toCenter.x} ${toCenter.y}`

  // 연결선 그리기
  connectionGroup
    .append('path')
    .attr('d', pathData)
    .attr('stroke', options.strokeColor || 'black')
    .attr('stroke-width', options.strokeWidth || 2)
    .attr('fill', 'none')

  // 연결선 라벨 처리
  if (options.label) {
    const labelX = (fromCenter.x + toCenter.x) / 2
    const labelY = (fromCenter.y + toCenter.y) / 2 - 10

    connectionGroup
      .append('text')
      .attr('x', labelX)
      .attr('y', labelY)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', options.labelColor || '#666')
      .attr('background', 'white')
      .text(options.label)
  }

  return connectionGroup
}

// 요소 좌표 추출 함수
function getTransformCoords(transformStr) {
  if (!transformStr) return { x: 0, y: 0 }

  const match = transformStr.match(/translate\(([^,]+),([^)]+)\)/)
  if (match) {
    return {
      x: parseFloat(match[1]),
      y: parseFloat(match[2]),
    }
  }
  return { x: 0, y: 0 }
}

// 박스 하이라이트 함수
function highlightBoxAtIndex(index) {
  clearElementHighlight()

  const boxes = elementsGroup.selectAll('.box-element')
  boxes.each(function (d, i) {
    if (i === index) {
      const box = d3.select(this)
      box.classed('highlighted', true)

      box.select('rect').attr('fill', '#ffe415')
    }
  })
}

// 원 하이라이트 함수
function highlightCircleAtPosition(targetX, targetY, tolerance = 5) {
  clearElementHighlight()

  const circles = elementsGroup.selectAll('.circle-element')
  circles.each(function (d, i) {
    const circle = d3.select(this)
    const transform = circle.attr('transform')
    const coords = getTransformCoords(transform)

    // 좌표 일치 확인 (오차 범위 적용)
    if (
      Math.abs(coords.x - targetX) <= tolerance &&
      Math.abs(coords.y - targetY) <= tolerance
    ) {
      circle.classed('highlighted', true)

      circle.select('circle').attr('fill', '#ffe415')
    }
  })
}

// 요소 하이라이트 해제
function clearElementHighlight() {
  if (elementsGroup) {
    // 박스
    elementsGroup.selectAll('.box-element').classed('highlighted', false)
    elementsGroup
      .selectAll('.box-element rect')
      .attr('fill', 'white')
      .attr('stroke', 'black')
      .attr('stroke-width', 2)

    // 원
    elementsGroup.selectAll('.circle-element').classed('highlighted', false)
    elementsGroup
      .selectAll('.circle-element circle')
      .attr('fill', 'white')
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
  }
}

// 캔버스 전체 지우기 함수
function clearCanvas() {
  if (connectionsGroup) {
    connectionsGroup.selectAll('*').remove()
  }
  if (elementsGroup) {
    elementsGroup.selectAll('*').remove()
  }
}

// ========== D3.js 시각화 기능 ==========
// ========== (2. 시점 초기화 기능) ==========

// 캔버스 중앙 이동 함수
function resetCanvasView() {
  if (!svgContainer || !zoom || !elementsGroup) {
    return
  }

  // 캔버스 사용영역 계산
  const boundingBox = getElementsBoundingBox()

  if (!boundingBox) {
    // 요소가 없을 경우 중앙으로 이동
    svgContainer
      .transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity)
    return
  }

  // 줌 레벨, 중심점 계산
  const { scale, translateX, translateY } = calculateOptimalView(boundingBox)

  const transform = d3.zoomIdentity
    .translate(translateX, translateY)
    .scale(scale)

  svgContainer.transition().duration(750).call(zoom.transform, transform)
}

// 모든 시각화 요소들의 경계 박스 계산 함수
function getElementsBoundingBox() {
  if (!elementsGroup) return null

  const allElements = elementsGroup.selectAll('.box-element, .circle-element')

  if (allElements.empty()) return null

  let minX = Infinity,
    minY = Infinity
  let maxX = -Infinity,
    maxY = -Infinity

  allElements.each(function () {
    const element = d3.select(this)
    const transform = element.attr('transform')
    const coords = getTransformCoords(transform)

    if (element.classed('box-element')) {
      // 박스
      const rect = element.select('rect')
      const width = parseFloat(rect.attr('width')) || DEFAULT_BOX_WIDTH
      const height = parseFloat(rect.attr('height')) || DEFAULT_BOX_HEIGHT

      minX = Math.min(minX, coords.x)
      minY = Math.min(minY, coords.y)
      maxX = Math.max(maxX, coords.x + width)
      maxY = Math.max(maxY, coords.y + height)
    } else if (element.classed('circle-element')) {
      // 원
      const circle = element.select('circle')
      const radius = parseFloat(circle.attr('r')) || DEFAULT_CIRCLE_RADIUS

      minX = Math.min(minX, coords.x - radius)
      minY = Math.min(minY, coords.y - radius)
      maxX = Math.max(maxX, coords.x + radius)
      maxY = Math.max(maxY, coords.y + radius)
    }
  })

  if (minX === Infinity) return null

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  }
}

// 시점 계산 함수
function calculateOptimalView(boundingBox) {
  const padding = 50 // 최소 여백 설정
  const svgWidth = SVG_WIDTH
  const svgHeight = SVG_HEIGHT

  const scaleX = (svgWidth - padding * 2) / boundingBox.width
  const scaleY = (svgHeight - padding * 2) / boundingBox.height

  // X, Y축 중 최소값 적용
  let scale = Math.min(scaleX, scaleY)

  // 줌 범위 제한 적용
  scale = Math.max(0.5, Math.min(3, scale))

  // SVG 중심으로 이동하기 위한 변환 계산
  const svgCenterX = svgWidth / 2
  const svgCenterY = svgHeight / 2

  const translateX = svgCenterX - boundingBox.centerX * scale
  const translateY = svgCenterY - boundingBox.centerY * scale

  return { scale, translateX, translateY }
}

// ========== 메모리 시각화 기능 ==========

// 메모리 블록 생성 함수
function createMemoryVisualization(dataArray, startAddress = 100) {
  const memoryView = document.getElementById('memory-view')
  if (!memoryView) return

  // 기존 메모리 블록 초기화
  memoryView.innerHTML = ''

  // 메모리 컨테이너 생성
  const memoryContainer = document.createElement('div')
  memoryContainer.className = 'memory-container'
  memoryView.appendChild(memoryContainer)

  // 각 데이터에 대해 메모리 블록 생성
  dataArray.forEach((data, index) => {
    const memoryBlock = document.createElement('div')
    memoryBlock.className = 'memory-block'
    memoryBlock.setAttribute('data-address', startAddress + index)

    // 상단 라벨 (가상 주소 표시용)
    const addressLabel = document.createElement('div')
    addressLabel.className = 'memory-address'
    addressLabel.textContent = startAddress + index
    memoryBlock.appendChild(addressLabel)

    // 데이터 영역
    const dataContent = document.createElement('div')
    dataContent.className = 'memory-data'
    dataContent.textContent = data || ''
    memoryBlock.appendChild(dataContent)

    memoryContainer.appendChild(memoryBlock)
  })
}

// 메모리 블록 업데이트 함수
function updateMemoryBlock(address, data) {
  const memoryBlock = document.querySelector(`[data-address="${address}"]`)
  if (memoryBlock) {
    const dataContent = memoryBlock.querySelector('.memory-data')
    if (dataContent) {
      dataContent.textContent = data
    }
  }
}

// 메모리 블록 하이라이트 제거 함수
function clearMemoryHighlight() {
  document.querySelectorAll('.memory-block').forEach((block) => {
    block.classList.remove('highlight')
  })
}

// 메모리 블록 강조 함수
function highlightMemoryBlock(address) {
  // 기존 강조 제거
  clearMemoryHighlight()

  // 새로운 강조 추가
  const memoryBlock = document.querySelector(`[data-address="${address}"]`)
  if (memoryBlock) {
    memoryBlock.classList.add('highlight')
  }
}

// 메모리 시각화 초기화 함수
function clearMemoryVisualization() {
  const memoryView = document.getElementById('memory-view')
  if (memoryView) {
    memoryView.innerHTML = ''
  }
}

// ========== 기본 설정 ==========

// 페이지 로드 시 SVG 초기화
document.addEventListener('DOMContentLoaded', function () {
  // SVG 초기화
  setTimeout(() => {
    initializeSVG()
  }, 100)
})

// 함수 전역 등록
window.createBox = createBox
window.createCircle = createCircle
window.createBoxSequence = createBoxSequence
window.createConnection = createConnection
window.createMemoryVisualization = createMemoryVisualization
window.updateMemoryBlock = updateMemoryBlock
window.highlightMemoryBlock = highlightMemoryBlock
window.clearMemoryHighlight = clearMemoryHighlight
window.highlightBoxAtIndex = highlightBoxAtIndex
window.clearElementHighlight = clearElementHighlight
window.highlightCircleAtPosition = highlightCircleAtPosition
window.clearMemoryVisualization = clearMemoryVisualization
window.clearCanvas = clearCanvas
window.resetCanvasView = resetCanvasView

// ===============개발용 테스트 함수======================

// function testBoxes() {
//   if (!svgContainer) {
//     initializeSVG()
//   }

//   clearCanvas()

//   createBox(100, 100, '10', '[0]')
//   createBox(200, 100, '20', '[1]')
//   createBox(300, 100, '30', '[2]')

//   createBoxSequence(100, 200, ['A', 'B', 'C', 'D'], 'horizontal')

//   createBoxSequence(
//     500,
//     100,
//     [{ data: '1' }, { data: '2' }, { data: '3' }],
//     'vertical'
//   )
// }

// function testCircles() {
//   clearCanvas()

//   const circle1 = createCircle(150, 150, '5')
//   const circle2 = createCircle(300, 150, '10')
//   const circle3 = createCircle(450, 150, '15')

//   setTimeout(() => {
//     createConnection(circle1, circle2, { label: 'next' })
//     createConnection(circle2, circle3, { label: 'next' })
//   }, 100)
// }

// function testLines() {
//   clearCanvas()

//   const box1 = createBox(100, 100, 'Box1', 'start')
//   const box2 = createBox(300, 200, 'Box2', 'end')
//   const circle1 = createCircle(200, 300, 'C1')

//   setTimeout(() => {
//     createConnection(box1, box2, { label: 'direct' })
//     createConnection(box1, circle1, {
//       label: 'to circle',
//       strokeColor: '#4caf50',
//     })
//     createConnection(circle1, box2, { strokeColor: '#9c27b0' })
//   }, 100)
// }

// function testMemory() {
//   const testData = [
//     'A',
//     'B',
//     'C',
//     '',
//     'E',
//     'F',
//     '',
//     'H',
//     '111',
//     '111',
//     '111',
//     '111',
//     '111',
//     '111',
//     '111',
//     '111',
//     '111',
//     '111',
//     '111',
//     '111',
//     '111',
//     '111',
//     '111',
//     '111',
//     '111',
//     '111',
//     '111',
//     '111',
//     '111',
//     '111',
//   ]
//   createMemoryVisualization(testData, 100)

//   // 3초 후 특정 블록 업데이트 및 강조
//   setTimeout(() => {
//     updateMemoryBlock(103, 'D')
//     highlightMemoryBlock(103)
//   }, 1500)
//   setTimeout(() => {
//     updateMemoryBlock(106, 'G')
//     highlightMemoryBlock(106)
//   }, 3000)
// }
