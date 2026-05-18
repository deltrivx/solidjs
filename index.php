<?php
/**
 * 极简 PHP 入口
 * 作用：将根目录请求直接映射到打包后的 dist 目录
 */
$file = __DIR__ . '/dist/index.html';

if (file_exists($file)) {
    $html = file_get_contents($file);
    // 关键：由于我们在根目录运行，需要给 HTML 注入一个 <base> 标签，
    // 这样 HTML 内部的所有 "./assets/..." 都能正确指向 "/dist/assets/..."
    $html = str_replace('<head>', '<head><base href="/dist/">', $html);
    echo $html;
} else {
    echo "<h1>Error: dist/index.html not found.</h1>";
    echo "请运行 npm run build 生成打包文件。";
}