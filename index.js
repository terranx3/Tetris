const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const board = [];
const bgm = document.createElement('audio');
const breakSound = document.createElement('audio');
const drop = document.createElement('audio');
let rotatedShape;

let score = 0;
let level = 1;
let linesCleared = 0;
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');

bgm.setAttribute("src", "./assets/bgm.mp3");
bgm.muted = true;

breakSound.setAttribute("src", "./assets/break.mp3");
breakSound.muted = true;

drop.setAttribute("src", "./assets/drop.mp3");
drop.muted = true;

for(let row = 0; row < BOARD_HEIGHT; row++) {
    board[row] = [];
    for(let col = 0; col < BOARD_WIDTH; col++) {
        board[row][col] = 0;
    }
}

const tetrominoes = [
    {
        shape : [
            [1, 1],
            [1, 1]
        ],
        color:'#ffd800',
    },
    {
        shape:[
            [0, 2, 0],
            [2, 2, 2]
        ],
        color: '#7925dd',
    },
    {
        shape : [
            [0, 3, 3],
            [3, 3, 0]
        ],
        color: 'orange',
    },
    {
        shape : [
            [4, 4, 0],
            [0, 4, 4]
        ],
        color: 'red',
    },
    {
        shape : [
            [5, 0, 0],
            [5, 5, 5]
        ],
        color: 'green',
    },
    {
        shape: [
            [0, 0, 6],
            [6, 6, 6]
        ],
        color: '#ff6400',
    },
    {
        shape :[[7, 7, 7, 7]],
        color:'#00b5ff',
    },
];

/**
 * 랜덤한 테트로미노를 생성합니다.
 * @returns {Object} 랜덤 테트로미노 객체
 */
function randomTetromino() {
    const index = Math.floor(Math.random() * tetrominoes.length);
    const tetromino = tetrominoes[index];
    return {
        shape : tetromino.shape,
        color : tetromino.color,
        row: 0,
        col : Math.floor(Math.random() * (BOARD_WIDTH - tetromino.shape[0].length +1))
    }; 
}

let currentTetromino = randomTetromino();
let currentGhostTetromino;

/**
 * 현재 테트로미노를 그립니다.
 */
function drawTetromino() {
    const shape = currentTetromino.shape;
    const color = currentTetromino.color;
    const row = currentTetromino.row;
    const col = currentTetromino.col;

    for(let r = 0; r < shape.length; r++) {
        for(let c = 0; c < shape[r].length; c++) {
            if(shape[r][c]) {
                const block = document.createElement("div");
                block.classList.add("block");
                block.style.backgroundColor = color;
                block.style.top = (row + r) * 24 + "px";
                block.style.left = (col + c) * 24 + "px";
                block.setAttribute("id", `block-${row + r}-${col + c}`);
                document.getElementById("game_board").appendChild(block);
            }
        }
    }
}

/**
 * 현재 테트로미노를 지웁니다.
 */
function eraseTetromino() {
    const gameBoard = document.getElementById('game_board');

    for (let i = 0; i < currentTetromino.shape.length; i++) {
        for (let j = 0; j < currentTetromino.shape[i].length; j++) {
            if (currentTetromino.shape[i][j] !== 0) {
                let row = currentTetromino.row + i;
                let col = currentTetromino.col + j;
                let block = gameBoard.querySelector(`#block-${row}-${col}`);

                if (block) {
                    gameBoard.removeChild(block);
                }
            }
        }
    }
}

/**
 * 테트로미노가 지정된 방향으로 이동할 수 있는지 확인합니다.
 * @param {number} rowOffset - 행 오프셋
 * @param {number} colOffset - 열 오프셋
 * @returns {boolean} 이동 가능 여부
 */
function canTetrominoMove(rowOffset, colOffset) {
    for(let i = 0; i < currentTetromino.shape.length; i++) {
        for(let j = 0; j < currentTetromino.shape[i].length; j++) {
            if(currentTetromino.shape[i][j] !== 0) {
                let row = currentTetromino.row + i + rowOffset;
                let col = currentTetromino.col + j + colOffset;

                if(row >= BOARD_HEIGHT || col < 0 || col >= BOARD_WIDTH || (row >= 0 && board[row][col] !== 0)) {
                    return false;
                }
            }
        }
    }

    return true;
}

/**
 * 테트로미노가 회전할 수 있는지 확인합니다.
 * @param {Array} rotatedShape - 회전된 테트로미노 모양
 * @returns {boolean} 회전 가능 여부
 */
function canTetrominoRotate(rotatedShape) {
    for(let i = 0; i < rotatedShape.length; i++) {
        for(let j = 0; j < rotatedShape[i].length; j++) {
            if(rotatedShape[i][j] !== 0) {
                let row = currentTetromino.row + i;
                let col = currentTetromino.col + j;

                if(row>= BOARD_HEIGHT || col < 0 || col >= BOARD_WIDTH || (row >= 0 && board[row][col] !==0)) {
                    return false;
                }
            }
        }
    }
    return true;
}

/**
 * 테트로미노를 보드에 고정합니다.
 */
function lockTetromino () {
    for(let i = 0; i < currentTetromino.shape.length; i++) {
        for(let j = 0; j < currentTetromino.shape[i].length; j++) {
            if(currentTetromino.shape[i][j] !== 0) {
                let row = currentTetromino.row + i;
                let col = currentTetromino.col + j;
                board[row][col] = currentTetromino.color;
            }
        }
    }

    let rowsCleared = clearRows();
    if(rowsCleared > 0) {
        // update Score
    }

    currentTetromino = randomTetromino();
}

/**
 * 행을 지우고 점수를 업데이트합니다.
 * @returns {number} 지운 행의 수
 */
function clearRows() {
    let rowsCleared = 0;

    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        let rowFilled = true;

        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (board[y][x] === 0) {
                rowFilled = false;
                break;
            }
        }

        if (rowFilled) {
            rowsCleared++;

            for (let yy = y; yy > 0; yy--) {
                for (let x = 0; x < BOARD_WIDTH; x++) {
                    board[yy][x] = board[yy - 1][x];
                }
            }

            // 새로 생긴 첫 줄을 0으로 초기화
            for (let x = 0; x < BOARD_WIDTH; x++) {
                board[0][x] = 0;
            }

            // 행이 삭제되면 y를 증가시켜서 같은 행을 다시 검사
            y++;
        }
    }

    if (rowsCleared > 0) {
        updateGameBoard();
    }

    return rowsCleared;
}

/**
 * 게임 보드를 업데이트합니다.
 */
function updateGameBoard() {
    const gameBoardElement = document.getElementById('game_board');
    gameBoardElement.innerHTML = "";

    for (let row = 0; row < BOARD_HEIGHT; row++) {
        for (let col = 0; col < BOARD_WIDTH; col++) {
            if (board[row][col]) {
                const block = document.createElement('div');
                block.classList.add('block');
                block.style.backgroundColor = board[row][col];
                block.style.top = row * 24 + "px";
                block.style.left = col * 24 + "px";
                block.setAttribute('id', `block-${row}-${col}`);
                gameBoardElement.appendChild(block);
            }
        }
    }
}

/**
 * 테트로미노를 회전시킵니다.
 */
function rotateTetromino() {
    const newRotatedShape = [];
    const oldShape = currentTetromino.shape;

    for (let i = 0; i < oldShape[0].length; i++) {
        let row = [];
        for (let j = oldShape.length - 1; j >= 0; j--) {
            row.push(oldShape[j][i]);
        }
        newRotatedShape.push(row);
    }

    if (canTetrominoRotate(newRotatedShape)) {
        eraseTetromino();
        currentTetromino.shape = newRotatedShape;
        drawTetromino();

        moveGhostTetromino();
    }
}

/**
 * 테트로미노를 지정된 방향으로 이동시킵니다.
 * @param {string} direction - 이동 방향 ('left', 'right', 'down')
 */
function moveTetromino(direction) {
    let row = currentTetromino.row;
    let col = currentTetromino.col;

    if(direction === 'left') {
        if(canTetrominoMove(0,-1)) {
            eraseTetromino();
            col-=1;
            currentTetromino.col = col;
            currentTetromino.row = row;
            drawTetromino();
        }
    } else if (direction === 'right') {
        if(canTetrominoMove(0,1)) {
            eraseTetromino();
            col+=1;
            currentTetromino.col = col;
            currentTetromino.row = row;
            drawTetromino();
        }
    } else {
        if(canTetrominoMove(1,0)) {
            eraseTetromino();
            row++;
            currentTetromino.col = col;
            currentTetromino.row = row;
            drawTetromino();
        } else {
            lockTetromino();
        }
    }

    moveGhostTetromino();
}

/**
 * 고스트 테트로미노를 그립니다.
 */
function drawGhostTetromino() {
    if (!drawGhost) {
        return;
    }

    const shape = currentGhostTetromino.shape;
    const color = 'rgba(255,255,255,0.5)';
    const row = currentGhostTetromino.row;
    const col = currentGhostTetromino.col;

    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) {
                const block = document.createElement('div');
                block.classList.add('ghost');
                block.style.backgroundColor = color;
                block.style.top = (row + r) * 24 + "px";
                block.style.left = (col + c) * 24 + "px";
                block.setAttribute('id', `ghost-${row + r}-${col + c}`);
                document.getElementById('game_board').appendChild(block);
            }
        }
    }
}

/**
 * 고스트 테트로미노를 토글합니다.
 */
function toggleDrawGhost() {
    drawGhost = !drawGhost;
    updateGameBoard();
    drawTetromino();
    moveGhostTetromino();
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'G' || event.key === 'g') {
        toggleDrawGhost();
    }
});

/**
 * 고스트 테트로미노를 지웁니다.
 */
function eraseGhostTetromino() {
    const ghost = document.querySelectorAll('.ghost');
    for(let i = 0; i < ghost.length; i++) {
        ghost[i].remove();
    }
}

/**
 * 고스트 테트로미노가 지정된 방향으로 이동할 수 있는지 확인합니다.
 * @param {number} rowOffset - 행 오프셋
 * @param {number} colOffset - 열 오프셋
 * @returns {boolean} 이동 가능 여부
 */
function canGhostTetromino(rowOffset, colOffset) {
    for(let i = 0; i < currentGhostTetromino.shape.length; i++) {
        for(let j = 0; j < currentGhostTetromino.shape[i].length; j++) {
            if(currentGhostTetromino.shape[i][j] !== 0) {
                let row = currentGhostTetromino.row + i + rowOffset;
                let col = currentGhostTetromino.col + j + colOffset;

                if(row >= BOARD_HEIGHT || col < 0 || col >= BOARD_WIDTH || (row >= 0 && board[row][col] !== 0)) {
                    return false;
                }
            }
        }
    }
    return true;
}

/**
 * 고스트 테트로미노를 이동시킵니다.
 */
function moveGhostTetromino() {
    eraseGhostTetromino();

    currentGhostTetromino = {...currentTetromino};

    while(canGhostTetromino(1,0)) {
        currentGhostTetromino.row ++;
    }

    drawGhostTetromino();
}

document.body.addEventListener("click", () => {
    bgm.play();
    bgm.muted = false; 
    drop.muted = false;  
});

/**
 * 테트로미노를 한 번에 떨어뜨립니다.
 */
async function dropTetromino() {
    let row = currentTetromino.row;
    let col = currentTetromino.col;

    drop.muted = false;
    drop.play();

    while (canTetrominoMove(1, 0)) {
        eraseTetromino();
        row++;
        currentTetromino.col = col;
        currentTetromino.row = row;
        drawTetromino();
        await sleep(1);
    }

    lockTetromino();
}

/**
 * 일정 시간 동안 대기하는 비동기 함수.
 * @param {number} ms - 대기 시간 (밀리초)
 * @returns {Promise} 대기 완료 후 resolve되는 Promise
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

document.addEventListener('keydown', handleKeyPress);

/**
 * 키보드 입력을 처리하는 함수.
 * @param {KeyboardEvent} event - 키보드 이벤트
 */
function handleKeyPress(event) {
    switch(event.keyCode) {
        case 37 : //left arrow
            moveTetromino('left');
            break;
        case 39 : //right arrow
            moveTetromino('right');
            break;  
        case 40 : //down arrow
            moveTetromino('down');
            break;
        case 38 : //up arrow
            rotateTetromino();
            break;
        case 32 : // space bar
            dropTetromino();
            break;          
    }
}

drawTetromino();
setInterval(moveTetromino, 500);