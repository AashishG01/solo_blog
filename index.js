// prototype is a link which allows one object to borrow properties from another object 

// intiution 
// beta child object -> cycle 
// papa parent object -> car 
// dadji grandparent -> haveli 

// if beta wants car he will check he doesnot have he take it from papa 
// if beta wants haveli he will check he does not have he will ask papa he does not have he will ask dadaji and take it from him 

// each js object has hidden property -> __proto__ this is the link between child and parent 

const janwar = {
    khana: true, 
    chalna : function(){
        console.log("main chal raha hu");
    }
};

const khargosh = {
    koodna: true
};

// linking the relation 
// khargosh ka baaap janwar hai 
khargosh.__proto__ = janwar;

console.log(khargosh.koodna); // true (Apna hai)
console.log(khargosh.khana);  // true (Janwar se udhaar liya!)
khargosh.chalna();            // "Main chal raha hoon" (Janwar se aaya)

// fayda -> khargosh ko chalna method copy karne ki jarurat nhi padi usne bas link use kiya aur memory bach gayi 

// confusion -> .prototype vs __proto__ 
// __proto__ -> link it happens on object its the connection between the parent and child 
// .prototype -> THe blueprint ye sirf functions k pass hota hai jab aap new users() karte hai toh js user.prototype main jo bhi rakha hai use naye object ke __proto__ mein daal deta hai 

