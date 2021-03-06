config = {
  startPage: document.getElementById("startPage"),
  registerPage: document.getElementById("registerPage"),
  mainPage: document.getElementById("mainPage"),
  leftDiv: document.getElementById("leftDiv"),
  rightDiv: document.getElementById("rightDiv"),
  rightDivProfile: document.getElementById("rightDivProfile"),
  rightDivItem: document.getElementById("rightDivItem"),
  rightDivPurchase: document.getElementById("rightDivPurchase"),
};

let user;
let day = 1;

class View {
  static leftDivView(user) {
    let container = `
      <h4 id="burgersCount">${user.burgers} Burgers</h4>
      <h4 id="burgerProfit">$${user.burgerProfit}/クリック</h4>
      <img id="burgerImg" class="mt-2 hover" src="https://cdn.pixabay.com/photo/2014/04/02/17/00/burger-307648_960_720.png"
       width="200px"
      >
      <br>
      <button id="save" class="btn btn-warning col-6 mt-4">セーブ</button>
    `;
    return container;
  }

  static rightDivProfileView(user) {
    let container = `
      <div class="d-flex flex-wrap">
        <div class="col-6 border">${user.name}</div>
        <div class="col-6 border">${user.age}歳</div>
        <div class="col-6 border">${day}日目</div>
        <div class="col-6 border">$${user.money}</div>
      </div>
    `;
    return container;
  }

  static rightDivItemView() {
    let container = ``;
    for (let i = 0; i < items.length; i++) {
      let limit = items[i].type == "invest" ? "∞" : items[i].limit;
      let itemContainer = `
        <div id="itemList" class="d-flex border p-2 hover">
          <img src="${items[i].img}" class="col-2" width="100px">
          <div class="col-4 ml-4 text-left d-flex align-items-center">
            <div>
              <p>${items[i].name}</p>
              <p>$${items[i].price}</p>
            </div>
          </div>
          <div class="col-4 d-flex align-items-center">${View.profitDescription(items[i])}</div>
          <div class="col-2 d-flex align-items-center">${items[i].hold} / ${limit}</div>
        </div>
      `;
      container += itemContainer;
    }
    return container;
  }

  static rightDivPurchaseView(item) {
    let container = `
      <div>
        <p>${item.name}</p>
        <p>最大保有可能数:${item.limit}</p>
        <p>価格:$${item.price}</p>
        <input id="purchaseNumber" type="number" value=1 min=1 style="text-align:right">
        <div class="d-flex m-4 justify-content-around">
          <button class="btn btn-warning col-4 back-btn">戻る</button>
          <button class="btn btn-warning col-4 next-btn">購入</button>
        </div>
      </div>
    `;
    return container;
  }

  //購入した場合の利益の説明
  static profitDescription(item) {
    let unit;
    let increase;
    if (item.type == "ability") {
      unit = "click";
      increase = item.profit;
    } else if (item.type == "invest") {
      unit = "sec";
      increase = item.price * item.profit;
    } else if (item.type == "realEstate") {
      unit = "sec";
      increase = item.profit;
    }

    return `
        <p>+$${increase} / ${unit}</p>
        <p>
    `;
  }
}

class Controller {
  static createHashMap() {
    let hashMap = {};
    for (let i = 0; i < items.length; i++) {
      hashMap[items[i].name] = items[i];
    }
    return hashMap;
  }

  //画面遷移（要所の非表示）
  static displayNone(ele) {
    ele.classList.remove("d-block");
    ele.classList.add("d-none");
  }

  //画面遷移（要素を表示）
  static displayBlock(ele) {
    ele.classList.remove("d-none");
    ele.classList.add("d-block");
  }

  //ユーザー登録ページに進む
  static showRegisterPage() {
    Controller.displayNone(config.startPage);
    Controller.displayBlock(config.registerPage);
  }

  //スタートページに戻る
  static backStartPage() {
    Controller.displayNone(config.registerPage);
    Controller.displayBlock(config.startPage);
  }

  //ゲームをスタートさせ、メイン画面に進む
  static startGame() {
    const userForm = document.getElementById("userForm");
    user = new User(userForm.value, 20, 10000, 25, 0, 0, 0, 0);
    Controller.displayNone(config.registerPage);
    Controller.displayBlock(config.mainPage);
    Controller.createMainPage(user);
    setInterval(() => {
      Controller.nextDay();
    }, 1000);
  }

  //1日毎の処理
  static nextDay() {
    day += 1;
    if (day % 365 == 0) user.age += 1;
    user.money += user.totalBonds * hashMap["ETF Bonds"].profit;
    user.money += user.totalStock * hashMap["ETF Stock"].profit;
    user.money += user.totalIncome;

    //プロフィール画面の更新
    config.rightDivProfile.innerHTML = "";
    config.rightDivProfile.innerHTML += View.rightDivProfileView(user);
  }

  //メインページの作成
  static createMainPage(user) {
    config.leftDiv.innerHTML = View.leftDivView(user);
    config.rightDivProfile.innerHTML = View.rightDivProfileView(user);
    let burgerImg = document.getElementById("burgerImg");
    let saveBtn = document.getElementById("save");

    burgerImg.addEventListener("click", function () {
      Controller.clickBurger(user);
    });

    saveBtn.addEventListener("click", function () {
      Controller.save();
    });

    rightDivItem.innerHTML = View.rightDivItemView();

    for (let i = 0; i < items.length; i++) {
      let itemDom = document.querySelectorAll("#itemList")[i];
      itemDom.addEventListener("click", function () {
        Controller.clickItem(items[i]);
      });
    }
  }

  //ハンバーガーをクリックした時の処理
  static clickBurger(user) {
    let burgersCount = document.getElementById("burgersCount");
    user.burgers += 1;
    user.money += user.burgerProfit;
    burgersCount.innerHTML = `
      ${user.burgers} Burgers
    `;
    config.rightDivProfile.innerHTML = "";
    config.rightDivProfile.innerHTML += View.rightDivProfileView(user);
  }

  //商品をクリックした後の処理
  static clickItem(item) {
    Controller.displayNone(config.rightDivItem);
    Controller.displayBlock(config.rightDivPurchase);
    config.rightDivPurchase.innerHTML = View.rightDivPurchaseView(item);

    let backBtn = config.rightDivPurchase.querySelectorAll(".back-btn").item(0);
    let nextBtn = config.rightDivPurchase.querySelectorAll(".next-btn").item(0);

    backBtn.addEventListener("click", function () {
      Controller.displayNone(config.rightDivPurchase);
      Controller.displayBlock(config.rightDivItem);
    });

    nextBtn.addEventListener("click", function () {
      Controller.purchaseItem(item);
    });
  }

  //購入ボタンを押した場合
  static purchaseItem(item) {
    let purchaseNumber = parseInt(document.getElementById("purchaseNumber").value);
    if (user.money >= item.price * purchaseNumber) {
      if (item.hold + purchaseNumber <= item.limit) {
        Controller.assetUpdate(item, purchaseNumber);
        Controller.displayNone(config.rightDivPurchase);
        Controller.displayBlock(config.rightDivItem);
        Controller.createMainPage(user);
      } else {
        alert("購入限度を超えています!");
      }
    } else {
      alert("お金が足りません!");
    }
  }

  //保有資産の増加処理
  static assetUpdate(item, purchaseNumber) {
    user.money -= item.price * purchaseNumber;
    item.hold += purchaseNumber;
    if (item.name == "Filip Machine") {
      let burgerProfit = document.getElementById("burgerProfit");
      user.burgerProfit = item.profit * (item.hold + 1);
      burgerProfit.innerHTML = "";
      burgerProfit.innerHTML = `$${user.burgerProfit}/クリック`;
    } else if (item.name == "ETF Stock") {
      user.totalStock += item.price * purchaseNumber;
      item.price = item.price * 1.1;
    } else if (item.name == "ETF Bonds") {
      user.totalBonds = item.price * item.hold;
    } else if (item.type == "realEstate") {
      user.totalIncome += item.profit * purchaseNumber;
    }
  }

  //セーブ
  static save() {
    localStorage.setItem("userData", JSON.stringify(user));
    localStorage.setItem("itemsData", JSON.stringify(items));
    localStorage.setItem("dayData", day);
    alert("保存しました");
  }

  //セーブ箇所からのスタート
  static saveStart() {
    if (localStorage.getItem("userData" === null)) {
      alert("保存されていません");
    } else {
      Controller.displayNone(config.startPage);
      Controller.displayBlock(config.mainPage);
      user = JSON.parse(localStorage.getItem("userData"));
      items = JSON.parse(localStorage.getItem("itemsData"));
      day = parseInt(localStorage.getItem("dayData"));
      Controller.createMainPage(user);
      setInterval(() => {
        Controller.nextDay();
      }, 1000);
    }
  }
}

class User {
  constructor(name, age, money, burgerProfit, burgers, totalBonds, totalStock, totalIncome) {
    this.name = name;
    this.age = age;
    this.money = money;
    this.burgerProfit = burgerProfit;
    this.burgers = burgers;
    this.totalBonds = totalBonds;
    this.totalStock = totalStock;
    this.totalIncome = totalIncome;
  }
}

class Item {
  constructor(name, type, limit, price, profit, hold, img) {
    this.name = name;
    this.type = type;
    this.limit = limit;
    this.price = price;
    this.profit = profit;
    this.hold = hold;
    this.img = img;
  }
}

let items = [
  new Item("Filip Machine", "ability", 500, 150, 25, 0, "https://cdn.pixabay.com/photo/2019/06/30/20/09/grill-4308709_960_720.png"),
  new Item("ETF Stock", "invest", 99999999, 30000, 0.1, 0, "https://cdn.pixabay.com/photo/2016/03/31/20/51/chart-1296049_960_720.png"),
  new Item("ETF Bonds", "invest", 99999999, 30000, 0.07, 0, "https://cdn.pixabay.com/photo/2016/03/31/20/51/chart-1296049_960_720.png"),
  new Item("Lemonade Stand", "realEstate", 1000, 30000, 30, 0, "https://cdn.pixabay.com/photo/2012/04/15/20/36/juice-35236_960_720.png"),
  new Item("Ice Cream Truck", "realEstate", 500, 100000, 120, 0, "https://cdn.pixabay.com/photo/2020/01/30/12/37/ice-cream-4805333_960_720.png"),
  new Item("House", "realEstate", 100, 20000000, 32000, 0, "https://cdn.pixabay.com/photo/2016/03/31/18/42/home-1294564_960_720.png"),
  new Item("TownHouse", "realEstate", 100, 40000000, 64000, 0, "https://cdn.pixabay.com/photo/2019/06/15/22/30/modern-house-4276598_960_720.png"),
  new Item("Mansion", "realEstate", 20, 250000000, 500000, 0, "https://cdn.pixabay.com/photo/2017/10/30/20/52/condominium-2903520_960_720.png"),
  new Item("Industrial Space", "realEstate", 10, 1000000000, 2200000, 0, "https://cdn.pixabay.com/photo/2012/05/07/17/35/factory-48781_960_720.png"),
  new Item("Hotel Skyscraper", "realEstate", 5, 10000000000, 25000000, 0, "https://cdn.pixabay.com/photo/2012/05/07/18/03/skyscrapers-48853_960_720.png"),
  new Item("Bullet-Speed Sky Railway", "realEstate", 1, 10000000000000, 30000000000, 0, "https://cdn.pixabay.com/photo/2013/07/13/10/21/train-157027_960_720.png"),
];
hashMap = Controller.createHashMap();
