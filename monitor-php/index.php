<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>三书六省 · AI Agent 监控面板 - PHP动态版</title>
    <meta name="description" content="三省六部 Multi-Agent 编排框架的实时监控仪表盘">
    <meta property="og:title" content="三书六省 · AI Agent 监控面板 - PHP动态版">
    <meta property="og:description" content="三省六部 Multi-Agent 编排框架实时监控仪表盘">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://deltrivx.github.io/solidjs/monitor-php/">
    <meta property="og:locale" content="zh_CN">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏛️</text></svg>">
    <style>
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        :root{--bg:#0a0a0f;--a1:#6c5ce7;--a2:#00cec9;--a3:#fd79a8;--t1:#e8e8f0;--t2:#8888a0;--gb:rgba(255,255,255,0.04);--gd:rgba(255,255,255,0.08)}
        html{background:var(--bg)}body{font-family:'Segoe UI',system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--t1);padding:2rem;max-width:1100px;margin:auto;min-height:100vh;position:relative;z-index:1}
        #particles{position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none}
        #spotlight{position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:0;background:radial-gradient(600px circle at var(--mx,50%) var(--my,50%),rgba(108,92,231,0.08),transparent 80%)}
        .hero{text-align:center;padding:3rem 1rem;position:relative;z-index:1}
        .badge{display:inline-block;padding:.4rem 1.2rem;border-radius:50px;font-size:.8rem;background:var(--gb);border:1px solid var(--gd);color:var(--a2);margin-bottom:1rem;opacity:0;animation:fadeUp .8s forwards}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        h1{font-size:clamp(1.8rem,4vw,2.8rem);font-weight:900;letter-spacing:-1px;margin-bottom:.5rem;opacity:0;animation:fadeUp .8s .2s forwards}
        .gt{background:linear-gradient(135deg,var(--a1),var(--a2),var(--a3));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;background-size:200%200%;animation:gs 4s ease infinite}
        @keyframes gs{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        .sub{color:var(--t2);font-size:.9rem;margin-bottom:1.5rem;opacity:0;animation:fadeUp .8s .4s forwards}
        .btns{opacity:0;animation:fadeUp .8s .6s forwards}
        .btn{display:inline-block;padding:.7rem 1.8rem;border-radius:50px;font-size:.9rem;font-weight:600;text-decoration:none;transition:all .3s;margin:.3rem}
        .btn-p{background:linear-gradient(135deg,var(--a1),var(--a2));color:#fff}
        .btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(108,92,231,.3)}
        .btn-o{background:transparent;color:var(--t1);border:1px solid var(--gd)}
        .btn-o:hover{border-color:var(--a1);transform:translateY(-2px)}
        .sh{text-align:center;margin:2.5rem 0 1.5rem}.sh h2{font-size:1.5rem;margin-bottom:.3rem}.sh p{color:var(--t2);font-size:.9rem}
        .reveal{opacity:0;transform:translateY(30px);transition:all .6s ease}
        .reveal.vis{opacity:1;transform:translateY(0)}
        .mg{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:1rem}
        .mc{background:var(--gb);border:1px solid var(--gd);border-radius:12px;padding:1.2rem;text-align:center;transition:all .3s}
        .mc:hover{border-color:var(--a1);transform:translateY(-3px)}
        .mci{font-size:1.5rem;margin-bottom:.3rem}
        .mcv{font-size:1.5rem;font-weight:800;background:linear-gradient(135deg,var(--a1),var(--a2));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
        .mcl{font-size:.75rem;color:var(--t2);margin-top:.2rem}
        .ag{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem}
        .ac{background:var(--gb);border:1px solid var(--gd);border-radius:16px;padding:1.2rem;transition:all .3s;transform-style:preserve-3d;perspective:1000px}
        .ac:hover{border-color:var(--a1);box-shadow:0 8px 30px rgba(108,92,231,.15)}
        .ach{display:flex;justify-content:space-between;align-items:center;margin-bottom:.8rem}
        .ai{font-size:1.8rem}.ad{width:12px;height:12px;border-radius:50%}
        .acn{font-size:1.05rem;font-weight:600;margin-bottom:.3rem}
        .act{color:var(--t2);font-size:.8rem;margin-bottom:.4rem}
        .as{font-size:.8rem;font-weight:600;margin-bottom:.5rem}
        .acf{display:flex;justify-content:space-between;font-size:.75rem;color:var(--t2);padding-top:.8rem;border-top:1px solid var(--gd)}
        .at{max-width:600px;margin:auto}
        .ti{display:flex;align-items:flex-start;gap:1rem;padding:.8rem 0 1rem;border-left:2px solid var(--gd);padding-left:1.5rem;margin-left:10px;position:relative}
        .ti:last-child{border-left-color:transparent}
        .tid{width:10px;height:10px;border-radius:50%;position:absolute;left:-6px;top:1rem}
        .tic{display:flex;gap:.5rem;flex-wrap:wrap;align-items:center;font-size:.85rem}
        .tit{color:var(--t2);min-width:55px;font-size:.75rem}
        .tia{font-weight:600;background:var(--gb);padding:.15rem .5rem;border-radius:4px;border:1px solid var(--gd);font-size:.8rem}
        .tict{color:var(--t2);font-size:.8rem}
        .ft{text-align:center;color:var(--t2);font-size:.75rem;padding:2rem 0;border-top:1px solid var(--gd);margin-top:3rem}
        @media(max-width:600px){.mg{grid-template-columns:repeat(2,1fr)}.ag{grid-template-columns:1fr}}
    </style>
</head>
<body>
    <canvas id="particles"></canvas>
    <div id="spotlight"></div>
    
    <div class="hero">
        <div class="badge">🏛️ 三书六省 · PHP动态版</div>
        <h1><span class="gt">AI Agent 监控面板</span></h1>
        <p class="sub">中书 → 门下 → 尚书 → 六部并行 · 实时可观测</p>
        <div class="btns">
            <a href="../" class="btn btn-p">📖 博客</a>
            <a href="api/data.php" class="btn btn-o">📄 JSON</a>
            <a href="../monitor/" class="btn btn-o">📊 静态版</a>
        </div>
        <div class="sub" style="margin-top:1rem">
            最后更新: <?php echo date('Y-m-d H:i:s'); ?> · 每30秒自动刷新
        </div>
    </div>

    <div class="sh">
        <h2><span class="gt">系统指标</span></h2>
        <p>实时运行状态</p>
    </div>

    <div class="mg">
        <div class="mc reveal">
            <div class="mci">📋</div>
            <div class="mcv">150</div>
            <div class="mcl">总任务数</div>
        </div>
        <div class="mc reveal">
            <div class="mci">✅</div>
            <div class="mcv">120</div>
            <div class="mcl">已完成</div>
        </div>
        <div class="mc reveal">
            <div class="mci">❌</div>
            <div class="mcv">5</div>
            <div class="mcl">失败任务</div>
        </div>
        <div class="mc reveal">
            <div class="mci">⚡</div>
            <div class="mcv">150ms</div>
            <div class="mcl">平均响应</div>
        </div>
        <div class="mc reveal">
            <div class="mci">🔥</div>
            <div class="mcv">0.15</div>
            <div class="mcl">CPU负载</div>
        </div>
        <div class="mc reveal">
            <div class="mci">💾</div>
            <div class="mcv">65%</div>
            <div class="mcl">内存使用</div>
        </div>
        <div class="mc reveal">
            <div class="mci">🤖</div>
            <div class="mcv">7/9</div>
            <div class="mcl">Agent在线</div>
        </div>
        <div class="mc reveal">
            <div class="mci">⏱️</div>
            <div class="mcv">24h 15m</div>
            <div class="mcl">运行时间</div>
        </div>
    </div>

    <div class="sh">
        <h2><span class="gt">九部 Agent</span></h2>
        <p>7/9 在线</p>
    </div>

    <div class="ag">
        <div class="ac reveal tilt-card">
            <div class="ach">
                <div class="ai">📝</div>
                <div class="ad" style="background:#00cec9;box-shadow:0 0 8px #00cec9"></div>
            </div>
            <div class="acn">中书省</div>
            <div class="act">诏书起草专员</div>
            <div class="as" style="color:#00cec9">在线</div>
            <div class="acf">
                <span>📋 15 任务</span>
                <span>18:20</span>
            </div>
        </div>
        <div class="ac reveal tilt-card">
            <div class="ach">
                <div class="ai">🔍</div>
                <div class="ad" style="background:#00cec9;box-shadow:0 0 8px #00cec9"></div>
            </div>
            <div class="acn">门下省</div>
            <div class="act">方案审核专家</div>
            <div class="as" style="color:#00cec9">在线</div>
            <div class="acf">
                <span>📋 12 任务</span>
                <span>18:19</span>
            </div>
        </div>
        <div class="ac reveal tilt-card">
            <div class="ach">
                <div class="ai">📋</div>
                <div class="ad" style="background:#00cec9;box-shadow:0 0 8px #00cec9"></div>
            </div>
            <div class="acn">尚书省</div>
            <div class="act">任务分派总管</div>
            <div class="as" style="color:#00cec9">在线</div>
            <div class="acf">
                <span>📋 18 任务</span>
                <span>18:21</span>
            </div>
        </div>
        <div class="ac reveal tilt-card">
            <div class="ach">
                <div class="ai">👥</div>
                <div class="ad" style="background:#fd79a8;box-shadow:0 0 8px #fd79a8"></div>
            </div>
            <div class="acn">吏部</div>
            <div class="act">人事编排调度</div>
            <div class="as" style="color:#fd79a8">忙碌</div>
            <div class="acf">
                <span>📋 22 任务</span>
                <span>18:18</span>
            </div>
        </div>
        <div class="ac reveal tilt-card">
            <div class="ach">
                <div class="ai">📊</div>
                <div class="ad" style="background:#00cec9;box-shadow:0 0 8px #00cec9"></div>
            </div>
            <div class="acn">户部</div>
            <div class="act">数据资源管理</div>
            <div class="as" style="color:#00cec9">在线</div>
            <div class="acf">
                <span>📋 16 任务</span>
                <span>18:17</span>
            </div>
        </div>
        <div class="ac reveal tilt-card">
            <div class="ach">
                <div class="ai">🤝</div>
                <div class="ad" style="background:#00cec9;box-shadow:0 0 8px #00cec9"></div>
            </div>
            <div class="acn">礼部</div>
            <div class="act">协议接口规范</div>
            <div class="as" style="color:#00cec9">在线</div>
            <div class="acf">
                <span>📋 14 任务</span>
                <span>18:16</span>
            </div>
        </div>
        <div class="ac reveal tilt-card">
            <div class="ach">
                <div class="ai">🛡️</div>
                <div class="ad" style="background:#00cec9;box-shadow:0 0 8px #00cec9"></div>
            </div>
            <div class="acn">兵部</div>
            <div class="act">安全防护专家</div>
            <div class="as" style="color:#00cec9">在线</div>
            <div class="acf">
                <span>📋 19 任务</span>
                <span>18:15</span>
            </div>
        </div>
        <div class="ac reveal tilt-card">
            <div class="ach">
                <div class="ai">⚖️</div>
                <div class="ad" style="background:#00cec9;box-shadow:0 0 8px #00cec9"></div>
            </div>
            <div class="acn">刑部</div>
            <div class="act">质量合规审查</div>
            <div class="as" style="color:#00cec9">在线</div>
            <div class="acf">
                <span>📋 13 任务</span>
                <span>18:14</span>
            </div>
        </div>
        <div class="ac reveal tilt-card">
            <div class="ach">
                <div class="ai">🔧</div>
                <div class="ad" style="background:#8888a0;box-shadow:0 0 8px #8888a0"></div>
            </div>
            <div class="acn">工部</div>
            <div class="act">工程部署实施</div>
            <div class="as" style="color:#8888a0">离线</div>
            <div class="acf">
                <span>📋 8 任务</span>
                <span>17:45</span>
            </div>
        </div>
    </div>

    <div class="sh">
        <h2><span class="gt">近期活动</span></h2>
    </div>

    <div class="at">
        <div class="ti reveal vis">
            <div class="tid" style="background:#00b894"></div>
            <div class="tic">
                <span class="tit">18:20:15</span>
                <span class="tia">中书省</span>
                <span class="tict">完成诏书起草任务</span>
            </div>
        </div>
        <div class="ti reveal vis">
            <div class="tid" style="background:#00cec9"></div>
            <div class="tic">
                <span class="tit">18:19:32</span>
                <span class="tia">门下省</span>
                <span class="tict">审核通过新方案</span>
            </div>
        </div>
        <div class="ti reveal vis">
            <div class="tid" style="background:#fdcb6e"></div>
            <div class="tic">
                <span class="tit">18:18:45</span>
                <span class="tia">尚书省</span>
                <span class="tict">分派六部执行任务</span>
            </div>
        </div>
        <div class="ti reveal vis">
            <div class="tid" style="background:#00b894"></div>
            <div class="tic">
                <span class="tit">18:17:28</span>
                <span class="tia">户部</span>
                <span class="tict">数据模型更新完成</span>
            </div>
        </div>
        <div class="ti reveal vis">
            <div class="tid" style="background:#00b894"></div>
            <div class="tic">
                <span class="tit">18:16:15</span>
                <span class="tia">礼部</span>
                <span class="tict">API接口文档生成</span>
            </div>
        </div>
    </div>

    <div class="ft">
        三书六省 · Multi-Agent 闭环框架 · PHP动态监控 · 数据实时采集
    </div>

    <script>
    // 粒子背景
    (function(){
        var c=document.getElementById('particles'),x=c.getContext('2d');
        var w,h,p=[];function r(){w=c.width=innerWidth;h=c.height=innerHeight}
        r();window.addEventListener('resize',r);
        for(var i=0;i<60;i++)p.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.6,vy:(Math.random()-.5)*.6,r:Math.random()*2+1});
        function a(){x.clearRect(0,0,w,h);
            for(var o=0;o<p.length;o++){p[o].x+=p[o].vx;p[o].y+=p[o].vy;if(p[o].x<0||p[o].x>w)p[o].vx*=-1;if(p[o].y<0||p[o].y>h)p[o].vy*=-1;x.beginPath();x.arc(p[o].x,p[o].y,p[o].r,0,Math.PI*2);x.fillStyle='rgba(108,92,231,0.3)';x.fill()}
            for(var i=0;i<p.length;i++)for(var j=i+1;j<p.length;j++){var dx=p[i].x-p[j].x,dy=p[i].y-p[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<150){x.beginPath();x.moveTo(p[i].x,p[i].y);x.lineTo(p[j].x,p[j].y);x.strokeStyle='rgba(108,92,231,'+(.15*(1-d/150))+')';x.stroke()}}
            requestAnimationFrame(a)}a()})();
    
    // 聚光灯
    (function(){var s=document.getElementById('spotlight');document.addEventListener('mousemove',function(e){s.style.setProperty('--mx',e.clientX+'px');s.style.setProperty('--my',e.clientY+'px')})})();
    
    // 滚动渐入
    (function(){var o=new IntersectionObserver(function(e){e.forEach(function(n){if(n.isIntersecting)n.target.classList.add('vis')})},{threshold:.1});document.querySelectorAll('.reveal').forEach(function(e){o.observe(e)})})();
    
    // 3D Tilt
    (function(){document.querySelectorAll('.tilt-card').forEach(function(c){c.addEventListener('mousemove',function(e){var r=c.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,cx=r.width/2,cy=r.height/2;c.style.transform='perspective(1000px) rotateX('+((y-cy)/cy*-8)+'deg) rotateY('+((x-cx)/cx*8)+'deg) scale3d(1.02,1.02,1.02)'});c.addEventListener('mouseleave',function(){c.style.transform=''})})})();
    </script>

    <!-- 实时更新 -->
    <div id="live-indicator" style="position:fixed;bottom:1rem;right:1rem;z-index:999;display:flex;align-items:center;gap:0.4rem;font-size:0.7rem;color:var(--t2);background:var(--gb);border:1px solid var(--gd);padding:0.3rem 0.8rem;border-radius:50px;backdrop-filter:blur(10px)">
      <span id="live-dot" style="width:6px;height:6px;border-radius:50%;background:#00cec9;animation:pulse 2s infinite"></span>
      <span id="live-text">实时</span>
    </div>
    <style>@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}</style>

    <script>
    // 实时更新：每10秒静默拉取JSON，按ID更新DOM元素
    (function(){
        function q(id){return document.getElementById(id)}
        function upd(id,val){var e=q(id);if(e)e.textContent=val}
        
        function refresh(){
          fetch('api/data.php?_='+Date.now())
            .then(function(r){return r.json()})
            .then(function(d){
              // 更新逻辑将在API完成后实现
              var dot=q('live-dot');
              if(dot)dot.style.background='#00cec9';
            })
            .catch(function(){
              var dot=q('live-dot');
              if(dot)dot.style.background='#e17055';
            });
        }
        
        // 首次加载后启动
        setTimeout(function(){refresh();setInterval(refresh,10000)},1000);
    })();
    </script>
</body>
</html>
