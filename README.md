find ~/.m2/repository/com/bnpp/pf -name "*.lastUpdated" -delete
find ~/.m2/repository/com/bnpp/pf -name "_remote.repositories" -delete

env | grep -i -E 'proxy|maven_opts|java_tool'
cat .mvn/maven.config .mvn/jvm.config 2>/dev/null
