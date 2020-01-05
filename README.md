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

### DATABASE (PostgreSQL)

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

### MISC

getting started:

`npm i -S body-parser express jsonwebtoken passport passport-jwt sequelize pg pg-hstore dotenv multer -D sequelize-cli`

#### sequelize setup

generate some models:  
`npx sequelize-cli model:generate --name User --attributes name:string,email:string`

`npx sequelize-cli model:generate --name Product --attributes unf:string,upc_code:string,category:string,name:string,description:string,pk:number,size:string,unit_type:string,ws_price:number,u_price:number,codes:string`

`npx sequelize-cli model:generate --name Order --attributes status:string,payment_status:string,shipment_status:string,total:number,name:string,email:string,phone:string,address:string,notes:string,history:jsonb`

`npx sequelize-cli model:generate --name OrderLineItem --attributes OrderId:number,data:jsonb`

`npx sequelize-cli model:generate --name WholesaleOrder --attributes data:jsonb`

`npx sequelize-cli model:generate --name Page --attributes href:string,content:text`

`npx sequelize-cli model:generate --name Member --attributes name:string,phone:string,address:string,discount:number,fees_paid:number,store_credit:number,shares:number,member_type:string`

### coreos notes

#### CORE OS DOCKER SERVICE

this will restart docker containers if the coreos instance restarts (like, for upgradez)

```sh
sudo systemctl enable docker.service
sudo systemctl start docker.service
```

#### swap

very useful for micro instances w/o much RAM

https://coreos.com/os/docs/latest/adding-swap.html

**as root:**

```sh
mkdir -p /var/vm
fallocate -l 1024m /var/vm/swapfile1
chmod 600 /var/vm/swapfile1
mkswap /var/vm/swapfile1
```

vi /etc/systemd/system/var-vm-swapfile1.swap

```
[Unit]
Description=Turn on swap

[Swap]
What=/var/vm/swapfile1

[Install]
WantedBy=multi-user.target
```

```sh
systemctl enable --now var-vm-swapfile1.swap
```

**Optionally**

```sh
echo 'vm.swappiness=10' | sudo tee /etc/sysctl.d/80-swappiness.conf
systemctl restart systemd-sysctl
```

see:

```
$ swapon
NAME              TYPE       SIZE USED PRIO
/var/vm/swapfile1 file      1024M   0B   -1
```
