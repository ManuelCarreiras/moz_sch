#!/bin/bash
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass"}' 