"""
FastAPI proxy shim.

Per platform constraints, supervisor runs `uvicorn server:app` on 0.0.0.0:8001.
The actual backend is implemented in Node.js + Express.js (MERN stack) and
runs as a child process on 127.0.0.1:$NODE_PORT. This shim spawns that child
on startup and reverse-proxies every /api/* request to it.

All real application logic lives under /app/backend/node/.
"""
import os
import asyncio
import atexit
import signal
import subprocess
import time
from contextlib import asynccontextmanager
from pathlib import Path

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

load_dotenv(Path(__file__).parent / ".env")

NODE_PORT = os.environ.get("NODE_PORT", "8002")
NODE_BACKEND_URL = f"http://127.0.0.1:{NODE_PORT}"
NODE_DIR = Path(__file__).parent / "node"

_node_proc: subprocess.Popen | None = None


def start_node_backend() -> None:
    global _node_proc
    if _node_proc and _node_proc.poll() is None:
        return
    env = os.environ.copy()
    env["PORT"] = NODE_PORT
    _node_proc = subprocess.Popen(
        ["node", "server.js"],
        cwd=str(NODE_DIR),
        env=env,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        preexec_fn=os.setsid,
    )


def stop_node_backend() -> None:
    global _node_proc
    if _node_proc and _node_proc.poll() is None:
        try:
            os.killpg(os.getpgid(_node_proc.pid), signal.SIGTERM)
            _node_proc.wait(timeout=5)
        except Exception:
            try:
                os.killpg(os.getpgid(_node_proc.pid), signal.SIGKILL)
            except Exception:
                pass
    _node_proc = None


atexit.register(stop_node_backend)


async def wait_for_node(timeout: float = 30.0) -> bool:
    deadline = time.time() + timeout
    async with httpx.AsyncClient(timeout=2.0) as client:
        while time.time() < deadline:
            try:
                r = await client.get(f"{NODE_BACKEND_URL}/api/health")
                if r.status_code == 200:
                    return True
            except Exception:
                pass
            await asyncio.sleep(0.5)
    return False


@asynccontextmanager
async def lifespan(_app: FastAPI):
    start_node_backend()
    await wait_for_node()
    yield
    stop_node_backend()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

_HOP_BY_HOP = {
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
    "host",
    "content-length",
    "content-encoding",
}


@app.get("/")
async def root():
    return {"service": "Sandhya Puri Sanyas Ashram API", "stack": "MERN (Node.js + Express.js + MongoDB)"}


@app.api_route(
    "/api/{full_path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
)
async def proxy_api(full_path: str, request: Request):
    if _node_proc is None or _node_proc.poll() is not None:
        start_node_backend()
        await wait_for_node(timeout=20)

    url = f"{NODE_BACKEND_URL}/api/{full_path}"
    headers = {k: v for k, v in request.headers.items() if k.lower() not in _HOP_BY_HOP}
    body = await request.body()

    async with httpx.AsyncClient(timeout=60.0) as client:
        upstream = await client.request(
            method=request.method,
            url=url,
            headers=headers,
            content=body,
            params=dict(request.query_params),
        )

    response_headers = {
        k: v for k, v in upstream.headers.items() if k.lower() not in _HOP_BY_HOP
    }
    return Response(
        content=upstream.content,
        status_code=upstream.status_code,
        headers=response_headers,
        media_type=upstream.headers.get("content-type"),
    )
