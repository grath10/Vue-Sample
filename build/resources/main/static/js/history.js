// IN主题的数据展示方式待研究与讨论
$(function () {
    searchClient();
    var start = moment().subtract(1, 'hours');
    var end = moment();
    function cb(start, end) {
        $('#dateTimeRange span').html(start.format('YYYY-MM-DD HH') + '~' + end.format('YYYY-MM-DD HH'));
    }

    $("#dateTimeRange").daterangepicker({
        startDate: start,
        endDate: end,
        maxDate: moment(), //最大时间
        // dateLimit : {
        //     days : 30
        // }, //起止时间的最大间隔
        showDropdowns: true,
        showWeekNumbers: false, //是否显示第几周
        timePicker: true, //是否显示小时和分钟
        timePickerIncrement: 60, //时间的增量，单位为分钟
        timePicker24Hour: true, //是否使用24小时制显示时间
        /*ranges : {
            '最近1小时': [moment().subtract(1, 'hours'), moment()],
            '今日': [moment().startOf('day'), moment()],
            '昨日': [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')]
            // '最近7日': [moment().subtract(6, 'days'), moment()],
            // '最近30日': [moment().subtract(29, 'days'), moment()]
        },*/
        opens: 'right', //日期选择框的弹出位置
        buttonClasses: ['btn btn-default'],
        applyClass: 'btn-small btn-primary blue',
        cancelClass: 'btn-small',
        locale: {
            applyLabel: '确定',
            cancelLabel: '取消',
            fromLabel: '起始时间',
            toLabel: '结束时间',
            customRangeLabel: '自定义',
            daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
            monthNames: ['一月', '二月', '三月', '四月', '五月', '六月',
                '七月', '八月', '九月', '十月', '十一月', '十二月'],
            firstDay: 1
        }
    }, cb);
    cb(start, end);
});

function searchClient() {
    $("#module-id").select2({
        ajax: {
            url: '/device/fuzzyId',
            dataType: "json",
            delay: 250,
            data: function (params) {
                return {
                    id: params.term
                };
            },
            processResults: function (data, page) {
                var arr = [];
                for(var i=0;i<data.length;i++){
                    var client = data[i];
                    var obj={
                        "id": client['clientid'],
                        "text": client['clientid'],
                        "type": client['type']
                    };
                    arr.push(obj);
                }
                return {
                    results: arr
                };
            },
            cache: true
        },
        escapeMarkup: function (markup) {
            return markup;
        },
        minimumInputLength: 1,
        language: "zh-CN",
        placeholder: '请选择传感器',
        allowClear: true
    }).on("select2:select", function (event) {
        var realSelected = event.params.data.id;
        var selected = $("#module-id").select2("data");
        // console.log(selected[0] && selected[0].text);
        // console.log(realSelected);
    }).on("select2:unselect", function (event) {
        $(this).val(null).trigger('change');
    });
}

function getData() {
    var clientId = $("#module-id").val();
    if (clientId == "") {
        hideAllChart();
        alert("请输入编号");
        return;
    }
    // console.log("客户端编号:", clientId);
    var selectData = $("#module-id").select2("data");
    var category = "";
    for(var j=0;j<selectData.length;j++){
        var item = selectData[j];
        if(clientId == item['id']){
            category = item['type'];
            break;
        }
    }
    // console.log("类别:", category);
    var timeRange = $("#dateTimeRange span").html();
    var timeArr = timeRange.split("~");
    $.ajax({
        url: '/app/historyData',
        method: 'get',
        async: false,
        contentType: "application/json",
        data: {
            "clientid": clientId,
            "startTime": timeArr[0] + ":00:00",
            "endTime": timeArr[1] + ":59:59"
        },
        success: function (response) {
            /*var rows = response.length;
            var str = "";
            var type = "";
            for(var i=0;i<rows;i++){
                var obj = response[i];
                type = obj['keyword'];
                if(i == 0) {
                    str += getHeader(type);
                    str += "<tbody>" + getBody(type, obj);
                }else{
                    str += getBody(type, obj);
                }
            }
            $("#data-table").html(str + "</tbody>");*/
            drawPics(response, category);
        }
    });
}

function drawPics(data, type) {
    var timeAxis = [];
    var valueAxis = [];
    var channel = "";
    for (var i = 0; i < data.length; i++) {
        var row = data[i];
        timeAxis.push(row['collecttime']);
        valueAxis.push(row['value1']);
        channel = row['channel'];
        if (type == '电表') {
            if (i == 0) {
                var value2Arr = [];
                var value3Arr = [];
                var value4Arr = [];
                var value5Arr = [];
                var value6Arr = [];
            }
            value2Arr.push(row['value2']);
            value3Arr.push(row['value3']);
            value4Arr.push(row['value4']);
            value5Arr.push(row['value5']);
            value6Arr.push(row['value6']);
        }
    }
    if (type == '电表') {
        showChart();
        getLineChart(timeAxis, valueAxis, 1, '电压');
        getLineChart(timeAxis, value2Arr, 2, '电流');
        getLineChart(timeAxis, value3Arr, 3, '有功功率');
        getLineChart(timeAxis, value4Arr, 4, '功率因子');
        getLineChart(timeAxis, value5Arr, 5, '频率');
        getLineChart(timeAxis, value6Arr, 6, '总电量');
    } else if(type == '输入输出'){
        hideChart();
        showFirstChart();
        getBarChart(timeAxis, valueAxis, channel);
    } else{
        showFirstChart();
        getLineChart(timeAxis, valueAxis, 1, type);
        hideChart();
    }
}

function getLevelData(values, channel) {
    var data = [];
    var series = [];
    for(var i=0;i<values.length;i++){
        var value = values[i];
        var valBin = value.toString(2);
        var validVal = valBin.substring(-channel);
        if(i == 0){
            for(var j=0;j<channel;j++){
                data[j] = [];
            }
        }
        for(var k=channel;k>0;k--){
            data[k - 1].push(validVal[channel - k]);
        }
    }
    for(var l=0;l<channel;l++){
        var series = {
            name: "通道" + (l+1),
            type: 'bar',
            barWidth: 10,
            barGap: 10,
            data: data[l]
        }
        series.push(series);
    }
    console.log(JSON.stringify(series));
    return series;
}

function getLegend(channel) {
    var legend = [];
    for(var i=0;i<channel;i++){
        legend.push("通道" + (i+1));
    }
    return legend;
}

function getBarChart(timeAxis, valueAxis, channel) {
    var seriesArr = getLevelData(valueAxis, channel);
    var option = {
        title: {
            left: 'center',
            text: '输入电平变化',
            textStyle: {
                fontStyle: 'normal',
                fontWeight: 'normal',
                fontSize: 14
            }
        },
        grid: {
            top: 20,
            bottom: 65
        },
        legend: {
            data: getLegend(channel),
            selectedMode: 'single',
            top: 'bottom'
        },
        tooltip: {
            trigger: 'axis',
            show: false,
            formatter: function (params, ticket, callback) {
                if (params[0]) {
                    var timeArr = params[0].name.split(" ");
                    var time = timeArr[1].split(":");
                    return time[0] + ":" + time[1] + " " + params[0].value;
                }
            }
        },
        toolbox: {
            show: false,
            feature: {
                dataZoom: {
                    yAxisIndex: 'none'
                },
                dataView: {readOnly: false},
                magicType: {type: ['line', 'bar']},
                restore: {},
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: timeAxis,
            axisLabel: {
                formatter: function (value, index) {
                    var timeArr = value.split(" ");
                    var time = timeArr[1].split(":");
                    return time[0] + ":" + time[1];
                }
            }
        },
        yAxis: {
            type: 'value'
        },
        series: seriesArr
    };
    var myChart = echarts.init(document.getElementById('graph1'));
    myChart.setOption(option);
}

function showFirstChart() {
    $("#graph1").show();
}
function hideChart() {
    $("#graph2").hide();
    $("#graph3").hide();
    $("#graph4").hide();
    $("#graph5").hide();
    $("#graph6").hide();
}

function hideAllChart() {
    $("#graph1").hide();
    $("#graph2").hide();
    $("#graph3").hide();
    $("#graph4").hide();
    $("#graph5").hide();
    $("#graph6").hide();
}

function showChart() {
    $("#graph1").show();
    $("#graph2").show();
    $("#graph3").show();
    $("#graph4").show();
    $("#graph5").show();
    $("#graph6").show();
}

function getLineChart(timeAxis, dataArr, i, type) {
    var option = {
        title: {
            left: 'center',
            text: type + '变化',
            textStyle: {
                fontStyle: 'normal',
                fontWeight: 'normal',
                fontSize: 14
            }
        },
        grid: {
            top: 30,
            bottom: 20
        },
        tooltip: {
            trigger: 'axis',
            show: false,
            formatter: function (params, ticket, callback) {
                if (params[0]) {
                    var timeArr = params[0].name.split(" ");
                    var time = timeArr[1].split(":");
                    return time[0] + ":" + time[1] + " " + params[0].value;
                }
            }
        },
        // legend: {
        //     data:['值']
        // },
        toolbox: {
            show: false,
            feature: {
                dataZoom: {
                    yAxisIndex: 'none'
                },
                dataView: {readOnly: false},
                magicType: {type: ['line', 'bar']},
                restore: {},
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: timeAxis,
            axisLabel: {
                formatter: function (value, index) {
                    var timeArr = value.split(" ");
                    var time = timeArr[1].split(":");
                    return time[0] + ":" + time[1];
                }
            }
        },
        yAxis: {
            type: 'value',
            scale: true,
            // axisLabel: {
            //     formatter: '{value} °C'
            // }
        },
        series: [
            {
                name: '',
                type: 'line',
                data: dataArr,
                // markPoint: {
                //     data: [
                //         {name: '周最低', value: -2, xAxis: 1, yAxis: -1.5}
                //     ]
                // },
                markLine: {
                    data: [
                        {type: 'average', name: '平均值'},
                        [{
                            symbol: 'none',
                            x: '90%',
                            yAxis: 'max'
                        }, {
                            symbol: 'circle',
                            label: {
                                normal: {
                                    position: 'start',
                                    formatter: '最大值'
                                }
                            },
                            type: 'max',
                            name: '最高点'
                        }]
                    ]
                }
            }
        ]
    };
    var myChart = echarts.init(document.getElementById('graph' + i));
    myChart.setOption(option);
}

function getHeader(type) {
    var str;
    if (type != '电表') {
        str = "<thead><tr><td class='text-center'>采集时间</td><td class='text-center'>" + type + "</td>";
    } else {
        str = "<thead><tr><td class='text-center'>采集时间</td><td class='text-center'>电压</td><td class='text-center'>电流</td><td class='text-center'>有功功率</td>"
            + "<td class='text-center'>功率因子</td><td class='text-center'>频率</td><td class='text-center'>总电量</td>";
    }
    return str + "</tr></thead>";
}

function getBody(type, obj) {
    var str;
    if (type != '电表') {
        str = "<tr><td class='text-center'>" + obj['collecttime'] + "</td><td class='text-center'>" + obj['value1'] + "</td>";
    } else {
        str = "<tr><td class='text-center'>" + obj['collecttime'] + "</td><td class='text-center'>" + obj['value1'] + "</td><td class='text-center'>" + obj['value2'] + "</td><td class='text-center'>" + obj['value3']
            + "</td><td class='text-center'>" + obj['value4'] + "</td><td class='text-center'>" + obj['value5'] + "</td><td class='text-center'>" + obj['value6'] + "</td>";
    }
    return str + "</tr>";
}