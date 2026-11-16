ls -la /vault/secrets/storage.yml
awk -F'"' '/access-key-id/{print "longueur =", length($2)}' /vault/secrets/storage.yml
tr '\0' '\n' < /proc/1/environ | grep COMMON_STORAGE | cut -c1-30
