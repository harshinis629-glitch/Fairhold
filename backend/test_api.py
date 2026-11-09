import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app

def run_tests():
    client = TestClient(app)
    
    print("1. Testing GET /api/system/status...")
    res = client.get("/api/system/status")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    status_data = res.json()
    print("   Status:", status_data)

    print("2. Testing GET /api/rentals...")
    res = client.get("/api/rentals")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    rentals = res.json()
    print(f"   Found {len(rentals)} rentals in database.")
    assert len(rentals) >= 3, "Expected at least 3 seeded rentals"

    sample_rental = rentals[0]
    rental_id = sample_rental["id"]
    print(f"3. Testing GET /api/rentals/{rental_id}...")
    res = client.get(f"/api/rentals/{rental_id}")
    assert res.status_code == 200
    r_detail = res.json()
    print(f"   Rental: {r_detail['item_name']}, Status: {r_detail['status']}")

    print("4. Testing POST /api/rentals (New Rental Creation)...")
    new_rental_payload = {
        "item_name": "Test Red Komodo 6K Camera",
        "category": "Camera & Cinema Optics",
        "renter_name": "Marcus Vance",
        "renter_email": "marcus@cinematography.org",
        "owner_name": "Apex Cine Rentals",
        "owner_email": "owner@apexcine.com",
        "rental_fee": 150.0,
        "deposit_amount": 400.0,
        "currency": "USD",
        "before_image_url": "/uploads/sony_fx3_before.jpg",
        "after_image_url": "/uploads/sony_fx3_after.jpg"
    }
    res = client.post("/api/rentals", json=new_rental_payload)
    assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.text}"
    created = res.json()
    created_id = created["id"]
    print(f"   Created rental {created_id} with total authorized ${created['total_authorized']}")

    print(f"5. Testing POST /api/rentals/{created_id}/run-inspection...")
    res = client.post(f"/api/rentals/{created_id}/run-inspection")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    inspected = res.json()
    print(f"   AI Findings Count: {len(inspected['findings'])}, Proposed: ${inspected['proposed_deduction']}")
    assert len(inspected["findings"]) > 0

    finding_id = inspected["findings"][0]["id"]
    print(f"6. Testing POST /api/rentals/{created_id}/owner-review...")
    review_payload = {
        "finding_decisions": [
            {
                "finding_id": finding_id,
                "owner_decision": "APPROVED",
                "owner_adjusted_amount": inspected["findings"][0]["proposed_deduction"]
            }
        ],
        "owner_notes": "Reviewed and approved front element scratch deduction."
    }
    res = client.post(f"/api/rentals/{created_id}/owner-review", json=review_payload)
    assert res.status_code == 200
    reviewed = res.json()
    print(f"   Approved Deduction: ${reviewed['approved_deduction']}")

    print(f"7. Testing POST /api/rentals/{created_id}/settle (PayPal Sandbox Capture & Void)...")
    settle_payload = {
        "confirm_settlement": True,
        "renter_notes": "Thank you for the transparent inspection report."
    }
    res = client.post(f"/api/rentals/{created_id}/settle", json=settle_payload)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    settled = res.json()
    print(f"   Settled status: {settled['status']}")
    print(f"   Captured total: ${settled['captured_amount']} (Fee: ${settled['rental_fee']} + Damage: ${settled['approved_deduction']})")
    print(f"   Released deposit: ${settled['refunded_amount']}")
    print(f"   PayPal Capture ID: {settled['paypal_capture_id']}")
    print(f"   PayPal Void ID: {settled['paypal_void_id']}")
    assert settled["status"] == "SETTLED"
    assert settled["captured_amount"] > 0
    assert settled["refunded_amount"] > 0

    print("8. Testing POST /api/inspect-adhoc...")
    upload_dir = backend_dir / "uploads"
    before_path = upload_dir / "sony_fx3_before.jpg"
    after_path = upload_dir / "sony_fx3_after.jpg"
    with open(before_path, "rb") as bf, open(after_path, "rb") as af:
        files = {
            "before_image": ("before.jpg", bf, "image/jpeg"),
            "after_image": ("after.jpg", af, "image/jpeg")
        }
        data = {
            "item_name": "Sony FX3 Adhoc Inspection",
            "category": "Camera"
        }
        res = client.post("/api/inspect-adhoc", data=data, files=files)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        adhoc_res = res.json()
        print(f"   Ad-hoc analysis summary: {adhoc_res['summary']}")
        print(f"   Ad-hoc findings count: {len(adhoc_res['findings'])}")

    print("\n[SUCCESS] ALL 8 TESTS PASSED! The Fairhold backend is 100% demo-ready.")

if __name__ == "__main__":
    run_tests()
