const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const board = [];
const bgm = document.createElement('audio');
const breakSound = document.createElement('audio');
const drop = document.createElement('audio');
let rotatedShape;

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
/*
//erase tetromino from board
function eraseTetromino() {
    for(let i = 0; i < currentTetromino.shape.length; i++){
        for(let j = 0; j < currentTetromino.shape[i].length; j++){
            if(currentTetromino.shape[i][j] !== 0) {
                let row = currentTetromino.row + i;
                let col = currentTetromino.col + j;
                let block = document.getElementById(`block-${row}-${col}`);

                if(block) {
                    document.getElementById('game_board').removeChild(block);
                }
            }
        }
    }
}
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

function canTetrominoRotate() {
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

    //clear row
    let rowsCleared = clearRows();
    if(rowsCleared > 0) {
        // update Score
    }

    currentTetromino = randomTetromino();
}

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

            // 행을 삭제하고 윗 행들을 아래로 이동
            for (let yy = y; yy > 0; yy--) {
                for (let x = 0; x < BOARD_WIDTH; x++) {
                    board[yy][x] = board[yy - 1][x];
                }
            }

            // 맨 위 행을 0으로 채움
            for (let x = 0; x < BOARD_WIDTH; x++) {
                board[0][x] = 0;
            }
        }
    }

    // 화면을 지우고 다시 그리는 부분을 한 번만 수행
    if (rowsCleared > 0) {
        updateGameBoard();
    }
}

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

/*
function clearRows() {
    let rowCleared = 0;

    for(let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        let rowFilled = true;

        for(let x = 0; x < BOARD_WIDTH; x++) {
            if(board[y][x] === 0) {
                rowFilled = false;
                break;
            }
        }

        if(rowFilled) {
            rowsCleared++;

            for(let yy = y; yy > 0; yy--) {
                for(let x = 0; x < BOARD_WIDTH; x++) {
                    board[yy][x] = board[yy-1][x];
                }
            }

            for(let x = 0; x < BOARD_WIDTH; x++) {
                board[0][x] = 0;
            }
            document.getElementById('game_board').innerHTML = "";
            for(let row = 0; row < BOARD_HEIGHT; row++) {
                for(let col = 0; col < BOARD_WIDTH; col++) {
                    if(board[row][col]) {
                        const block  = document.createElement('div');
                        block.classList.add('block');
                        block.style.backgroundColor = board[row][col];
                        block.style.top = row * 24 + "px";
                        block.style.left = col * 24 + "px";
                        block.setAttribute('id', `block-${row}-${col}`);
                        document.getElementById('game_board').appendChild(block);
                    }
                }
            }
        }

        // replay

        y++;
    }
}
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

function canTetrominoRotate(rotatedShape) {
    for (let i = 0; i < rotatedShape.length; i++) {
        for (let j = 0; j < rotatedShape[i].length; j++) {
            if (rotatedShape[i][j] !== 0) {
                let row = currentTetromino.row + i;
                let col = currentTetromino.col + j;

                if (
                    row >= BOARD_HEIGHT ||
                    col < 0 ||
                    col >= BOARD_WIDTH ||
                    (row >= 0 && board[row][col] !== 0)
                ) {
                    return false;
                }
            }
        }
    }
    return true;
}

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
            //down
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

drawTetromino();
setInterval(moveTetromino, 500);

// 초기에 drawGhost 플래그를 true로 설정
let drawGhost = true;

// drawGhostTetromino 함수에서 drawGhost 플래그에 따라 그림을 그리거나 스킵
function drawGhostTetromino() {
    // drawGhost가 false이면 함수를 빠져나감
    if (!drawGhost) {
        return;
    }

    const shape = currentGhostTetromino.shape;
    const color = 'rgba(255,255,255,0.5)';
    const row = currentGhostTetromino.row;
    const col = currentGhostTetromino.col;

    // 기존 코드는 여기에 그대로 둠
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

// drawGhost를 토글하는 함수
function toggleDrawGhost() {
    drawGhost = !drawGhost;
}

// 예시로 특정 키(예: 'G' 키)를 누르면 drawGhost를 토글하도록 설정
document.addEventListener('keydown', (event) => {
    if (event.key === 'G' || event.key === 'g') {
        toggleDrawGhost();
    }
});
/*
// draw Ghost
function drawGhostTetromino() {
    const shape = currentGhostTetromino.shape;
    const color = 'rgba(255,255,255,0.5)';
    const row = currentGhostTetromino.row;
    const col = currentGhostTetromino.col;

    if (!shape || !Array.isArray(shape) || shape.length === 0) {
        console.error("Invalid ghost tetromino shape:", shape);
        return;
    }

    for(let r =0; r < shape.length; r++) {
        for(let c = 0; c < shape[r].length; c++) {
            if(shape[r][c]) {
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
*/

function eraseGhostTetromino() {
    const ghost = document.querySelectorAll('.ghost');
    for(let i = 0; i < ghost.length; i++) {
        ghost[i].remove();
    }
}

function canGhostTetromino(rowOffset,colOffset) {
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

function canGhostTetromino(rowOffset, colOffset) {
    const shape = currentGhostTetromino.shape;

    if (!shape) {
        // shape이 정의되지 않았을 때 처리
        return false;
    }

    for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
            if (shape[i][j] !== 0) {
                let row = currentGhostTetromino.row + i + rowOffset;
                let col = currentGhostTetromino.col + j + colOffset;

                if (row >= BOARD_HEIGHT || col < 0 || col >= BOARD_WIDTH || (row >= 0 && board[row][col] !== 0)) {
                    return false;
                }
            }
        }
    }
    return true;
}

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

async function dropTetromino() {
    let row = currentTetromino.row;
    let col = currentTetromino.col;

    drop.muted = false;
    drop.play();

    // 비동기 함수를 사용하여 테트로미노를 떨어뜨림
    while (canTetrominoMove(1, 0)) {
        eraseTetromino();
        row++;
        currentTetromino.col = col;
        currentTetromino.row = row;
        drawTetromino();
        await sleep(1); // 일정 시간 동안 기다림 (sleep 함수는 아래에 정의됨)
    }

    lockTetromino();
}

// 일정 시간 동안 대기하는 비동기 함수 정의
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


/*
function dropTetromino() {
    let row = currentTetromino.row;
    let col = currentTetromino.col;

    drop.muted = false;
    drop.play();

    while(canTetrominoMove(1,0)) {
        eraseTetromino();
        row++;
        currentTetromino.col = col;
        currentTetromino.row = row;
        drawTetromino();
    }

    lockTetromino();
}
*/


document.addEventListener('keydown', handleKeyPress);

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
            //rotate
            rotateTetromino();
            break;
        case 32 : // space bar
            //drop
            dropTetromino();
            break;          
    }
}