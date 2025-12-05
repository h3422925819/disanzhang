// 图表实例
let myChart;

// 显示错误信息
function showError(message) {
    const chartContainer = document.querySelector('.chart-container');
    if (chartContainer) {
        chartContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #e74c3c;">
                <h3>⚠️ 加载错误</h3>
                <p>${message}</p>
                <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    重新加载页面
                </button>
            </div>
        `;
    }
}

// 当前数据
let currentData = {
    labels: ['产品A', '产品B', '产品C', '产品D', '产品E'],
    values: [450, 320, 280, 510, 380],
    title: '产品销售数据分析'
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
        showError('Chart.js库加载失败，请检查网络连接');
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
    
    // 绑定图表类型选择事件
    const chartTypeSelect = document.getElementById('chartType');
    if (chartTypeSelect) {
        chartTypeSelect.addEventListener('change', updateChart);
    }
    
    // 绑定控制元素事件
    const controlElements = [
        'updateChart', 'resetData',
        'showGrid', 'gridStyle', 'showReferenceLine', 
        'showReferenceArea', 'showAnnotation', 'showTable'
    ];
    
    controlElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            const eventType = ['updateChart', 'resetData'].includes(id) ? 'click' : 'change';
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
    
    // 加载初始数据
    setTimeout(() => {
        loadData(currentData);
        
        // 确保表格初始状态是隐藏的
        const tableContainer = document.getElementById('dataTableContainer');
        if (tableContainer) {
            tableContainer.style.display = 'none';
        }
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
        labels: ['产品A', '产品B', '产品C', '产品D', '产品E'],
        values: [450, 320, 280, 510, 380],
        title: '产品销售数据分析'
    });
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

// 计算平均值
function calculateAverage(values) {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
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
                showAnnotation,
                chartType
            });
            myChart = new Chart(ctx.getContext('2d'), config);
        } catch (error) {
            console.error('图表创建失败:', error);
            alert('图表创建失败，请检查数据格式');
        }
    }, 100);
    
    // 处理表格显示
    const tableContainer = document.getElementById('dataTableContainer');
    if (showTable) {
        createDataTable(data);
        if (tableContainer) {
            tableContainer.style.display = 'block';
        }
    } else {
        if (tableContainer) {
            tableContainer.style.display = 'none';
        }
    }
}

// 获取图表配置
function getChartConfig(type, data, options = {}) {
    const { 
        showGrid = false, 
        gridStyle = 'solid',
        showReferenceLine = false,
        showReferenceArea = false,
        showAnnotation = false,
        chartType = 'bar'
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
    
    // 计算平均值用于参考线
    const average = calculateAverage(data.values);
    const minValue = Math.min(...data.values);
    const maxValue = Math.max(...data.values);
    
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
                    borderDash: gridStyle === 'dashed' ? [5, 5] : gridStyle === 'dotted' ? [2, 2] : false,
                    drawBorder: false
                } : { display: false }
            },
            x: {
                grid: showGrid ? {
                    color: 'rgba(0, 0, 0, 0.1)',
                    borderDash: gridStyle === 'dashed' ? [5, 5] : gridStyle === 'dotted' ? [2, 2] : false,
                    drawBorder: false
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
    
    // 添加注释、参考线和参考区域
    if (showReferenceLine || showReferenceArea || showAnnotation) {
        config.options.plugins.annotation = {
            annotations: {}
        };
        
        // 添加参考线（平均值）
        if (showReferenceLine && type !== 'pie' && type !== 'doughnut' && type !== 'polarArea' && type !== 'radar') {
            config.options.plugins.annotation.annotations.averageLine = {
                type: 'line',
                yMin: average,
                yMax: average,
                borderColor: 'rgb(255, 99, 132)',
                borderWidth: 2,
                borderDash: [6, 6],
                label: {
                    content: `平均值: ${average.toFixed(1)}`,
                    display: true,
                    position: 'end',
                    backgroundColor: 'rgba(255, 99, 132, 0.8)',
                    color: 'white',
                    padding: 6,
                    font: { size: 12, weight: 'bold' }
                }
            };
        }
        
        // 添加参考区域
        if (showReferenceArea && type !== 'pie' && type !== 'doughnut' && type !== 'polarArea' && type !== 'radar') {
            const range = (maxValue - minValue) * 0.3; // 30%的范围
            config.options.plugins.annotation.annotations.referenceArea = {
                type: 'box',
                yMin: average - range/2,
                yMax: average + range/2,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                label: {
                    content: '目标区域',
                    display: true,
                    position: 'center',
                    backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    color: 'white',
                    padding: 6,
                    font: { size: 12, weight: 'bold' }
                }
            };
        }
        
        // 添加注释
        if (showAnnotation) {
            const maxIndex = data.values.indexOf(maxValue);
            if (maxIndex !== -1) {
                if (type === 'scatter') {
                    config.options.plugins.annotation.annotations.maxPoint = {
                        type: 'point',
                        xValue: maxIndex * 10,
                        yValue: maxValue,
                        backgroundColor: 'rgba(255, 99, 132, 1)',
                        radius: 8,
                        label: {
                            content: '最大值',
                            display: true,
                            position: 'top',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            color: 'rgb(255, 99, 132)',
                            font: { size: 12, weight: 'bold' },
                            padding: 6,
                            borderRadius: 4
                        }
                    };
                } else {
                    config.options.plugins.annotation.annotations.maxPoint = {
                        type: 'point',
                        xValue: data.labels[maxIndex],
                        yValue: maxValue,
                        backgroundColor: 'rgba(255, 99, 132, 1)',
                        radius: 8,
                        label: {
                            content: '最大值',
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
            }
        }
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
    
    const showGrid = document.getElementById('showGrid')?.checked || false;
    const gridStyle = document.getElementById('gridStyle')?.value || 'solid';
    const showReferenceLine = document.getElementById('showReferenceLine')?.checked || false;
    const showReferenceArea = document.getElementById('showReferenceArea')?.checked || false;
    const showAnnotation = document.getElementById('showAnnotation')?.checked || false;
    
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
                grid: showGrid ? {
                    color: 'rgba(0, 0, 0, 0.1)',
                    borderDash: gridStyle === 'dashed' ? [5, 5] : gridStyle === 'dotted' ? [2, 2] : false,
                    drawBorder: false
                } : { display: false }
                },
                x: {
                    title: {
                        display: true,
                        text: 'x'
                    },
                grid: showGrid ? {
                    color: 'rgba(0, 0, 0, 0.1)',
                    borderDash: gridStyle === 'dashed' ? [5, 5] : gridStyle === 'dotted' ? [2, 2] : false,
                    drawBorder: false
                } : { display: false }
                }
            }
        }
    };
    
    // 为正弦余弦函数添加注释
    if (showReferenceLine || showReferenceArea || showAnnotation) {
        config.options.plugins.annotation = {
            annotations: {}
        };
        
        if (showReferenceLine) {
            config.options.plugins.annotation.annotations.zeroLine = {
                type: 'line',
                yMin: 0,
                yMax: 0,
                borderColor: 'rgb(75, 192, 192)',
                borderWidth: 2,
                borderDash: [6, 6],
                label: {
                    content: '零线',
                    display: true,
                    position: 'end',
                    backgroundColor: 'rgba(75, 192, 192, 0.8)',
                    color: 'white',
                    padding: 6,
                    font: { size: 12, weight: 'bold' }
                }
            };
        }
        
        if (showAnnotation) {
            config.options.plugins.annotation.annotations.zeroCrossing = {
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
    }
    
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

// 创建数据表格
function createDataTable(data) {
    const tableContainer = document.getElementById('dataTableContainer');
    const tableDiv = document.getElementById('dataTable');
    
    if (!tableDiv) {
        console.error('无法找到表格容器');
        return;
    }
    
    const total = data.values.reduce((sum, val) => sum + val, 0);
    const average = calculateAverage(data.values);
    const maxValue = Math.max(...data.values);
    const minValue = Math.min(...data.values);
    const maxIndex = data.values.indexOf(maxValue);
    const minIndex = data.values.indexOf(minValue);
    
    const tableHTML = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <thead>
                <tr style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white;">
                    <th style="padding: 12px; text-align: left; font-weight: 600; font-size: 14px;">项目</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600; font-size: 14px;">数值</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600; font-size: 14px;">百分比</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600; font-size: 14px;">状态</th>
                </tr>
            </thead>
            <tbody>
                ${data.labels.map((label, index) => {
                    const value = data.values[index];
                    const percentage = ((value / total) * 100).toFixed(1);
                    let statusIcon = '';
                    let statusColor = '';
                    
                    if (index === maxIndex) {
                        statusIcon = '🏆 最高';
                        statusColor = '#10b981';
                    } else if (index === minIndex) {
                        statusIcon = '📉 最低';
                        statusColor = '#ef4444';
                    } else if (value > average) {
                        statusIcon = '📈 高于平均';
                        statusColor = '#3b82f6';
                    } else {
                        statusIcon = '📊 低于平均';
                        statusColor = '#6b7280';
                    }
                    
                    return `
                        <tr style="background: ${index % 2 === 0 ? '#f9fafb' : 'white'}; transition: all 0.3s ease;" 
                            onmouseover="this.style.background='#e0e7ff'; this.style.transform='scale(1.01)'" 
                            onmouseout="this.style.background='${index % 2 === 0 ? '#f9fafb' : 'white'}'; this.style.transform='scale(1)'">
                            <td style="padding: 10px; border: none; font-weight: 500;">${label}</td>
                            <td style="padding: 10px; border: none; font-weight: 600; color: #1f2937;">${value.toLocaleString()}</td>
                            <td style="padding: 10px; border: none;">${percentage}%</td>
                            <td style="padding: 10px; border: none;">
                                <span style="background: ${statusColor}20; color: ${statusColor}; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                                    ${statusIcon}
                                </span>
                            </td>
                        </tr>
                    `;
                }).join('')}
                <tr style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); font-weight: 600;">
                    <td style="padding: 12px; border: none; color: #374151;">统计信息</td>
                    <td style="padding: 12px; border: none; color: #374151;">总计: ${total.toLocaleString()}</td>
                    <td style="padding: 12px; border: none; color: #374151;">100%</td>
                    <td style="padding: 12px; border: none; color: #374151;">平均: ${average.toFixed(1)}</td>
                </tr>
            </tbody>
        </table>
    `;
    
    tableDiv.innerHTML = tableHTML;
}

// 移除数据表格
function removeDataTable() {
    const tableContainer = document.getElementById('dataTableContainer');
    if (tableContainer) {
        tableContainer.style.display = 'none';
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