#!/bin/bash
# Usage: ./get_user.sh <JWT_TOKEN>
TOKEN=$1
curl http://localhost:5000/users \
  -H "Authorization: Bearer $TOKEN" 