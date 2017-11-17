function getNodePosition(node) {
    var top = 0, left = 0;
    while(node){
        if(node.tagName){
            top += node.offsetTop;
            left += node.offsetLeft;
            node = node.offsetParent;
        }else {
            node = node.parentNode;
        }
    }
    return [left, top];
}

$(function () {
    $("#img-code").on('click', function (e) {
        var ev = e||event;
        var x = ev.pageX;
        var y = ev.pageY;
        var img = document.getElementById("img-code");
        var nodeX = getNodePosition(img)[0];
        var nodeY = getNodePosition(img)[1];
        var number = $("#hiddenPosition option").length;
        if(number > 2){
            return;
        }
        var deltaX = parseInt(x) - parseInt(nodeX);
        var deltaY = parseInt(y) - parseInt(nodeY);
        $("#hiddenPosition").append("<option value='" + (parseInt(number) + 1) + "'>" + deltaX + ":" + deltaY + "</option>");
        var childDiv = document.createElement('img');
        childDiv.style.left = (parseInt(x) - 10) + 'px';
        childDiv.style.top = (parseInt(y) - 10) + 'px';
        childDiv.style.border = '1px solid #ff0000';
        childDiv.style.position = 'absolute';
        childDiv.src = '/images/icon.png';
        childDiv.style.width = '20px';
        childDiv.style.height = '20px';
        childDiv.style.opacity = '0.5';
        document.body.appendChild(childDiv);
        var position = deltaX + ":" + deltaY;
        var oldPostion = $("#position").val();
        if(oldPostion != ""){
            $("#position").val(oldPostion + "," + position);
        }else{
            $("#position").val(position);
        }
        console.log("选中位置：", $("#position").val());
    });
    $("#loginForm").validate();
});