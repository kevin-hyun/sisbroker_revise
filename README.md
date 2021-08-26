# sisbroker_revise
아이비즈 인턴 생활에서 작성한 코드를 기업비즈니스 로직을 제외한 부분만 정리


## ✅ Short Description
학사시스템과 Blackboard사이 데이터 관리 미들웨어

## ✅ Long Description

sisbroker는 대학교 학사시스템과 파트너사인 Blackboard사이에서 교직원들이 데이터 관리를 쉽게 할 수 있도록 하는 미들웨어입니다. 
기존 데이터 관리에 있어서 교직원이 사용하기에는 제약이 많고 데이터 추적에도 문제가 있어 조금 더 직관적으로 컨트롤 할 수 있도록 하는 것이 목적입니다. 
`Schedule`에 맞춰서 학사정보시스템의 해당하는 정보를 파트너사에 보내는 `Job`을 `생성하고 변경`할 수 있는 기능이 포함되어 있습니다. 
추가로 학사데이터와 파트너사의 `데이터의 차이`를 `추적`하여 `데이터 라벨링`을 하는 기능이 있습니다.
그중에서 기업의 비즈니스 로직이 제외된 기능 중심의 코드를 정리한 프로젝트입니다.


## ✅ installation

OS : `Mac OS Big Sur version 11.4`

`git clone https://github.com/kevin-hyun/sisbroker_revise.git`

해당 디렉토리로 이동한 후 

`npm install —save`

### 설치 `npm library`

```
"cors": "^2.8.5"  
"express": "^4.17.1", 
"jwt-decode": "^3.1.2",
"mariadb": "^2.5.4",
"nodemon": "^2.0.12",
"winston": "^3.3.3",
"winston-daily-rotate-file": "^4.5.5"
```
추가 설명 
`jwt-decode` : jwt로 전달된 토큰 정보 decrypt를 위해 사용

`mariadb` : ORM을 사용하지 않고 raw query를 사용해서 mariadb와 연결하고 소통하기 위해 사용

`winston` : 서버 활동 (api 호출, sql query)에 대한 log와 error를 기록 위해 사용

`winston-daily-rotatee-file` : 한달 단위로 로그를 파일로 관리하기 위해 사용


## ✅ 구현기능

`user`
- 회원가입- 교직원 정보 등록
- 로그인 - jwt 토큰 생성
- 학사시스템 DB연결 - 학사시스템에서 데이터를 가져오기 위해 oracle과 연결

`config`
- jwt decrypt
- Schedule Job API
  - Create Job
  - Read Job
  - Update Job
  - Delete Job
  - Job on/off toggle 

`data`
- v1(old data) - v2(new data) 비교
- 삭제 & 추가된 부분에 대한 labeling



## ✅ 담당기능

프로젝트 전체 구조를 express architecture에 맞춰서 구현했습니다. 

`config`
- jwt decrypt
- Schedule Job API
  - Create Job
  - Read Job
  - Update Job
  - Delete Job
  - Job on/off toggle 

 
 express middleware 개념 활용
 
## ✅  리팩토링
`기업비즈니스 로직 제외한 코드`
- 1차적으로 비즈니스 로직을 제외했지만 추가적으로 반영이 필요한 부분에 대해서 제외

 
## ✅ stack
- <img alt="Javascript" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>  : v1.7
- <img alt="NodeJS" src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white"/>  : v14.17.3
- <img alt="ExpressJS" src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge"/> : v4.17.1


