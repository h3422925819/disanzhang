// 图表实例
let myChart;

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
    
    // 注册注释插件
    try {
        if (typeof window !== 'undefined' && window.ChartAnnotation) {
            Chart.register(window.ChartAnnotation);
            console.log('注释插件已注册');
        }
    } catch (error) {
        console.warn('注释插件注册失败:', error);
    }
    
    initTrigData();
    
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
    
    // 绑定控制元素事件
    const controlElements = [
        'updateChart', 'loadSampleData', 'resetData',
        'showGrid', 'gridStyle', 'showReferenceLine', 
        'showReferenceArea', 'showAnnotation', 'showTable'
    ];
    
    controlElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            const eventType = ['updateChart', 'loadSampleData', 'resetData'].includes(id) ? 'click' : 'change';
            element.addEventListener(eventType, updateChart);
        }
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
    
    console.log('事件监听器已绑定');
    
    // 设置默认选中的图表类型
    setTimeout(() => {
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
}

// 加载数据到输入框
function loadData(data) {
    const dataLabelsElement = document.getElementById('dataLabels');
    const dataValuesElement = document.getElementById('dataValues');
    const chartTitleElement = document.getElementById('chartTitle');
    
    if (dataLabelsElement) dataLabelsElement.value = data.labels.join(',');
    if (dataValuesElement) dataValuesElement.value = data.values.join(',');
    if (chartTitleElement) chartTitleElement.value = data.title;
    
    currentData = data;
    
    // 更新标题显示
    updateChartTitleDisplay(data.title);
    
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
        loadData({
            labels: trigData.labels,
            values: trigData.sineValues,
            title: trigData.title
        });
    } else {
        loadData({
            labels: ['产品A', '产品B', '产品C', '产品D', '产品E'],
            values: [120, 190, 80, 150, 180],
            title: '销售数据示例'
        });
    }
}

// 解析输入数据
function parseInputData() {
    const dataLabelsElement = document.getElementById('dataLabels');
    const dataValuesElement = document.getElementById('dataValues');
    const chartTitleElement = document.getElementById('chartTitle');
    
    const labels = dataLabelsElement.value
        .split(',')
        .map(label => label.trim())
        .filter(label => label);
    
    const values = dataValuesElement.value
        .split(',')
        .map(value => parseFloat(value.trim()))
        .filter(value => !isNaN(value));
    
    const title = chartTitleElement.value || '数据可视化';
    
    return { labels, values, title };
}

// 更新图表标题显示
function updateChartTitleDisplay(title) {
    const titleElement = document.getElementById('chartTitleDisplay');
    if (titleElement) {
        titleElement.textContent = title;
    }
}

// 更新图表
function updateChart() {
    const ctx = document.getElementById('myChart');
    if (!ctx) {
        console.error('无法找到图表画布元素');
        return;
    }
    
    const chartType = document.getElementById('chartType').value;
    const showGrid = document.getElementById('showGrid')?.checked || false;
    const gridStyle = document.getElementById('gridStyle')?.value || 'solid';
    const showReferenceLine = document.getElementById('showReferenceLine')?.checked || false;
    const showReferenceArea = document.getElementById('showReferenceArea')?.checked || false;
    const showAnnotation = document.getElementById('showAnnotation')?.checked || false;
    const showTable = document.getElementById('showTable')?.checked || false;
    
    // 检查是否是特殊图表类型
    if (chartType === 'sineCosine') {
        loadSineCosineChart();
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
    
    // 更新标题显示
    updateChartTitleDisplay(data.title);
    
    // 销毁旧图表
    if (myChart) {
        myChart.destroy();
        myChart = null;
    }
    
    // 创建新图表
    setTimeout(() => {
        try {
            const config = getChartConfig(chartType, data, {
                showGrid,
                gridStyle,
                showReferenceLine,
                showReferenceArea,
                showAnnotation
            });
            myChart = new Chart(ctx.getContext('2d'), config);
        } catch (error) {
            console.error('图表创建失败:', error);
            alert('图表创建失败，请检查数据格式');
        }
    }, 100);
    
    // 处理表格显示
    if (showTable) {
        addDataTable(data);
    } else {
        removeDataTable();
    }
}

// 获取图表配置
function getChartConfig(type, data, options = {}) {
    const { showGrid = false, gridStyle = 'solid' } = options;
    
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
                pointHoverRadius: type === 'line' ? 6 : type === 'scatter' ? 8 : 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: { size: 14 }
                    }
                },
                title: {
                    display: true,
                    text: data.title,
                    font: { size: 18, weight: 'bold' },
                    padding: { top: 10, bottom: 30 }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#ddd',
                    borderWidth: 1
                }
            }
        }
    };
    
    // 添加坐标轴配置
    if (type !== 'pie' && type !== 'doughnut' && type !== 'polarArea' && type !== 'radar') {
        config.options.scales = {
            y: {
                beginAtZero: true,
                grid: showGrid ? {
                    color: 'rgba(0, 0, 0, 0.1)',
                    borderDash: gridStyle === 'dashed' ? [5, 5] : gridStyle === 'dotted' ? [2, 2] : []
                } : { display: false }
            },
            x: {
                grid: showGrid ? {
                    color: 'rgba(0, 0, 0, 0.1)',
                    borderDash: gridStyle === 'dashed' ? [5, 5] : gridStyle === 'dotted' ? [2, 2] : []
                } : { display: false }
            }
        };
    }
    
    // 散点图特殊处理
    if (type === 'scatter') {
        config.data.datasets[0].data = data.values.map((value, index) => ({
            x: index * 10,
            y: value
        }));
    }
    
    return config;
}

// 加载正弦余弦图表
function loadSineCosineChart() {
    const ctx = document.getElementById('myChart');
    if (!ctx) {
        console.error('无法找到图表画布元素');
        return;
    }
    
    if (myChart) {
        myChart.destroy();
        myChart = null;
    }
    
    const config = {
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
                    display: true,
                    position: 'top'
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
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'x'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    };
    
    // 更新标题显示
    updateChartTitleDisplay(trigData.title);
    
    setTimeout(() => {
        try {
            myChart = new Chart(ctx.getContext('2d'), config);
        } catch (error) {
            console.error('正弦余弦图表创建失败:', error);
        }
    }, 100);
}

// 添加数据表格
function addDataTable(data) {
    const container = document.querySelector('.chart-container');
    let tableDiv = document.getElementById('dataTable');
    
    if (!tableDiv) {
        tableDiv = document.createElement('div');
        tableDiv.id = 'dataTable';
        tableDiv.style.marginTop = '20px';
        container.appendChild(tableDiv);
    }
    
    const total = data.values.reduce((sum, val) => sum + val, 0);
    
    const tableHTML = `
        <h3 style="margin-bottom: 10px; color: #1f2937; font-size: 16px;">数据表格</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
                <tr style="background: #f3f4f6;">
                    <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">项目</th>
                    <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">数值</th>
                    <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">百分比</th>
                </tr>
            </thead>
            <tbody>
                ${data.labels.map((label, index) => {
                    const value = data.values[index];
                    const percentage = ((value / total) * 100).toFixed(1);
                    return `
                        <tr>
                            <td style="border: 1px solid #e5e7eb; padding: 8px;">${label}</td>
                            <td style="border: 1px solid #e5e7eb; padding: 8px;">${value}</td>
                            <td style="border: 1px solid #e5e7eb; padding: 8px;">${percentage}%</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    
    tableDiv.innerHTML = tableHTML;
}

// 移除数据表格
function removeDataTable() {
    const tableDiv = document.getElementById('dataTable');
    if (tableDiv) {
        tableDiv.remove();
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

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);