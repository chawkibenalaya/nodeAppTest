kubectl -n ns-redis exec redis-master-0 -- redis-cli INFO server | grep redis_version
