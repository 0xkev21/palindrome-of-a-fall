#!/usr/bin/env python3
"""
Full automated capture of real in-engine states of Palindrome of a Fall.
Captures both desktop (1920x1080) and mobile (430x932 @ 2x = 860x1864) viewports.
"""

import asyncio
import json
import os
import subprocess
import time
import urllib.request
import base64
import websockets
import http.server
import socketserver
import threading

PORT = 8770
CDP_PORT = 9230
SCREENSHOT_DIR = "marketing/screenshots"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory="dist", **kwargs)
    def log_message(self, format, *args):
        pass

async def capture_all():
    server = socketserver.TCPServer(("127.0.0.1", PORT), Handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    print("Static server started.")

    cmd = [
        "/usr/bin/chromium-browser",
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        "--user-data-dir=/tmp/chromium-full-capture",
        f"--remote-debugging-port={CDP_PORT}",
        f"http://127.0.0.1:{PORT}/"
    ]
    proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2.5)

    try:
        req = urllib.request.urlopen(f"http://127.0.0.1:{CDP_PORT}/json")
        tabs = json.loads(req.read().decode())
        target_tab = next(tab for tab in tabs if tab.get("type") == "page")
        ws = await websockets.connect(target_tab["webSocketDebuggerUrl"], max_size=50*1024*1024)

        mid = 0
        async def call(method, params=None):
            nonlocal mid
            mid += 1
            cid = mid
            await ws.send(json.dumps({"id": cid, "method": method, "params": params or {}}))
            while True:
                msg = json.loads(await ws.recv())
                if msg.get("id") == cid:
                    return msg

        await asyncio.sleep(2.0)
        # Unlock audio / dismiss preloader
        await call("Runtime.evaluate", {"expression": "window.__PALINDROME__.enterExperience()"})
        await asyncio.sleep(1.0)

        # 1. Desktop captures (1920x1080)
        await call("Emulation.setDeviceMetricsOverride", {
            "width": 1920, "height": 1080, "deviceScaleFactor": 1, "mobile": False
        })
        await asyncio.sleep(0.5)

        desktop_targets = [
            ("real_desktop_act1_ash.png", 0.12, False),
            ("real_desktop_act3_spark.png", 0.38, False),
            ("real_desktop_bedrock.png", 0.94, False),
            ("real_desktop_act7_gold.png", 0.88, True),
            ("real_desktop_act4_drift.png", 0.52, True),
            ("real_desktop_ascent_flight.png", 0.18, True),
        ]

        for fname, prog, is_asc in desktop_targets:
            print(f"Capturing Desktop: {fname} (p={prog}, ascent={is_asc})...")
            await call("Runtime.evaluate", {"expression": f"window.__PALINDROME__.seek({prog}, {str(is_asc).lower()})"})
            await asyncio.sleep(1.2)
            shot = await call("Page.captureScreenshot", {"format": "png"})
            data = base64.b64decode(shot["result"]["data"])
            with open(os.path.join(SCREENSHOT_DIR, fname), "wb") as f:
                f.write(data)

        # 2. Mobile captures (430 x 932 @ 2x = 860 x 1864)
        print("Switching to Mobile Viewport (430x932 @ 2x)...")
        await call("Emulation.setDeviceMetricsOverride", {
            "width": 430, "height": 932, "deviceScaleFactor": 2, "mobile": True
        })
        await asyncio.sleep(0.5)

        mobile_targets = [
            ("real_mobile_act1_ash.png", 0.12, False),
            ("real_mobile_bedrock.png", 0.94, False),
            ("real_mobile_act7_gold.png", 0.88, True),
            ("real_mobile_ascent_flight.png", 0.18, True),
        ]

        for fname, prog, is_asc in mobile_targets:
            print(f"Capturing Mobile: {fname} (p={prog}, ascent={is_asc})...")
            await call("Runtime.evaluate", {"expression": f"window.__PALINDROME__.seek({prog}, {str(is_asc).lower()})"})
            await asyncio.sleep(1.2)
            shot = await call("Page.captureScreenshot", {"format": "png"})
            data = base64.b64decode(shot["result"]["data"])
            with open(os.path.join(SCREENSHOT_DIR, fname), "wb") as f:
                f.write(data)

        await ws.close()
        print("All real engine captures successfully recorded!")

    finally:
        proc.terminate()
        proc.wait()
        server.shutdown()

if __name__ == "__main__":
    asyncio.run(capture_all())
