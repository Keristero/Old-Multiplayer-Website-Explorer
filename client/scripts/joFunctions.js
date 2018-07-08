
//Prep seeded random number
Math.seed = function(s) {
    return function() {
        s = Math.sin(s) * 10000; return s - Math.floor(s);
    };
};
Math.resetSeed = function(){
    random1 = Math.seed(42);
    random2 = Math.seed(random1());
    Math.random = Math.seed(random2());
}

/* generateRandomNumber
 * This function generates a random number between the specified range
 * @param min Integer Lowest number to generate
 * @param max Integer Highest Number to generate
 * @return Integer containing a random number
 * @author Jonathan Nimmo
 * @version 1.1
 * @since 2015-08-6
*/
function RNG(min,max){
    var range = max - min + 1;
    return Math.floor(range * Math.random())+ min;
}