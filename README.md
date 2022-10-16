# sorta-cart-server

shout-outz:

- [Express](https://expressjs.com/)
- [passport-jwt](http://www.passportjs.org/packages/passport-jwt/)
- [Sequelize](https://sequelize.org/)

## ENV variables

use a `.env` file like such:

```sh
NODE_ENV=development
PORT=8080
JWT_SECRET=
PG_DATABASE_NAME=
PG_DATABASE_USER=
PG_DATABASE_PASSWORD=
PG_DATABASE_HOST=
PG_CA_CERT=
MAILGUN_API_KEY=
```

## devel setup

### scripts

build and run the app:

`npm start`

run tests:

`npm test`

run test and write coverage.txt

`npm run test:coverage`

create an admin user from the command line:

`npm run create:admin -- hello@marshcoop.org zomgzomg`

### DATABASE

#### run migrations

`npm run db:migrate`

`npm run db:migrate:undo:all`

#### seeds

`npx sequelize-cli seed:generate --name init-products`

`npm run db:seed:all`

undo all seeds:
`npx sequelize-cli db:seed:undo:all`

undo specific seed:
`npx sequelize-cli db:seed:undo --seed name-of-seed-as-in-data`

##### all-in-one reset

`npm run db:migrate:undo:all && npm run db:migrate && npm run db:seed:all`

### docker notes

see [3dwardsharp/sorta-cart-server](https://hub.docker.com/r/3dwardsharp/sorta-cart-server) on dockerhub.

```
docker build -t 3dwardsharp/sorta-cart-server .
docker run -p 3000:3000 --env-file=.env 3dwardsharp/sorta-cart-server
```

_note:_ use whatever tag makes sense (i.e. something other than `3dwardsharp/sorta-cart-server`)

#### PostgreSQL (pg) database

##### local docker pg

backup (to .sql file):

```
docker exec -t sorta-cart-server_pg_1 pg_dumpall -c -U marsh > dump_`date +%d-%m-%Y"_"%H_%M_%S`.sql
```

restore (from .sql file):

```
cat the_dump_file.sql | docker exec -i sorta-cart-server_pg_1 psql -U postgres
```

##### digitalocean hosted pg database (using pg connection pool):

```
psql -U $PG_DATABASE_USER -h $PG_DATABASE_HOST -p $PG_DATABASE_PORT -d $PG_DATABASE_NAME --set=sslmode=require < dump_30-01-2020_03_49_48.sql
```

### kubernetes (digialocean hosted)

##### SETUP

```
doctl auth init --context marsh
doctl auth switch --context marsh

doctl kubernetes cluster kubeconfig save marsh-netez
```

##### ENV VARZ

```
kubectl set env deployment/sorta-cart-server --list

kubectl set env deployment/sorta-cart-server SOME_ENV_VAR=some_value
```

##### LOGS

```
kubectl get pods
kubectl logs sorta-cart-server-564b889d88-7dvmx
```

##### UPDATE

```
kubectl set image deployments/sorta-cart-server sorta-cart-server=3dwardsharp/sorta-cart-server:0.0.9
```

##### SSL CERTZ

`doctl compute certificate list`

get `ID` value for `api.marshcoop.org`

okay get service yaml
`kubectl get service sorta-cart-server -o yaml`

copy/paste it into (new) file named: `sorta-cart-server-svc.yaml`

diff before apply
`kubectl diff -f ./sorta-cart-server-svc.yaml`
all good? then do it
`kubectl apply -f ./sorta-cart-server-svc.yaml`

### MISC

#### localhost https proxy

initial setup:

```sh
brew install mkcert

mkcert -install

mkdir .cert

mkcert -key-file ./.cert/key.pem -cert-file ./.cert/cert.pem "*.marsh.dev" localhost 127.0.0.1 ::1
```

start a server on localhost:3000, localhost:3001, localhost:3002 then run:

```sh
npm run dev:https
```

#### sequelize CLI

generate some models:  
`npx sequelize-cli model:generate --name User --attributes name:string,email:string`

`npx sequelize-cli model:generate --name Product --attributes unf:string,upc_code:string,category:string,name:string,description:string,pk:number,size:string,unit_type:string,ws_price:number,u_price:number,codes:string`

`npx sequelize-cli model:generate --name Order --attributes status:string,payment_status:string,shipment_status:string,total:number,name:string,email:string,phone:string,address:string,notes:string,history:jsonb`

`npx sequelize-cli model:generate --name OrderLineItem --attributes OrderId:number,data:jsonb`

`npx sequelize-cli model:generate --name WholesaleOrder --attributes data:jsonb`

`npx sequelize-cli model:generate --name Page --attributes href:string,content:text`

`npx sequelize-cli model:generate --name Member --attributes name:string,phone:string,address:string,discount:number,fees_paid:number,store_credit:number,shares:number,member_type:string`
