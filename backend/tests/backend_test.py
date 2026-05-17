"""Backend API tests for Sandhya Puri Sanyas Ashram (MERN via FastAPI proxy)."""
import os
import time
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    # Read from frontend .env as fallback
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip()
                    break
    except Exception:
        pass

BASE_URL = (BASE_URL or "").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@sandhyapuri.org"
ADMIN_PASSWORD = "Ashram@2026"


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=20)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and data["token"]
    return data["token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# ----- Health -----
class TestHealth:
    def test_health(self, session):
        r = session.get(f"{API}/health", timeout=20)
        assert r.status_code == 200
        data = r.json()
        assert data.get("status") == "ok"
        assert data.get("db") == "connected"
        assert data.get("razorpay_mode") == "mock"


# ----- Public endpoints -----
class TestPublic:
    def test_hero(self, session):
        r = session.get(f"{API}/hero", timeout=20)
        assert r.status_code == 200
        data = r.json()
        assert "images" in data
        assert isinstance(data["images"], list)
        assert len(data["images"]) >= 1

    def test_activities(self, session):
        r = session.get(f"{API}/activities", timeout=20)
        assert r.status_code == 200
        assert isinstance(r.json().get("activities"), list)

    def test_gallery(self, session):
        r = session.get(f"{API}/gallery", params={"page": 1, "limit": 9}, timeout=20)
        assert r.status_code == 200
        d = r.json()
        for k in ("images", "total", "page", "limit", "totalPages"):
            assert k in d
        assert d["page"] == 1
        assert d["limit"] == 9
        assert isinstance(d["images"], list)

    def test_video(self, session):
        r = session.get(f"{API}/video", timeout=20)
        assert r.status_code == 200
        assert "url" in r.json()

    def test_public_settings(self, session):
        r = session.get(f"{API}/admin/public-settings", timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert "upi_id" in d
        assert "upi_qr_url" in d


# ----- Auth -----
class TestAuth:
    def test_login_success(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert d["admin"]["email"] == ADMIN_EMAIL
        assert d["admin"]["role"] == "admin"

    def test_login_bad_pw(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"}, timeout=20)
        assert r.status_code == 401

    def test_login_missing(self, session):
        r = session.post(f"{API}/auth/login", json={}, timeout=20)
        assert r.status_code == 400

    def test_me_authed(self, session, admin_headers):
        r = session.get(f"{API}/auth/me", headers=admin_headers, timeout=20)
        assert r.status_code == 200
        assert r.json()["admin"]["email"] == ADMIN_EMAIL

    def test_donations_no_token(self, session):
        r = requests.get(f"{API}/donations", timeout=20)  # no auth header
        assert r.status_code == 401

    def test_donations_with_token(self, session, admin_headers):
        r = session.get(f"{API}/donations", headers=admin_headers, timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert "donations" in d
        assert isinstance(d["donations"], list)


# ----- Donation MOCK flow -----
class TestDonations:
    def test_mock_create_order_and_verify(self, session, admin_headers):
        payload = {"donorName": "TEST_Donor", "email": "test_donor@example.com", "amount": 101, "message": "TEST mock"}
        r = session.post(f"{API}/donate/create-order", json=payload, timeout=20)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("mock") is True
        order = d.get("order") or {}
        assert order.get("id", "").startswith("order_mock_")
        order_id = order["id"]

        r2 = session.post(
            f"{API}/donate/verify",
            json={"razorpay_order_id": order_id, "razorpay_payment_id": "pay_test_1", "razorpay_signature": "sig_test"},
            timeout=20,
        )
        assert r2.status_code == 200, r2.text
        v = r2.json()
        assert v.get("verified") is True
        assert v.get("mock") is True

        # confirm persistence via admin donations list
        r3 = session.get(f"{API}/donations", headers=admin_headers, timeout=20)
        assert r3.status_code == 200
        found = [x for x in r3.json()["donations"] if x.get("orderId") == order_id]
        assert len(found) == 1
        assert found[0]["paymentStatus"] == "mock_paid"
        assert found[0]["donorName"] == "TEST_Donor"

    def test_create_order_validation(self, session):
        r = session.post(f"{API}/donate/create-order", json={"donorName": "x", "email": "x@y.com"}, timeout=20)
        assert r.status_code == 400

    def test_upi_record(self, session, admin_headers):
        txn = f"TXN_TEST_{int(time.time())}"
        r = session.post(
            f"{API}/donate/upi-record",
            json={"donorName": "TEST_UPI", "email": "upi_test@example.com", "amount": 50, "upiTxnId": txn},
            timeout=20,
        )
        assert r.status_code == 200, r.text
        assert r.json().get("ok") is True

        r2 = session.get(f"{API}/donations", headers=admin_headers, timeout=20)
        assert r2.status_code == 200
        found = [x for x in r2.json()["donations"] if x.get("upiTxnId") == txn]
        assert len(found) == 1
        assert found[0]["paymentStatus"] == "paid"
        assert found[0]["mode"] == "upi_manual"


# ----- Contact -----
class TestContact:
    def test_contact_create(self, session, admin_headers):
        payload = {"name": "TEST User", "email": "test_contact@example.com", "message": "This is a TEST message"}
        r = session.post(f"{API}/contact", json=payload, timeout=20)
        assert r.status_code == 201, r.text
        assert r.json().get("ok") is True

        r2 = session.get(f"{API}/contact", headers=admin_headers, timeout=20)
        assert r2.status_code == 200
        subs = r2.json()["submissions"]
        assert any(s["email"] == "test_contact@example.com" for s in subs)

    def test_contact_missing_fields(self, session):
        r = session.post(f"{API}/contact", json={"name": "x"}, timeout=20)
        assert r.status_code == 400

    def test_contact_admin_requires_auth(self, session):
        r = requests.get(f"{API}/contact", timeout=20)
        assert r.status_code == 401


# ----- Admin stats / export -----
class TestAdminMisc:
    def test_stats(self, session, admin_headers):
        r = session.get(f"{API}/admin/stats", headers=admin_headers, timeout=20)
        assert r.status_code == 200
        d = r.json()
        for k in ("totalDonations", "totalAmount", "totalSubmissions"):
            assert k in d
            assert isinstance(d[k], (int, float))

    def test_csv_export(self, session, admin_headers):
        r = session.get(f"{API}/admin/donations/export", headers=admin_headers, timeout=30)
        assert r.status_code == 200
        ct = r.headers.get("content-type", "")
        assert "text/csv" in ct
        assert "createdAt,donorName,email,amount" in r.text.splitlines()[0]


# ----- Admin CRUD: hero / activities / gallery / video -----
class TestAdminCRUD:
    def test_hero_post_delete(self, session, admin_headers):
        url = "https://example.com/test-hero.jpg"
        r = session.post(f"{API}/hero", headers=admin_headers, json={"url": url, "alt": "TEST"}, timeout=20)
        assert r.status_code == 201, r.text
        new_id = r.json()["id"]
        r2 = session.delete(f"{API}/hero/{new_id}", headers=admin_headers, timeout=20)
        assert r2.status_code == 200
        assert r2.json().get("deleted") is True

    def test_activities_post_delete(self, session, admin_headers):
        url = "https://example.com/test-activity.jpg"
        r = session.post(
            f"{API}/activities",
            headers=admin_headers,
            json={"url": url, "title": "TEST Activity", "description": "TEST"},
            timeout=20,
        )
        assert r.status_code == 201, r.text
        new_id = r.json()["id"]
        r2 = session.delete(f"{API}/activities/{new_id}", headers=admin_headers, timeout=20)
        assert r2.status_code == 200

    def test_gallery_post_delete(self, session, admin_headers):
        url = "https://example.com/test-gallery.jpg"
        r = session.post(f"{API}/gallery", headers=admin_headers, json={"url": url, "caption": "TEST"}, timeout=20)
        assert r.status_code == 201, r.text
        new_id = r.json()["id"]
        r2 = session.delete(f"{API}/gallery/{new_id}", headers=admin_headers, timeout=20)
        assert r2.status_code == 200

    def test_video_update_and_read(self, session, admin_headers):
        url = "https://www.youtube.com/embed/test_video"
        r = session.post(f"{API}/video", headers=admin_headers, json={"url": url}, timeout=20)
        assert r.status_code == 200, r.text
        r2 = session.get(f"{API}/video", timeout=20)
        assert r2.status_code == 200
        assert r2.json().get("url") == url

    def test_admin_required_for_post(self, session):
        r = requests.post(f"{API}/hero", json={"url": "x"}, timeout=20)
        assert r.status_code == 401
