#!/usr/bin/env python3
"""
Captures real, pixel-perfect screenshots of the running Palindrome of a Fall WebGL application
using headless Chromium and Chrome DevTools Protocol (CDP) over WebSocket.
"""

import asyncio
import json
import os
import subprocess
import time
import urllib.request
import base64
import websockets

SCREENSHOT_DIR = "marketing/screenshots"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

CDP_PORT = 9222
DIST_INDEX = os.path.abspath("dist/index.html")

class CDPClient:
    def __init__(self, ws_url):
        self.ws_url = ws_url
        self.ws = None
        self.msg_id = 0

    async def connect(self):
        self.ws = await websockets.connect(self.ws_url, max_size=50 * 1024 * 1024)

    async def call(self, method, params=None):
        self.msg_id += 1
        payload = {"id": self.msg_id, "method": method, "params": params or {}}
        await self.ws.send(json.dumps(payload))
        while True:
            resp = await self.ws.recv()
            data = json.loads(resp)
            if data.get("id") == self.msg_id:
                if "error" in data:
                    raise Exception(f"CDP error: {data['error']}")
                return data.get("result", {})

    async def evaluate(self, expr):
        res = await self.call("Runtime.evaluate", {"expression": expr, "awaitPromise": True})
        return res.get("result", {}).get("value")

    async def screenshot(self, path):
        res = await self.call("Page.captureScreenshot", {"format": "png"})
        img_data = base64.b64decode(res["data"])
        with open(path, "wb") as f:
            f.write(img_data)
        print(f"Captured: {path} ({len(img_data):,} bytes)")

    async def close(self):
        if self.ws:
            await self.ws.close()

async def capture_all():
    # 1. Start Chromium headless
    cmd = [
        "/usr/bin/chromium-browser",
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        "--user-data-dir=/tmp/chromium-social-capture",
        f"--remote-debugging-port={CDP_PORT}",
        f"file://{DIST_INDEX}"
    ]
    proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print("Launched Chromium...")

    try:
        # Wait for debugging port
        for _ in range(20):
            try:
                req = urllib.request.urlopen(f"http://127.0.0.1:{CDP_PORT}/json", timeout=1)
                tabs = json.loads(req.read().decode())
                if tabs:
                    break
            except Exception:
                await asyncio.sleep(0.3)
        else:
            raise RuntimeError("Chromium remote debugging not available!")

        tab = tabs[0]
        ws_url = tab["webSocketDebuggerUrl"]
        print(f"Connecting to tab CDP: {ws_url}")
        
        client = CDPClient(ws_url)
        await client.connect()
        await client.call("Page.enable")
        await client.call("Runtime.enable")

        # Let the page boot and textures load
        print("Waiting for textures and story engine boot...")
        await asyncio.sleep(2.5)

        # Trigger preloader entry
        await client.evaluate("""
            if (window.__PALINDROME__) {
                window.__PALINDROME__.enterExperience();
            } else {
                document.getElementById('preloader')?.click();
            }
        """)
        await asyncio.sleep(1.0)

        # Captures definitions: (filename, width, height, progress, isAscent, description)
        captures = [
            # Desktop 16:9 widescreen captures
            ("desktop_descent_act1.png", 1920, 1080, 0.12, False, "Act I: Everything Scatters Into Ash"),
            ("desktop_descent_act3.png", 1920, 1080, 0.38, False, "Act III: The Suspended Spark"),
            ("desktop_bedrock_impact.png", 1920, 1080, 0.94, False, "Bedrock: The Obsidian Horizon"),
            ("desktop_ascent_act7.png", 1920, 1080, 0.90, True, "Ascent: What Shatters Can Reform In Light"),
            ("desktop_ascent_act4.png", 1920, 1080, 0.52, True, "Ascent: The Drift Reveals"),
            ("desktop_ascent_fly.png", 1920, 1080, 0.18, True, "Ascent: Flight & Gold Wings"),

            # Mobile 9:16 vertical in-situ captures (iPhone 15 Pro resolution: 430 x 932 @ 3x scale)
            ("mobile_descent_act1.png", 1080, 1920, 0.12, False, "Mobile: Act I Ash"),
            ("mobile_ascent_gold.png", 1080, 1920, 0.88, True, "Mobile: Act VII Gold Flight"),
            ("mobile_bedrock.png", 1080, 1920, 0.94, False, "Mobile: Bedrock Inversion"),

            # Square 1:1 captures (1080 x 1080)
            ("square_descent_act1.png", 1080, 1080, 0.12, False, "Square: Descent Act I"),
            ("square_ascent_gold.png", 1080, 1080, 0.88, True, "Square: Ascent Gold")
        ]

        for fname, w, h, prog, is_asc, desc in captures:
            print(f"Configuring viewport {w}x{h} for '{desc}' (p={prog}, ascent={is_asc})...")
            await client.call("Emulation.setDeviceMetricsOverride", {
                "width": w,
                "height": h,
                "deviceScaleFactor": 1,
                "mobile": h > w
            })
            await client.call("Emulation.setVisibleSize", {"width": w, "height": h})
            
            # Seek and force render frame
            await client.evaluate(f"""
                window.__PALINDROME__.seek({prog}, {str(is_asc).lower()});
                if (window.__PALINDROME__.storyEngine) {{
                    window.__PALINDROME__.storyEngine.render();
                }}
            """)
            await asyncio.sleep(0.8) # Allow smooth render frame
            
            out_path = os.path.join(SCREENSHOT_DIR, fname)
            await client.screenshot(out_path)

        await client.close()
        print("All real in-engine screenshots captured successfully!")

    finally:
        proc.terminate()
        proc.wait()

if __name__ == "__main__":
    asyncio.run(capture_all())
