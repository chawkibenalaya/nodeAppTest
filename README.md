openssl s_client -connect api-dvt.staging.bnpparibas-pf.com:443 \
  -servername api-dvt.staging.bnpparibas-pf.com </dev/null 2>/dev/null \
  | openssl x509 -noout -text \
  | grep -A3 -E 'Subject Public Key Info|Subject Alternative Name'


kubectl -n ns-redis exec redis-master-0 -- redis-cli INFO server | grep redis_version
