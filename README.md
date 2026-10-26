curl -sS -o /dev/null -w 'http=%{http_code} connect=%{http_connect}\n' --noproxy '' -x http://127.0.0.1:8079 https://evtstreamspltfrm-akhq.pf.dev.echonet:8443/ui/login
curl -sS -o /dev/null --max-time 20 -w 'google http=%{http_code} connect=%{http_connect}\n' --noproxy '' -x http://127.0.0.1:8079 https://www.google.com
curl -v --max-time 20 --noproxy '' -x http://127.0.0.1:8079 https://evtstreamspltfrm-akhq.pf.dev.echonet:8443/ui/login -o /dev/null 2>&1 | grep -E '^< HTTP|^\* (CONNECT|Proxy|Connected|Operation|Recv|SSL)'
