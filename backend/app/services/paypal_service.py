import base64
import json
import logging
from typing import Dict, Any, Optional
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

class PayPalService:
    def __init__(self):
        self.base_url = settings.paypal_base_url
        self.client_id = settings.PAYPAL_CLIENT_ID
        self.client_secret = settings.PAYPAL_CLIENT_SECRET

    async def get_access_token(self) -> str:
        """
        Exchange client ID and secret for an OAuth2 bearer token from PayPal REST API.
        """
        if not settings.is_paypal_configured:
            raise ValueError(
                "PayPal credentials are not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in backend/.env."
            )

        auth_header = base64.b64encode(f"{self.client_id}:{self.client_secret}".encode()).decode()
        headers = {
            "Authorization": f"Basic {auth_header}",
            "Content-Type": "application/x-www-form-urlencoded",
        }
        data = {"grant_type": "client_credentials"}

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(f"{self.base_url}/v1/oauth2/token", headers=headers, data=data)
            if resp.status_code != 200:
                logger.error(f"PayPal OAuth failed ({resp.status_code}): {resp.text}")
                raise RuntimeError(f"PayPal OAuth failed ({resp.status_code}): {resp.text}")
            
            token_data = resp.json()
            return token_data.get("access_token")

    async def create_and_authorize_order(
        self,
        rental_fee: float,
        deposit_amount: float,
        item_name: str,
        currency: str = "USD",
        renter_name: str = "Renter",
        return_url: str = "http://localhost:5173/payment-success",
        cancel_url: str = "http://localhost:5173/payment-cancel"
    ) -> Dict[str, Any]:
        """
        1. Create an Order with intent: AUTHORIZE for total amount = rental_fee + deposit_amount
        2. In PayPal REST v2, orders with intent AUTHORIZE can be authorized via /v2/checkout/orders/{id}/authorize
           or approved via PayPal checkout flow.
        """
        total_amount = round(rental_fee + deposit_amount, 2)
        token = await self.get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }

        payload = {
            "intent": "AUTHORIZE",
            "purchase_units": [
                {
                    "reference_id": f"fairhold_{item_name[:15].strip().replace(' ', '_')}",
                    "description": f"Fairhold Protection: {item_name} (Rental ${rental_fee:.2f} + Deposit ${deposit_amount:.2f})",
                    "amount": {
                        "currency_code": currency,
                        "value": f"{total_amount:.2f}",
                        "breakdown": {
                            "item_total": {
                                "currency_code": currency,
                                "value": f"{total_amount:.2f}"
                            }
                        }
                    },
                    "items": [
                        {
                            "name": f"Rental Fee: {item_name}",
                            "unit_amount": {
                                "currency_code": currency,
                                "value": f"{rental_fee:.2f}"
                            },
                            "quantity": "1",
                            "category": "DIGITAL_GOODS"
                        },
                        {
                            "name": f"Security Deposit: {item_name}",
                            "unit_amount": {
                                "currency_code": currency,
                                "value": f"{deposit_amount:.2f}"
                            },
                            "quantity": "1",
                            "category": "DIGITAL_GOODS"
                        }
                    ]
                }
            ],
            "application_context": {
                "brand_name": "Fairhold Deposit Protection",
                "landing_page": "NO_PREFERENCE",
                "user_action": "CONTINUE",
                "return_url": return_url,
                "cancel_url": cancel_url,
            }
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(f"{self.base_url}/v2/checkout/orders", headers=headers, json=payload)
            if resp.status_code not in (200, 201):
                logger.error(f"PayPal order creation failed ({resp.status_code}): {resp.text}")
                raise RuntimeError(f"PayPal order creation failed: {resp.text}")
            
            order_data = resp.json()
            order_id = order_data["id"]

            # Next, attempt authorization call
            # Note: For Sandbox API without browser redirection, if buyer approval is required,
            # we return order details including approve links.
            # If standard server-to-server authorization is directly performed:
            auth_resp = await client.post(
                f"{self.base_url}/v2/checkout/orders/{order_id}/authorize",
                headers=headers,
                json={}
            )
            
            if auth_resp.status_code in (200, 201):
                auth_data = auth_resp.json()
                # Extract authorization id from purchase_units[0].payments.authorizations[0].id
                authorizations = (
                    auth_data.get("purchase_units", [{}])[0]
                    .get("payments", {})
                    .get("authorizations", [])
                )
                auth_id = authorizations[0]["id"] if authorizations else None
                return {
                    "success": True,
                    "order_id": order_id,
                    "authorization_id": auth_id,
                    "status": auth_data.get("status", "AUTHORIZED"),
                    "raw_order": order_data,
                    "raw_authorization": auth_data
                }
            else:
                # If direct authorize requires user approval link, return the created order and approve URL
                approve_link = next((l["href"] for l in order_data.get("links", []) if l.get("rel") == "approve"), None)
                return {
                    "success": True,
                    "order_id": order_id,
                    "authorization_id": None,
                    "status": order_data.get("status", "CREATED"),
                    "approve_url": approve_link,
                    "raw_order": order_data,
                    "raw_authorization": auth_resp.json() if auth_resp.content else None,
                    "message": "Order created. Authorize link ready for buyer approval."
                }

    async def capture_authorization(
        self,
        authorization_id: str,
        amount: float,
        currency: str = "USD",
        note: str = "Fairhold settlement: Rental fee + owner approved damage deduction"
    ) -> Dict[str, Any]:
        """
        Capture the rental fee plus approved damage deduction from the authorized deposit.
        POST /v2/payments/authorizations/{authorization_id}/capture
        """
        token = await self.get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }
        payload = {
            "amount": {
                "value": f"{amount:.2f}",
                "currency_code": currency
            },
            "is_final_capture": False,  # Allow remaining to be explicitly voided or partial capture
            "note_to_payer": note
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{self.base_url}/v2/payments/authorizations/{authorization_id}/capture",
                headers=headers,
                json=payload
            )
            if resp.status_code not in (200, 201):
                logger.error(f"PayPal capture failed ({resp.status_code}): {resp.text}")
                raise RuntimeError(f"PayPal capture failed ({resp.status_code}): {resp.text}")
            
            capture_data = resp.json()
            return {
                "success": True,
                "capture_id": capture_data.get("id"),
                "status": capture_data.get("status", "COMPLETED"),
                "amount": capture_data.get("amount", {}),
                "raw_response": capture_data
            }

    async def void_authorization(
        self,
        authorization_id: str,
        note: str = "Fairhold deposit protection: Remaining security deposit released to renter"
    ) -> Dict[str, Any]:
        """
        Void the unused authorization amount, immediately releasing held funds back to the renter.
        POST /v2/payments/authorizations/{authorization_id}/void
        """
        token = await self.get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{self.base_url}/v2/payments/authorizations/{authorization_id}/void",
                headers=headers
            )
            # PayPal VOID returns 204 No Content on success, or 200 with representation
            if resp.status_code in (200, 204):
                raw_data = resp.json() if resp.content else {"status": "VOIDED", "id": authorization_id}
                return {
                    "success": True,
                    "authorization_id": authorization_id,
                    "status": "VOIDED",
                    "raw_response": raw_data,
                    "note": note
                }
            else:
                logger.error(f"PayPal void failed ({resp.status_code}): {resp.text}")
                raise RuntimeError(f"PayPal void failed ({resp.status_code}): {resp.text}")

paypal_service = PayPalService()
