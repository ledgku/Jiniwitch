# Jiniwitch
> IoT Switch Server (Node.js, Arduino)

&nbsp;

## Development Stack
> 개발 언어 및 스택 소개

- Language : Javascript, [Node.js](https://nodejs.org/)
- Framework : [Express](http://expressjs.com/)
- Database : [MariaDB](https://mariadb.org/), [Redis](http://www.redis.io/)
- Module : asnyc, crypto, request, winston

&nbsp;

## REST API
> REST API Definition

| Feature |	Method	| Request URL | Todo Status |
| :------------ |	:-------:	| :-----------------| :--------: |
| 회원가입 |	POST	| /jini/user/join | complete |
| 로그인 |	POST	| /jini/user/login | complete |
| 로그아웃 |	POST	| /jini/user/logout | complete |
| 그룹리스트 |	GET	| /jini/group | complete |
| 그룹추가 |	POST	| /jini/group | complete |
| 그룹삭제 |	DELETE	| /jini/group | complete |
| 스위치리스트 |	POST	| /jini/hw/list | complete |
| 스위치정보 |	POST	| /jini/hw/info | complete |
| 스위치켜기 |	POST	| /jini/hw/on | complete |
| 스위치끄기 |	POST	| /jini/hw/off | complete |
| 기록보기 |	GET	| /jini/history | complete |
