const ingredients = [
  ["Moonflower","🌸","Rare"],["Stardust","✨","Epic"],["Dragon Berry","🍒","Epic"],
  ["Crystal Water","💧","Common"],["Fairy Mushroom","🍄","Uncommon"],["Phoenix Feather","🪶","Legendary"],
  ["Mermaid Tear","💎","Rare"],["Rainbow Leaf","🍃","Uncommon"],["Shadow Petal","🥀","Epic"],
  ["Moonstone","🌙","Rare"],["Sun Drop","☀️","Uncommon"],["Dream Dust","🌟","Rare"],
  ["Frost Mint","🌿","Common"],["Thunder Seed","⚡","Epic"],["Star Crystal","🔮","Legendary"],
  ["Silver Moss","🌱","Common"],["Ember Root","🥕","Uncommon"],["Cloud Petal","☁️","Uncommon"],
  ["Twilight Seed","🫘","Rare"],["Whispering Herb","🌾","Common"],["Glowcap","🍄","Uncommon"],
  ["Comet Dust","☄️","Epic"],["Aurora Bloom","🌷","Legendary"],["Mist Pearl","🫧","Rare"],
  ["Golden Thorn","🌻","Epic"]
];

const recipes = {
  "Moonflower|Stardust": ["Moonlight Elixir","Rare","🌙","Lets moonlight linger in a room long after sunset."],
  "Dragon Berry|Phoenix Feather": ["Dragonfire Draught","Legendary","🔥","A warm, harmless spark that makes every candle feel brighter."],
  "Fairy Mushroom|Rainbow Leaf": ["Enchanted Garden Potion","Epic","🌈","A tiny imaginary garden appears in the mind for a moment."],
  "Crystal Water|Moonstone": ["Mirror of the Moon","Rare","🪞","Shows a shimmering reflection of the laboratory under moonlight."],
  "Dream Dust|Mermaid Tear": ["Dreamwalker Elixir","Epic","💭","Turns ordinary daydreams into colorful little stories."],
  "Sun Drop|Thunder Seed": ["Stormspark Potion","Epic","⚡","Makes the cauldron hum with a cheerful little storm."],
  "Aurora Bloom|Stardust": ["Aurora Essence","Legendary","🌌","A pastel ribbon of northern-light colors dances above the bottle."],
  "Ember Root|Frost Mint": ["Balance Brew","Rare","⚖️","Warmth and coolness meet in perfect imaginary balance."],
  "Moonstone|Shadow Petal": ["Eclipse Elixir","Epic","🌑","Creates a soft eclipse-shaped shadow on the table."],
  "Cloud Petal|Comet Dust": ["Skybound Potion","Epic","☁️","A miniature cloud circles the bottle like a friendly satellite."]
};

const achievementData = [
  ["First Brew","🧪","Brew your first potion."],
  ["Curious Apprentice","🔎","Experiment with 5 ingredients."],
  ["Experimental Mind","🧠","Make 5 brews."],
  ["Recipe Hunter","📖","Discover 3 different potions."],
  ["Rare Talent","💜","Discover a Rare or better potion."],
  ["Arcane Brewer","✨","Earn 100 XP."],
  ["Legendary Alchemist","👑","Discover a Legendary potion."],
  ["Secret Seeker","🔐","Discover a mystery brew."],
  ["Keeper of Secrets","🗝️","Create 5 mystery brews."],
  ["Master of PotionLab","🏆","Reach Level 5."]
];

let state = JSON.parse(localStorage.getItem("potionlabState")) || {
  xp:0, level:1, discoveries:[], brews:0, experiments:0, mystery:0
};
let selected = [];

function save(){ localStorage.setItem("potionlabState", JSON.stringify(state)); updateUI(); }
function xpForLevel(){ return state.level * 100; }
function addXP(n){
  state.xp += n;
  while(state.level < 5 && state.xp >= xpForLevel()){
    state.xp -= xpForLevel();
    state.level++;
    toast("✦ Level up! You are now level "+state.level);
  }
  save();
}
function showScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  if(id==="grimoire") renderGrimoire();
  if(id==="achievements") renderAchievements();
  updateUI();
  window.scrollTo({top:0,behavior:"smooth"});
}
function renderIngredients(){
  const box=document.getElementById("ingredients");
  box.innerHTML=ingredients.map((x,i)=>`
    <button class="ingredient" onclick="selectIngredient(${i})" title="${x[0]} — ${x[2]}">
      <span class="icon">${x[1]}</span><small>${x[0]}</small><span class="rarity">${x[2]}</span>
    </button>`).join("");
}
function selectIngredient(i){
  if(selected.length>=4) return toast("The cauldron can only hold four ingredients.");
  const item=ingredients[i];
  if(selected.some(x=>x[0]===item[0])) return toast("That ingredient is already selected.");
  selected.push(item); state.experiments++; 
  document.getElementById("elaraSpeech").textContent="Excellent choice: "+item[0]+".";
  document.getElementById("orinSpeech").textContent=selected.length===1?"What should we add next?":"This might become interesting!";
  renderSelected(); save();
}
function renderSelected(){
  const box=document.getElementById("selectedIngredients");
  document.getElementById("selectedCount").textContent=selected.length;
  document.getElementById("brewButton").disabled=selected.length<2;
  box.innerHTML=selected.length?selected.map((x,i)=>`<button class="selected-item" onclick="removeSelected(${i})">${x[1]} ${x[0]} ×</button>`).join(""):'<span class="empty">Pick 2–4 ingredients</span>';
}
function removeSelected(i){ selected.splice(i,1); renderSelected(); }
function clearSelection(){ selected=[]; renderSelected(); }
function recipeKey(){
  return selected.map(x=>x[0]).sort().join("|");
}
function brewPotion(){
  if(selected.length<2) return;
  const key=recipeKey();
  const r=recipes[key];
  state.brews++;
  let potion;
  if(r){
    potion={name:r[0],rarity:r[1],icon:r[2],lore:r[3],ingredients:selected.map(x=>x[0])};
    const existing=state.discoveries.find(x=>x.name===potion.name);
    if(!existing){ state.discoveries.push(potion); addXP(r[1]==="Legendary"?250:r[1]==="Epic"?100:r[1]==="Rare"?50:25); }
    else addXP(10);
    document.getElementById("liquid").style.background =
      r[1]==="Legendary"?"#f1d98e":r[1]==="Epic"?"#e9c1c9":"#b9a8df";
    document.getElementById("elaraSpeech").textContent="A successful brew! Record it in the Grimoire.";
    document.getElementById("orinSpeech").textContent="We made "+potion.name+"!";
    openDiscovery(potion);
  } else {
    state.mystery++;
    potion={name:randomMystery(),rarity:"Mystery",icon:["☁️","🫧","🎀","🌈","✨"][Math.floor(Math.random()*5)],
      lore:"The ingredients refused to behave normally. The laboratory has recorded the result anyway.",
      ingredients:selected.map(x=>x[0])};
    state.discoveries.push(potion);
    addXP(25);
    document.getElementById("liquid").style.background="#f0c9d8";
    document.getElementById("elaraSpeech").textContent="Curious... this combination was not in my notes.";
    document.getElementById("orinSpeech").textContent="I think Pip likes it.";
    openDiscovery(potion);
  }
  selected=[]; renderSelected(); save();
}
function randomMystery(){
  const names=["Cloudy Surprise","Pip's Favorite Brew","Pastel Paradox","Wandering Spark","The Unsettled Elixir","Pocket Rainbow","Curious Whirl"];
  return names[Math.floor(Math.random()*names.length)];
}
function chaosBrew(){
  if(ingredients.length<2) return;
  selected=[];
  while(selected.length<3){
    const x=ingredients[Math.floor(Math.random()*ingredients.length)];
    if(!selected.some(y=>y[0]===x[0])) selected.push(x);
  }
  renderSelected(); toast("Chaos chose three ingredients. What could possibly happen?");
}
function openDiscovery(p){
  document.getElementById("modalContent").innerHTML=`
    <div class="discovery-art">${p.icon}</div>
    <h2>${p.name}</h2>
    <p><b>${p.rarity}</b> • Discovery #${state.discoveries.length}</p>
    <p>${p.lore}</p>
    <p><b>Ingredients:</b> ${p.ingredients.join(", ")}</p>
    <button class="primary" onclick="closeModal();showScreen('grimoire')">Add to Grimoire ✦</button>
    <button class="secondary" onclick="copyDiscovery('${p.name.replaceAll("'","")}')">Copy Discovery</button>`;
  document.getElementById("modal").classList.remove("hidden");
  renderAchievements();
}
function closeModal(){document.getElementById("modal").classList.add("hidden")}
function copyDiscovery(name){
  const text=`PotionLab discovery: ${name} — discovered in the Living Potion Lab. 🧪✨`;
  navigator.clipboard?.writeText(text); toast("Discovery copied!");
}
function renderGrimoire(){
  const box=document.getElementById("grimoirePages");
  document.getElementById("bookCount").textContent=state.discoveries.length;
  box.innerHTML=state.discoveries.length?state.discoveries.map(p=>`
    <article class="grimoire-page">
      <div class="potion-art">${p.icon}</div>
      <p class="eyebrow">${p.rarity}</p>
      <h3>${p.name}</h3>
      <p>${p.lore}</p>
      <small>Ingredients: ${p.ingredients.join(" · ")}</small>
    </article>`).join(""):`<article class="grimoire-page unknown"><h3>Your first page is waiting.</h3><p>Return to the laboratory and brew something curious.</p></article>`;
}
function renderAchievements(){
  const box=document.getElementById("achievementGrid");
  const unlocked=achievementData.map((a,i)=>{
    let yes=false;
    if(i===0) yes=state.brews>=1;
    if(i===1) yes=state.experiments>=5;
    if(i===2) yes=state.brews>=5;
    if(i===3) yes=state.discoveries.length>=3;
    if(i===4) yes=state.discoveries.some(p=>["Rare","Epic","Legendary"].includes(p.rarity));
    if(i===5) yes=state.xp>=100 || state.level>1;
    if(i===6) yes=state.discoveries.some(p=>p.rarity==="Legendary");
    if(i===7) yes=state.mystery>=1;
    if(i===8) yes=state.mystery>=5;
    if(i===9) yes=state.level>=5;
    return {...{a,i,yes}};
  });
  box.innerHTML=unlocked.map(x=>`<article class="badge ${x.yes?"":"locked"}"><div class="badge-icon">${x.a[1]}</div><h3>${x.a[0]}</h3><p>${x.a[2]}</p><small>${x.yes?"UNLOCKED":"LOCKED"}</small></article>`).join("");
}
function updateUI(){
  ["level","profileLevel"].forEach(id=>document.getElementById(id).textContent=state.level);
  ["xp","profileXp"].forEach(id=>document.getElementById(id).textContent=state.xp);
  document.getElementById("discoveries").textContent=state.discoveries.length;
  document.getElementById("profilePotions").textContent=state.discoveries.length;
  document.getElementById("profileIngredients").textContent=ingredients.length;
  const pct=Math.min(100,(state.xp/xpForLevel())*100);
  document.getElementById("xpBar").style.width=pct+"%";
}
function toast(msg){
  const t=document.getElementById("toast"); t.textContent=msg; t.classList.add("show");
  clearTimeout(window.toastTimer); window.toastTimer=setTimeout(()=>t.classList.remove("show"),2400);
}
function resetProgress(){
  if(confirm("Reset all PotionLab discoveries and XP?")){
    localStorage.removeItem("potionlabState");
    location.reload();
  }
}
renderIngredients(); renderSelected(); updateUI(); renderAchievements();
