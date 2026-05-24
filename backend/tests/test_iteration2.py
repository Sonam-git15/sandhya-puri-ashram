"""Iteration 2 tests — Razorpay LIVE, real images, file uploads, password reset, public settings."""
import io
import os
import re
import time
import struct
import zlib
import requests
import pytest

BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or "").rstrip("/")
if not BASE_URL:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                break
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@sandhyapuri.org"
ADMIN_PASSWORD = "Ashram@2026"


def _png_bytes():
    """Generate a minimal 1x1 PNG."""
    sig = b"\x89PNG\r\n\x1a\n"
    def chunk(t, d):
        return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xffffffff)
    ihdr = struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0)
    raw = b"\x00\xff\x00\x00"
    idat = zlib.compress(raw)
    return sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")


@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=20)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ----- Health (live mode) -----
class TestHealth:
    def test_razorpay_live_mode(self):
        r = requests.get(f"{API}/health", timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert d.get("razorpay_mode") == "live", f"expected live, got {d.get('razorpay_mode')}"


# ----- Razorpay LIVE create-order -----
class TestRazorpayLive:
    def test_create_order_real(self, admin_headers):
        payload = {"donorName": "TEST_LiveDonor", "email": "test_live@example.com", "amount": 11, "message": "TEST live"}
        r = requests.post(f"{API}/donate/create-order", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("mock") is False, f"expected mock=false, got {d}"
        assert d.get("keyId", "").startswith("rzp_test_"), f"keyId: {d.get('keyId')}"
        order = d.get("order") or {}
        assert order.get("id"), "no order id"
        assert not order["id"].startswith("order_mock_"), f"got mock id: {order['id']}"
        assert order["id"].startswith("order_"), f"unexpected order id: {order['id']}"

        # confirm donation persisted with paymentStatus=created and mode=razorpay
        time.sleep(0.5)
        r2 = requests.get(f"{API}/donations", headers=admin_headers, timeout=20)
        assert r2.status_code == 200
        found = [x for x in r2.json()["donations"] if x.get("orderId") == order["id"]]
        assert len(found) == 1, f"donation not persisted for {order['id']}"
        assert found[0]["paymentStatus"] == "created"
        assert found[0]["mode"] == "razorpay"


# ----- Real ashram images -----
class TestRealImages:
    def _assert_customer_assets(self, urls):
        assert len(urls) >= 1
        for u in urls:
            assert "customer-assets.emergentagent.com" in u, f"non-customer-assets URL: {u}"
            assert "unsplash.com" not in u

    def test_hero_5_real_images(self):
        r = requests.get(f"{API}/hero", timeout=20)
        assert r.status_code == 200
        imgs = r.json()["images"]
        assert len(imgs) == 5, f"expected 5 hero images, got {len(imgs)}"
        self._assert_customer_assets([i["url"] for i in imgs])

    def test_activities_5_real(self):
        r = requests.get(f"{API}/activities", timeout=20)
        assert r.status_code == 200
        acts = r.json()["activities"]
        assert len(acts) == 5, f"expected 5 activities, got {len(acts)}"
        self._assert_customer_assets([a["url"] for a in acts])

    def test_gallery_9_real(self):
        r = requests.get(f"{API}/gallery", params={"page": 1, "limit": 20}, timeout=20)
        assert r.status_code == 200
        imgs = r.json()["images"]
        assert len(imgs) >= 9, f"expected ≥9 gallery, got {len(imgs)}"
        # at least 9 from customer-assets (allow extras from later uploads)
        ca = [i for i in imgs if "customer-assets.emergentagent.com" in i["url"]]
        assert len(ca) >= 9, f"expected ≥9 customer-asset gallery items, got {len(ca)}"


# ----- File uploads (multer) -----
class TestFileUploads:
    """Stores ids/filenames for cross-tests."""
    uploaded = {}

    def test_gallery_upload(self, admin_headers):
        files = [("images", ("TEST_g1.png", _png_bytes(), "image/png"))]
        r = requests.post(f"{API}/gallery/upload", headers=admin_headers, files=files, timeout=30)
        assert r.status_code in (200, 201), r.text
        d = r.json()
        arr = d.get("images") or d.get("uploaded") or []
        assert len(arr) >= 1, d
        item = arr[0]
        assert item["url"].startswith("/api/uploads/gallery/")
        TestFileUploads.uploaded["gallery_id"] = item.get("id") or item.get("_id")
        TestFileUploads.uploaded["gallery_url"] = item["url"]

        # GET /api/gallery should include it
        r2 = requests.get(f"{API}/gallery", params={"page": 1, "limit": 50}, timeout=20)
        assert r2.status_code == 200
        urls = [x["url"] for x in r2.json()["images"]]
        assert item["url"] in urls

    def test_static_file_served(self):
        url = TestFileUploads.uploaded.get("gallery_url")
        assert url, "no uploaded gallery url"
        r = requests.get(f"{BASE_URL}{url}", timeout=20)
        assert r.status_code == 200
        assert r.headers.get("content-type", "").startswith("image/")
        assert len(r.content) > 0

    def test_hero_upload(self, admin_headers):
        files = [("images", ("TEST_h1.png", _png_bytes(), "image/png"))]
        r = requests.post(f"{API}/hero/upload", headers=admin_headers, files=files, timeout=30)
        assert r.status_code in (200, 201), r.text
        arr = r.json().get("images") or r.json().get("uploaded") or []
        assert len(arr) >= 1
        item = arr[0]
        assert item["url"].startswith("/api/uploads/hero/")
        TestFileUploads.uploaded["hero_id"] = item.get("id") or item.get("_id")

        # static fetch
        r2 = requests.get(f"{BASE_URL}{item['url']}", timeout=20)
        assert r2.status_code == 200
        assert r2.headers.get("content-type", "").startswith("image/")

    def test_activities_upload(self, admin_headers):
        files = [("image", ("TEST_a1.png", _png_bytes(), "image/png"))]
        data = {"title": "TEST_Activity", "description": "test desc"}
        r = requests.post(f"{API}/activities/upload", headers=admin_headers, files=files, data=data, timeout=30)
        assert r.status_code in (200, 201), r.text
        d = r.json()
        # may return {activity:...} or directly the doc
        doc = d.get("activity") or d.get("item") or d
        assert doc.get("url", "").startswith("/api/uploads/activities/"), doc
        assert doc.get("title") == "TEST_Activity"
        TestFileUploads.uploaded["activity_id"] = doc.get("id") or doc.get("_id")

    def test_edit_caption(self, admin_headers):
        gid = TestFileUploads.uploaded.get("gallery_id")
        assert gid, "no gallery_id"
        r = requests.put(f"{API}/gallery/{gid}", headers={**admin_headers, "Content-Type": "application/json"},
                         json={"caption": "TEST_new_caption"}, timeout=20)
        assert r.status_code == 200, r.text

        r2 = requests.get(f"{API}/gallery", params={"page": 1, "limit": 100}, timeout=20)
        match = [x for x in r2.json()["images"] if (x.get("id") or x.get("_id")) == gid]
        assert match and match[0].get("caption") == "TEST_new_caption"

    def test_replace_image(self, admin_headers):
        gid = TestFileUploads.uploaded.get("gallery_id")
        assert gid
        old_url = TestFileUploads.uploaded.get("gallery_url")
        files = [("image", ("TEST_g2.png", _png_bytes(), "image/png"))]
        r = requests.put(f"{API}/gallery/{gid}", headers=admin_headers, files=files, timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        new_url = (d.get("image") or d).get("url") or d.get("url")
        assert new_url and new_url.startswith("/api/uploads/gallery/")
        assert new_url != old_url, "url did not change"
        TestFileUploads.uploaded["gallery_url"] = new_url

    def test_delete_gallery_removes_file(self, admin_headers):
        gid = TestFileUploads.uploaded.get("gallery_id")
        url = TestFileUploads.uploaded.get("gallery_url")
        assert gid and url
        r = requests.delete(f"{API}/gallery/{gid}", headers=admin_headers, timeout=20)
        assert r.status_code == 200
        # file should be gone
        r2 = requests.get(f"{BASE_URL}{url}", timeout=20)
        assert r2.status_code in (404, 403), f"file still served: {r2.status_code}"

    def test_cleanup_hero_activity(self, admin_headers):
        hid = TestFileUploads.uploaded.get("hero_id")
        aid = TestFileUploads.uploaded.get("activity_id")
        if hid:
            requests.delete(f"{API}/hero/{hid}", headers=admin_headers, timeout=20)
        if aid:
            requests.delete(f"{API}/activities/{aid}", headers=admin_headers, timeout=20)


# ----- Public settings (phone/whatsapp/lat/lng) -----
class TestPublicSettings:
    def test_public_settings_has_all(self):
        r = requests.get(f"{API}/admin/public-settings", timeout=20)
        assert r.status_code == 200, r.text
        d = r.json()
        for k in ("upi_id", "phone", "whatsapp", "lat", "lng"):
            assert k in d, f"missing key {k} in {d}"
        # lat/lng should match env
        assert abs(float(d["lat"]) - 28.6293963) < 1e-4
        assert abs(float(d["lng"]) - 77.2474045) < 1e-4

    def test_update_phone(self, admin_headers):
        new_phone = f"+91 99999 {int(time.time()) % 100000:05d}"
        r = requests.put(f"{API}/admin/settings/phone",
                         headers={**admin_headers, "Content-Type": "application/json"},
                         json={"value": new_phone}, timeout=20)
        assert r.status_code == 200, r.text
        time.sleep(0.3)
        r2 = requests.get(f"{API}/admin/public-settings", timeout=20)
        assert r2.json().get("phone") == new_phone


# ----- About video URL + upload -----
class TestVideo:
    def test_video_url_save(self, admin_headers):
        url = "https://www.youtube.com/embed/test_iter2"
        r = requests.post(f"{API}/video",
                          headers={**admin_headers, "Content-Type": "application/json"},
                          json={"url": url}, timeout=20)
        assert r.status_code == 200, r.text
        r2 = requests.get(f"{API}/video", timeout=20)
        assert r2.json().get("url") == url

    def test_video_file_upload(self, admin_headers):
        # minimal mp4 bytes (just a fake header — multer mimetype filter checks extension/mimetype, not content)
        fake_mp4 = b"\x00\x00\x00\x20ftypisom" + b"\x00" * 32
        files = [("video", ("TEST_v1.mp4", fake_mp4, "video/mp4"))]
        r = requests.post(f"{API}/video/upload", headers=admin_headers, files=files, timeout=30)
        assert r.status_code in (200, 201), r.text
        d = r.json()
        url = d.get("url") or (d.get("video") or {}).get("url")
        assert url and url.startswith("/api/uploads/videos/"), d
        # static serve
        r2 = requests.get(f"{BASE_URL}{url}", timeout=20)
        assert r2.status_code == 200
        # GET /api/video reflects this
        r3 = requests.get(f"{API}/video", timeout=20)
        assert r3.json().get("url") == url


# ----- Password reset flow -----
class TestPasswordReset:
    def test_forgot_password_ok(self):
        r = requests.post(f"{API}/auth/forgot-password",
                          json={"email": ADMIN_EMAIL}, timeout=20)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("ok") is True or d.get("message")

    def test_recent_resets_has_token(self, admin_headers):
        r = requests.get(f"{API}/auth/recent-resets", headers=admin_headers, timeout=20)
        assert r.status_code == 200, r.text
        items = r.json().get("resets") or r.json().get("items") or r.json()
        assert isinstance(items, list) and len(items) >= 1
        last = items[0]
        url = last.get("resetUrl") or last.get("url")
        assert url and "/admin/reset-password/" in url, f"no resetUrl: {last}"
        m = re.search(r"/admin/reset-password/([a-f0-9]{64})", url)
        assert m, f"no 64-hex token in {url}"

    def test_reset_invalid_token(self):
        r = requests.get(f"{API}/auth/reset-password/INVALID", timeout=20)
        assert r.status_code == 404
        d = r.json()
        assert d.get("valid") is False

    def test_full_reset_and_restore(self, admin_headers):
        # 1) forgot
        r = requests.post(f"{API}/auth/forgot-password", json={"email": ADMIN_EMAIL}, timeout=20)
        assert r.status_code == 200
        time.sleep(0.5)
        # 2) get token
        r2 = requests.get(f"{API}/auth/recent-resets", headers=admin_headers, timeout=20)
        items = r2.json().get("resets") or r2.json().get("items") or r2.json()
        url = items[0].get("resetUrl") or items[0].get("url")
        token = re.search(r"/admin/reset-password/([a-f0-9]{64})", url).group(1)

        # 3) weak password should be rejected
        r_weak = requests.post(f"{API}/auth/reset-password",
                               json={"token": token, "password": "abc"}, timeout=20)
        assert r_weak.status_code == 400, f"weak pw not rejected: {r_weak.status_code} {r_weak.text}"

        # 4) strong new password
        new_pw = "NewStrong@123"
        r3 = requests.post(f"{API}/auth/reset-password",
                           json={"token": token, "password": new_pw}, timeout=20)
        assert r3.status_code == 200, r3.text

        # 5) login with new password
        rL = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": new_pw}, timeout=20)
        assert rL.status_code == 200, f"login w/ new pw failed: {rL.text}"

        # 6) reuse same token -> error
        r4 = requests.post(f"{API}/auth/reset-password",
                           json={"token": token, "password": "AnotherStrong@123"}, timeout=20)
        assert r4.status_code in (400, 404), r4.text
        msg = (r4.json().get("error") or r4.json().get("message") or "").lower()
        assert "used" in msg or "invalid" in msg or "expired" in msg, msg

        # 7) RESTORE original password
        # use new_pw token: forgot again
        rF = requests.post(f"{API}/auth/forgot-password", json={"email": ADMIN_EMAIL}, timeout=20)
        assert rF.status_code == 200
        time.sleep(0.5)
        # re-login with new_pw to get fresh admin token (because old admin_headers may still be valid via JWT but safer)
        new_token = rL.json()["token"]
        new_headers = {"Authorization": f"Bearer {new_token}"}
        rR = requests.get(f"{API}/auth/recent-resets", headers=new_headers, timeout=20)
        items2 = rR.json().get("resets") or rR.json().get("items") or rR.json()
        url2 = items2[0].get("resetUrl") or items2[0].get("url")
        tok2 = re.search(r"/admin/reset-password/([a-f0-9]{64})", url2).group(1)
        rRestore = requests.post(f"{API}/auth/reset-password",
                                 json={"token": tok2, "password": ADMIN_PASSWORD}, timeout=20)
        assert rRestore.status_code == 200, f"restore failed: {rRestore.text}"

        # 8) verify final login works with original password
        rFinal = requests.post(f"{API}/auth/login",
                               json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=20)
        assert rFinal.status_code == 200, f"final restore login failed: {rFinal.text}"
