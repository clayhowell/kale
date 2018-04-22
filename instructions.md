
Head over to
`[https://www.kucoin.com/](https://www.kucoin.com/)`
  
Create an account there and get an api key/secret setup for your account
 

If you have mongodb installed just skip this

[https://docs.mongodb.com/manual/installation/](https://docs.mongodb.com/manual/installation/)

  

You must set the host path in in /etc/host

Like so

`sudo vim /etc/hosts`

  Then append the file
```
127.0.0.1 mongo mongo
```
And save 
`:wq`

  
next clone kale (which is slightly modified tribeca)
`git clone https://github.com/clayhowell/kale.git`

`cd kale`
  

Open project in your editor

Create `tribeca.json` in where sample.-dev-tribeca.json is (root) and paste the following

Paste in your kucoin api key and secret key that you registered
```
{
"TRIBECA_MODE": "dev",
"EXCHANGE": "kucoin",
"TradedPair": "ETH/BTC”,
"MongoDbUrl": "mongodb://mongo:27017/tribeca",
"WebClientUsername": "NULL",
"WebClientPassword": "NULL",
"WebClientListenPort": "3000",
"ShowAllOrders": "true",

"KucoinHttpUrl": "[https://api.kucoin.com](https://api.kucoin.com)/v1",
"KucoinKey": "<YOUR_API_KEY>",
"KucoinSecret": "<YOUR_SECRET_KEY>",
"KucoinOrderDestination": "Kucoin"
}
```
   

then:
`npm install`
`npm start`
