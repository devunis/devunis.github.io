---
title: "개발자가 알아두면 좋은 AWS 대표 서비스: 서버부터 데이터·AI·운영까지"
date: 2026-11-13 00:01:00 +0900
categories: [Backend, Cloud]
tags: [AWS, EC2, S3, RDS, ECS, Lambda, CloudWatch, Bedrock]
---

AWS에는 서비스가 많습니다. 이름을 모두 외우기보다 **서버를 실행하고, 데이터를 저장하고, 요청을 연결하고, 안전하게 운영하는 역할**로 나누면 이해하기 쉽습니다.

이 글은 2026년 11월 13일 확인한 AWS 공식 문서를 바탕으로, 웹·백엔드·AI 개발자가 먼저 알아두면 좋은 서비스를 정리합니다. 모든 서비스를 사용하는 것이 목표는 아닙니다. 필요한 기능과 운영 부담에 맞춰 조합하는 것이 중요합니다.

## 먼저 보는 AWS 서비스 지도

| 필요한 것 | 대표 서비스 |
| --- | --- |
| 프로그램 실행 | EC2, Lambda |
| 컨테이너 실행·관리 | ECR, ECS, EKS, Fargate |
| 파일·디스크 저장 | S3, EBS, EFS |
| 데이터베이스·캐시 | RDS, Aurora, DynamoDB, ElastiCache |
| 네트워크·트래픽 연결 | VPC, ELB, Route 53, CloudFront, API Gateway |
| 권한·인증서·비밀 관리 | IAM, ACM, KMS, Secrets Manager |
| 비동기 작업·이벤트 | SQS, SNS, EventBridge, Step Functions |
| 로그·감사·비용 관리 | CloudWatch, CloudTrail, AWS Budgets |
| 데이터 분석 | Athena, Glue, Redshift |
| 생성형 AI·머신러닝 | Bedrock, SageMaker AI |

## 1. 실행 환경: EC2와 Lambda

**EC2는 가상 서버를 빌려 쓰는 서비스**입니다. 운영체제, 실행 환경, 애플리케이션 구성을 직접 제어할 수 있습니다. 그만큼 패치, 자원 용량, 장애 대응 등 관리할 부분도 생깁니다. EC2 Auto Scaling을 함께 사용하면 정책에 따라 인스턴스 수를 조절할 수 있습니다.

**Lambda는 이벤트에 반응해 코드를 실행하는 서비스**입니다. 파일 업로드 후 처리, 예약 작업, API 처리 등에 활용합니다. 서버 용량 관리를 AWS에 맡기지만 실행 시간·메모리·동시 실행 등의 제한과 애플리케이션 설계는 여전히 고려해야 합니다. 서버리스는 서버가 사라진다는 뜻이 아닙니다. [AWS 컴퓨팅 서비스](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/compute-services.html)

| 선택 관점 | EC2 | Lambda |
| --- | --- | --- |
| 실행 단위 | 가상 서버에서 프로세스 실행 | 이벤트에 따른 함수 실행 |
| 제어 범위 | 운영체제·런타임을 폭넓게 제어 | 제공되는 실행 환경과 설정 활용 |
| 먼저 떠올릴 사례 | 기존 서버 애플리케이션, 지속 실행 작업 | 이벤트 처리, 짧은 독립 작업 |

어느 쪽이 항상 저렴하거나 빠른 것은 아닙니다. 트래픽 패턴, 실행 시간, 필요한 자원과 운영 비용을 함께 봐야 합니다.

## 2. 컨테이너: ECR·ECS·EKS·Fargate는 역할이 다르다

Docker로 패키징했다면 다음 네 가지 이름을 구분하는 것이 좋습니다.

| 서비스 | 역할 | 쉽게 이해하면 |
| --- | --- | --- |
| ECR | 컨테이너 이미지 저장소 | 만들어 놓은 이미지를 보관하는 곳 |
| ECS | AWS의 관리형 컨테이너 오케스트레이션 | 컨테이너 배치·실행·서비스 유지 관리 |
| EKS | 관리형 Kubernetes 서비스 | Kubernetes 기반 운영 환경 |
| Fargate | 서버 관리 부담을 줄이는 컨테이너 컴퓨팅 | 컨테이너를 실행할 자원 제공 |

**ECS와 EKS는 실행을 관리하는 체계이고, Fargate는 실행 자원을 제공하는 방식**입니다. 예를 들어 ECS에서 Fargate를 사용하거나 EC2 기반 용량을 사용할 수 있습니다. EKS에서도 지원되는 워크로드에 Fargate를 사용할 수 있지만, 모든 Kubernetes 기능을 동일하게 사용할 수 있다고 가정하면 안 됩니다. [AWS 컨테이너·컴퓨팅 비교](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/compute-services.html), [ECS 개요](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html)

<figure class="article-diagram">
<figcaption>컨테이너 배포 흐름의 한 예</figcaption>
<ol><li>코드로 컨테이너 이미지 빌드</li><li>ECR에 이미지 저장</li><li>ECS 서비스에서 이미지와 실행 설정 지정</li><li>Fargate 자원에서 컨테이너 실행</li></ol>
</figure>

Kubernetes 운영이 필요한 이유가 없다면 EKS부터 선택할 필요는 없습니다. 팀의 경험과 필요한 기능에 맞춰 실행 방식을 고르면 됩니다.

## 3. 저장소: S3·EBS·EFS

| 서비스 | 저장 방식 | 대표 용도 |
| --- | --- | --- |
| S3 | 버킷과 객체 키를 사용하는 객체 스토리지 | 이미지, 첨부 파일, 백업, 데이터 레이크 |
| EBS | EC2에 연결하는 블록 스토리지 | 서버의 디스크 볼륨 |
| EFS | 여러 클라이언트에서 접근하는 관리형 파일 시스템 | 공유 파일이 필요한 애플리케이션 |

S3를 서버의 일반 디스크와 같은 방식으로 생각하면 혼동하기 쉽습니다. 객체를 API로 읽고 쓰는 모델이 기본이며, 파일 시스템의 모든 동작을 그대로 제공하는 것은 아닙니다. EBS는 디스크, EFS는 공유 파일 시스템이라는 차이에서 출발하면 됩니다. [AWS 스토리지 서비스](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/storage-services.html)

## 4. 데이터베이스: RDS·Aurora·DynamoDB·ElastiCache

| 서비스 | 특징 | 먼저 검토할 상황 |
| --- | --- | --- |
| RDS | 관계형 데이터베이스의 설치·백업·패치 등 운영 지원 | PostgreSQL·MySQL 등으로 서비스 데이터 관리 |
| Aurora | RDS에서 제공하는 MySQL·PostgreSQL 호환 관계형 엔진 | Aurora의 가용성·확장 구조가 필요한 경우 |
| DynamoDB | 키-값·문서 모델을 제공하는 관리형 NoSQL | 접근 패턴과 키 설계가 명확한 워크로드 |
| ElastiCache | 관리형 인메모리 캐시 서비스 | 반복 조회 결과, 세션 등 빠른 접근이 필요한 데이터 |

Aurora는 RDS와 완전히 별개의 분류라기보다 **RDS가 관리하는 데이터베이스 엔진 중 하나**로 이해하면 좋습니다. 호환된다는 표현도 모든 기능·확장·운영 특성이 동일하다는 의미는 아닙니다.

DynamoDB는 관계형 DB를 그대로 대체하는 선택지가 아닙니다. 어떤 키로 무엇을 조회할지 먼저 설계해야 합니다. 캐시는 원본 데이터와의 일관성, 만료, 장애 시 동작까지 함께 설계해야 합니다. [AWS 데이터베이스 서비스](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/database.html)

## 5. 네트워크: VPC·로드 밸런서·DNS·CDN

| 서비스 | 하는 일 |
| --- | --- |
| VPC | AWS 자원을 배치하는 논리적으로 격리된 네트워크 구성 |
| ELB | 여러 대상에 트래픽을 분산하는 로드 밸런싱 서비스군 |
| ALB | ELB 중 HTTP·HTTPS 애플리케이션 트래픽을 다루는 로드 밸런서 |
| Route 53 | DNS를 통해 도메인 이름을 서비스 엔드포인트에 연결 |
| CloudFront | 엣지 위치를 활용한 콘텐츠 전송·캐싱 |
| API Gateway | API의 진입점과 요청 처리 정책 관리 |

Route 53은 모든 웹 요청을 대신 전달하는 프록시가 아닙니다. 브라우저가 도메인의 주소를 찾는 DNS 단계와 실제 HTTP 요청이 전달되는 경로를 구분해야 합니다. API Gateway와 ALB도 항상 함께 설치해야 하는 구성은 아닙니다. API 유형과 연결 대상에 맞춰 선택합니다. [AWS 네트워킹 서비스](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/networking-services.html)

## 6. 보안: IAM·ACM·KMS·Secrets Manager

| 서비스 | 관리 대상 |
| --- | --- |
| IAM | AWS 리소스에 접근하는 사용자·역할·정책 |
| ACM | 지원 서비스에 사용하는 TLS 인증서 |
| KMS | 암호화 키와 키 사용 권한 |
| Secrets Manager | DB 비밀번호·API 키 같은 비밀 값 |
| WAF | 웹 요청을 검사·필터링하는 규칙 |
| Cognito | 애플리케이션 사용자 인증 등을 위한 기능 |

IAM은 AWS 리소스 접근 권한을 다룹니다. 서비스 이용자의 회원가입·로그인과는 구분해야 합니다. 애플리케이션이 S3에 접근할 때는 장기 액세스 키를 코드에 넣기보다 실행 환경에 맞는 IAM 역할과 임시 자격 증명을 검토하는 것이 좋습니다.

보안 그룹은 네트워크 트래픽을 제어하고, IAM 정책은 AWS 작업 권한을 제어합니다. 둘은 서로 다른 문제를 해결합니다. [AWS 보안·자격 증명 서비스](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/security-services.html)

## 7. 비동기 처리: SQS·SNS·EventBridge·Step Functions

| 서비스 | 핵심 역할 | 예시 |
| --- | --- | --- |
| SQS | 작업을 큐에 보관하고 소비자가 가져가서 처리 | 이미지 변환 작업 대기열 |
| SNS | 메시지를 여러 구독 대상으로 전달 | 하나의 알림을 여러 시스템에 전파 |
| EventBridge | 이벤트 규칙에 따라 대상을 연결 | 주문 이벤트를 조건에 맞는 처리기로 전달 |
| Step Functions | 여러 처리 단계를 상태와 흐름으로 조정 | 검증 → 처리 → 결과 저장 워크플로 |

메일 발송이나 문서 분석을 사용자 요청 안에서 모두 끝내기 어려울 때, 큐에 작업을 넣고 별도 워커가 처리하도록 분리할 수 있습니다. 다만 큐를 도입한다고 중복 처리와 실패 복구가 자동으로 해결되는 것은 아닙니다. 사용하는 서비스의 전달 보장과 재시도 정책을 확인하고, 작업을 안전하게 다시 실행할 수 있도록 설계해야 합니다. [AWS 애플리케이션 통합 서비스](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/application-integration.html)

## 8. 운영: CloudWatch와 CloudTrail, 그리고 비용

**CloudWatch는 시스템 상태를 관찰하는 도구**입니다. 지표·로그·알람을 통해 오류와 자원 사용량을 확인합니다. 애플리케이션 로그나 사용자 정의 지표는 필요한 수집 설정을 해야 합니다. [CloudWatch 개요](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html)

**CloudTrail은 AWS 계정에서 수행한 활동을 추적하는 도구**입니다. 누가 어떤 AWS API 작업을 했는지 조사할 때 사용합니다. 모든 애플리케이션 요청이 자동으로 기록된다고 가정하면 안 되며, 필요한 이벤트 범위와 기록 설정을 확인해야 합니다. [CloudTrail 개요](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html)

AWS Budgets는 비용·사용량의 예산과 알림을 설정하는 데 활용합니다. **예산 알림은 실시간 과금 차단 장치가 아닙니다.** 알림과 비용 데이터 반영에는 시간이 걸릴 수 있습니다. [AWS Budgets 안내](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html)

서비스별 요금 외에도 데이터 전송, 로그 저장, NAT Gateway 같은 주변 비용을 확인해야 합니다. 무료 사용 조건과 요금은 계정·리전·시점에 따라 공식 안내를 확인하는 것이 안전합니다.

## 9. 데이터 분석과 AI

| 분야 | 서비스 | 역할 |
| --- | --- | --- |
| 데이터 조회 | Athena | S3 등의 데이터를 SQL로 분석 |
| 데이터 통합 | Glue | 데이터 카탈로그·변환·통합 작업 |
| 데이터 웨어하우스 | Redshift | 분석 목적의 데이터 웨어하우스 |
| 생성형 AI | Bedrock | 기반 모델을 활용하는 관리형 생성형 AI 기능 |
| 머신러닝 | SageMaker AI | 모델 개발·학습·배포를 위한 관리형 도구 |

서비스용 DB에서 주문을 저장하는 작업과, 대량의 주문 이력을 분석하는 작업은 요구 사항이 다릅니다. 분석 서비스는 이 차이에서 출발하면 이해하기 쉽습니다. [AWS 분석 서비스](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/analytics.html)

Bedrock은 제공되는 기반 모델을 활용하는 애플리케이션에서, SageMaker AI는 직접 모델을 개발·학습·배포하는 과정에서 먼저 검토할 수 있습니다. 실제 기능은 겹치는 부분도 있으므로 이 구분을 절대적인 경계로 볼 필요는 없습니다. 모델·기능의 리전 지원과 비용도 확인해야 합니다. [AWS AI·머신러닝 서비스](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/machine-learning.html)

## 서비스가 연결되는 모습

컨테이너 기반 웹 서비스를 가정한 학습용 예시입니다. 실제 운영 환경을 재현한 구성은 아닙니다.

<figure class="article-diagram">
<figcaption>웹 API 요청 경로의 예: 도메인 조회 후 HTTPS 요청</figcaption>
<ol><li>브라우저가 Route 53 DNS를 통해 서비스 주소 확인</li><li>브라우저가 ALB에 HTTPS 요청</li><li>ALB가 ECS 서비스의 Fargate 태스크로 요청 전달</li><li>애플리케이션이 RDS에서 데이터를 조회하고 응답</li></ol>
</figure>

이 구성에서 이미지는 ECR에 보관하고, 업로드 파일은 S3에 저장할 수 있습니다. IAM 역할로 접근 권한을 부여하고, Secrets Manager로 비밀 값을 관리하며, CloudWatch로 로그와 지표를 관찰합니다. 정적 파일 전달이 필요하면 CloudFront를 추가하고, 오래 걸리는 작업은 SQS와 별도 워커로 분리할 수 있습니다.

VPC·서브넷·라우팅·보안 그룹은 이 연결이 실제로 가능하도록 구성해야 합니다. 위 흐름도만으로 운영 환경의 가용성이나 보안이 보장되지는 않습니다.

## 어떤 순서로 익히면 좋을까?

1. **EC2·VPC·IAM**: 서버가 어디에서 실행되고 누가 접근하는지 이해합니다.
2. **S3·RDS·ALB·ACM**: 파일과 DB를 연결하고 HTTPS로 서비스를 제공합니다.
3. **CloudWatch·CloudTrail·Budgets**: 오류·변경 이력·비용을 확인합니다.
4. **ECR·ECS·Fargate**: 컨테이너 배포가 필요할 때 확장합니다.
5. **Lambda·SQS·EventBridge**: 이벤트와 비동기 작업을 분리합니다.
6. **분석·AI 서비스**: 실제 데이터 처리·모델 활용 요구에 맞춰 선택합니다.

처음부터 모든 서비스를 붙일 필요는 없습니다. 작은 서비스 하나를 배포하면서 실행 환경, 네트워크, 권한, 데이터, 관찰 가능성의 관계를 이해하는 것이 먼저입니다.

### 함께 읽기

- [AWS EC2에 Docker로 배포하기]({% post_url 2026-01-04-aws-ec2-docker-deploy %})
- [멱등성과 재시도]({% post_url 2026-10-20-idempotency-retries %})
