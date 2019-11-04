# sorta-cart-server

### devel

project setup:

`npm i -S body-parser express jsonwebtoken passport passport-jwt sequelize pg pg-hstore dotenv`

sequelize setup:

`npx sequelize-cli model:generate --name User --attributes name:string,email:string`

`npx sequelize-cli model:generate --name Product --attributes unf:string,upc_code:string,category:string,name:string,description:string,pk:number,size:string,unit_type:string,ws_price:number,u_price:number,codes:string`

run migrations:

`npx sequelize-cli db:migrate`

`npx sequelize-cli db:migrate:undo:all`

seeds:

`npx sequelize-cli seed:generate --name init-products`

`npx sequelize-cli db:seed:all`
