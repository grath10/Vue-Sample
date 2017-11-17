// 修改参数提交公共接口
function saveChanges(url, data, modalId, callback) {
    $.ajax({
        url: url,
        type: 'post',
        async: false,
        cache: false,
        contentType: 'application/json;charset=utf-8',
        data: data,
        success: function (response) {
            alert("更新成功");
            $(modalId).modal('hide');
            callback();
        },
        error: function () {
            alert("操作失败");
        }
    });
}

// 创建提交公共接口
function createSomething(url, params, modalId, callback) {
    $.ajax({
        url: url,
        data: params,
        async: false,
        success: function (response) {
            if (response == "success") {
                alert("添加成功");
                $(modalId).modal('hide');
                callback();
            } else {
                alert("操作出错");
            }
        }
    })
}

