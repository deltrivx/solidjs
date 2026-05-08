<?php
/**
 * 三书六省 AI Agent 监控数据API
 * 提供实时监控数据的JSON接口
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// 模拟监控数据
$data = [
    'gateway' => [
        'status' => 'running',
        'updatedAt' => date('Y-m-d H:i:s'),
        'version' => '1.0.0'
    ],
    'metrics' => [
        'totalTasks' => 150,
        'completedTasks' => 120,
        'failedTasks' => 5,
        'avgResponseTime' => '150ms',
        'cpuLoad' => 0.15,
        'memoryPct' => 65,
        'agentsOnline' => 7,
        'uptime' => '24h 15m'
    ],
    'agents' => [
        [
            'id' => 'zhongshusheng',
            'name' => '中书省',
            'emoji' => '📝',
            'description' => '诏书起草专员',
            'status' => 'online',
            'tasks' => 15,
            'lastUpdate' => date('c', strtotime('-5 minutes'))
        ],
        [
            'id' => 'menxiasheng',
            'name' => '门下省',
            'emoji' => '🔍',
            'description' => '方案审核专家',
            'status' => 'online',
            'tasks' => 12,
            'lastUpdate' => date('c', strtotime('-6 minutes'))
        ],
        [
            'id' => 'shangshu',
            'name' => '尚书省',
            'emoji' => '📋',
            'description' => '任务分派总管',
            'status' => 'online',
            'tasks' => 18,
            'lastUpdate' => date('c', strtotime('-4 minutes'))
        ],
        [
            'id' => 'libu',
            'name' => '吏部',
            'emoji' => '👥',
            'description' => '人事编排调度',
            'status' => 'busy',
            'tasks' => 22,
            'lastUpdate' => date('c', strtotime('-7 minutes'))
        ],
        [
            'id' => 'hubu',
            'name' => '户部',
            'emoji' => '📊',
            'description' => '数据资源管理',
            'status' => 'online',
            'tasks' => 16,
            'lastUpdate' => date('c', strtotime('-8 minutes'))
        ],
        [
            'id' => 'libu_li',
            'name' => '礼部',
            'emoji' => '🤝',
            'description' => '协议接口规范',
            'status' => 'online',
            'tasks' => 14,
            'lastUpdate' => date('c', strtotime('-9 minutes'))
        ],
        [
            'id' => 'bingbu',
            'name' => '兵部',
            'emoji' => '🛡️',
            'description' => '安全防护专家',
            'status' => 'online',
            'tasks' => 19,
            'lastUpdate' => date('c', strtotime('-10 minutes'))
        ],
        [
            'id' => 'xingbu',
            'name' => '刑部',
            'emoji' => '⚖️',
            'description' => '质量合规审查',
            'status' => 'online',
            'tasks' => 13,
            'lastUpdate' => date('c', strtotime('-11 minutes'))
        ],
        [
            'id' => 'gongbu',
            'name' => '工部',
            'emoji' => '🔧',
            'description' => '工程部署实施',
            'status' => 'offline',
            'tasks' => 8,
            'lastUpdate' => date('c', strtotime('-45 minutes'))
        ]
    ],
    'recentActivities' => [
        [
            'time' => date('H:i:s', strtotime('-5 minutes')),
            'agent' => '中书省',
            'action' => '完成诏书起草任务',
            'type' => 'success',
            'timestamp' => date('c', strtotime('-5 minutes'))
        ],
        [
            'time' => date('H:i:s', strtotime('-6 minutes')),
            'agent' => '门下省',
            'action' => '审核通过新方案',
            'type' => 'info',
            'timestamp' => date('c', strtotime('-6 minutes'))
        ],
        [
            'time' => date('H:i:s', strtotime('-7 minutes')),
            'agent' => '尚书省',
            'action' => '分派六部执行任务',
            'type' => 'warning',
            'timestamp' => date('c', strtotime('-7 minutes'))
        ],
        [
            'time' => date('H:i:s', strtotime('-8 minutes')),
            'agent' => '户部',
            'action' => '数据模型更新完成',
            'type' => 'success',
            'timestamp' => date('c', strtotime('-8 minutes'))
        ],
        [
            'time' => date('H:i:s', strtotime('-9 minutes')),
            'agent' => '礼部',
            'action' => 'API接口文档生成',
            'type' => 'success',
            'timestamp' => date('c', strtotime('-9 minutes'))
        ]
    ]
];

try {
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal server error',
        'message' => $e->getMessage()
    ]);
}
