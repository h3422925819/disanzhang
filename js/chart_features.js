// 第3章功能扩展文件
// 3.1 图例控制、3.4 显示网格、3.5 添加参考线和参考区域

// 确保Chart.js已加载
if (typeof Chart === 'undefined') {
    console.error('Chart.js未加载，chart_features.js将无法正常工作');
}

// 确保getChartConfig函数可用
if (typeof getChartConfig === 'undefined') {
    console.warn('getChartConfig函数未定义，将使用降级配置');
}

// 获取网格配置
function getGridConfig(showGrid, gridAxis, gridStyle) {
    if (!showGrid) {
        return {
            display: false
        };
    }
    
    const borderDash = gridStyle === 'dashed' ? [5, 5] : gridStyle === 'dotted' ? [2, 2] : [];
    
    return {
        display: true,
        color: 'rgba(0, 0, 0, 0.1)',
        borderDash: borderDash,
        lineWidth: gridStyle === 'dotted' ? 1 : 0.5
    };
}

// 获取参考线配置
function getReferenceLineConfig(showReferenceLine) {
    if (!showReferenceLine) return {};
    
    const annotations = {};
    
    // 水平参考线
    annotations.hLine = {
        type: 'line',
        yMin: 30,
        yMax: 30,
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 2,
        borderDash: [6, 6],
        label: {
            content: '参考线',
            display: true,
            position: 'end',
            backgroundColor: 'rgba(255, 99, 132, 0.8)',
            color: 'white',
            padding: 4,
            font: { size: 12 }
        }
    };
    
    // 垂直参考线
    annotations.vLine = {
        type: 'line',
        xMin: 2,
        xMax: 2,
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 2,
        borderDash: [6, 6],
        label: {
            content: '参考线',
            display: true,
            position: 'end',
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
            color: 'white',
            padding: 4,
            font: { size: 12 }
        }
    };
    
    return annotations;
}

// 获取参考区域配置
function getReferenceAreaConfig(showReferenceArea) {
    if (!showReferenceArea) return {};
    
    const annotations = {};
    
    // X轴方向的参考区域
    annotations.xArea = {
        type: 'box',
        xMin: 1,
        xMax: 3,
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
    
    // Y轴方向的参考区域
    annotations.yArea = {
        type: 'box',
        yMin: 20,
        yMax: 40,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        label: {
            content: '目标区域',
            display: true,
            position: 'center',
            backgroundColor: 'rgba(75, 192, 192, 0.8)',
            color: 'white',
            padding: 4,
            font: { size: 12 }
        }
    };
    
    return annotations;
}

// 获取注释配置
function getAnnotationConfig(showAnnotation, data) {
    if (!showAnnotation || !data.labels || data.labels.length < 3) return {};
    
    const annotations = {};
    
    // 添加数据点注释
    const middleIndex = Math.min(Math.floor(data.labels.length / 2), data.labels.length - 1);
    const yValue = Array.isArray(data.values[middleIndex]) 
        ? (data.values[middleIndex].y || data.values[middleIndex])
        : data.values[middleIndex];
    
    annotations.dataPoint = {
        type: 'point',
        xValue: middleIndex,
        yValue: yValue || 20,
        backgroundColor: 'rgba(255, 99, 132, 1)',
        radius: 8,
        label: {
            content: '重要数据点',
            display: true,
            position: 'top',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: 'rgb(255, 99, 132)',
            font: {
                size: 12,
                weight: 'bold'
            },
            padding: 6,
            borderRadius: 4
        }
    };
    
    return annotations;
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
                    const total = data.values.reduce((sum, val) => sum + val, 0);
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

// 更新图表配置以支持第3章功能
function enhanceChartConfig(config, options) {
    const {
        showGrid = false,
        gridAxis = 'both',
        gridStyle = 'solid',
        showReferenceLine = false,
        showReferenceArea = false,
        showAnnotation = false,
        showTable = false
    } = options;
    
    // 添加网格
    if (config.options.scales) {
        if (config.options.scales.x) {
            config.options.scales.x.grid = getGridConfig(
                showGrid && (gridAxis === 'both' || gridAxis === 'x'),
                gridAxis,
                gridStyle
            );
        }
        if (config.options.scales.y) {
            config.options.scales.y.grid = getGridConfig(
                showGrid && (gridAxis === 'both' || gridAxis === 'y'),
                gridAxis,
                gridStyle
            );
        }
    }
    
    // 添加图例控制
    if (config.options.plugins) {
        if (!config.options.plugins.legend) {
            config.options.plugins.legend = {};
        }
        config.options.plugins.legend.display = options.showLegend !== false;
        if (options.legendPosition) {
            config.options.plugins.legend.position = options.legendPosition;
        }
        if (!config.options.plugins.legend.align) {
            config.options.plugins.legend.align = 'center';
        }
        if (!config.options.plugins.legend.labels) {
            config.options.plugins.legend.labels = {
                padding: 20,
                usePointStyle: true,
                font: {
                    size: 14
                }
            };
        }
    }
    
    // 添加注释插件（需要注册chartjs-plugin-annotation）
    if (showAnnotation || showReferenceLine || showReferenceArea) {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js 未加载');
        } else if (!Chart.Annotation && !window.ChartAnnotation) {
            console.warn('需要加载 chartjs-plugin-annotation 插件');
        } else {
            // 创建注释配置
            const annotations = {
                ...getReferenceLineConfig(showReferenceLine),
                ...getReferenceAreaConfig(showReferenceArea),
                ...getAnnotationConfig(showAnnotation, options.data || {})
            };
            
            // 只有在有注释时才添加插件配置
            if (Object.keys(annotations).length > 0) {
                config.options.plugins.annotation = {
                    annotations: annotations
                };
                console.log('已添加注释配置，注释数量:', Object.keys(annotations).length);
            }
        }
    }
    
    return config;
}

// 创建增强的图表（带注释插件支持）
function createEnhancedChart(ctx, type, data, options = {}) {
    try {
        // 基础配置 - 确保getChartConfig函数可用
        let config;
        if (typeof getChartConfig === 'function') {
            config = getChartConfig(type, data, options);
        } else {
            // 降级配置
            config = {
                type: type,
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: data.title,
                        data: data.values,
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: options.showLegend,
                            position: options.legendPosition || 'top'
                        },
                        title: {
                            display: true,
                            text: data.title
                        }
                    }
                }
            };
        }
        const enhancedConfig = enhanceChartConfig(config, options);
        
        // 检查是否有注释插件需求
        if (options.showAnnotation || options.showReferenceLine || options.showReferenceArea) {
            // 尝试加载注释插件
            loadAnnotationPlugin().then(() => {
                // 插件加载成功，创建图表
                myChart = new Chart(ctx, enhancedConfig);
            }).catch(() => {
                // 降级处理：不使用注释功能
                const fallbackOptions = { ...options, showAnnotation: false, showReferenceLine: false, showReferenceArea: false };
                const fallbackConfig = enhanceChartConfig(config, fallbackOptions);
                myChart = new Chart(ctx, fallbackConfig);
                console.warn('注释插件未加载，已禁用注释功能');
            });
        } else {
            myChart = new Chart(ctx, enhancedConfig);
        }
        
        // 处理表格显示
        if (options.showTable) {
            addDataTable(data);
        } else {
            removeDataTable();
        }
    } catch (error) {
        console.error('创建图表时出错:', error);
        // 创建一个简单的降级图表
        try {
            const fallbackConfig = {
                type: 'bar',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: data.title,
                        data: data.values,
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: options.showLegend,
                            position: options.legendPosition || 'top'
                        },
                        title: {
                            display: true,
                            text: data.title
                        }
                    }
                }
            };
            myChart = new Chart(ctx, fallbackConfig);
        } catch (fallbackError) {
            console.error('降级图表也失败了:', fallbackError);
        }
    }
}

// 动态加载注释插件
function loadAnnotationPlugin() {
    return new Promise((resolve, reject) => {
        // 检查是否已经加载
        if (typeof Chart !== 'undefined' && (Chart.Annotation || window.ChartAnnotation)) {
            resolve();
            return;
        }
        
        // 动态加载插件
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chartjs-plugin-annotation@3.0.1/dist/chartjs-plugin-annotation.min.js';
        script.onload = () => {
            setTimeout(() => {
                if (typeof Chart !== 'undefined') {
                    // 尝试多种方式注册
                    if (window.ChartAnnotation) {
                        Chart.register(window.ChartAnnotation);
                        console.log('注释插件已注册 (动态加载后)');
                        resolve();
                    } else if (Chart.Annotation) {
                        Chart.register(Chart.Annotation);
                        console.log('注释插件已注册 (Chart.Annotation)');
                        resolve();
                    } else {
                        reject(new Error('插件对象未找到'));
                    }
                } else {
                    reject(new Error('Chart.js未找到'));
                }
            }, 100); // 等待一小段时间确保插件完全加载
        };
        script.onerror = () => reject(new Error('插件加载失败'));
        document.head.appendChild(script);
    });
}