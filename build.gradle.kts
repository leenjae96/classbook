import org.apache.tools.ant.taskdefs.condition.Os

plugins {
    java
    id("org.springframework.boot") version "3.4.1"
    id("io.spring.dependency-management") version "1.1.7"
}

group = "com.leenjae"
version = "1.0-SNAPSHOT"
description = "classbook-new"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

configurations {
    compileOnly {
        extendsFrom(configurations.annotationProcessor.get())
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter")
    // 1. 웹 서버 기능 (Tomcat, MVC)
    implementation("org.springframework.boot:spring-boot-starter-web")
    // 2. DB 접근 기술 (JPA)
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    // 3. DB 드라이버 (MariaDB)
    runtimeOnly("org.mariadb.jdbc:mariadb-java-client")
    // 4. 편의 도구 (Getter, Setter, Constructor 자동생성)
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")

    testImplementation(platform("org.junit:junit-bom:5.10.0"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.test {
    useJUnitPlatform()
}

// 1. 리액트 프로젝트 경로 변수 지정 (본인 폴더명에 맞게 수정!)
// 예: 현재 프로젝트 루트 바로 아래 'frontend'라는 폴더에 리액트가 있다면
val frontendDir = "$projectDir/classbook-front"

// 2. 리액트 빌드 명령어 실행 (OS에 따라 npm vs npm.cmd 구분)
tasks.register<Exec>("buildReact") {
    group = "frontend"
    description = "Build the React application"

    // 리액트 폴더에서 명령어를 실행하겠다
    workingDir(file(frontendDir))

    // 윈도우인지 맥/리눅스인지 확인해서 명령어 결정
    if (Os.isFamily(Os.FAMILY_WINDOWS)) {
        commandLine("npm.cmd", "run", "build")
    } else {
        commandLine("npm", "run", "build")
    }
}

// 3. 빌드된 결과물을 Spring Boot의 static 폴더로 복사
tasks.register<Copy>("copyReactBuildFiles") {
    group = "frontend"
    description = "Copy React build files to Spring Boot static resources"

    // buildReact 작업이 먼저 끝나야 함
    dependsOn("buildReact")

    // 리액트 빌드 결과물 경로 (보통 build 또는 dist)
    from("$frontendDir/dist")
    // 복사할 목적지 (Spring Boot 정적 리소스 경로)
    into("$projectDir/src/main/resources/static")
}
// 4. Spring Boot가 resources를 처리할 때(processResources) 위 작업을 먼저 실행하도록 낚아챔
tasks.named("processResources") {
    dependsOn("copyReactBuildFiles")
}
