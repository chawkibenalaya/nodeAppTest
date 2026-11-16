tr '\0' '\n' < /proc/1/environ | grep COMMON_STORAGE_ACCESS_KEY | cut -c1-45
