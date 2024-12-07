#!/bin/sh
echo "export const environment = { production: true, apiUrl: '${API_URL}' };" > /app/src/environments/environment.ts
exec "$@"


