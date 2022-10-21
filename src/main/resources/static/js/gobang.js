document.getElementById("title1").innerText = myName;
document.getElementById("title2").innerText = friendName;
var c = document.getElementById("myCanvas");

var ctx = c.getContext("2d");

ctx.strokeStyle = "green";
ctx.lineWidth = 2;

// 划线
var line = function () {
    ctx.strokeStyle = "green";
    // 划线 共 650*650
    for (var i = 0; i < 13; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (i + 1) * 50);
        ctx.lineTo(650, (i + 1) * 50);

        ctx.stroke();

    }
    for (var ii = 0; ii < 13; ii++) {
        ctx.beginPath();
        ctx.moveTo((ii + 1) * 50, 0);
        ctx.lineTo((ii + 1) * 50, 650);

        ctx.stroke();

    }
    ctx.strokeStyle = "#FF5062";


};

//line();

// 定义坐标
var arr = [];
for (var x = 0; x < 13; x++) {
    arr[x] = [];
    for (var y = 0; y < 13; y++) {
        arr[x][y] = {'x': (x * 50), 'y': (y * 50)};
    }
}
// 记录不能落子的坐标
var doNotClear = {};
// 上一次选择的位置
var lastSelect = {};
// 我的棋子颜色
var myColor = '';
// 我是否可以玩
var canPlay = false;
// 游戏计时任务id
var gameTimeTask;
// 成功的五个棋子坐标
var fiveXY = [];
c.addEventListener('click', function (e) {
    var offsetX = e.offsetX;
    var offsetY = e.offsetY;
    for (var i = 0; i < 13; i++) {
        var find = false;
        for (j = 0; j < 13; j++) {
            var x = arr[i][j].x;
            var y = arr[i][j].y;
            if ((x - 25 < offsetX && offsetX < x + 25) && (y - 25 < offsetY && offsetY < y + 25)) {
                if (x === 0 || y === 0) {
                    find = true;
                    break;
                }

                if (lastSelect.x == x && lastSelect.y == y) {
                    find = true;
                    break;
                }
                clearLastSelect();

                ctx.strokeStyle = "#FF5062";
                ctx.beginPath();
                ctx.arc(x, y, 20, 0, 2 * Math.PI);
                ctx.stroke();

                lastSelect['x'] = x;
                lastSelect['y'] = y;
                find = true;
                break;
            }
        }
        if (find) {
            break;
        }
    }

});
// 清除上一次的选择
var clearLastSelect = function () {
    if (lastSelect.x && lastSelect.y) {

        ctx.clearRect(lastSelect.x - 25, lastSelect.y - 25, 50, 50);

        // 补上清除的区域的线
        ctx.strokeStyle = "green";
        ctx.beginPath();
        ctx.moveTo(lastSelect.x - 25, lastSelect.y);
        ctx.lineTo(lastSelect.x + 25, lastSelect.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(lastSelect.x, lastSelect.y - 25);
        ctx.lineTo(lastSelect.x, lastSelect.y + 25);
        ctx.stroke();

        // 要不要补上棋子
        var theColor = doNotClear[lastSelect.x + '-' + lastSelect.y];
        if (theColor) {
            ctx.strokeStyle = theColor;
            ctx.beginPath();
            ctx.arc(lastSelect.x, lastSelect.y, 20, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.fillStyle = theColor;
            ctx.fill();
            ctx.strokeStyle = "#FF5062";
        }

    }
};
// 上下左右移动
var move = function (s) {
    if (!(lastSelect.x && lastSelect.y)) {
        return;
    }
    var x = lastSelect.x, y = lastSelect.y;

    if (s === 1) {
        // 上
        if (y > 50) {
            y = y - 50;
        }
    }
    if (s === 2) {
        // 左
        if (x > 50) {
            x = x - 50;
        }
    }
    if (s === 3) {
        // 右
        if (x < 650) {
            x = x + 50;
        }
    }
    if (s === 4) {
        // 下
        if (y > 50) {
            y = y + 50;
        }
    }
    ctx.strokeStyle = "#FF5062";
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.stroke();

    clearLastSelect();

    lastSelect['x'] = x;
    lastSelect['y'] = y;
};

// 确定
var sure = function () {
    if (!(lastSelect.x && lastSelect.y)) {
        return;
    }
    if (canPlay === false) {
        showToast('请等待' + friendName + '落子完成', 500);
        return;
    }
    var x = lastSelect.x, y = lastSelect.y;
    ctx.strokeStyle = myColor;
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = myColor;
    ctx.fill();

    doNotClear[x + '-' + y] = myColor;
    ctx.strokeStyle = "#FF5062";

    var msg = {'type': 'pick', 'x': x, 'y': y, 'value': myColor};
    sendNotice('system:' + JSON.stringify(msg));

    canPlay = false;
    document.getElementById('playerName').innerText = friendName;
    if (gameTimeTask) {
        window.clearInterval(gameTimeTask);
    }
    var ok = checkGame(x, y);
    if (ok === true) {
        showToast(myName + "获得了游戏胜利！！！", 5000);
        document.getElementById('result_msg').innerText = myName + "获得了游戏胜利！！！";
        var msg = {'type': 'end', 'value': fiveXY};
        sendNotice('system:' + JSON.stringify(msg));
        endGame(fiveXY);
        doNotClear = {};
    }
};
var checkReset = function () {
    if (Object.getOwnPropertyNames(doNotClear).length > 0) {
        var r = confirm("是否要重新开始？");
        if (r === true) {
            return true;
        } else {
            return false;
        }
    }
    return true;
};
// 重开
var resetButton = function () {
    if (checkReset()) {
        reset();
        var msg = {'type': 'start', 'x': 0, 'y': 0};
        sendNotice('system:' + JSON.stringify(msg));
        // 谁开谁是白
        myColor = '#ffffff';
        // 谁开谁先走
        canPlay = true;
        document.getElementById('playerName').innerText = myName;
        gameTime();
    }
};
var reset = function () {
    ctx.clearRect(0, 0, 650, 650);
    line();
    // 记录不能落子的坐标
    doNotClear = {};
    // 上一次选择的位置
    lastSelect = {};
    document.getElementById('userTime').innerText = 0;
    document.getElementById('result_msg').innerText = "游戏进行中...";
};
// 游戏计时
var gameTime = function () {
    var userTimeE = document.getElementById('userTime');
    gameTimeTask = setInterval(function (args) {
        var userTime = userTimeE.innerText;
        var userTime_ = Number(userTime) + 1;
        userTimeE.innerText = userTime_;
    }, 1000);
};
// 检查是否结束
var checkGame = function (x, y) {
    var i = 0, x_ = 0, y_ = 0;
    var arr2 = [];

    // 1 检查横向 左边
    var x1 = 0;
    for (i = 0; i < 13; i++) {
        x_ = (x - (i + 1) * 50);
        y_ = y;
        if (doNotClear[x_ + '-' + y_] == myColor) {
            x1++;
            arr2.push({'x': x_, 'y': y_});
        } else {
            break;
        }
    }
    // 1 检查横向 右边
    var x2 = 0;
    for (i = 0; i < 13; i++) {
        x_ = (x + (i + 1) * 50);
        y_ = y;
        if (doNotClear[x_ + '-' + y_] == myColor) {
            arr2.push({'x': x_, 'y': y_});
            x2++;
        } else {
            break;
        }
    }
    if (x1 + x2 >= 4) {
        arr2.push({'x': x, 'y': y});
        fiveXY = arr2;
        return true;
    }
    // 2 竖向检查 上面
    arr2 = [];
    var y1 = 0;
    for (i = 0; i < 13; i++) {
        x_ = x;
        y_ = (y - (i + 1) * 50);
        if (doNotClear[x_ + '-' + y_] == myColor) {
            arr2.push({'x': x_, 'y': y_});
            y1++;
        } else {
            break;
        }
    }
    // 2 竖向检查 下面
    var y2 = 0;
    for (i = 0; i < 13; i++) {
        x_ = x;
        y_ = (y + (i + 1) * 50);
        if (doNotClear[x_ + '-' + y_] == myColor) {
            arr2.push({'x': x_, 'y': y_});
            y2++;
        } else {
            break;
        }
    }
    if (y1 + y2 >= 4) {
        arr2.push({'x': x, 'y': y});
        fiveXY = arr2;
        return true;
    }
    arr2 = [];
    // 3 斜向检查 正
    var z1 = 0;
    for (i = 0; i < 13; i++) {
        x_ = (x - (i + 1) * 50);
        y_ = (y - (i + 1) * 50);
        if (doNotClear[x_ + '-' + y_] == myColor) {
            arr2.push({'x': x_, 'y': y_});
            z1++;
        } else {
            break;
        }
    }
    var z2 = 0;
    for (i = 0; i < 13; i++) {
        x_ = (x + (i + 1) * 50);
        y_ = (y + (i + 1) * 50);
        if (doNotClear[x_ + '-' + y_] == myColor) {
            arr2.push({'x': x_, 'y': y_});
            z2++;
        } else {
            break;
        }
    }
    if (z1 + z2 >= 4) {
        arr2.push({'x': x, 'y': y});
        fiveXY = arr2;
        return true;
    }
    arr2 = [];
    // 4 竖向检查 反
    var v1 = 0;
    for (i = 0; i < 13; i++) {
        x_ = (x + (i + 1) * 50);
        y_ = (y - (i + 1) * 50);
        if (doNotClear[x_ + '-' + y_] == myColor) {
            arr2.push({'x': x_, 'y': y_});
            v1++;
        } else {
            break;
        }
    }
    var v2 = 0;
    for (i = 0; i < 13; i++) {
        x_ = (x - (i + 1) * 50);
        y_ = (y + (i + 1) * 50);
        if (doNotClear[x_ + '-' + y_] == myColor) {
            arr2.push({'x': x_, 'y': y_});
            v2++;
        } else {
            break;
        }
    }
    if (v1 + v2 >= 4) {
        arr2.push({'x': x, 'y': y});
        fiveXY = arr2;
        return true;
    }

    return false;
};
// 成功后渲染
var endGame = function (arr1) {
    if (arr1 == undefined) {
        arr1 = [];
    }
    // 把五个连起来
    ctx.strokeStyle = "#ffff00";
    for (var i = 0; i < arr1.length; i++) {
        ctx.beginPath();
        ctx.arc(Number(arr1[i].x), Number(arr1[i].y), 20, 0, 2 * Math.PI);
        ctx.stroke();
    }
    ctx.strokeStyle = "#FF5062";
    canPlay = false;
    // 延时五秒
    var taskList = [];
    taskList.push({'type': 'timeout', 'value': 6000});
    taskList.push({'type': 'clearFull', 'x': 0, 'y': 0, 'z': 650});
    taskList.push({'type': 'timeout', 'value': 500});
    // 写字
    var o1 = {'type': 'write', 'x': 50, 'y': 50, 'value': '亲爱的宝宝！我爱你~~~', 'f': '30px Arial', 's': '#000000'};
    taskList.push(o1);
    taskList.push({'type': 'timeout', 'value': 1000});
    var o1 = {'type': 'write', 'x': 50, 'y': 100, 'value': '我给你画个向日葵，希望宝宝喜欢~~~', 'f': '30px Arial', 's': '#000000'};
    taskList.push(o1);
    taskList.push({'type': 'timeout', 'value': 1000});
    // 再删除 文字
    var o = {'type': 'clearFull', 'x': 0, 'y': 0, 'z': 650};
    taskList.push(o);
    // 画向日葵
    taskList.push({'type': 'pick', 'x': 250, 'y': 100, 'value': '#ffff00'});
    taskList.push({'type': 'pick', 'x': 300, 'y': 100, 'value': '#ffff00'});
    taskList.push({'type': 'pick', 'x': 350, 'y': 100, 'value': '#ffff00'});
    taskList.push({'type': 'pick', 'x': 400, 'y': 150, 'value': '#ffff00'});
    taskList.push({'type': 'pick', 'x': 200, 'y': 150, 'value': '#ffff00'});
    taskList.push({'type': 'pick', 'x': 450, 'y': 200, 'value': '#ffff00'});
    taskList.push({'type': 'pick', 'x': 450, 'y': 250, 'value': '#ffff00'});
    taskList.push({'type': 'pick', 'x': 450, 'y': 300, 'value': '#ffff00'});
    taskList.push({'type': 'pick', 'x': 150, 'y': 200, 'value': '#ffff00'});
    taskList.push({'type': 'pick', 'x': 150, 'y': 250, 'value': '#ffff00'});
    taskList.push({'type': 'pick', 'x': 150, 'y': 300, 'value': '#ffff00'});
    taskList.push({'type': 'pick', 'x': 200, 'y': 350, 'value': '#ffff00'});
    taskList.push({'type': 'pick', 'x': 400, 'y': 350, 'value': '#ffff00'});
    taskList.push({'type': 'pick', 'x': 250, 'y': 400, 'value': '#ffff00'});
    taskList.push({'type': 'pick', 'x': 300, 'y': 400, 'value': '#ffff00'});
    taskList.push({'type': 'pick', 'x': 350, 'y': 400, 'value': '#ffff00'});

    taskList.push({'type': 'pick', 'x': 300, 'y': 450, 'value': '#00ff00'});
    taskList.push({'type': 'pick', 'x': 300, 'y': 500, 'value': '#00ff00'});
    taskList.push({'type': 'pick', 'x': 300, 'y': 550, 'value': '#00ff00'});
    taskList.push({'type': 'pick', 'x': 300, 'y': 600, 'value': '#00ff00'});
    taskList.push({'type': 'pick', 'x': 100, 'y': 600, 'value': '#00ff00'});
    taskList.push({'type': 'pick', 'x': 150, 'y': 600, 'value': '#00ff00'});
    taskList.push({'type': 'pick', 'x': 200, 'y': 600, 'value': '#00ff00'});
    taskList.push({'type': 'pick', 'x': 250, 'y': 600, 'value': '#00ff00'});
    taskList.push({'type': 'pick', 'x': 350, 'y': 600, 'value': '#00ff00'});
    taskList.push({'type': 'pick', 'x': 400, 'y': 600, 'value': '#00ff00'});
    taskList.push({'type': 'pick', 'x': 450, 'y': 600, 'value': '#00ff00'});
    taskList.push({'type': 'pick', 'x': 500, 'y': 600, 'value': '#00ff00'});
    taskList.push({'type': 'pick', 'x': 350, 'y': 550, 'value': '#00ff00'});
    taskList.push({'type': 'pick', 'x': 400, 'y': 500, 'value': '#00ff00'});
    taskList.push({'type': 'pick', 'x': 450, 'y': 450, 'value': '#00ff00'});
    taskList.push({'type': 'pick', 'x': 250, 'y': 550, 'value': '#00ff00'});
    taskList.push({'type': 'pick', 'x': 450, 'y': 450, 'value': '#00ff00'});
    taskList.push({'type': 'pick', 'x': 250, 'y': 550, 'value': '#00ff00'});
    taskList.push({'type': 'pick', 'x': 200, 'y': 500, 'value': '#00ff00'});
    taskList.push({'type': 'pick', 'x': 150, 'y': 450, 'value': '#00ff00'});
    taskList.push({'type': 'timeout', 'value': 1000});
    var o1 = {'type': 'write', 'x': 10, 'y': 20, 'value': '入目无他人,四下皆是你', 'f': '20px Arial', 's': '#000000'};
    taskList.push(o1);
    taskList.push({'type': 'timeout', 'value': 1000});
    var o1 = {
        'type': 'write',
        'x': 10,
        'y': 40,
        'value': '有你时你是太阳,我目不转睛,无你时我低下头谁也不见',
        'f': '20px Arial',
        's': '#000000'
    };
    taskList.push(o1);
    taskList.push({'type': 'timeout', 'value': 3000});
    taskList.push({'type': 'clearFull', 'x': 0, 'y': 0, 'z': 650});
    taskList.push({'type': 'write', 'x': 50, 'y': 200, 'value': '最后还是我可爱的宝宝上线', 'f': '30px Arial', 's': '#000000'});
    taskList.push({'type': 'timeout', 'value': 1000});
    taskList.push({'type': 'clearFull', 'x': 0, 'y': 0, 'z': 650});

    taskList.push({'type': 'write', 'x': 325, 'y': 325, 'value': '3', 'f': '30px Arial', 's': '#000000'});
    taskList.push({'type': 'timeout', 'value': 1000});
    taskList.push({'type': 'clearFull', 'x': 0, 'y': 0, 'z': 650});
    taskList.push({'type': 'write', 'x': 325, 'y': 325, 'value': '2', 'f': '30px Arial', 's': '#000000'});
    taskList.push({'type': 'timeout', 'value': 1000});
    taskList.push({'type': 'clearFull', 'x': 0, 'y': 0, 'z': 650});
    taskList.push({'type': 'write', 'x': 325, 'y': 325, 'value': '1', 'f': '30px Arial', 's': '#000000'});
    taskList.push({'type': 'timeout', 'value': 1000});
    taskList.push({'type': 'clearFull', 'x': 320, 'y': 320, 'z': 450});

    taskList.push({
        'type': 'drawImg',
        'x': 0,
        'y': 0,
        'z': 650,
        value: 'https://60547b06v7.oicp.vip/web_socket/img/pq3.jpg'
    });
    taskList.push({'type': 'timeout', 'value': 5000});
    taskList.push({'type': 'clearFull', 'x': 0, 'y': 0, 'z': 325});
    taskList.push({'type': 'clearFull', 'x': 325, 'y': 325, 'z': 325});
    taskList.push({'type': 'clearFull', 'x': 325, 'y': 0, 'z': 325});
    taskList.push({'type': 'clearFull', 'x': 0, 'y': 325, 'z': 325});

    taskList.push({'type': 'write', 'x': 50, 'y': 200, 'value': '点击开始对局进行下一句游戏', 'f': '30px Arial', 's': '#000000'});

    var doTask = function () {
        if (taskList.length === 0) {
            console.log('清除任务');
            clearInterval(taskId);

            modeDisabled = false;
            operationDisabled = false;

            return;
        }
        var task = taskList[0];
        if (task.type === 'pick') {

            var x = task.x, y = task.y;
            ctx.strokeStyle = task.value;
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, 2 * Math.PI);
            ctx.stroke();

            ctx.fillStyle = task.value;
            ctx.fill();

        } else if (task.type === 'write') {
            ctx.font = task.f;
            ctx.fillStyle = task.s;
            ctx.fillText(task.value, task.x, task.y);
        } else if (task.type === 'clearFull') {
            ctx.clearRect(task.x, task.y, task.z, task.z);
        } else if (task.type === 'timeout') {
            clearInterval(taskId);
            setTimeout(function () {
                taskId = setInterval(doTask, 150, false);
            }, task.value);
        } else if (task.type === 'drawImg') {
            var img = document.getElementById("pq1");
            img.src = task.value;
            img.onload = function () {
                ctx.drawImage(img, task.x, task.y, task.z, task.z);
            }
        }
        taskList.shift(task);
    };
    var taskId = setInterval(doTask, 200, false);

};

var sendNotice = function (msg) {
    var body = {"from": myName + '_gobang', "to": friendName + '_gobang', "msg": msg};
    webSocket.send(JSON.stringify(body));
};


// 创建websocket

var createWebSocket = function () {
    var host = '60547b06v7.oicp.vip';
    var webName = 'web_socket';
    var userName = myName + '_gobang';
    var webSocket = new WebSocket('wss://' + host + '/' + webName + '/webSocket/' + userName);

    webSocket.onclose = function (e) {
        document.getElementById("title1").style.color = '#d4d4d4';
        console.log("webSocket关闭连接!" + new Date().toLocaleString());
    };
    webSocket.onerror = function () {
        document.getElementById("title1").style.color = '#d4d4d4';
        console.log("webSocket连接错误!");
    };
    webSocket.onopen = function () {
        console.log("webSocket连接成功!" + new Date().toLocaleString());
        document.getElementById("title1").style.color = '#ddf109';
        var msg = {'type': 'login', 'value': friendName + '登录在线了'};
        sendNotice('system:' + JSON.stringify(msg));

    };
    webSocket.onmessage = function (event) {
        console.log("webSocket收到消息:" + event.data);
        var message = JSON.parse(event.data);
        if (message.msg && message.msg.startsWith('system:')) {
            // 系统消息
            var body = JSON.parse(message.msg.substr(7));
            if (body.type === 'start') {
                reset();
                // 被开，就是黑
                myColor = '#000000';
                // 被开，就下一步再走
                canPlay = false;
                document.getElementById('playerName').innerText = friendName;
            } else if (body.type === 'pick') {
                var x = Number(body.x);
                var y = Number(body.y);
                var theColor = body.value;

                ctx.strokeStyle = theColor;
                ctx.beginPath();
                ctx.arc(x, y, 20, 0, 2 * Math.PI);
                ctx.stroke();

                ctx.fillStyle = theColor;
                ctx.fill();

                ctx.strokeStyle = "#0000ff";
                ctx.beginPath();
                ctx.arc(x, y, 19, 0, 2 * Math.PI);
                ctx.stroke();

                setTimeout(function () {
                    ctx.strokeStyle = theColor;
                    ctx.beginPath();
                    ctx.arc(x, y, 19, 0, 2 * Math.PI);
                    ctx.stroke();
                }, 500);

                doNotClear[x + '-' + y] = theColor;
                ctx.strokeStyle = "#FF5062";

                canPlay = true;
                showToast('该你了', '200');
                document.getElementById('playerName').innerText = myName;
                gameTime();

            } else if (body.type === 'end') {
                var value = body.value;
                document.getElementById('result_msg').innerText = friendName + "获得了游戏胜利！！！";
                endGame(value);
                if (gameTimeTask) {
                    window.clearInterval(gameTimeTask);
                }
            } else if (body.type === 'login') {
                document.getElementById("title2").style.color = '#ddf109';
                document.getElementById("xin").style.animation = "mymove 1.5s infinite";
                var msg = {'type': 'login_received', 'value': friendName + '登录在线了'};
                sendNotice('system:' + JSON.stringify(msg));
            } else if (body.type === 'login_received') {
                document.getElementById("title2").style.color = '#ddf109';
                document.getElementById("xin").style.animation = "mymove 1.5s infinite"
            }

        } else {
            var msg = message.from + '[' + getDate('h:i:s') + ']:' + message.msg;
            showMsg(msg);
        }

    };

    return webSocket

};
var webSocket = createWebSocket();


var showToast = function (msg, duration) {
    duration = isNaN(duration) ? 3000 : duration;
    var m = document.createElement('div');
    m.innerHTML = msg;
    m.style.cssText = "    width: 23%;\n" +
        "    min-width: 10px;\n" +
        "    background: rgb(0, 0, 0);\n" +
        "    opacity: 1;\n" +
        "    height: auto;\n" +
        "    min-height: 30px;\n" +
        "    color: rgb(240 246 255);\n" +
        "    line-height: 30px;\n" +
        "    text-align: center;\n" +
        "    border-radius: 4px;\n" +
        "    position: fixed;\n" +
        "    top: 40%;\n" +
        "    left: 37%;\n" +
        "    z-index: 999999;\n" +
        "    font-size: 25px;";
    document.body.appendChild(m);
    setTimeout(function () {
        var d = 0.5;
        m.style.webkitTransition = '-webkit-transform ' + d + 's ease-in, opacity ' + d + 's ease-in';
        m.style.opacity = '0';
        setTimeout(function () {
            document.body.removeChild(m)
        }, d * 1000);
    }, duration);
};
