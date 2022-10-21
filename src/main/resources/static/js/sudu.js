document.getElementById("title").innerText = myName + ' ❤ ' + friendName;

var c = document.getElementById("myCanvas");

var ctx = c.getContext("2d");

ctx.strokeStyle = "green";
ctx.lineWidth = 2;

// 划线
var line = function () {
    // 划线
    for (var i = 0; i < 9; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (i + 1) * 50);
        ctx.lineTo(450, (i + 1) * 50);
        if (i === 2 || i === 5) {
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#ff03f5";
        } else {
            ctx.lineWidth = 2;
            ctx.strokeStyle = "green";
        }
        ctx.stroke();

    }
    ctx.strokeStyle = "green";
    ctx.lineWidth = 2;
    for (var ii = 0; ii < 9; ii++) {
        ctx.beginPath();
        ctx.moveTo((ii + 1) * 50, 0);
        ctx.lineTo((ii + 1) * 50, 450);
        if (ii === 2 || ii === 5) {
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#ff03f5";
        } else {
            ctx.lineWidth = 2;
            ctx.strokeStyle = "green";
        }
        ctx.stroke();

    }
    ctx.strokeStyle = "#FF5062";
};
line();
// 定义坐标
var arr = [];
for (var x = 0; x < 9; x++) {
    arr[x] = [];
    for (var y = 0; y < 9; y++) {
        arr[x][y] = {'x': 25 + (y * 50) - 5, 'y': 25 + (x * 50)};
    }
}

// 数据对应坐标
var dataObj = {};
// 自己是否可以操作
var canPlay = false, modeDisabled = false, operationDisabled = false;


var lastSelect = {}, doNotClear = {}, friendLastSelect = {}, selectSameNum = {};
// y轴坐标偏移量
var y_offset = 10;
var gameTimeTask = '';
c.addEventListener('click', function (e) {
    var offsetX = e.offsetX;
    var offsetY = e.offsetY;
    for (var i = 0; i < 9; i++) {
        var find = false;
        for (j = 0; j < 9; j++) {
            var x = arr[i][j].x;
            var y = arr[i][j].y;
            if ((x + 5 - 25 < offsetX && offsetX < x + 5 + 25) && (y - 25 < offsetY && offsetY < y + 25)) {
                if (lastSelect.x == x && lastSelect.y == y) {
                    find = true;
                    break;
                }
                if (lastSelect.x && lastSelect.y) {

                    ctx.clearRect(lastSelect.x + 5 - 23, lastSelect.y - 23, 47, 47);
                    if (doNotClear[lastSelect.x + '-' + lastSelect.y]) {
                        ctx.fillText(doNotClear[lastSelect.x + '-' + lastSelect.y], lastSelect.x - 2, lastSelect.y + y_offset);
                    } else {
                    }

                }

                ctx.beginPath();
                ctx.arc(x + 5, y, 20, 0, 2 * Math.PI);
                ctx.stroke();
                var msg = {'type': 'selected', 'x': x, 'y': y};
                sendNotice('system:' + JSON.stringify(msg));

                lastSelect['x'] = x;
                lastSelect['y'] = y;

                markSameNum(x, y);

                find = true;
                break;
            }
        }
        if (find) {
            break;
        }
    }

});
// 标记所有选中的相同的数字
var markSameNum = function (x, y) {
    // 回滚之前标记的
    for (var k1 in selectSameNum) {

        var sameXY1 = k1.split('-');
        var x1 = Number(sameXY1[0]);
        var y1 = Number(sameXY1[1]);
        ctx.clearRect(x1 + 5 - 23, y1 - 23, 47, 47);
        ctx.fillText(selectSameNum[x1 + '-' + y1], x1 - 2, y1 + y_offset);
    }
    selectSameNum = {};

    // 标记所有选中的相同的数字
    var theNum = doNotClear[x + '-' + y];
    // 根据选中的反找数字
    ctx.strokeStyle = "#645049";
    for (var k in doNotClear) {

        if (doNotClear[k] === theNum && k !== x + '-' + y) {
            var sameXY = k.split('-');
            ctx.beginPath();
            ctx.arc(Number(sameXY[0]) + 5, Number(sameXY[1]), 20, 0, 2 * Math.PI);
            ctx.stroke();
            selectSameNum[k] = doNotClear[k];
        }


    }
    ctx.strokeStyle = "#FF5062";
};
// 操作区域绑定事件
var operation = document.getElementsByClassName('num');
for (var i = 0; i < operation.length; i++) {
    operation[i].addEventListener('click', function (e1, e2) {
        if (operationDisabled) {
            return;
        }
        if (!dataObj[lastSelect.x + '-' + lastSelect.y]) {
            return;
        }
        if (!canPlay) {
            showToast('请等待' + friendName + "操作完成", '200');
            return;
        }

        console.log(this.textContent);
        if (lastSelect.x && lastSelect.y) {
            // 判断数值的正确性
            if (dataObj[lastSelect.x + '-' + lastSelect.y] != this.textContent) {
                sendNotice('失败了一次');
                showToast('请再考虑一下吧', "200");
                var failTimesE = document.getElementById('failTimes');
                var failTimes = Number(failTimesE.innerText) + 1;
                failTimesE.innerText = failTimes;
                return;
            }
            if (doNotClear[lastSelect.x + '-' + lastSelect.y]) {
                showToast('这里已经填了数字~', "200");
                return;
            }

            ctx.clearRect(lastSelect.x + 5 - 23, lastSelect.y - 23, 47, 47);
            ctx.fillText(this.textContent, lastSelect.x - 2, lastSelect.y + y_offset);

            doNotClear[lastSelect.x + '-' + lastSelect.y] = Number(this.textContent);
            // 更新下面汇总
            updateSum();
            var msg = {'type': 'pick', 'x': lastSelect.x, 'y': lastSelect.y, 'value': Number(this.textContent)};
            sendNotice('system:' + JSON.stringify(msg));

            lastSelect = {};
            canPlay = false;
            document.getElementById('playerName').innerText = friendName;
            window.clearInterval(gameTimeTask);
            var userTimeAll = document.getElementById('userTimeAll').innerText;
            var userTime = document.getElementById('userTime').innerText;
            document.getElementById('userTimeAll').innerText = Number(userTimeAll) + Number(userTime);
            document.getElementById('userTime').innerText = 0;
            // 完成
            if (isSuccess()) {
                showToast('哈哈！恭喜恭喜', '1000');
                showMsg('[' + myName + ']:' + '哈哈！我们成功了！');
                var msg = {'type': 'end', 'value': '哈哈！恭喜恭喜,' + myName + ' 最棒！'};
                sendNotice('system:' + JSON.stringify(msg));
                var failTimes = document.getElementById('failTimes').innerText;
                var userTimeAll = document.getElementById('userTimeAll').innerText;
                msg = {
                    'type': 'info',
                    'value': '对局被' + myName + "终结，他/她 失败了：" + failTimes + "次,总耗时：" + userTimeAll + "秒"
                };
                showMsg(msg.value);
                sendNotice('system:' + JSON.stringify(msg));
                endGame();
            }

        } else {
            showToast('请选择单元格', '200');
        }

    })
}
// 更新汇总数据
var updateSum = function () {

    var count1 = 0, count2 = 0, count3 = 0, count4 = 0, count5 = 0, count6 = 0, count7 = 0, count8 = 0, count9 = 0;
    for (var k in doNotClear) {
        var value = Number(doNotClear[k]);
        switch (value) {
            case 1:
                count1++;
                break;
            case 2:
                count2++;
                break;
            case 3:
                count3++;
                break;
            case 4:
                count4++;
                break;
            case 5:
                count5++;
                break;
            case 6:
                count6++;
                break;
            case 7:
                count7++;
                break;
            case 8:
                count8++;
                break;
            case 9:
                count9++;
                break;

        }

    }
    document.getElementById('num-t-1').innerText = count1;
    document.getElementById('num-t-2').innerText = count2;
    document.getElementById('num-t-3').innerText = count3;
    document.getElementById('num-t-4').innerText = count4;
    document.getElementById('num-t-5').innerText = count5;
    document.getElementById('num-t-6').innerText = count6;
    document.getElementById('num-t-7').innerText = count7;
    document.getElementById('num-t-8').innerText = count8;
    document.getElementById('num-t-9').innerText = count9;
};
// 完成后刷新
var endGame = function () {
    // 模式不可以选择
    modeDisabled = true;
    // 数字不可以操作
    operationDisabled = true;
    // 着一删除内容
    var taskList = [];
    for (var d = 0; d < 81; d++) {
        var o = {'type': 'clear', 'x': arr[parseInt(d / 9)][d % 9].x, 'y': arr[parseInt(d / 9)][d % 9].y};
        taskList.push(o);
    }
    // 写字
    var text = '  亲爱的宝宝！我爱你！看我给你画个爱心~';
    var textArr = text.split('');
    for (var t = 0; t < textArr.length; t++) {
        var o1 = {
            'type': 'write',
            'x': arr[parseInt(t / 9)][t % 9].x,
            'y': arr[parseInt(t / 9)][t % 9].y,
            'value': textArr[t]
        };
        taskList.push(o1);
    }
    // 再删除 文字
    for (var s = 0; s < textArr.length; s++) {
        var o2 = {'type': 'clear', 'x': arr[parseInt(s / 9)][s % 9].x, 'y': arr[parseInt(s / 9)][s % 9].y};
        taskList.push(o2);
    }
    // 给宝宝画一个爱心 ❤
    var heart = [20, 21, 23, 24, 28, 31, 34, 36, 44, 45, 53, 55, 61, 65, 66, 68, 69, 76];
    for (var h = 0; h < heart.length; h++) {
        var o3 = {
            'type': 'write',
            'x': arr[parseInt(heart[h] / 9)][heart[h] % 9].x,
            'y': arr[parseInt(heart[h] / 9)][heart[h] % 9].y,
            value: '♥'
        };
        taskList.push(o3);
    }
    // 删除爱心
    for (var h = 0; h < heart.length; h++) {
        var o3 = {
            'type': 'clear',
            'x': arr[parseInt(heart[h] / 9)][heart[h] % 9].x,
            'y': arr[parseInt(heart[h] / 9)][heart[h] % 9].y
        };
        taskList.push(o3);
    }

    // 删除爱心
    var f1 = {'type': 'clearFull', 'x': 0, 'y': 0, 'z': 250};
    taskList.push(f1);
    var f2 = {'type': 'clearFull', 'x': 0, 'y': 250, 'z': 250};
    taskList.push(f2);

    var f3 = {'type': 'clearFull', 'x': 250, 'y': 0, 'z': 250};
    taskList.push(f3);
    var f4 = {'type': 'clearFull', 'x': 250, 'y': 250, 'z': 250};
    taskList.push(f4);

    // 写字
    var text = '  宝宝，看看，这个像不像你~~~';
    var textArr = text.split('');
    for (var t = 0; t < textArr.length; t++) {
        var o1 = {
            'type': 'write',
            'x': arr[parseInt(t / 9)][t % 9].x,
            'y': arr[parseInt(t / 9)][t % 9].y,
            'value': textArr[t]
        };
        taskList.push(o1);
    }
    // 再删除 文字
    for (var s = 0; s < textArr.length; s++) {
        var o2 = {'type': 'clear', 'x': arr[parseInt(s / 9)][s % 9].x, 'y': arr[parseInt(s / 9)][s % 9].y};
        taskList.push(o2);
    }
    taskList.push({'type': 'write', 'x': 250, 'y': 250, value: '3'});
    taskList.push({'type': 'timeout', 'value': 1000});
    taskList.push({'type': 'clear', 'x': 250, 'y': 250});
    taskList.push({'type': 'write', 'x': 250, 'y': 250, value: '2'});
    taskList.push({'type': 'timeout', 'value': 1000});
    taskList.push({'type': 'clear', 'x': 250, 'y': 250});
    taskList.push({'type': 'write', 'x': 250, 'y': 250, value: '1'});
    taskList.push({'type': 'timeout', 'value': 1000});
    taskList.push({'type': 'clear', 'x': 250, 'y': 250});
    // 画出佩奇
    taskList.push({
        'type': 'drawImg',
        'x': 0,
        'y': 0,
        'z': 500,
        value: 'https://60547b06v7.oicp.vip/web_socket/img/pq1.jpg'
    });
    taskList.push({'type': 'timeout', 'value': 5000});
    taskList.push({'type': 'clearFull', 'x': 0, 'y': 0, 'z': 250});
    taskList.push({'type': 'clearFull', 'x': 250, 'y': 250, 'z': 250});
    taskList.push({'type': 'clearFull', 'x': 250, 'y': 0, 'z': 250});
    taskList.push({'type': 'clearFull', 'x': 0, 'y': 250, 'z': 250});
    // 写字
    var text = '  再来画一个穿了衣服的你~~~';
    var textArr = text.split('');
    for (var t = 0; t < textArr.length; t++) {
        var o1 = {
            'type': 'write',
            'x': arr[parseInt(t / 9)][t % 9].x,
            'y': arr[parseInt(t / 9)][t % 9].y,
            'value': textArr[t]
        };
        taskList.push(o1);
    }
    // 再删除 文字
    for (var s = 0; s < textArr.length; s++) {
        var o2 = {'type': 'clear', 'x': arr[parseInt(s / 9)][s % 9].x, 'y': arr[parseInt(s / 9)][s % 9].y};
        taskList.push(o2);
    }
    taskList.push({'type': 'write', 'x': 250, 'y': 250, value: '3'});
    taskList.push({'type': 'timeout', 'value': 1000});
    taskList.push({'type': 'clear', 'x': 250, 'y': 250});
    taskList.push({'type': 'write', 'x': 250, 'y': 250, value: '2'});
    taskList.push({'type': 'timeout', 'value': 1000});
    taskList.push({'type': 'clear', 'x': 250, 'y': 250});
    taskList.push({'type': 'write', 'x': 250, 'y': 250, value: '1'});
    taskList.push({'type': 'timeout', 'value': 1000});
    taskList.push({'type': 'clear', 'x': 250, 'y': 250});
    // 画出佩奇
    taskList.push({
        'type': 'drawImg',
        'x': 0,
        'y': 0,
        'z': 500,
        value: 'https://60547b06v7.oicp.vip/web_socket/img/pq2.jpg'
    });
    taskList.push({'type': 'timeout', 'value': 5000});
    taskList.push({'type': 'clearFull', 'x': 0, 'y': 0, 'z': 250});
    taskList.push({'type': 'clearFull', 'x': 250, 'y': 250, 'z': 250});
    taskList.push({'type': 'clearFull', 'x': 250, 'y': 0, 'z': 250});
    taskList.push({'type': 'clearFull', 'x': 0, 'y': 250, 'z': 250});

    // 写字
    var text = '  猜一下下面这位是谁的宝宝呀~~~';
    var textArr = text.split('');
    for (var t = 0; t < textArr.length; t++) {
        var o1 = {
            'type': 'write',
            'x': arr[parseInt(t / 9)][t % 9].x,
            'y': arr[parseInt(t / 9)][t % 9].y,
            'value': textArr[t]
        };
        taskList.push(o1);
    }
    // 再删除 文字
    for (var s = 0; s < textArr.length; s++) {
        var o2 = {'type': 'clear', 'x': arr[parseInt(s / 9)][s % 9].x, 'y': arr[parseInt(s / 9)][s % 9].y};
        taskList.push(o2);
    }
    taskList.push({'type': 'write', 'x': 250, 'y': 250, value: '5'});
    taskList.push({'type': 'timeout', 'value': 1000});
    taskList.push({'type': 'clear', 'x': 250, 'y': 250});
    taskList.push({'type': 'write', 'x': 250, 'y': 250, value: '4'});
    taskList.push({'type': 'timeout', 'value': 1000});
    taskList.push({'type': 'clear', 'x': 250, 'y': 250});
    taskList.push({'type': 'write', 'x': 250, 'y': 250, value: '3'});
    taskList.push({'type': 'timeout', 'value': 1000});
    taskList.push({'type': 'clear', 'x': 250, 'y': 250});
    taskList.push({'type': 'write', 'x': 250, 'y': 250, value: '2'});
    taskList.push({'type': 'timeout', 'value': 1000});
    taskList.push({'type': 'clear', 'x': 250, 'y': 250});
    taskList.push({'type': 'write', 'x': 250, 'y': 250, value: '1'});
    taskList.push({'type': 'timeout', 'value': 1000});
    taskList.push({'type': 'clear', 'x': 250, 'y': 250});
    // 画出佩奇
    taskList.push({
        'type': 'drawImg',
        'x': 0,
        'y': 0,
        'z': 500,
        value: 'https://60547b06v7.oicp.vip/web_socket/img/pq3.jpg'
    });
    taskList.push({'type': 'timeout', 'value': 5000});
    taskList.push({'type': 'clearFull', 'x': 0, 'y': 0, 'z': 250});
    taskList.push({'type': 'clearFull', 'x': 250, 'y': 250, 'z': 250});
    taskList.push({'type': 'clearFull', 'x': 250, 'y': 0, 'z': 250});
    taskList.push({'type': 'clearFull', 'x': 0, 'y': 250, 'z': 250});


    // 写字
    var text = '  宝宝，不要走，我们开始下一局~~~';
    var textArr = text.split('');
    for (var t = 0; t < textArr.length; t++) {
        var o1 = {
            'type': 'write',
            'x': arr[parseInt(t / 9)][t % 9].x,
            'y': arr[parseInt(t / 9)][t % 9].y,
            'value': textArr[t]
        };
        taskList.push(o1);
    }
    // 再删除 文字
    for (var s = 0; s < textArr.length; s++) {
        var o2 = {'type': 'clear', 'x': arr[parseInt(s / 9)][s % 9].x, 'y': arr[parseInt(s / 9)][s % 9].y};
        taskList.push(o2);
    }

    var doTask = function () {
        if (taskList.length === 0) {
            console.log('清除任务');
            clearInterval(taskId);

            modeDisabled = false;
            operationDisabled = false;
            line()
            return;
        }
        var task = taskList[0];
        if (task.type === 'clear') {
            ctx.clearRect(task.x + 5 - 23, task.y - 23, 47, 47);
        } else if (task.type === 'write') {
            ctx.fillText(task.value, task.x - 2, task.y + y_offset);
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
    var taskId = setInterval(doTask, 150, false);

};
// 结束第二步
var endGame2 = function () {

};
// 生成真实数据
var genData = function (deleteNum) {
    if (modeDisabled) {
        return;
    }
    var data = [];
    var ok_arr = [
        [9, 7, 8, 3, 1, 2, 6, 4, 5],
        [3, 1, 2, 6, 4, 5, 9, 7, 8],
        [6, 4, 5, 9, 7, 8, 3, 1, 2],
        [7, 8, 9, 1, 2, 3, 4, 5, 6],
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
        [4, 5, 6, 7, 8, 9, 1, 2, 3],
        [8, 9, 7, 2, 3, 1, 5, 6, 4],
        [2, 3, 1, 5, 6, 4, 8, 9, 7],
        [5, 6, 4, 8, 9, 7, 2, 3, 1]
    ];
    // 生成随机9个数
    var arr0 = [];
    while (true) {
        var n = getNum();
        if (arr0.includes(n) === false) {
            arr0.push(n);
        }
        if (arr0.length === 9) {
            break;
        }
    }
    // 转置
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            for (var k = 0; k < 9; k++) {
                if (ok_arr[i][j] === arr0[k]) {
                    ok_arr[i][j] = arr0[(k + 1) % 9];
                    break;
                }
            }
        }
    }
    // 转成一维的
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            data.push(ok_arr[i][j]);
        }
    }
    // 数据写到坐标上

    showData(data);

    // 删掉部分数据
    var needDeleteList = [];
    do {
        var d = parseInt(Math.random() * 80);
        if (!needDeleteList.includes(d)) {
            needDeleteList.push(d);
        }

    } while (needDeleteList.length < deleteNum);


    hiddenData(needDeleteList);
    // 更新汇总
    updateSum();
    // 发消息给自己
    var model = '未知';
    if (deleteNum === 20) {
        model = '简易';
    } else if (deleteNum === 30) {
        model = '一般';
    } else if (deleteNum === 50) {
        model = '困难';
    }
    showMsg('游戏已开始，模式为' + model);
    // 发消息给对面
    var msg = {'type': 'start', 'data': data.toString(), 'deleteData': needDeleteList.toString()};
    sendNotice('system:' + JSON.stringify(msg));
    // 谁发起谁先开始
    canPlay = true;
    document.getElementById('playerName').innerText = myName;
    document.getElementById('userTimeAll').innerText = 0;
    document.getElementById('userTime').innerText = 0;
    document.getElementById('failTimes').innerText = 0;
    if (gameTimeTask) {
        window.clearInterval(gameTimeTask);
    }
    gameTime();
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
// 显示真实数据
var showData = function (data) {
    if (data.length > 0) {
        // 数据写到坐标上
        var c = document.getElementById("myCanvas");
        var ctx = c.getContext("2d");
        ctx.font = "30px Arial";
        for (var i = 0; i < 81; i++) {
            ctx.clearRect(arr[parseInt(i / 9)][i % 9].x + 5 - 23, arr[parseInt(i / 9)][i % 9].y - 23, 47, 47);
            ctx.fillText(data[i], arr[parseInt(i / 9)][i % 9].x - 2, arr[parseInt(i / 9)][i % 9].y + y_offset);
            dataObj[arr[parseInt(i / 9)][i % 9].x + '-' + arr[parseInt(i / 9)][i % 9].y] = Number(data[i]);
            doNotClear[arr[parseInt(i / 9)][i % 9].x + '-' + arr[parseInt(i / 9)][i % 9].y] = Number(data[i]);
        }
    }
};
// 显示真实数据
var hiddenData = function (needDeleteList) {
    // 删掉部分数据
    for (var i = 0; i < needDeleteList.length; i++) {
        var d = needDeleteList[i];
        ctx.clearRect(arr[parseInt(d / 9)][d % 9].x + 5 - 23, arr[parseInt(d / 9)][d % 9].y - 23, 47, 47);
        delete doNotClear[arr[parseInt(d / 9)][d % 9].x + '-' + arr[parseInt(d / 9)][d % 9].y];
    }

};
// 判断是否全部完成
var isSuccess = function () {
    if (Object.getOwnPropertyNames(doNotClear).length === 81) {
        return true;
    } else {
        return false;
    }
};
// 获取随机数
var getNum = function (n) {
    var r = parseInt(Math.random() * 10);
    return r === 0 ? getNum() : r;

};

// 发送消息
var sendMsgButton = function () {

    var message = document.getElementById("message");
    if (message.value) {
        if (message.value === 'CYP/END') {
            endGame();
            message.value = '';
        } else {
            var msg = '[' + myName + '] ' + getDate('h:i:s') + ':' + message.value;
            showMsg(msg);
            sendNotice(message.value);
            message.value = '';
        }

    }
};
// 消息回车
document.getElementById("message").addEventListener('keydown', function (e) {
    if (e.keyCode === 13) {
        sendMsgButton();
    }
});
var showMsg = function (msg) {
    var messageArea = document.getElementById("messageArea");
    messageArea.append('\n' + msg);
    messageArea.scrollTop = messageArea.scrollHeight;
};
// 创建websocket

var createWebSocket = function () {
    var host = '60547b06v7.oicp.vip';
    var webName = 'web_socket';
    var userName = myName;
    var webSocket = new WebSocket('wss://' + host + '/' + webName + '/webSocket/' + userName);

    webSocket.onclose = function (e) {
        console.log("webSocket关闭连接!" + new Date().toLocaleString());
        showMsg(myName + "下线了！");
        sendNotice(myName + "下线了！")
    };
    webSocket.onerror = function () {
        console.log("webSocket连接错误!");
        showMsg(myName + "掉线了！");
        sendNotice(myName + "掉线了！")
    };
    webSocket.onopen = function () {
        console.log("webSocket连接成功!" + new Date().toLocaleString());
        showMsg(myName + "上线了！");
        sendNotice(myName + "上线了！")
    };
    webSocket.onmessage = function (event) {
        console.log("webSocket收到消息:" + event.data);
        var message = JSON.parse(event.data);
        if (message.msg && message.msg.startsWith('system:')) {
            // 系统消息
            var body = JSON.parse(message.msg.substr(7));
            if (body.type === 'start') {
                var data = body.data.split(',');
                var deleteData = body.deleteData.split(',');
                showData(data);
                hiddenData(deleteData);
                var model = '未知';
                var deleteNum = deleteData.length;
                if (deleteNum === 20) {
                    model = '简易';
                } else if (deleteNum === 30) {
                    model = '一般';
                } else if (deleteNum === 50) {
                    model = '困难';
                }
                showMsg('游戏已开始，模式为' + model);
                // 被动开局，不能操作
                // 更新汇总
                updateSum();
                canPlay = false;

            } else if (body.type === 'pick') {
                var x = Number(body.x);
                var y = Number(body.y);
                var value = Number(body.value);

                ctx.clearRect(x + 5 - 23, y - 23, 47, 47);
                ctx.fillText(value, x - 2, y + y_offset);

                doNotClear[x + '-' + y] = value;
                // 更新汇总
                updateSum();
                // 对面操作完成，自己可以操作
                canPlay = true;
                showToast('该你了', '200');
                document.getElementById('playerName').innerText = myName;
                gameTime()


            } else if (body.type === 'end') {
                var value = body.value;
                showToast(value, '1000');
                showMsg(myName + '[' + getDate('h:i:s') + ']:' + value);
                endGame();
                if (gameTimeTask) {
                    window.clearInterval(gameTimeTask);
                }
                document.getElementById('userTime').innerText = 0;

            } else if (body.type === 'selected') {
                var x = Number(body.x);
                var y = Number(body.y);
                if (friendLastSelect.x && friendLastSelect.y) {
                    ctx.clearRect(friendLastSelect.x + 5 - 23, friendLastSelect.y - 23, 47, 47);
                    if (doNotClear[friendLastSelect.x + '-' + friendLastSelect.y]) {
                        ctx.fillText(doNotClear[friendLastSelect.x + '-' + friendLastSelect.y], friendLastSelect.x - 2, friendLastSelect.y + y_offset);
                    }
                }
                ctx.strokeStyle = "#260aff";
                ctx.beginPath();
                ctx.arc(x + 5, y, 20, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.strokeStyle = "#FF5062";
                friendLastSelect.x = x;
                friendLastSelect.y = y;
            } else if (body.type === 'info') {
                showMsg('[' + getDate('h:i:s') + ']:' + body.value);
            }

        } else {
            var msg = message.from + '[' + getDate('h:i:s') + ']:' + message.msg;
            showMsg(msg);
        }

    };

    return webSocket

};
var webSocket = createWebSocket();

var sendNotice = function (msg) {
    var body = {"from": myName, "to": friendName, "msg": msg};
    webSocket.send(JSON.stringify(body));
};

var getDate = function (formatStr) {
    var fTime = new Date();
    var fStr = 'ymdhis';
    if (!formatStr) {
        formatStr = "y-m-d h:i:s";
    }


    var formatArr = [
        fTime.getFullYear().toString(),
        (fTime.getMonth() + 1).toString(),
        fTime.getDate().toString(),
        fTime.getHours().toString(),
        fTime.getMinutes().toString(),
        fTime.getSeconds().toString()
    ];
    for (var i = 0; i < formatArr.length; i++) {
        formatStr = formatStr.replace(fStr.charAt(i), formatArr[i]);
    }
    return formatStr;
};

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

