# Tomcat 기반 이미지 사용 (JDK 17)
FROM tomcat:9.0-jdk17

# 기존 webapps 폴더 제거 (기본 앱들 제거)
RUN rm -rf /usr/local/tomcat/webapps/*

# .war 파일을 컨테이너로 복사하고 이름을 ROOT.war로 바꿔서 기본 루트로 실행되게 함
COPY target/sas-1.0-SNAPSHOT.war /usr/local/tomcat/webapps/ROOT.war

# Tomcat 기본 포트
EXPOSE 8080
