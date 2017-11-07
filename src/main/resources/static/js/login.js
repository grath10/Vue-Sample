var handler = function (captchaObj) {
    $("#btnLoginForm").click(function (e) {
        var result = captchaObj.getValidate();
        if(!result){
            $("#notice").show();
            setTimeout(function () {
                $("#notice").hide();
            }, 2000);
            e.preventDefault();
        }
    });
    // 将验证码加到id为captcha的元素里，同时会有三个input值用于表单提交
    captchaObj.appendTo("#captcha");
    captchaObj.onReady(function () {
        $("#wait").hide();
    });
};
$.ajax({
    url: 'gt/register?t=' + (new Date()).getTime(),
    type: 'get',
    dataType: 'json',
    success: function (data) {
        // 调用initGeetest初始化参数
        // 参数1：配置参数，参数2：回调，回调的第一个参数为验证码对象
        // 之后可以使用它调用相应的接口
        initGeetest({
            gt: data.gt,
            challenge: data.challenge,
            new_captcha: data.new_captcha, // 用于宕机时表示是新验证码的宕机
            offline: !data.success, // 表示用户后台检测服务器是否宕机，一般不需要关注
            product: 'float', // 产品形式，包括：float，popup，embed
            width: '100%'
        }, handler);
    }
})
$(function () {
    $("#loginForm").validate();
});