// 动态优化按钮布局
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(optimizeButtonLayouts, 100);
});

function optimizeButtonLayouts() {
    const versionContainers = document.querySelectorAll('.version-container');
    
    versionContainers.forEach(container => {
        const buttons = container.querySelectorAll('.version-link');
        const buttonCount = buttons.length;
        
        // 根据按钮数量应用不同的布局类
        container.className = 'version-container';
        
        switch(buttonCount) {
            case 5:
                container.classList.add('buttons-5');
                // 让第5个按钮跨两列
                if (buttons[4]) {
                    buttons[4].style.gridColumn = 'span 2';
                    buttons[4].style.justifySelf = 'stretch';
                }
                break;
            case 4:
                container.classList.add('buttons-4');
                break;
            case 3:
                container.classList.add('buttons-3');
                break;
            case 2:
                container.classList.add('buttons-2');
                break;
            case 1:
                container.classList.add('buttons-1');
                break;
        }
        
        console.log(`优化按钮布局: ${buttonCount}个按钮`);
    });
}

// 监听窗口大小变化，重新优化布局
window.addEventListener('resize', function() {
    setTimeout(optimizeButtonLayouts, 50);
});