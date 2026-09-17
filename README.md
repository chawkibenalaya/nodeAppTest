echo | openssl s_client -connect api-dvt.staging.bnpparibas-pf.com:443 -servername api-dvt.staging.bnpparibas-pf.com 2>/dev/null | openssl x509 -noout -text | grep -A3 "Public Key Info"
echo | openssl s_client -connect api-dvt.staging.bnpparibas-pf.com:443 -servername api-dvt.staging.bnpparibas-pf.com 2>/dev/null | openssl x509 -noout -text | grep -A1 "Alternative Name"
openssl x509 -in ~/Downloads/api-dvt.staging.bnpparibas-pf.com.pem -noout -text | grep -A3 "Public Key Info"
