
echo 'export DEVOPS_SPACE_ID=4401' >> ~/.zshrc && source ~/.zshrc
curl -sI "$ARTIFACTORY_URL/maven.org/" | head -1

cd <chemin>/walle-backend-dispatcher
find ~/.m2/repository -name "*.lastUpdated" -delete
find ~/.m2/repository -name "_remote.repositories" -delete
mvn -s ../walle-backend-access/pipeline/settings.xml -U clean install


open -a "IntelliJ IDEA"






for v in ARTIFACTORY_URL ARTIFACTORY_API_URL ARTIFACTORY_USER ARTIFACTORY_PASSWORD DEVOPS_SPACE_ID; do
  printf '%s=%s\n' "$v" "$( [ -n "${(P)v}" ] && echo OK || echo MANQUANTE )"
done


curl -x http://127.0.0.1:8079 -sI https://nexus-devops.pf.echonet/repository/maven-private/ | head -1


nslookup nexus-devops.pf.echonet
curl -sI https://nexus-devops.pf.echonet/repository/maven-private/ | head -1



find ~/.m2/repository/com/bnpp/pf -name "*.lastUpdated" -delete
find ~/.m2/repository/com/bnpp/pf -name "_remote.repositories" -delete

env | grep -i -E 'proxy|maven_opts|java_tool'
cat .mvn/maven.config .mvn/jvm.config 2>/dev/null
