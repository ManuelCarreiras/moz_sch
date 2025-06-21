#!/bin/bash
curl -X POST http://localhost:5000/users \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "testuser@example.com", "password": "testpass"}' 