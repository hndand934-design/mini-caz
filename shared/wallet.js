const WALLET_KEY="mini_caz_wallet";

const wallet={
get(){
return Number(localStorage.getItem(WALLET_KEY)||1000);
},

set(v){
localStorage.setItem(WALLET_KEY,v);
},

add(v){
this.set(this.get()+v);
},

take(v){
this.set(this.get()-v);
}
};