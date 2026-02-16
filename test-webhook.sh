#!/bin/bash
curl -X POST https://getreadytopost.netlify.app/api/square-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_id": "F9395CHZ6135H",
    "type": "payment.updated",
    "event_id": "test-event-123",
    "created_at": "2026-02-16T18:00:00.000Z",
    "data": {
      "type": "payment",
      "id": "TEST_PAYMENT_ID",
      "object": {
        "payment": {
          "id": "TEST_PAYMENT_ID",
          "status": "COMPLETED",
          "amount_money": {
            "amount": 1999,
            "currency": "USD"
          },
          "buyer_email_address": "idxrealty@gmail.com"
        }
      }
    }
  }'
