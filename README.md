lsof -iTCP:8079 -sTCP:LISTEN
curl -sS -o /dev/null -w 'http=%{http_code} connect=%{http_connect}\n' --noproxy '' \
  -x http://127.0.0.1:8079 https://evtstreamspltfrm-akhq.pf.dev.echonet:8443/ui/login
