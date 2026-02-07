Node + fastify + MongoDb 

backend -> node + fastify 
db -> MongoDb
Tools -> postman 


API features 
1. Get all articles 
2. get single article 
3. create article 
4. update article 
5. delete article 


Db design 
id -> object 
title -> string 
content -> string 
tags -> [string]
published -> boolean 
createdAt -> date
UpdatedAt -> date 

why this desing 
tags -> filtering easy 
published -> draft vs live 
timestamps -> sorting by date 


Request flow 
ex --> create article 
Client -> post/article -> route -> controller -> model(Mongodb) -> response 


server.js  main abhi tak kya kiya 

Fastify instance create
        ↓
Route define (/)
        ↓
Server listen on port 3000
        ↓
Client sends request
        ↓
Route handler runs
        ↓
JSON response


Mental model 
schema -> rules
model -> database interaction 
Document -> Actual Blog post 


POST/Blog
Client -> API call -> MongoDb me new blog create 


GET/Blogs 
MongoDb se saare blogs fetch karega -> json return karega 

client -> GET/blogs -> mongodb -> fetch blogs in json 

GET/Blogs/:id -> ye single blog detail page ka backbone hota hai 

client -> GET/blogs/:id -> mongodb -> ek specific blog 


Update blog -> PUT /blogs/:id
logic 
url se id aayegi 
body se new data ayega 
mongodb me update hoga 
updated blog return hoga

Important options explained
{ new: true, runValidators: true }
new: true → updated blog return karega
runValidators: true → schema rules enforce honge


Delete Blog -> DELETE/blogs/:id


![REST API](1_5b9URi8HKSr9A9f-jvmxCQ.png)


Filter and Pagination

lets suppose we have 
5 blogs -> no issue
500 blogs -> thoda slow
50000 blogs -> bahut slow

sab blogs ek sath bhejna -> performance issue
frontend pe filter karna -> worse 

solution -> backend pe filter and pagination

Pagination -> data ko chote chote pages me todna 
page 1 -> blogs 1-10
page 2 -> blogs 11-20
jab upar scroll karte hai to next page load hota hai

pagination without filter 
GET /blogs?page=2&limit=5
page number -> 2
ek page main -> 5 blogs

How pagination happens in backend 
backend has 2 powerfull tools -> skip and limit
skip -> kitne blogs skip karne hai
limit -> kitne blogs return karne hai


what is filtering
filtering -> specific criteria ke basis pe data ko filter karna
example -> published blogs, specific tag ke blogs

example urls 
GET /blogs?published=true -> sirf published blogs
GET /blogs?tags=technology -> sirf technology tag ke blogs

How filtering happens in backend
filtering -> query parameters se criteria milta hai
think filter is empty bag:  -> Filter = {}
agar published=true hai -> Filter = { published: true }
agar tags=technology hai -> Filter = { tags: 'technology' }

mongodb smart hai agar tags field me array hai to wo check karega ki kya 'technology' us array me hai ya nahi


How Pagination and filtering work together
GET /blogs?published=true&page=2&limit=5
filter -> { published: true }
pagination -> page 2, limit 5

Client request
   ↓
Query params read
   ↓
Filter object build
   ↓
Pagination values calculate
   ↓
MongoDB query
   ↓
Response

a full request -> GET /blogs?published=true&tag=node&page=2&limit=3

Backend samajhta hai:

Mujhe:
sirf published blogs chahiye
jisme tag = node ho
page 2 ka data chahiye
3 blogs per page

Adding JWT Authentication 
problem -> any user can create, update, delete blogs without any restriction so no user identity, no authorization, no security

Real app -> user registration and login system hota hai and only author or admin can create, update, delete blogs

thats why we need authentication and authorization

Authentication -> user ki identity verify karna(tum kon ho)
Authorization -> user ke permissions check karna(tum kya kar sakte ho)

JWT -> JSON Web Token   
it is like digital id card for users, it contains user information and is signed by the server to ensure its authenticity

login k baad server ek JWT generate karta hai jisme user ki information hoti hai, ye token client ko bhej diya jata hai, client is token ko apne local storage me store kar leta hai, jab bhi client protected route pe request bhejta hai to wo token ko authorization header me bhejta hai, server is token ko verify karta hai aur agar valid hai to user ko access de deta hai

JWT Flow 
user login -> server generates JWT -> client stores JWT -> client sends JWT in Authorization header for protected routes -> server verifies JWT -> if valid, access granted

User Register / Login
        ↓
Server verifies credentials
        ↓
Server creates JWT token
        ↓
Token client ko milta hai
        ↓
Client stores token (frontend)
        ↓
Client sends token in every request
        ↓
Server verifies token
        ↓
Allow or deny request


Where is token sent 
HTTP header me -> Authorization: Bearer <token>

example 
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....

What is inside the JWT token
JWT token ke andar encrypted data hota hai 
{
    "userId": "12345",
    "username": "john_doe",
    "role": "admin"
}
this does not store password 

Implementation in this project 
1. user schema 
2. registration api 
3. login api
4. jwt generation
5. protected routes
6. roles(admin/user)
7. blog ownership 
8. refresh tokens 


user model + Registration api 
user provide his email + password and registers -> password should be hashed -> store in DB 

bcryptjs -> password hashing ke liye popular library hai
jsonwebtoken -> JWT token generate karne ke liye popular library hai

user model -> humne name, email, password fields li hai 

APi -> POST http://localhost:3000/auth/register
this is given on /auth/register route 

Login API + JWT Token 
register me -> user is saved in DB and password is hashed

login me -> 
1. user email + password bhejega 
2. backend password verify karega 
3. agar correct -> JWT token generate karega
4. token client ko bhej dega 
5. client is token ko future request me bhejega 


JWT ka simple mental model 
JWT = entry pass
login pe milta hai 
har protected route pe dikhana padta hai
valid token -> access milta hai
invalid token/missing token -> access denied

JWT_SECRET -> ye ek secret key hai jo server use karta hai JWT token ko sign karne ke liye, isse kisi ke sath share nahi karna chahiye, agar koi is secret key ko pata chal jata hai to wo fake tokens generate kar sakta hai aur unauthorized access le sakta hai, isliye isse environment variable me store karna chahiye aur code me hardcode nahi karna chahiye.

JWT_EXPIRES_IN -> ye ek configuration hai jo JWT token ke expiration time ko define karta hai, iska matlab hai ki token kitne time ke liye valid rahega, iske baad token expire ho jayega aur user ko dobara login karna padega, isse security enhance hoti hai kyunki agar token kisi ke pass chala jata hai to wo token sirf limited time ke liye valid rahega, isliye isse bhi environment variable me store karna chahiye.

login routes -> http://[::1]:3000/auth/login
Token is most important 

imp security rules 
never share password in response 
never share JWT secret to client 
token is shared in Authorization header, never in URL
Authorization: Bearer <token>


Access Token and Refresh Token

problem with JWT -> once token is issued, it is valid until it expires, if token is stolen then attacker can use it until it expires, or the does user have to login again to get new token, this can be inconvenient for users
solution -> Access Token + Refresh Token

Access token -> short lived token (15 minutes to 1 hour), is token ko har request me bhejna hota hai, is token ke andar user information hoti hai, is token ko verify karke server user ki identity confirm karta hai, agar access token expire ho jata hai to user ko access denied milta hai

access token -> short lived entry pass 
Sent in every request of protected route
short expiry (15 min - 1 hour) -> secure
Authorization: Bearer <ACCESS_TOKEN>

what's inside access token 
{
    "userId": "12345",
    "username": "john_doe",
    "role": "admin"
}

Refresh token -> long lived token (7 days to 30 days), is token ko sirf tab bhejna hota hai jab access token expire ho jata hai, is token ke andar bhi user information hoti hai, is token ko verify karke server user ki identity confirm karta hai, agar refresh token valid hai to server new access token generate karta hai aur client ko bhej deta hai, is tarah se user ko baar baar login karne ki zarurat nahi padti
Refresh token -> long lived entry pass
Sent only when access token expires
long expiry (7 days - 30 days)
not sent in every request, only when access token expires

Token Flow 
Login
 ↓
Server gives:
  - Access Token (short)
  - Refresh Token (long)
 ↓
Client stores:
  - Access token (memory)
  - Refresh token (secure storage)
 ↓
Client calls API with access token
 ↓
Access token expires ❌
 ↓
Client sends refresh token
 ↓
Server issues new access token
 ↓
Client continues

In the current project only single jwt token is used 

JWT middleware + protecting routes
JWT middleware -> ye ek function hai jo har protected route pe run hota hai, ye request ke authorization header se JWT token ko extract karta hai, phir is token ko verify karta hai using the JWT secret, agar token valid hai to middleware request object me user information attach kar deta hai aur next() call karta hai to proceed to the route handler, agar token invalid ya missing hai to middleware 401 Unauthorized response bhej deta hai

Protecting routes -> ab humne blog create, update, delete routes ko protect kar diya hai using JWT middleware, iska matlab hai ki sirf authenticated users hi in routes ko access kar sakte hai, agar koi unauthenticated user in routes ko access karne ki koshish karta hai to usse 401 Unauthorized response milega

Goal -> Sirf logged in user hi post put delete blogs kar paye 
public routes 
get all blogs
get blog by id

protected routes
post blog
update blog
delete blog

Request
  ↓
JWT Middleware
  ↓
Valid token? → Controller
Invalid token? → 401


Validation Layer (zod)
Problem -> currently hum apne API me koi validation nahi kar rahe hai, iska matlab hai ki agar client galat data bhejta hai to wo server pe error throw karega ya unexpected behavior hoga, isliye hume ek validation layer add karni chahiye jo incoming request data ko validate kare aur ensure kare ki wo expected format me hai
Solution -> Zod library use karenge jo ek powerful schema validation library hai, isse hum apne data ke liye schemas define kar sakte hai aur easily validate kar sakte hai ki incoming data un schemas ke according hai ya nahi, agar data valid nahi hai to Zod automatically error throw karega jise hum handle kar sakte hai aur client ko proper error response bhej sakte hai

Validation layer ka kaam:
Controller ke pehle hi galat request ko block kar dena


mental model 
Request
  ↓
Validation (Zod)
  ↓
JWT Middleware
  ↓
Controller


