const balEl = document.getElementById("bal");
const bonusBtn = document.getElementById("bonusBtn");

function updateBalance(){
  balEl.textContent = wallet.get();
}

bonusBtn.onclick = () => {
  wallet.add(1000);
  updateBalance();
};

updateBalance();