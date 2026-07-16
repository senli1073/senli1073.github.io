/**
 * projects.js
 * 动态加载 projects.json 并渲染项目列表到 #projects-md 容器中。
 * 设计原则：
 * - 通过 JSON 驱动，新增项目只需修改 projects.json，无需改动 HTML。
 * - 视觉风格与网站现有的 Research/Outputs 区块保持一致。
 */

(function () {
    'use strict';

    /**
     * 简单的 HTML 转义，防止 XSS
     * @param {string} str - 原始字符串
     * @returns {string} 转义后的安全字符串
     */
    function escapeHTML(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(String(str)));
        return div.innerHTML;
    }

    /**
     * 生成单个项目的 HTML 结构
     * @param {Object} project - 项目数据对象
     * @param {string} project.title       - 项目标题
     * @param {string} project.subtitle    - 副标题
     * @param {string} project.description - 简介
     * @param {string[]} project.tags      - 标签数组
     * @param {string} project.pdf         - PDF 文件路径
     * @returns {string} HTML 字符串
     */
    function buildProjectHTML(project) {
        // 构建标签 HTML
        var tagsHTML = '';
        if (project.tags && project.tags.length > 0) {
            tagsHTML = '<div class="project-tags">';
            project.tags.forEach(function (tag) {
                tagsHTML += '<span class="project-tag">' + escapeHTML(tag) + '</span>';
            });
            tagsHTML += '</div>';
        }

        // 构建 PDF 按钮（仅当 pdf 字段存在时）
        var pdfButtonHTML = '';
        if (project.pdf) {
            pdfButtonHTML =
                '<a class="project-pdf-btn" href="' + escapeHTML(project.pdf) + '" target="_blank" rel="noopener noreferrer">' +
                '&#128196; View Case Study (PDF)' +
                '</a>';
        }

        // 组装完整项目卡片
        return (
            '<div class="project-item">' +
            '<h3 class="project-title">' + escapeHTML(project.title) + '</h3>' +
            '<div class="project-subtitle">' + escapeHTML(project.subtitle) + '</div>' +
            '<p class="project-description">' + escapeHTML(project.description) + '</p>' +
            tagsHTML +
            pdfButtonHTML +
            '</div>'
        );
    }

    /**
     * 渲染项目列表到目标容器
     * @param {Array} projects - 项目数据数组
     */
    function renderProjects(projects) {
        var container = document.getElementById('projects-md');
        if (!container) return;

        if (!projects || projects.length === 0) {
            container.innerHTML = '<p>No projects yet.</p>';
            return;
        }

        var html = '';
        projects.forEach(function (project) {
            html += buildProjectHTML(project);
        });
        container.innerHTML = html;
    }

    // --- 入口：DOM 加载完成后自动拉取并渲染 ---
    window.addEventListener('DOMContentLoaded', function () {
        fetch('projects.json')
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Failed to load projects.json: ' + response.status);
                }
                return response.json();
            })
            .then(function (projects) {
                renderProjects(projects);
            })
            .catch(function (error) {
                console.error('Projects loader error:', error);
                var container = document.getElementById('projects-md');
                if (container) {
                    container.innerHTML = '<p>Unable to load projects at this time.</p>';
                }
            });
    });
})();
