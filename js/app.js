// 图表实例
let myChart;
let miniCharts = {};

// 当前数据
let currentData = {
    labels: ['类别1', '类别2', '类别3', '类别4', '类别5'],
    values: [12, 19, 3, 15, 8],
    title: '数据可视化示例'
};



// 正弦余弦数据
const trigData = {
    labels: [],
    sineValues: [],
    cosineValues: [],
    title: '正弦余弦函数对比'
};

// 初始化正弦余弦数据
function initTrigData() {
    const x = [];
    const sineValues = [];
    const cosineValues = [];
    
    for (let i = 0; i <= 20; i++) {
        const angle = (i / 20) * 2 * Math.PI;
        x.push(i);
        sineValues.push(Math.sin(angle));
        cosineValues.push(Math.cos(angle));
    }
    
    trigData.labels = x;
    trigData.sineValues = sineValues;
    trigData.cosineValues = cosineValues;
}

// 初始化
function init() {
    console.log('开始初始化应用...');
    
    // 检查Chart.js是否加载
    if (typeof Chart === 'undefined') {
        console.error('Chart.js未加载');
        return;
    }
    
    // 尝试注册注释插件 - 使用新的API
    try {
        // 检查注释插件是否已通过script标签加载
        if (typeof window !== 'undefined' && window.ChartAnnotation) {
            Chart.register(window.ChartAnnotation);
            console.log('注释插件已注册 (window.ChartAnnotation)');
        } else if (typeof Chart !== 'undefined' && Chart.Annotation) {
            Chart.register(Chart.Annotation);
            console.log('注释插件已注册 (Chart.Annotation)');
        } else {
            console.warn('注释插件未找到，将动态加载');
            // 预加载注释插件
            loadAnnotationPlugin().then(() => {
                console.log('注释插件预加载完成');
            }).catch(err => {
                console.warn('注释插件预加载失败:', err);
            });
        }
    } catch (error) {
        console.warn('注释插件注册失败:', error);
    }
    
    initTrigData();
    
    // 初始化图例状态
    legendState = {
        visible: true,
        position: 'top',
        style: 'default'
    };
    
    // 绑定事件监听器
    const elements = [
        'updateChart', 'resetData', 'loadSampleData',
        'showGrid', 'gridStyle', 'showReferenceLine', 
        'showReferenceArea', 'showAnnotation', 'showTable'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            const eventType = id === 'updateChart' || id === 'resetData' || id === 'loadSampleData' ? 'click' : 'change';
            element.addEventListener(eventType, updateChart);
        } else {
            console.warn('未找到元素:', id);
        }
    });
    
    // 绑定图表类型卡片点击事件
    const chartTypeCards = document.querySelectorAll('.chart-type-card');
    chartTypeCards.forEach(card => {
        card.addEventListener('click', function() {
            // 移除所有active类
            chartTypeCards.forEach(c => c.classList.remove('active'));
            // 添加active类到当前卡片
            this.classList.add('active');
            // 设置隐藏的select值
            const chartTypeInput = document.getElementById('chartType');
            if (chartTypeInput) {
                chartTypeInput.value = this.dataset.type;
            }
            // 更新图表
            updateChart();
        });
    });
    
    // 绑定图表操作按钮
    const downloadBtn = document.getElementById('downloadChart');
    const fullscreenBtn = document.getElementById('fullscreenChart');
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadChart);
    }
    
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }
    
    // 绑定主题切换
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // 绑定特殊事件
    document.getElementById('resetData').addEventListener('click', resetData);
    document.getElementById('loadSampleData').addEventListener('click', loadSampleData);
    
    // 绑定图例控制事件
    initLegendControls();
    
    console.log('事件监听器已绑定');
    
    // 等待DOM完全加载后初始化图表
    setTimeout(() => {
        console.log('加载初始数据...');
        // 确保默认图表类型被选中
        const firstCard = document.querySelector('.chart-type-card');
        if (firstCard) {
            firstCard.classList.add('active');
            const chartTypeInput = document.getElementById('chartType');
            if (chartTypeInput) {
                chartTypeInput.value = firstCard.dataset.type || 'bar';
            }
        }
        loadData(currentData);
    }, 300);
    
    // 初始化示例图表
    initExampleCharts();
}

// 加载数据到输入框
function loadData(data) {
    document.getElementById('dataLabels').value = data.labels.join(',');
    document.getElementById('dataValues').value = data.values.join(',');
    document.getElementById('chartTitle').value = data.title;
    currentData = data;
    
    // 延迟更新图表以确保DOM准备就绪
    setTimeout(() => {
        updateChart();
    }, 100);
}

// 重置数据
function resetData() {
    loadData({
        labels: ['类别1', '类别2', '类别3', '类别4', '类别5'],
        values: [12, 19, 3, 15, 8],
        title: '数据可视化示例'
    });
}

// 加载示例数据
function loadSampleData() {
    const chartType = document.getElementById('chartType').value;
    if (chartType === 'sineCosine') {
        // 加载正弦余弦数据
        document.getElementById('dataLabels').value = trigData.labels.join(',');
        document.getElementById('dataValues').value = trigData.sineValues.join(',');
        document.getElementById('chartTitle').value = trigData.title;
        updateChart();
    } else {
        // 加载默认示例数据
        loadData({
            labels: ['产品A', '产品B', '产品C', '产品D', '产品E'],
            values: [120, 190, 80, 150, 180],
            title: '销售数据示例'
        });
    }
}

// 解析输入数据
function parseInputData() {
    const labels = document.getElementById('dataLabels').value
        .split(',')
        .map(label => label.trim())
        .filter(label => label);
    
    const values = document.getElementById('dataValues').value
        .split(',')
        .map(value => parseFloat(value.trim()))
        .filter(value => !isNaN(value));
    
    const title = document.getElementById('chartTitle').value || '数据可视化';
    
    return { labels, values, title };
}

// 获取图表配置
function getChartConfig(type, data, options = {}) {
    const {
        showLegend = true,
        legendPosition = 'top',
        showGrid = false,
        gridAxis = 'both',
        gridStyle = 'solid',
        showReferenceLine = false,
        showReferenceArea = false,
        showAnnotation = false,
        showTable = false
    } = options;
    const colors = [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)'
    ];
    
    const borderColors = [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
    ];
    
    const config = {
        type: type,
        data: {
            labels: data.labels,
            datasets: [{
                label: data.title,
                data: data.values,
                backgroundColor: type === 'line' ? 'rgba(54, 162, 235, 0.2)' : 
                    type === 'scatter' ? 'rgba(75, 192, 192, 0.6)' :
                    colors.slice(0, data.values.length),
                borderColor: type === 'line' ? 'rgba(54, 162, 235, 1)' : 
                    type === 'scatter' ? 'rgba(75, 192, 192, 1)' :
                    borderColors.slice(0, data.values.length),
                borderWidth: 2,
                tension: type === 'line' ? 0.4 : 0,
                fill: type === 'line' ? true : false,
                pointRadius: type === 'line' ? 4 : type === 'scatter' ? 6 : 0,
                pointHoverRadius: type === 'line' ? 6 : type === 'scatter' ? 8 : 0,
                pointBackgroundColor: type === 'line' ? 'rgba(54, 162, 235, 1)' : 
                    type === 'scatter' ? 'rgba(75, 192, 192, 1)' :
                    borderColors.slice(0, data.values.length),
                pointBorderColor: type === 'line' ? '#fff' : 
                    type === 'scatter' ? 'rgba(75, 192, 192, 1)' :
                    borderColors.slice(0, data.values.length),
                pointBorderWidth: type === 'line' ? 2 : type === 'scatter' ? 1 : 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        plugins: {
            legend: {
                display: showLegend,
                position: legendPosition,
                align: 'center',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    font: {
                        size: 14
                    },
                    generateLabels: function(chart) {
                        const data = chart.data;
                        if (data.labels.length && data.datasets.length) {
                            const dataset = data.datasets[0];
                            const total = dataset.data.reduce((sum, val) => sum + val, 0);
                            
                            return data.labels.map((label, i) => {
                                const value = dataset.data[i];
                                const percentage = ((value / total) * 100).toFixed(1);
                                const meta = chart.getDatasetMeta(0);
                                
                                return {
                                    text: `${label}: ${value} (${percentage}%)`,
                                    fillStyle: dataset.backgroundColor[i] || dataset.backgroundColor,
                                    strokeStyle: dataset.borderColor[i] || dataset.borderColor,
                                    lineWidth: dataset.borderWidth,
                                    hidden: isNaN(dataset.data[i]) || meta.data[i].hidden,
                                    index: i
                                };
                            });
                        }
                        return [];
                    }
                }
            },
            title: {
                display: true,
                text: data.title,
                font: {
                    size: 18,
                    weight: 'bold'
                },
                padding: {
                    top: 10,
                    bottom: 30
                }
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#ddd',
                borderWidth: 1,
                callbacks: {
                    label: function(context) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        label += context.parsed.y !== undefined ? context.parsed.y : context.parsed;
                        
                        if (type === 'pie' || type === 'doughnut') {
                            const dataset = context.dataset;
                            const total = dataset.data.reduce((sum, val) => sum + val, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            label += ` (${percentage}%)`;
                        }
                        
                        return label;
                    }
                }
            }
        },
            scales: type === 'pie' || type === 'doughnut' || type === 'polarArea' || type === 'radar' ? {} : {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    };
    
    // 散点图特殊处理
    if (type === 'scatter') {
        config.data.datasets[0].data = data.values.map((value, index) => ({
            x: index,
            y: value
        }));
    }
    
    return config;
}

// 更新图表
function updateChart() {
    const ctx = document.getElementById('myChart');
    if (!ctx) {
        console.error('无法找到图表画布元素');
        return;
    }
    
    const chartType = document.getElementById('chartType').value;
    const legendStateObj = getLegendState();
    const showGrid = document.getElementById('showGrid').checked;
    const gridAxis = document.getElementById('gridAxis').value;
    const gridStyle = document.getElementById('gridStyle').value;
    const showReferenceLine = document.getElementById('showReferenceLine').checked;
    const showReferenceArea = document.getElementById('showReferenceArea').checked;
    const showAnnotation = document.getElementById('showAnnotation').checked;
    const showTable = document.getElementById('showTable').checked;
    
    // 更新图表容器样式
    updateChartContainerStyle();
    
    // 检查是否是示例图表类型
    if (chartType === 'sineCosine') {
        loadExampleChart(chartType);
        return;
    }
    
    const data = parseInputData();
    
    if (data.labels.length === 0 || data.values.length === 0) {
        alert('请输入有效的数据标签和数值');
        return;
    }
    
    if (data.labels.length !== data.values.length) {
        alert('数据标签和数值数量必须相同');
        return;
    }
    
    // 销毁旧图表
    if (myChart) {
        myChart.destroy();
        myChart = null;
    }
    
    // 更新标题显示
    updateChartTitleDisplay(data.title);
    
    // 等待DOM更新后创建新图表
    setTimeout(() => {
        try {
            // 使用增强的图表创建函数
            createEnhancedChart(ctx.getContext('2d'), chartType, data, {
                showLegend: legendStateObj.visible,
                legendPosition: legendStateObj.position,
                legendStyle: legendStateObj.style,
                showGrid,
                gridAxis,
                gridStyle,
                showReferenceLine,
                showReferenceArea,
                showAnnotation,
                showTable,
                data: data
            });
        } catch (error) {
            console.error('图表创建失败:', error);
            alert('图表创建失败，请检查数据格式');
        }
    }, 100);
    
    // 添加表格（如果需要）
    if (showTable) {
        addDataTable(data);
    } else {
        removeDataTable();
    }
}

// 初始化示例图表（已在图表类型选择中集成）
function initExampleCharts() {
    // 不再需要初始化多个小图表，所有示例都集成到主图表中
}

// 加载示例图表
function loadExampleChart(exampleType) {
    const ctx = document.getElementById('myChart');
    if (!ctx) {
        console.error('无法找到图表画布元素');
        return;
    }
    
    if (myChart) {
        myChart.destroy();
        myChart = null;
    }
    
    const showGrid = document.getElementById('showGrid').checked;
    const gridAxis = document.getElementById('gridAxis').value;
    const gridStyle = document.getElementById('gridStyle').value;
    const showReferenceLine = document.getElementById('showReferenceLine').checked;
    const showReferenceArea = document.getElementById('showReferenceArea').checked;
    const showAnnotation = document.getElementById('showAnnotation').checked;
    const legendStateObj = getLegendState();
    
    let config;
    let chartData;
    
    switch (exampleType) {
        case 'sineCosine':
        case 'sineCosine':
            chartData = {
                labels: trigData.labels,
                values: trigData.sineValues,
                title: trigData.title
            };
            const sineCosConfig = {
                type: 'line',
                data: {
                    labels: trigData.labels,
                    datasets: [
                        {
                            label: 'sin(x)',
                            data: trigData.sineValues,
                            borderColor: 'rgba(54, 162, 235, 1)',
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            tension: 0.4,
                            fill: false,
                            borderWidth: 2,
                            pointRadius: 3,
                            pointHoverRadius: 5
                        },
                        {
                            label: 'cos(x)',
                            data: trigData.cosineValues,
                            borderColor: 'rgba(255, 99, 132, 1)',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            tension: 0.4,
                            fill: false,
                            borderWidth: 2,
                            pointRadius: 3,
                            pointHoverRadius: 5
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: legendStateObj.visible,
                            position: legendStateObj.position,
                            align: 'center',
                            labels: {
                                padding: 20,
                                usePointStyle: true,
                                font: {
                                    size: 14
                                }
                            }
                        },
                        title: {
                            display: true,
                            text: trigData.title,
                            font: { size: 16, weight: 'bold' }
                        }
                    },
                    scales: {
                        y: {
                            title: {
                                display: true,
                                text: '函数值'
                            },
                            grid: showGrid ? {
                                color: 'rgba(0, 0, 0, 0.1)',
                                borderDash: gridStyle === 'dashed' ? [5, 5] : gridStyle === 'dotted' ? [2, 2] : []
                            } : { display: false }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'x'
                            },
                            grid: showGrid ? {
                                color: 'rgba(0, 0, 0, 0.1)',
                                borderDash: gridStyle === 'dashed' ? [5, 5] : gridStyle === 'dotted' ? [2, 2] : []
                            } : { display: false }
                        }
                    },
                    animation: {
                        duration: 1500,
                        easing: 'easeInOutQuart'
                    }
                }
            };
            config = sineCosConfig;
            break;
            
    }
    
    // 添加注释、参考线和参考区域配置
    if (showAnnotation || showReferenceLine || showReferenceArea) {
        if (config.options.plugins === undefined) {
            config.options.plugins = {};
        }
        
        // 创建注释配置
        const annotations = {};
        
        // 添加参考线
        if (showReferenceLine) {
            // 根据图表类型调整参考线
            if (exampleType === 'movieBoxOffice' || exampleType === 'histogram') {
                // 柱状图的参考线
                annotations.centerLine = {
                    type: 'line',
                    yMin: 25,
                    yMax: 25,
                    borderColor: 'rgb(255, 99, 132)',
                    borderWidth: 2,
                    borderDash: [6, 6],
                    label: {
                        content: '平均线',
                        display: true,
                        position: 'end',
                        backgroundColor: 'rgba(255, 99, 132, 0.8)',
                        color: 'white',
                        padding: 4,
                        font: { size: 12 }
                    }
                };
            } else {
                // 散点图或线图的参考线
                annotations.centerX = {
                    type: 'line',
                    xMin: 50,
                    xMax: 50,
                    borderColor: 'rgb(255, 99, 132)',
                    borderWidth: 2,
                    borderDash: [6, 6],
                    label: {
                        content: '中心线',
                        display: true,
                        position: 'end',
                        backgroundColor: 'rgba(255, 99, 132, 0.8)',
                        color: 'white',
                        padding: 4,
                        font: { size: 12 }
                    }
                };
            }
        }
        
        // 添加参考区域
        if (showReferenceArea) {
            if (exampleType === 'movieBoxOffice' || exampleType === 'histogram') {
                // 柱状图的参考区域
                annotations.referenceArea = {
                    type: 'box',
                    yMin: 30,
                    yMax: 50,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    label: {
                        content: '目标区间',
                        display: true,
                        position: 'center',
                        backgroundColor: 'rgba(54, 162, 235, 0.8)',
                        color: 'white',
                        padding: 4,
                        font: { size: 12 }
                    }
                };
            } else {
                // 散点图的参考区域
                annotations.referenceArea = {
                    type: 'box',
                    xMin: 20,
                    xMax: 40,
                    yMin: 20,
                    yMax: 40,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    label: {
                        content: '参考区域',
                        display: true,
                        position: 'center',
                        backgroundColor: 'rgba(54, 162, 235, 0.8)',
                        color: 'white',
                        padding: 4,
                        font: { size: 12 }
                    }
                };
            }
        }
        
        // 添加注释
        if (showAnnotation && chartData && exampleType === 'sineCosine') {
            annotations.sineAnnotation = {
                type: 'point',
                xValue: 10,
                yValue: 0,
                backgroundColor: 'rgba(255, 99, 132, 1)',
                radius: 8,
                label: {
                    content: '零点交叉',
                    display: true,
                    position: 'top',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: 'rgb(255, 99, 132)',
                    font: { size: 12, weight: 'bold' },
                    padding: 6,
                    borderRadius: 4
                }
            };
        }
        
        // 检查注释插件是否可用并应用配置
        if (typeof Chart !== 'undefined' && (Chart.Annotation || window.ChartAnnotation)) {
            config.options.plugins.annotation = {
                annotations: annotations
            };
            console.log('已添加注释配置，注释数量:', Object.keys(annotations).length);
        } else {
            console.warn('注释插件未加载，已禁用注释功能');
        }
    }
    
    // 等待DOM更新后创建图表
    setTimeout(() => {
        try {
            myChart = new Chart(ctx.getContext('2d'), config);
        } catch (error) {
            console.error('示例图表创建失败:', error);
            alert('示例图表创建失败');
        }
    }, 100);
}



// 图例控制相关变量
let legendState = {
    visible: true,
    position: 'top',
    style: 'default'
};

// 初始化图例控制
function initLegendControls() {
    const legendToggle = document.getElementById('legendToggle');
    const legendOptions = document.getElementById('legendOptions');
    const positionButtons = document.querySelectorAll('.pos-btn');
    const styleButtons = document.querySelectorAll('.style-btn');
    
    // 主按钮点击事件
    if (legendToggle) {
        legendToggle.addEventListener('click', function() {
            legendState.visible = !legendState.visible;
            updateLegendToggleUI();
            updateChart();
        });
    }
    
    // 位置按钮点击事件
    positionButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有active类
            positionButtons.forEach(b => b.classList.remove('active'));
            // 添加active类到当前按钮
            this.classList.add('active');
            // 更新状态
            legendState.position = this.dataset.position;
            // 如果图例隐藏，则显示图例
            if (!legendState.visible) {
                legendState.visible = true;
                updateLegendToggleUI();
            }
            updateChart();
        });
    });
    
    // 样式按钮点击事件
    styleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有active类
            styleButtons.forEach(b => b.classList.remove('active'));
            // 添加active类到当前按钮
            this.classList.add('active');
            // 更新状态
            legendState.style = this.dataset.style;
            // 如果图例隐藏，则显示图例
            if (!legendState.visible) {
                legendState.visible = true;
                updateLegendToggleUI();
            }
            updateChart();
        });
    });
    
    // 初始化UI
    updateLegendToggleUI();
}

// 更新图例切换按钮UI
function updateLegendToggleUI() {
    const legendToggle = document.getElementById('legendToggle');
    const legendOptions = document.getElementById('legendOptions');
    const legendText = legendToggle.querySelector('.legend-text');
    const legendIcon = legendToggle.querySelector('.legend-icon');
    
    if (legendState.visible) {
        legendToggle.classList.remove('inactive');
        legendToggle.classList.add('active');
        legendText.textContent = '隐藏图例';
        legendIcon.textContent = '📊';
        if (legendOptions) {
            legendOptions.classList.add('show');
        }
    } else {
        legendToggle.classList.remove('active');
        legendToggle.classList.add('inactive');
        legendText.textContent = '显示图例';
        legendIcon.textContent = '📈';
        if (legendOptions) {
            legendOptions.classList.remove('show');
        }
    }
}

// 获取当前图例状态（用于图表配置）
function getLegendState() {
    return legendState;
}

// 更新图表容器样式类
function updateChartContainerStyle() {
    const chartContainer = document.querySelector('.chart-container');
    if (!chartContainer) return;
    
    // 移除所有图例样式类
    chartContainer.classList.remove('compact-legend', 'detailed-legend');
    
    // 添加当前样式类
    if (legendState.style === 'compact') {
        chartContainer.classList.add('compact-legend');
    } else if (legendState.style === 'detailed') {
        chartContainer.classList.add('detailed-legend');
    }
}

// 下载图表
function downloadChart() {
    if (!myChart) {
        alert('请先创建图表');
        return;
    }
    
    const link = document.createElement('a');
    link.download = `chart_${Date.now()}.png`;
    link.href = myChart.toBase64Image();
    link.click();
}

// 全屏切换
function toggleFullscreen() {
    const chartDisplay = document.querySelector('.chart-display');
    if (!chartDisplay) return;
    
    if (chartDisplay.classList.contains('fullscreen')) {
        chartDisplay.classList.remove('fullscreen');
        document.body.style.overflow = '';
    } else {
        chartDisplay.classList.add('fullscreen');
        document.body.style.overflow = 'hidden';
    }
    
    // 触发图表重绘
    setTimeout(() => {
        if (myChart) {
            myChart.resize();
        }
    }, 100);
}

// 主题切换
function toggleTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('.theme-icon');
    
    if (document.body.classList.contains('dark-theme')) {
        document.body.classList.remove('dark-theme');
        themeIcon.textContent = '🌙';
    } else {
        document.body.classList.add('dark-theme');
        themeIcon.textContent = '☀️';
    }
    
    // 重新渲染图表以应用新主题
    if (myChart) {
        setTimeout(() => {
            myChart.update();
        }, 100);
    }
}

// 更新图表标题显示
function updateChartTitleDisplay(title) {
    const titleElement = document.getElementById('chartTitleDisplay');
    if (titleElement) {
        titleElement.textContent = title;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);