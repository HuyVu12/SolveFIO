let canvas = document.querySelector('canvas');
let c = canvas.getContext('2d');

const mouse = {
    inCancas: false,
    x: canvas.width,
    y: canvas.height,
}

let myImg = {
    gray: new Image(),
    lightGray: new Image(),
    red: new Image(),
}
myImg['lightGray'].src = './img/lightGray.png';
myImg['gray'].src = './img/gray.png';
myImg['red'].src = './img/red.png';

let Row = 7;
let Col = 5;
let Bsize = 50;

class Block {
    constructor(
        {
            position,
            id,
        }
    ) {
        this.position = position;
        this.id = id;
        this.img = 'gray';
        this.isHide = false;
        this.isStart = false;
        this.glbAlpha = 1;
        // this.str = id.x * (Col) + id.y + 1;
        this.str = '';
    }
    isSelected({ x, y }) {
        return (x > this.position.x && x < this.position.x + Bsize && y > this.position.y && y < this.position.y + Bsize)
    }
    update() {
        this.img = 'gray';
        if (this.isStart) {
            this.img = 'red';
        }
    }
    draw() {
        if (this.isHide) return;
        this.update();
        c.save();
        c.globalAlpha = this.glbAlpha;
        c.drawImage(myImg[this.img], this.position.x, this.position.y, Bsize, Bsize);
        c.strokeStyle = 'white';
        c.strokeRect(this.position.x, this.position.y, Bsize, Bsize);
        c.stroke();

        // c.strokeStyle = 'black';
        // c.font = '20px Courier New';
        // c.strokeText(this.str, this.position.x + 10, this.position.y + 30);
        c.restore();
    }
    onClick() {
        this.isHide = !this.isHide;
    }
}

let arrBlocks = [];

function changeBackground(value){
    console.log(value);
    document.querySelector('body').style.background = value;
    document.querySelector('body').style.backgroundSize = 'cover';
}

function changeSizeBoard(){
    init();
}

function init() {
    canMove = [];
    numPath = [];
    numBlock = 0;
    ck_c = [];
    doneDfs = false;
    path = {};
    numCalc = 0;
    arrBlocks = [];
    Row = document.getElementById('row').value;
    Col = document.getElementById('col').value;
    Bsize = parseInt(document.getElementById('bsize').value);
    canvas.width = Col * Bsize;
    canvas.height = Row * Bsize;
    for (let i = 0; i < canvas.height; i += Bsize) {
        let blocks = [];
        for (let j = 0; j < canvas.width; j += Bsize) {
            blocks.push(
                new Block({
                    position: { x: j, y: i },
                    id: { x: i / Bsize, y: j / Bsize }
                })
            )
        }
        arrBlocks.push(blocks);
    }
}

let doneDfs = false;
function animate() {
    requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height);
    arrBlocks.forEach(blocks => {
        blocks.forEach(block => {
            block.draw();
        })
    });
    if(doneDfs){
        c.beginPath();
        c.moveTo(path[1].x + Bsize*0.5, path[1].y + Bsize*0.5);
        c.lineWidth = 3;
        for(let key in path){
            c.lineTo(path[key].x + Bsize*0.5, path[key].y + Bsize*0.5);
        }
        c.strokeStyle = 'blue';
        c.stroke();
    }
    c.lineWidth = 1;
}
animate();

window.addEventListener('mousemove', function (ev) {
    if (ev.x > canvas.offsetLeft - canvas.width * 0.5 && ev.x < canvas.offsetLeft + canvas.width * 0.5
        && ev.y > canvas.offsetTop - canvas.height * 0.5 && ev.y < canvas.offsetTop + canvas.height * 0.5
    ) {
        mouse.x = ev.offsetX;
        mouse.y = ev.offsetY;
    }
    else {
        mouse.x = -1;
        mouse.y = -1;
    }
    // this.document.getElementById('x').value = mouse.x;
    // this.document.getElementById('y').value = mouse.y;
    arrBlocks.forEach(blocks => {
        blocks.forEach(block => {
            if (block.isSelected({ x: mouse.x, y: mouse.y })) {
                block.glbAlpha = 0.5;
            }
            else block.glbAlpha = 1;
        })
    });
});

window.addEventListener('click', function (ev) {
    arrBlocks.forEach(blocks => {
        blocks.forEach(block => {
            if (block.isSelected({ x: mouse.x, y: mouse.y })) {
                block.isHide = !block.isHide;
                if (block.isHide) block.isStart = false;
            }
        })
    });
});

window.addEventListener('dblclick', function (ev) {
    arrBlocks.forEach(blocks => {
        blocks.forEach(block => {
            if (block.isSelected({ x: mouse.x, y: mouse.y })) {
                block.isHide = false;
                block.isStart = true;
            }
            else block.isStart = false;
        })
    });
})

let st = { x: 0, y: 0 };
let ax = [0, 0, -1, 1];
let ay = [-1, 1, 0, 0];
let canMove = [];
let numPath = [];
let numBlock = 0;
let path = {};
let numCalc = 0;

function prepare() {
    canMove = [];
    numPath = [];
    numBlock = 0;
    ck_c = [];
    doneDfs = false;
    path = {};
    numCalc = 0;

    for (let i = 0; i < Row; ++i) {
        let cm1 = [];
        let np1 = [];
        let ckc1 = [];
        for (let j = 0; j < Col; ++j) {
            let block = arrBlocks[i][j];
            block.str = 0;
            if (block.isHide) cm1.push(0);
            else {
                cm1.push(1);
                ++numBlock;
            }
            if (block.isStart) st = block.id;
            np1.push(0);
            ckc1.push(0);
        }
        canMove.push(cm1);
        numPath.push(np1);
        ck_c.push(ckc1);
    }
}
function dfs(u, step, pu) {
    ++numCalc;
    numPath[u.x][u.y] = step;
    if (step == numBlock) {
        throw 'hetcuu';
    }
    if(!check_can_solve2()){
        return;
    }
    if(step % 2){
        if (!check_can_solve()) {
            return;
        }
    }
    for (let i = 0; i < 4; ++i) {
        let v = {
            x: u.x,
            y: u.y
        };
        v.x += ax[i];
        v.y += ay[i];
        if (v.x < 0 || v.y < 0 || v.x >= Row || v.y >= Col) continue;
        if (!canMove[v.x][v.y] || numPath[v.x][v.y] != 0) continue;
        dfs(v, step + 1, u);
        numPath[v.x][v.y] = 0;
    }
}
function RunDfs() {
    prepare();
    try {
        dfs(st, 1, st);
    } catch (str) {
        doneDfs = true;
        for (let i = 0; i < Row; ++i) {
            for (let j = 0; j < Col; ++j) {
                if(numPath[i][j] == 0)continue;
                arrBlocks[i][j].str = numPath[i][j];
                path[numPath[i][j]] = {x: arrBlocks[i][j].position.x, y: arrBlocks[i][j].position.y};
            }
        }
        console.log(numCalc);
    }
}
// Check can Solve
let ck_c = [];
let co = 0;
let num_c = 0;

function dfs_c(x, y) {
    ++numCalc;
    ++num_c;
    ck_c[x][y] = co;
    for (let i = 0; i < 4; ++i) {
        let vx = x + ax[i];
        let vy = y + ay[i];
        if (vx < 0 || vy < 0 || vx >= Row || vy >= Col) continue;
        if (!canMove[vx][vy] || ck_c[vx][vy] == co || numPath[vx][vy] != 0) continue;
        dfs_c(vx, vy);
    }
}

function check_can_solve() {
    let containBlock = 0;
    co += 1;
    num_c = 0;
    for (let i = 0; i < Row; ++i)
        for (let j = 0; j < Col; ++j) {
            if (canMove[i][j] && numPath[i][j] == 0) ++containBlock;
        }

    for (let i = 0; i < Row; ++i)
        for (let j = 0; j < Col; ++j) {
            if (canMove[i][j] && numPath[i][j] == 0) {
                dfs_c(i, j);
                return num_c == containBlock;
            }
        }
}

function check_can_solve2(){
    let res = 0;
    for(let i = 0; i < Row; ++i)
    for(let j = 0; j < Col; ++j){
        if(!canMove[i][j] || numPath[i][j])continue;
        let re = 0;
        for(let k = 0; k < 4; ++k){
            let x = i + ax[k];
            let y = j + ay[k];
            if(x < 0 || x >= Row || y < 0 || y >= Col){
                ++re;
            }
            else if((numPath[x][y] > 0 || !canMove[x][y]) 
                // && ({x: x, y: y} != st)
            )++re;
            if(re >= 3)++res;
            if(res > 2)return 0;
        }
        return 1;
    }
}

init();
