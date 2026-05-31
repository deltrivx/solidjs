import { onMount } from 'solid-js';
import { A } from '@solidjs/router';
import { initReveal } from '../../utils/animations';

export default function ArticleFnosIgpuTemp() {
    onMount(() => {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
        window.scrollTo(0, 0);
    });

    return (
        <section id="article-detail">
            <div class="article-container reveal">
                <A href="/articles" class="back-link">← 返回文章列表</A>
                <div class="article-header">
                    <h1>飞牛系统（FnOS）核显温度显示补丁：从原理到实现</h1>
                    <p class="article-subtitle">Intel iGPU · WebSocket 代理 · JS 注入 · bind-mount · FnOS 资源监控面板适配</p>
                    <div class="article-meta">
                        <span class="article-date">2026-05-24</span>
                        <div class="article-tags">
                            <span class="tech-tag">FnOS</span>
                            <span class="tech-tag">iGPU</span>
                            <span class="tech-tag">Intel</span>
                            <span class="tech-tag">WebSocket</span>
                            <span class="tech-tag">系统补丁</span>
                        </div>
                    </div>
                </div>
                <div class="article-content">

                    <h2>一、背景</h2>
                    <p>飞牛系统（FnOS）基于 Linux 深度定制，其 Web 管理面板内置了资源监控功能，可显示 CPU、内存、磁盘、网络、GPU 等设备的实时状态。然而，对于部分 Intel 处理器（特别是 10th/11th 代及更新型号），核显（iGPU）的温度在 FnOS 面板中显示为空或 0，因为 FnOS 的 GPU 监控逻辑只读取了独立显卡的温度传感器，而 Intel 核显的温度输出方式与独显不同。</p>

                    <p>问题的本质：Intel 核显（i915 驱动）通常不暴露独立的温度传感器（thermal zone），核显温度实际包含在 CPU 封装温度包（Package Temperature）中。FnOS 的资源监控通过「核心系统资源 API」（trim_cgi）获取 GPU 数据时，读取到的 GPU 温度为空，导致面板中 GPU 温度项无显示值。</p>

                    <p>本方案通过 WebSocket 代理注入 + JavaScript 补丁 + bind-mount 的方式，在完全不修改 FnOS 核心文件的前提下，将 CPU 封装温度回填到 GPU 温度显示字段中。</p>

                    <h2>二、方案架构</h2>
                    <pre>{`┌─────────────────────────────────────────────────────────────────┐
│                   FnOS Web 管理面板 (浏览器端)                    │
│  资源监控页面                                                    │
│  ┌─ ResourceMonitor.js (已补丁) ──────────────────────────────┐ │
│  │  GPU 温度显示逻辑：如果 GPU 返回 temp 为空，使用             │ │
│  │  window.__xiaIgpuTemp（来自 CPU Package 温度）回填          │ │
│  └───────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────────┘
                           │ WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              fnos-igpu-ws-proxy.py (WebSocket 代理)              │
│  监听 /run/trim_cgi.socket                                       │
│  收到 GPU 查询请求 → 从 CPU 响应中提取 Package 温度               │
│  → 回填到 GPU 响应数据中 → 转发给浏览器                           │
│  直接读取 /sys/class/hwmon 作为 fallback                          │
└───────────┬──────────────────────────────┬───────────────────────┘
            │                              │
            ▼                              ▼
┌─────────────────────────┐  ┌──────────────────────────────┐
│ trim_cgi (FnOS 后端)     │  │ /sys/class/hwmon 传感器       │
│ 通过 /run/trim_cgi.socket│  │ coretemp → CPU Package 温度  │
│ .orig 接收原始请求        │  │ pch_cometlake → PCH 温度    │
└─────────────────────────┘  └──────────────────────────────┘`}</pre>

                    <p>三个核心组件：</p>
                    <ol>
                        <li><strong>WebSocket 代理</strong>（Python）：拦截 FnOS 资源监控的前后端 WebSocket 通信，在 GPU 数据中注入 CPU Package 温度</li>
                        <li><strong>JavaScript 补丁</strong>：修改 FnOS 前端的 GPU 温度显示逻辑，当温度值为空时接受来自代理的回填值</li>
                        <li><strong>bind-mount 挂载</strong>：将补丁后的文件覆盖原始文件，不修改原始系统分区</li>
                    </ol>

                    <h2>三、前置条件与系统检查</h2>

                    <h3>3.1 确认硬件</h3>
                    <p>本方案适用于搭载 Intel 核显的 FnOS 设备。检查方法：</p>
                    <pre>{`# 检查 i915 驱动是否加载
lsmod | grep i915
# 输出示例：
# i915                 4739072  39 kvmgt
# drm_buddy              28672  1 i915
# ttm                   118784  1 i915

# 检查 GPU 设备是否存在
ls /sys/class/drm/
# 输出包含 card0、renderD128 等

# 检查 CPU 型号（带核显）
cat /proc/cpuinfo | grep "model name" | head -1
# Intel(R) Celeron(R) N5095 / Intel(R) Core(TM) i3-10100 等

# 检查 lm-sensors 是否安装
which sensors
sensors | grep -i "Package id"
# Package id 0:  +79.0°C  (high = +100.0°C, crit = +100.0°C)</pre>

                    <h3>3.2 确认问题</h3>
                    <p>打开 FnOS Web 面板 → 资源监控 → 查看 GPU 区域。如果核显类型/负载/显存有显示但温度为空白或 0，说明需要打此补丁。</p>

                    <h3>3.3 需要的东西</h3>
                    <ul>
                        <li>FnOS 设备（Debian 12 内核 6.x）with root 权限</li>
                        <li>Intel 核显（i915 驱动已加载）</li>
                        <li>Python 3.7+（FnOS 自带）</li>
                        <li>lm-sensors 包（用于手动验证温度，非必须）</li>
                    </ul>

                    <h2>四、核心组件详解</h2>

                    <h3>4.1 WebSocket 代理（fnos-igpu-ws-proxy.py）</h3>
                    <p>这是整个方案的核心。FnOS 的资源监控前端通过 WebSocket 与后端服务通信，WebSocket 请求通过 Unix Socket（/run/trim_cgi.socket）传输。代理程序做了两件事：</p>

                    <p><strong>socket 接管</strong>：启动时，代理程序将原始 FnOS 的监听 socket 重命名为 /run/trim_cgi.socket.orig，然后自己在 /run/trim_cgi.socket 上监听。这样所有 WebSocket 连接先经过代理，再转发到原始后端。</p>

                    <pre>{`# 启动时
mv /run/trim_cgi.socket /run/trim_cgi.socket.orig
python3 fnos-igpu-ws-proxy.py   # 监听 /run/trim_cgi.socket

# 停止时恢复
rm -f /run/trim_cgi.socket
mv /run/trim_cgi.socket.orig /run/trim_cgi.socket`}</pre>

                    <p><strong>数据注入</strong>：代理程序在转发 WebSocket 帧时，拦截两类请求：</p>
                    <ul>
                        <li><code>appcgi.resmon.cpu</code>：提取 CPU 响应数据中的 Package 温度（coretemp 的第一个温度值），缓存到变量</li>
                        <li><code>appcgi.resmon.gpu</code>：遍历 GPU 列表，如果某个 GPU 的 temp 字段为空或无效，用缓存的 CPU Package 温度回填</li>
                    </ul>

                    <p>同时，代理程序还直接读取 <code>/sys/class/hwmon</code> 作为 fallback 温度来源，优先级为 coretemp > pch_cometlake，确保温度值始终在 0-130°C 范围内才采用。</p>

                    <pre>{`# 温度读取策略
1. 优先从 appcgi.resmon.cpu 响应中提取（正常运行时）
2. 如果上述不可用，从 /sys/class/hwmon 读取
   2a. coretemp/temp1_input → CPU Package 温度
   2b. pch_cometlake → PCH 温度（备选）
3. 温度值必须在 0-130°C 范围，否则丢弃`}</pre>

                    <h3>4.2 JavaScript 补丁</h3>
                    <p>对 FnOS 前端文件做了三处修改：</p>

                    <p><strong>补丁一：GPU 温度显示条件（ResourceMonitor.js）</strong></p>
                    <p>原始代码中，GPU 温度显示的条件判断是 <code>r.temp</code>，当 temp 为空或 0 时不显示元素。修改后增加 <code>r.temp === 0</code> 的判断，即温度值即使为 0 也应显示，这样 WebSocket 代理注入的温度值才能被面板展示。</p>

                    <pre>{`// 修改前
dt=(e,r)=>{var s;r.temp&&e.add(U.Temp)

// 修改后
dt=(e,r)=>{var s;(r.temp||r.temp===0)&&e.add(U.Temp)`}</pre>

                    <p><strong>补丁二：CPU 温度捕获与缓存（ResourceMonitor.js）</strong></p>
                    <p>在资源监控的 CPU 数据请求回调中，将 CPU Package 温度保存到全局变量 window.__xiaIgpuTemp，供 GPU 数据注入使用。</p>

                    <pre>{`// window.__xiaIgpuTemp 全局变量
try{window.__xiaIgpuTemp=Array.isArray(a.data.cpu.temp)?
  a.data.cpu.temp[0]:void 0}catch{}`}</pre>

                    <p><strong>补丁三：核心 WebSocket 注入（index.js - 核心入口）</strong></p>
                    <p>在 FnOS 前端 WebSocket 底层框架中，对收到的每个消息尝试提取 CPU 温度和回填 GPU 温度。这里还读取 Cookie 中的 xia_igpu_temp 作为额外 fallback 来源。</p>

                    <h3>4.3 bind-mount 挂载</h3>
                    <p>为避免修改原始文件、防止 FnOS 系统更新时被覆盖，所有补丁文件通过 bind-mount 方式覆盖：</p>

                    <pre>{`# 将补丁后的 JS 文件 mount 到原始路径
mount --bind /usr/local/share/fnos-igpu-temp-patch/ResourceMonitor-BacdZkk_.js \\
  /usr/trim/www/assets/ResourceMonitor-BacdZkk_.js

mount --bind /usr/local/share/fnos-igpu-temp-patch/index-CMZOY5-G.js \\
  /usr/trim/www/assets/index-CMZOY5-G.js

# 取消挂载
umount /usr/trim/www/assets/ResourceMonitor-BacdZkk_.js
umount /usr/trim/www/assets/index-CMZOY5-G.js`}</pre>

                    <h2>五、完整部署脚本</h2>

                    <p>以下为完整的 setup 脚本。逐行执行即可完成部署。本仓库也提供了完整的恢复脚本（见第八节）。</p>

                    <h3>5.1 安装 WebSocket 代理脚本</h3>
                    <pre>{`cat > /usr/local/sbin/fnos-igpu-ws-proxy.py << 'PYEOF'
#!/usr/bin/env python3
import asyncio, base64, hashlib, json, os, re, socket, struct, time

LISTEN = os.environ.get('XIA_IGPU_LISTEN', '/run/trim_cgi.socket')
UPSTREAM = os.environ.get('XIA_IGPU_UPSTREAM', '/run/trim_cgi.socket.orig')
LOG = '/var/log/fnos-igpu-ws-proxy.log'
GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
TEMP_COOKIE = re.compile(r'(?:^|;\s*)xia_igpu_temp=([0-9.]+)')

last_temp = None

def log(msg):
    try:
        with open(LOG, 'a') as f:
            f.write(time.strftime('%F %T ') + msg + '\n')
    except Exception:
        pass

def read_temp():
    candidates = []
    try:
        for name_path in sorted(os.listdir('/sys/class/hwmon')):
            base = '/sys/class/hwmon/' + name_path
            try:
                name = open(base + '/name').read().strip()
            except Exception:
                continue
            if name == 'coretemp':
                candidates.insert(0, base + '/temp1_input')
            elif name == 'pch_cometlake':
                candidates.append(base + '/temp1_input')
        for p in candidates:
            try:
                v = int(open(p).read().strip()) / 1000.0
                if 0 < v < 130:
                    return round(v, 1)
            except Exception:
                pass
    except Exception:
        pass
    return None

def inject_payload(text):
    global last_temp
    try:
        obj = json.loads(text)
    except Exception:
        return text
    try:
        req = obj.get('req')
        data = obj.get('data')
        if req == 'appcgi.resmon.cpu':
            cpu = (data or {}).get('cpu') or {}
            temps = cpu.get('temp')
            if isinstance(temps, list) and temps:
                t = temps[0]
                if isinstance(t, (int, float)) and t >= 0:
                    last_temp = t
        elif req == 'appcgi.resmon.gpu':
            gpu = (data or {}).get('gpu')
            if isinstance(gpu, list):
                t = last_temp if isinstance(last_temp, (int, float)) and last_temp >= 0 else read_temp()
                if isinstance(t, (int, float)) and t >= 0:
                    changed = False
                    for g in gpu:
                        if isinstance(g, dict):
                            gt = g.get('temp')
                            if not isinstance(gt, (int, float)) or gt < 0:
                                g['temp'] = t
                                changed = True
                    if changed:
                        obj['data']['gpu'] = gpu
                        return json.dumps(obj, ensure_ascii=False, separators=(',', ':'))
    except Exception as e:
        log('inject error: %r' % (e,))
    return text

# --- WebSocket 帧解析和转发 ---

def encode_frame(payload, opcode=1, mask=False):
    if isinstance(payload, str):
        payload = payload.encode()
    ln = len(payload)
    first = 0x80 | opcode
    if ln < 126:
        hdr = bytes([first, (0x80 if mask else 0) | ln])
    elif ln < 65536:
        hdr = bytes([first, (0x80 if mask else 0) | 126]) + struct.pack('!H', ln)
    else:
        hdr = bytes([first, (0x80 if mask else 0) | 127]) + struct.pack('!Q', ln)
    if mask:
        key = os.urandom(4)
        payload = bytes(b ^ key[i % 4] for i, b in enumerate(payload))
        return hdr + key + payload
    return hdr + payload

async def read_frame(reader):
    h = await reader.readexactly(2)
    b1, b2 = h[0], h[1]
    opcode = b1 & 0x0f
    masked, ln = b2 & 0x80, b2 & 0x7f
    if ln == 126:
        ln = struct.unpack('!H', await reader.readexactly(2))[0]
    elif ln == 127:
        ln = struct.unpack('!Q', await reader.readexactly(8))[0]
    key = await reader.readexactly(4) if masked else b''
    data = await reader.readexactly(ln) if ln else b''
    if masked:
        data = bytes(b ^ key[i % 4] for i, b in enumerate(data))
    return opcode, data

async def pipe_client_to_upstream(cr, uw):
    try:
        while True:
            op, data = await read_frame(cr)
            uw.write(encode_frame(data, op, mask=True))
            await uw.drain()
            if op == 8: break
    except Exception: pass
    try: uw.close()
    except: pass

async def pipe_upstream_to_client(ur, cw):
    try:
        while True:
            op, data = await read_frame(ur)
            if op == 1:
                try:
                    data = inject_payload(data.decode('utf-8', 'ignore')).encode('utf-8')
                except: pass
            cw.write(encode_frame(data, op, mask=False))
            await cw.drain()
            if op == 8: break
    except Exception: pass
    try: cw.close()
    except: pass

async def handle(reader, writer):
    try:
        buf = b''
        while b'\r\n\r\n' not in buf:
            chunk = await reader.read(4096)
            if not chunk: return
            buf += chunk
            if len(buf) > 65536: return
        # 解析 WebSocket 握手
        head, rest = buf.split(b'\r\n\r\n', 1)
        lines = head.decode('iso-8859-1', 'ignore').split('\r\n')
        headers = {}
        for line in lines[1:]:
            if ':' in line:
                k, v = line.split(':', 1)
                headers[k.lower().strip()] = v.strip()
        key = headers.get('sec-websocket-key')
        if not key:
            writer.write(b'HTTP/1.1 400 Bad Request\r\nContent-Length: 0\r\n\r\n')
            await writer.drain()
            return
        accept = base64.b64encode(hashlib.sha1((key + GUID).encode()).digest()).decode()
        writer.write(('HTTP/1.1 101 Switching Protocols\r\n'
            'Upgrade: websocket\r\nConnection: Upgrade\r\n'
            'Sec-WebSocket-Accept: %s\r\n\r\n') % accept)
        await writer.drain()

        ur, uw = await asyncio.open_unix_connection(UPSTREAM)
        up_key = base64.b64encode(os.urandom(16)).decode()
        req = ('GET / HTTP/1.1\r\nHost: localhost\r\n'
            'Upgrade: websocket\r\nConnection: Upgrade\r\n'
            'Sec-WebSocket-Key: ' + up_key + '\r\nSec-WebSocket-Version: 13\r\n\r\n').encode()
        uw.write(req); await uw.drain()
        resp = b''
        while b'\r\n\r\n' not in resp:
            resp += await ur.read(4096)
            if len(resp) > 65536:
                raise RuntimeError('bad upstream handshake')
        await asyncio.gather(
            pipe_client_to_upstream(reader, uw),
            pipe_upstream_to_client(ur, writer))
    except Exception as e:
        log('handle error: %r' % (e,))
    finally:
        try: writer.close(); await writer.wait_closed()
        except: pass

async def main():
    try: os.unlink(LISTEN)
    except FileNotFoundError: pass
    server = await asyncio.start_unix_server(handle, LISTEN)
    os.chmod(LISTEN, 0o666)
    log('listening ' + LISTEN)
    async with server:
        await server.serve_forever()

if __name__ == '__main__':
    asyncio.run(main())
PYEOF
chmod +x /usr/local/sbin/fnos-igpu-ws-proxy.py`}</pre>

                    <h3>5.2 安装补丁脚本</h3>
                    <pre>{`mkdir -p /usr/local/share/fnos-igpu-temp-patch

# ==== patch 脚本 ====
cat > /usr/local/sbin/fnos-igpu-temp-patch << 'SHEOF'
#!/bin/sh
set -eu
SRC=/usr/trim/www/assets/ResourceMonitor-BacdZkk_.js
DIR=/usr/local/share/fnos-igpu-temp-patch
PATCHED=$DIR/ResourceMonitor-BacdZkk_.js
LOG=/var/log/fnos-igpu-temp-patch.log
now(){ date "+%F %T"; }
mkdir -p "$DIR"
if [ ! -f "$SRC" ]; then echo "$(now) source missing: $SRC" >> "$LOG"; exit 0; fi
if findmnt -n "$SRC" >/dev/null 2>&1; then umount "$SRC" || true; fi
python3 - "$SRC" "$PATCHED" "$LOG" <<"PY"
from pathlib import Path; from datetime import datetime; import sys
src=Path(sys.argv[1]); dst=Path(sys.argv[2]); log=Path(sys.argv[3])
s=src.read_text(errors="ignore")
now=datetime.now().strftime("%F %T")
changes=[]
repls=[
 ("gpu-temp-option",
  "dt=(e,r)=>{var s;r.temp&&e.add(U.Temp)",
  "dt=(e,r)=>{var s;(r.temp||r.temp===0)&&e.add(U.Temp)"),
 ("capture-cpu-package-temp",
  "ne.resmoCpu({},{timeout:1e3}).then(a=>{r(n=>(n.shift(),[...n,a.data.cpu]))}",
  "ne.resmoCpu({},{timeout:1e3}).then(a=>{try{window.__xiaIgpuTemp=Array.isArray(a.data.cpu.temp)?a.data.cpu.temp[0]:void 0}catch{}r(n=>(n.shift(),[...n,a.data.cpu]))}"),
 ("inject-gpu-temp",
  "ne.resmoGpu({},{timeout:1e3}).then(n=>{r(o=>(o.shift(),[...o,n.data]))}",
  "ne.resmoGpu({},{timeout:1e3}).then(n=>{try{const x=window.__xiaIgpuTemp;if(n&&n.data&&Array.isArray(n.data.gpu))n.data.gpu=n.data.gpu.map(g=>g&&(!(g.temp>=0)||Number.isNaN(g.temp))?{...g,temp:x}:g)}catch{}r(o=>(o.shift(),[...o,n.data]))}"),
]
for name,old,new in repls:
    if new in s: changes.append(f"{name}:already")
    elif old in s:
        s=s.replace(old,new,1); changes.append(f"{name}:patched")
    else: changes.append(f"{name}:missing")
dst.write_text(s)
log.open("a").write(f"{now} generated patched asset: {dst}; " + ", ".join(changes) + chr(10))
PY
mount --bind "$PATCHED" "$SRC"
echo "$(now) bind-mounted patched asset over $SRC" >> "$LOG"
SHEOF

# ==== core-patch 脚本 ====
cat > /usr/local/sbin/fnos-igpu-temp-core-patch << 'SHEOF'
#!/bin/sh
set -eu
SRC=/usr/trim/www/assets/index-CMZOY5-G.js
DIR=/usr/local/share/fnos-igpu-temp-patch
PATCHED=$DIR/index-CMZOY5-G.js
LOG=/var/log/fnos-igpu-temp-patch.log
now(){ date "+%F %T"; }
mkdir -p "$DIR"
if [ ! -f "$SRC" ]; then echo "$(now) core source missing: $SRC" >> "$LOG"; exit 0; fi
python3 - "$SRC" "$PATCHED" "$LOG" <<'PY'
from pathlib import Path; from datetime import datetime; import sys
src=Path(sys.argv[1]); dst=Path(sys.argv[2]); log=Path(sys.argv[3])
s=src.read_text(errors="ignore")
old='const n=JSON.parse(e.data);if(this.emit("message",e),n.res==="pong")'
inject='const n=JSON.parse(e.data);try{if(n&&n.req==="appcgi.resmon.cpu"&&n.data&&n.data.cpu&&Array.isArray(n.data.cpu.temp))window.__xiaIgpuTemp=n.data.cpu.temp[0];if(n&&n.req==="appcgi.resmon.gpu"&&n.data&&Array.isArray(n.data.gpu)){let x=window.__xiaIgpuTemp;if(!(x>=0)){let c=document.cookie.match(/(?:^|; )xia_igpu_temp=([0-9.]+)/);x=c?Number(c[1]):void 0}if(x>=0)n.data.gpu=n.data.gpu.map(g=>g&&(!(g.temp>=0)||Number.isNaN(g.temp))?{...g,temp:x}:g)}}catch{}if(this.emit("message",e),n.res==="pong")'
now=datetime.now().strftime("%F %T")
if inject in s: st="already"
elif old in s:
    s=s.replace(old,inject,1); st="patched"
else: st="missing"
dst.write_text(s)
log.open("a").write(f"{now} generated core patched asset: {dst}; websocket-inject:{st}" + chr(10))
PY
mount --bind "$PATCHED" "$SRC"
SHEOF

# ==== refresh 脚本 ====
cat > /usr/local/sbin/fnos-igpu-temp-refresh << 'SHEOF'
#!/bin/sh
set -eu
/usr/local/sbin/fnos-igpu-temp-patch
/usr/local/sbin/fnos-igpu-temp-core-patch
SHEOF

# ==== unpatch 脚本 ====
cat > /usr/local/sbin/fnos-igpu-temp-unpatch << 'SHEOF'
#!/bin/sh
set -eu
systemctl disable --now fnos-igpu-temp-patch.service >/dev/null 2>&1 || true
systemctl disable --now fnos-igpu-ws-proxy.service >/dev/null 2>&1 || true
for f in /usr/trim/www/assets/ResourceMonitor-BacdZkk_.js \
  /usr/trim/www/assets/index-CMZOY5-G.js \
  /usr/trim/nginx/conf/nginx.conf; do
  if findmnt -n "$f" >/dev/null 2>&1; then umount "$f"; fi
done
echo "unpatched FnOS iGPU temperature proxy and web assets"
SHEOF

chmod +x /usr/local/sbin/fnos-igpu-temp-patch \
  /usr/local/sbin/fnos-igpu-temp-core-patch \
  /usr/local/sbin/fnos-igpu-temp-refresh \
  /usr/local/sbin/fnos-igpu-temp-unpatch`}</pre>

                    <h3>5.3 安装 systemd 服务</h3>
                    <pre>{`cat > /etc/systemd/system/fnos-igpu-ws-proxy.service << 'SERVEOF'
[Unit]
Description=FnOS Intel iGPU temperature WebSocket injection proxy
After=trim_main.service trim_nginx.service resmon_service.service
Requires=trim_main.service

[Service]
Type=simple
ExecStartPre=/bin/sh -c 'for i in $(seq 1 60); do \\
  if [ -S /run/trim_cgi.socket ] && ss -lxnp | grep -q "/run/trim_cgi.socket.*trim"; then exit 0; fi; \\
  sleep 1; done; echo "trim_cgi.socket not ready" >&2; exit 1'
ExecStartPre=/bin/sh -c 'if [ -S /run/trim_cgi.socket.orig ]; then rm -f /run/trim_cgi.socket.orig; fi; \\
  mv /run/trim_cgi.socket /run/trim_cgi.socket.orig; rm -f /run/trim_cgi.socket'
Environment=XIA_IGPU_LISTEN=/run/trim_cgi.socket
Environment=XIA_IGPU_UPSTREAM=/run/trim_cgi.socket.orig
ExecStart=/usr/local/sbin/fnos-igpu-ws-proxy.py
ExecStopPost=/bin/sh -c 'rm -f /run/trim_cgi.socket; \\
  if [ -S /run/trim_cgi.socket.orig ]; then mv /run/trim_cgi.socket.orig /run/trim_cgi.socket; fi'
Restart=always
RestartSec=2

[Install]
WantedBy=multi-user.target
SERVEOF

cat > /etc/systemd/system/fnos-igpu-temp-patch.service << 'SERVEOF'
[Unit]
Description=Bind-mount patched FnOS web assets for Intel iGPU temperature display
After=local-fs.target trim_file_monitor.service trim_nginx.service
Wants=trim_nginx.service

[Service]
Type=oneshot
ExecStart=/usr/local/sbin/fnos-igpu-temp-refresh
RemainAfterExit=yes
ExecStop=/bin/sh -c 'for f in \\
  /usr/trim/www/assets/ResourceMonitor-BacdZkk_.js \\
  /usr/trim/www/assets/index-CMZOY5-G.js; do \\
  findmnt -n "$f" >/dev/null 2>&1 && umount "$f" || true; done'

[Install]
WantedBy=multi-user.target
SERVEOF

systemctl daemon-reload`}</pre>

                    <h2>六、启动与验证</h2>

                    <h3>6.1 启动服务</h3>
                    <p>注意：必须先启动 WebSocket 代理服务，再刷新补丁（JS 补丁依赖原始前端文件）：</p>

                    <pre>{`systemctl enable --now fnos-igpu-ws-proxy.service
systemctl enable --now fnos-igpu-temp-patch.service
# 等待几秒后刷新 FnOS Web 面板

# 检查服务状态
systemctl status fnos-igpu-ws-proxy.service --no-pager
systemctl status fnos-igpu-temp-patch.service --no-pager`}</pre>

                    <h3>6.2 验证</h3>
                    <p>打开 FnOS Web 面板 → 资源监控 → GPU 区域，应能看到温度值。温度值来源于 CPU 封装温度（Package Temperature），并非独立 GPU 传感器，但已足够反映核显的散热状态。</p>

                    <p>也可以通过日志确认注入是否生效：</p>

                    <pre>{`# WS 代理日志
tail -f /var/log/fnos-igpu-ws-proxy.log
# listening /run/trim_cgi.socket

# 补丁日志
cat /var/log/fnos-igpu-temp-patch.log
# gpu-temp-option:patched, capture-cpu-package-temp:patched, inject-gpu-temp:patched
# websocket-inject:patched`}</pre>

                    <h2>七、卸载</h2>
                    <pre>{`# 一键卸载
bash /usr/local/sbin/fnos-igpu-temp-unpatch
# 或
systemctl disable --now fnos-igpu-ws-proxy.service
systemctl disable --now fnos-igpu-temp-patch.service
rm -f /etc/systemd/system/fnos-igpu-ws-proxy.service
rm -f /etc/systemd/system/fnos-igpu-temp-patch.service
systemctl daemon-reload
systemctl restart trim_nginx.service`}</pre>

                    <h2>八、Fnos系统更新后的处理</h2>
                    <p>FnOS 更新时可能会替换前端 JS 文件，导致 bind-mount 挂载点失效或补丁的文件名发生变化。更新后的处理步骤：</p>
                    <pre>{`# 1. 检查补丁状态
cat /var/log/fnos-igpu-temp-patch.log | tail -5
# 如果有 "missing" 字样，说明前端文件名或代码结构已变化

# 2. 重新应用补丁
systemctl restart fnos-igpu-temp-patch.service

# 3. 如果仍不行，可能需要手动检查新的 JS 文件名
ls /usr/trim/www/assets/
# 找到新的 ResourceMonitor 和 index 文件，更新脚本中的文件名`}</pre>

                    <h2>九、备份与恢复</h2>
                    <h3>9.1 备份现有补丁</h3>
                    <pre>{`# 完整备份所有补丁文件
BACKUP_DIR=/vol2/Backups/fnos-igpu-temp-patch-$(date +%Y%m%d-%H%M%S)
mkdir -p "$BACKUP_DIR"

# 收集所有相关文件
tar --zstd -cpf "$BACKUP_DIR/fnos-igpu-temp-patch-full.tar.zst" \\
  -C / etc/systemd/system/fnos-igpu-temp-patch.service \\
  -C / etc/systemd/system/fnos-igpu-ws-proxy.service \\
  -C / usr/local/sbin/fnos-igpu-ws-proxy.py \\
  -C / usr/local/sbin/fnos-igpu-temp-patch \\
  -C / usr/local/sbin/fnos-igpu-temp-core-patch \\
  -C / usr/local/sbin/fnos-igpu-temp-refresh \\
  -C / usr/local/sbin/fnos-igpu-temp-unpatch \\
  -C / usr/local/share/fnos-igpu-temp-patch \\
  -C / var/log/fnos-igpu-temp-patch.log \\
  -C / var/log/fnos-igpu-ws-proxy.log

# 生成摘要
cd "$BACKUP_DIR"
sha256sum fnos-igpu-temp-patch-full.tar.zst > checksums.sha256
echo "backup saved to $BACKUP_DIR"`}</pre>

                    <h3>9.2 在新设备上恢复</h3>
                    <pre>{`# 从备份恢复
tar --zstd -xpf fnos-igpu-temp-patch-full.tar.zst -C /
chmod +x /usr/local/sbin/fnos-igpu-ws-proxy.py \\
  /usr/local/sbin/fnos-igpu-temp-patch \\
  /usr/local/sbin/fnos-igpu-temp-core-patch \\
  /usr/local/sbin/fnos-igpu-temp-refresh \\
  /usr/local/sbin/fnos-igpu-temp-unpatch

systemctl daemon-reload
systemctl enable --now fnos-igpu-ws-proxy.service
systemctl enable --now fnos-igpu-temp-patch.service
/usr/local/sbin/fnos-igpu-temp-refresh

# 验证
systemctl status fnos-igpu-ws-proxy.service --no-pager`}</pre>

                    <h2>十、技术原理深析</h2>

                    <h3>10.1 为什么 Intel 核显没有独立温度传感器？</h3>
                    <p>Intel 从 Sandy Bridge（第2代）开始将核显集成到 CPU 封装中，核显和 CPU 核心共用散热通道。从 Linux 4.15 开始，i915 驱动通过 hwmon 接口暴露了 GPU 温度（通过 GPU GT 热区），但这取决于硬件平台和驱动版本。在 10th Gen Comet Lake 及之前的部分平台上，i915 hwmon 接口可能缺失或返回无效值。</p>

                    <p>本方案将 CPU Package 温度（coretemp/temp1_input）复用给 GPU 显示，因为两者在同一封装中，温度高度相关，差异通常在 3-5°C 以内。</p>

                    <h3>10.2 WebSocket 代理原理</h3>
                    <p>FnOS 的前端与后端的 WebSocket 通信使用非标准的 WebSocket 协议（区别于标准 HTTP Upgrade 握手）。在实现中需要注意：</p>
                    <ul>
                        <li>客户端到代理的帧通常带 mask（masked = true），代理到上游的帧也需要 mask</li>
                        <li>上游返回的帧不带 mask（masked = false），代理到客户端也不带 mask</li>
                        <li>帧类型 opcode 1 = text, 8 = close</li>
                    </ul>

                    <h3>10.3 bind-mount 的优势</h3>
                    <ul>
                        <li>不修改原始文件系统，原始 JS 文件保持原样</li>
                        <li>系统更新时，如果原始文件被替换，bind-mount 挂载点变为孤儿挂载，下次重启服务时会自动 umount 并重新挂载</li>
                        <li>卸载时只需 umount + 移除 systemd 服务，不留痕迹</li>
                    </ul>

                    <h3>10.4 为什么有两个 JS 补丁？</h3>
                    <p>ResourceMonitor.js 负责资源监控页面的展示逻辑，index.js 是 FnOS 前端 WebSocket 底层通信框架。两个补丁的职责分工：</p>
                    <ul>
                        <li><strong>ResourceMonitor</strong>：修改 GPU 温度显示条件 + 捕获 CPU 温度 + 回填 GPU 数据</li>
                        <li><strong>index.js</strong>：在更低层的 WebSocket 消息处理中注入，确保所有通过 WebSocket 的 GPU 数据都被处理，与框架耦合更深、更可靠</li>
                    </ul>

                    <h2>十一、常见问题</h2>

                    <h3>Q: 补丁后 GPU 温度显示仍为空？</h3>
                    <p>检查以下项目：</p>
                    <pre>{`# 1. 检查 WebSocket 代理是否运行
ss -lxnp | grep trim_cgi.socket
# 应看到 /run/trim_cgi.socket（代理）和 /run/trim_cgi.socket.orig（上游）

# 2. 检查补丁日志
cat /var/log/fnos-igpu-temp-patch.log
# 确认所有标记都是 "patched" 而非 "missing"

# 3. 检查 CPU 温度获取
cat /sys/class/hwmon/*/name 2>/dev/null | grep coretemp
cat /sys/class/hwmon/*/temp1_input 2>/dev/null
# 应返回一个三位数（如 79000 表示 79.0°C）

# 4. 清除浏览器缓存，或使用无痕模式刷新面板`}</pre>

                    <h3>Q: 补丁后温度值异常（过高或过低）？</h3>
                    <p>CPU Package 温度在 30-100°C 为正常范围。如果显示 0 或负值，可能是 hwmon 路径不正确。检查 /sys/class/hwmon 中的传感器列表，调整 fallback 逻辑。</p>

                    <h3>Q: FnOS 系统更新后补丁失效？</h3>
                    <p>FnOS 更新时前端 JS 文件的哈希值（文件名中的 BacdZkk_ 等字符串）会发生变化。需要重新运行 <code>systemctl restart fnos-igpu-temp-patch.service</code>。如果文件名已变，需要更新脚本中的文件名。</p>

                    <h3>Q: 是否支持 AMD 核显？</h3>
                    <p>AMD APU（如 4700U、5700G 等）的核显温度可能有独立的 hwmon 接口（amdgpu 驱动），本方案需要适配 AMD 的温度路径。AMD 用户应检查 /sys/class/hwmon 中是否有 amdgpu 相关传感器。</p>

                    <h3>Q: 是否影响 FnOS 其他功能？</h3>
                    <p>不影响。补丁仅修改资源监控页面的 GPU 温度显示逻辑，不涉及存储、网络、权限管理等核心功能。WebSocket 代理仅透传和修改 GPU 相关数据帧，其他消息完全无感知。</p>

                    <h3>Q: 可以还原至原始状态吗？</h3>
                    <p>可以。运行 <code>bash /usr/local/sbin/fnos-igpu-temp-unpatch</code> 即可一键卸载，系统恢复至完全原始状态。</p>

                    <h2>十二、总结</h2>
                    <p>本方案在没有 Intel 独立 GPU 温度传感器的情况下，通过巧妙的 WebSocket 代理 + JS 注入方式，将 CPU 封装温度复用到核显温度显示槽位，使 FnOS 的资源监控更加完整。所有操作通过 bind-mount 实现，不修改系统原始文件，可完整卸载还原。完整的备份和恢复机制保证了方案的可迁移性。</p>

                    <p>对于同样使用 FnOS + Intel 核显的用户，只需按照本文步骤操作即可实现核显温度显示。对于其他 Linux 发行版的类似需求，也可以借鉴 WebSocket 代理注入的思路加以适配。</p>

                </div>
            </div>
        </section>
    );
}