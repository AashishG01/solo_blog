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



Blog ownership and Author pages 
Problem -> currently koi bhi authenticated user kisi bhi blog ko update ya delete kar sakta hai, iska matlab hai ki agar user A ne ek blog create kiya hai to user B us blog ko update ya delete kar sakta hai, isliye hume blog ownership ka concept implement karna chahiye jisme sirf blog ke creator hi us blog ko update ya delete kar sakta hai

Solution -> jab user ek blog create karta hai to hum us blog ke document me ek field add karenge jise "author" ya "owner" kahenge, is field me hum user ki unique ID store karenge, phir jab koi user update ya delete request bhejta hai to hum check karenge ki kya wo user us blog ka owner hai ya nahi, agar wo owner hai to hi update ya delete operation allow karenge, agar wo owner nahi hai to 403 Forbidden response bhej denge

tasks 
Each blog will have author field 
Only author can update or delete their blog
public api -> GET/users/:username  and this will return name, bio , joined data, total published blogs

mental model 
user -> 1 to many -> blogs 


added user and bio to model 
added article.model



Implementing Central Error handling 
-> controller me error handling karna tedious ho sakta hai, har controller me try catch block likhna padega, isliye hum ek central error handling mechanism implement karenge jisme hum ek global error handler define karenge jo saare errors ko handle karega, isse hum apne controllers ko clean aur maintainable rakh sakte hai

controllers will be clean 
No repetitive try catch blocks
proper error response structure
future scaling easy 


central error handling ka flow
Controller
   ↓ (throw error)
Fastify Global Error Handler
   ↓
Standardized JSON Response


Clean controller 
before -> 
if (!blog) {
  return reply.status(404).send({ message: "Blog not found" });
}


now -> 
import AppError from "../utils/AppError.js";

if (!blog) {
  throw new AppError("Blog not found", 404);
}

AppError class -> ye ek custom error class hai jo humne banayi hai, is class me hum error message aur status code ko define karte hai, jab bhi hume koi error throw karna hota hai to hum AppError class ka instance create karte hai aur usme error message aur status code pass karte hai, phir hum is error ko throw kar dete hai, global error handler is error ko catch karta hai aur uske message aur status code ke according client ko response bhejta hai



Draft -> publish workflow 
right now blog is published : boolean field hai, iska matlab hai ki jab blog create hota hai to wo turant publish ho jata hai, isliye hume ek draft-publish workflow implement karna chahiye jisme user pehle apne blog ko draft ke roop me save kar sakta hai aur jab wo ready ho jaye to usse publish kar sakta hai


blog life cycle 
draft -> published -> archived 
📝 Draft → Only author can see/edit
🌍 Published → Publicly visible
📦 Archived → Hidden but not deleted

This introduces 
state management -> blog ke state ko manage karna hoga (draft, published, archived)
authorization rules -> sirf author hi draft aur published blogs ko edit kar sakta hai, archived blogs ko koi bhi edit nahi kar sakta hai
Bussiness logic -> jab blog publish hota hai to uska published field true ho jata hai, jab blog archive hota hai to uska archived field true ho jata hai, aur dono fields false hone par wo draft state me hota hai

Architecture Improvement 
User
  ↓
Draft Blog
  ↓ publish
Published Blog
  ↓ archive
Archived Blog

TEST FLOW
1️⃣ Create blog → status = draft
2️⃣ GET public blogs → NOT visible
3️⃣ PATCH publish → visible
4️⃣ PATCH archive → hidden


Comment System 
Design 
We will NOT embed comments inside blog document.

Why?

❌ Blog document bloated ho jayega
❌ Pagination impossible
❌ Heavy writes
❌ Scaling issue

Instead:

✅ Separate Comment collection
✅ Reference blog
✅ Reference author

Featuers
1. add comment logged in user only
2. Get comments of a blog 
3. Delete own comment 
4. Edit comments (optional)
5. nested replies (optional)

Architect 
User 
  ↓
Comment
  ↓
Blog

one blog -> multiple comments
one user -> multiple comments

Like System 

design decision
Option 1: Just store likesCount
Bad idea.
Duplicate likes possible
No record of who liked
Data integrity issue

Option 2: Store users who liked (Correct way)
We will:
Store array of user IDs
Maintain like count
Prevent duplicate likes
Allow unlike



Follow system + personalized feed implementation 

we want to build 
User can follow other users 
Each user gets a personalized feed of blogs from followed users
Feed shows blogs from people they follow 

Social Graph 
Ashish -> follows -> rahul 
Ashish -> follows -> neha
Rahul -> follows -> dev

this is called a directed graph where users are nodes and follows are directed edges, this graph helps us understand the relationships between users and can be used to generate personalized feeds based on who they follow


where do we store this 

option 1: seperate follow collection 
good for complex queries but can be slow for feed generation

option 2: store followers and following in user model 

In User model:

followers: [ObjectId],
following: [ObjectId]


So:
User A
  following: [UserB, UserC]
User B
  followers: [UserA]
This is easier for your current architecture

How Personalized Feed Works
Let’s say:
User A follows:
following = [UserB, UserC]
Feed logic:
Give me all blogs
Where author IN [UserB, UserC]
AND status = published
Order by createdAt DESC
Paginate
That’s it.
But system thinking starts here.

Feed query flow 
Client hits: GET /feed
 ↓
Auth middleware identifies user
 ↓
Get user.following list
 ↓
Query blogs where:
   author ∈ following
   status = published
 ↓
Sort by newest
 ↓
Return paginated results


mportant Constraints We Must Handle

1️⃣ User cannot follow themselves
2️⃣ User cannot follow same person twice
3️⃣ Cannot follow non-existing user
4️⃣ Feed should not include drafts
5️⃣ Feed must be paginated

End result apis 
We will build:
POST   /users/:id/follow
POST   /users/:id/unfollow
GET    /feed



answer to some question 
Current feed query:
Article.find({
  author: { $in: user.following },
  status: "published"
})
.sort({ createdAt: -1 })
.limit(...)

This is query-time fan-in model.
It works fine for:
Small–medium scale
Thousands of users
Moderate follow counts
Let’s Evaluate Options
A) Caching Feed
Caching helps if:
Same feed requested repeatedly
Data doesn’t change often
But in feed systems:
Feed changes whenever someone publishes
Personal per-user data
Hard to cache reliably without invalidation complexity
Caching helps later — but not the first scalability step.
❌ Not the primary next move.
C) Redis Usage
Redis is a tool, not a strategy.
You use Redis for:
Caching
Rate limitin
Session storage
Precomputed feeds
But asking “use Redis?” is like asking:
Should we use a screwdriver?
Depends on what you’re building.
❌ Not the core architectural improvement yet.
D) Pagination Optimization
Pagination already exists.
You’re using:
.skip().limit()

That’s fine for moderate scale.
Yes, cursor-based pagination is better at huge scale.
But again — not the biggest improvement.
❌ Not the primary scalability leap.
🔥 The Correct Answer
✅ B) Fan-out on write
This is the real architectural jump.
🧠 Why Fan-Out On Write Is The True Scaling Move
Current system:
User requests feed
 → Query blogs from followed users
 → Sort → Return

Cost paid at read time.
Fan-out on write system:
When Rahul posts:

For each follower of Rahul:
  Insert blog reference into their feed collection

Now:
GET /feed
 → Just read precomputed feed entries
 → Very fast

Cost paid at write time.
📊 Trade-off Comparison
Strategy	Write Cost	Read Cost	Best For
Query-time fan-in	Low	High	Small-medium scale
Fan-out on write	High	Very Low	Large scale social apps
🚀 Why Big Companies Use Fan-Out
Instagram / Twitter feed must be:
Extremely fast
Low latency
Consistent
Scalable to millions
They:
Push content to follower feeds
Store feed in Redis / feed DB
Precompute timelines
🧠 So Architecturally Correct Next Step?
Answer:
B) Fan-out on write
Becauseit changes where the computational cost happens.
That’s real system design thinkng.
🏗 But For Your Current Project?
We do NOT implement fan-out yet.
Why?
Because:
Your scale doesn’t require it
Adds major complexity
Requires background jobs / queues
Instead:
We learn it conceptually,
then implement caching or optimization as practical steps.



Notification systems 

we will implement database based notifications for events like new comment, new follower, blog liked, etc.

ARCHITECTURE DESIGN

Instead of pushing notifications in random places, we design a clean structure.

📦 Notification Model

Each notification will store:
recipient → who receives it
sender → who triggered it
type → follow / like / comment
blog → optional (if related to blog)
read → boolean
createdAt

DESIGN PRINCIPLE

Notifications are:
Created when event happens
Read when user fetches
Marked read when user sees them



Implementing Rate Limiting 
Problem -> currently hum apne API endpoints pe koi rate limiting nahi laga rahe hai, iska matlab hai ki koi bhi user ya bot hamare API ko unlimited requests bhej sakta hai, jo ki server pe load badha sakta hai aur performance issues create kar sakta hai, isliye hume apne API endpoints pe rate limiting implement karni chahiye jisse hum control kar sake ki ek user kitni requests ek certain time frame me bhej sakta hai
Solution -> Fastify ke paas built-in rate limiting plugin hai jise hum use kar sakte hai, is plugin ko configure karke hum specify kar sakte hai ki ek user kitni requests per minute bhej sakta hai, agar user is limit ko exceed karta hai to usse 429 Too Many Requests response milega, isse hum apne server ko abusive traffic se protect kar sakte hai aur ensure kar sakte hai ki hamare API endpoints pe load manageable rahe

Why Rate Limiting?
Protects server from abuse
Prevents DDoS attacks
Ensures fair usage
Improves overall performance

Where should we apply rate limiting?

We'll apply 
strict limits on 
/auth/login and /auth/register to prevent brute-force attacks
moderate limits on /blogs/:id/comments and /blogs/:id/like to prevent spam
light limit globally on all endpoints to prevent abuse

Implementation
Fastify provides a plugin called fastify-rate-limit which can be easily integrated into our application. We can configure it to set different limits for different routes as needed. For example, we can set a strict limit of 5 requests per minute for authentication routes and a moderate limit of 20 requests per minute for comment and like routes. Additionally, we can set a global limit of 100 requests per minute for all other endpoints to ensure overall protection against abuse.
steps to implement:
Install fastify-rate-limit plugin
Configure rate limits for specific routes
Test the implementation using tools like Postman to ensure that rate limits are enforced correctly



Implementing Security Headers 
Problem -> currently hum apne API responses me koi security headers set nahi kar rahe hai, iska matlab hai ki hamare API endpoints vulnerable ho sakte hai various web attacks ke liye, isliye hume apne API responses me security headers implement karne chahiye jisse hum apne application ko secure kar sake against common vulnerabilities
Solution -> Fastify ke paas built-in support hai security headers ke liye, hum fastify-helmet plugin use kar sakte hai jisse hum easily apne API responses me security headers add kar sakte hai, is plugin ko configure karke hum specify kar sakte hai ki kaunse security headers hume add karne hai, jaise ki Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, etc. isse hum apne application ko various web attacks se protect kar sakte hai aur ensure kar sakte hai ki hamare API endpoints secure rahe

What Are Security Headers?

They are HTTP response headers that:
Prevent XSS
Prevent clickjacking
Prevent MIME sniffing
Control resource loading
Protect browser behavior
Production rule:
Always send secure headers in public APIs.

Implementation steps 
Install fastify-helmet plugin
Configure desired security headers
Test using Postman to verify headers are present in responses

in server.js 
import fastifyHelmet from "fastify-helmet";
await fastify.register(helmet,{global: true});
What this automatically adds:
X-DNS-Prefetch-Control
X-Frame-Options
X-Content-Type-Options
Strict-Transport-Security
Referrer-Policy
Content-Security-Policy

Why This Matters Even for API?
Even if frontend is separate:
APIs can be targeted
Clickjacking attacks possible
Browser misuse possible
Content sniffing exploit possible
Security headers reduce attack surface.


Api Versioning 
Problem -> currently hum apne API endpoints pe koi versioning implement nahi kar rahe hai, iska matlab hai ki agar future me hume apne API me changes karne hai to wo existing clients ke liye breaking changes create kar sakta hai, isliye hume apne API endpoints pe versioning implement karni chahiye jisse hum future me apne API me changes kar sake without affecting existing clients
Solution -> API versioning ke liye hum apne routes me version number include kar sakte hai, jaise ki /api/v1/blogs, /api/v2/blogs, etc. isse hum easily future me apne API me changes kar sakte hai without affecting existing clients, jab bhi hume apne API me breaking changes karne hai to hum simply new version create kar sakte hai aur existing clients ko old version use karne de sakte hai jab tak wo ready nahi ho jate new version pe migrate karne ke liye

why API Versioning?
Without versioning:
If tomorrow you change:
Response format
Field names
Auth logic
Pagination format
You break:
Frontend
Mobile apps
Integrations
Production rule:
Never break clients silently.

Implementation steps
we will 
create versioned route prefix 
e.g. /api/v1/blogs
group all rotues under /api/v1 prefix
when making breaking changes, create new version /api/v2 and update routes there
keep structure clean for /api/v2 later 


Slug system for SEO friendly URLs
Problem -> currently hum apne blogs ke URLs me sirf blog ID use kar rahe hai, iska matlab hai ki hamare URLs SEO friendly nahi hai aur user experience bhi thoda poor hai, isliye hume apne blogs ke URLs me slug system implement karna chahiye jisse hum apne URLs ko SEO friendly aur user friendly bana sake
Solution -> Slug ek URL friendly string hota hai jo blog ke title se generate hota hai, jab bhi user ek blog create karta hai to hum uske title se slug generate karenge aur usse blog document me store karenge, phir hum apne routes me blog ID ke sath slug bhi include karenge, jaise ki /blogs/:id/:slug, isse hamare URLs SEO friendly ho jayenge aur user experience bhi improve hoga

WHY SLUGS?

Instead of:
/api/v1/blogs/65f23abce9123
We want:
/api/v1/blogs/how-to-learn-backend
Benefits:
SEO friendly
Human readable
Shareable
Professional polish

