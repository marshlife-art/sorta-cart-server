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

### MISC

#### sequelize CLI

generate some models:  
`npx sequelize-cli model:generate --name User --attributes name:string,email:string`

`npx sequelize-cli model:generate --name Product --attributes unf:string,upc_code:string,category:string,name:string,description:string,pk:number,size:string,unit_type:string,ws_price:number,u_price:number,codes:string`

`npx sequelize-cli model:generate --name Order --attributes status:string,payment_status:string,shipment_status:string,total:number,name:string,email:string,phone:string,address:string,notes:string,history:jsonb`

`npx sequelize-cli model:generate --name OrderLineItem --attributes OrderId:number,data:jsonb`

`npx sequelize-cli model:generate --name WholesaleOrder --attributes data:jsonb`

`npx sequelize-cli model:generate --name Page --attributes href:string,content:text`

`npx sequelize-cli model:generate --name Member --attributes name:string,phone:string,address:string,discount:number,fees_paid:number,store_credit:number,shares:number,member_type:string`
