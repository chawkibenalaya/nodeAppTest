nslookup nexus-devops.pf.echonet
curl -sI https://nexus-devops.pf.echonet/repository/maven-private/ | head -1



find ~/.m2/repository/com/bnpp/pf -name "*.lastUpdated" -delete
find ~/.m2/repository/com/bnpp/pf -name "_remote.repositories" -delete

env | grep -i -E 'proxy|maven_opts|java_tool'
cat .mvn/maven.config .mvn/jvm.config 2>/dev/null
