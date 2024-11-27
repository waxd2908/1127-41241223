// Firebase 初始化
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const database = firebase.database();
const provider = new firebase.auth.GoogleAuthProvider();

const registerButton = document.getElementById("registerButton");
const loginButton = document.getElementById("loginButton");

// 註冊功能
function registerFunction() {
  auth.signInWithPopup(provider)
    .then(result => {
      const user = result.user;
      saveUserData(user);
      showSuccessAlert("註冊成功", `歡迎, ${user.displayName}`);
      switchToViewMemberButton(); // 切換到查看會員資料
      switchToLogoutButton(); // 切換到登出按鈕
    })
    .catch(error => {
      showErrorAlert("註冊失敗", error.message);
    });
}

// 查看會員資料功能
function viewMemberFunction() {
  const user = auth.currentUser;

  if (!user) {
    showErrorAlert("錯誤", "無法取得使用者資料，請重新登入！");
    return;
  }

  database.ref('users/' + user.uid).once('value')
    .then(snapshot => {
      const data = snapshot.val();
      document.getElementById("userName").innerText = `姓名: ${data.name}`;
      document.getElementById("userEmail").innerText = `Email: ${data.email}`;
      document.getElementById("userPhoto").src = data.photoURL;
      document.getElementById("lastLogin").innerText = `最後登入時間: ${formatDate(data.lastLogin)}`;
      
      const userModal = new bootstrap.Modal(document.getElementById("userModal"));
      userModal.show();
    })
    .catch(error => {
      showErrorAlert("資料獲取失敗", error.message);
    });
}

// 登出功能
function logoutFunction() {
  auth.signOut()
    .then(() => {
      showSuccessAlert("登出成功", "您已成功登出！");
      switchToRegisterButton(); // 切換到註冊按鈕
      switchToLoginButton(); // 切換到登入按鈕
    })
    .catch(error => {
      showErrorAlert("登出失敗", error.message);
    });
}

// 按鈕功能切換
function switchToRegisterButton() {
  registerButton.textContent = "註冊";
  registerButton.classList.remove("btn-info");
  registerButton.classList.add("btn-primary");
  registerButton.removeEventListener("click", viewMemberFunction);
  registerButton.addEventListener("click", registerFunction);
}

function switchToViewMemberButton() {
  registerButton.textContent = "查看會員資料";
  registerButton.classList.remove("btn-primary");
  registerButton.classList.add("btn-info");
  registerButton.removeEventListener("click", registerFunction);
  registerButton.addEventListener("click", viewMemberFunction);
}

function switchToLogoutButton() {
  loginButton.textContent = "登出";
  loginButton.classList.remove("btn-success");
  loginButton.classList.add("btn-danger");
  loginButton.removeEventListener("click", loginFunction);
  loginButton.addEventListener("click", logoutFunction);
}

function switchToLoginButton() {
  loginButton.textContent = "登入";
  loginButton.classList.remove("btn-danger");
  loginButton.classList.add("btn-success");
  loginButton.removeEventListener("click", logoutFunction);
  loginButton.addEventListener("click", loginFunction);
}

// 儲存使用者資料
function saveUserData(user) {
  const userData = {
    name: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    lastLogin: new Date().toISOString(),
  };
  database.ref('users/' + user.uid).set(userData);
}

// SweetAlert 提示
function showSuccessAlert(title, message) {
  Swal.fire({
    icon: "success",
    title: title,
    text: message,
    timer: 2000,
    showConfirmButton: false,
  });
}

function showErrorAlert(title, message) {
  Swal.fire({
    icon: "error",
    title: title,
    text: message,
  });
}

// 日期格式化
function formatDate(date) {
  const d = new Date(date);
  return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
}

// 初始化按鈕
switchToRegisterButton();
switchToLoginButton();
