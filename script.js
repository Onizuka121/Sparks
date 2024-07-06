window.onload = function () {


  let navs = document.getElementsByClassName("nav");
  let navs_array = Array.from(navs);
  let id_main_containers = ["feeds", "messages", "profile"];
  let chat_container = document.getElementById("chat-container");
  let toast_user = new bootstrap.Toast(document.getElementById('live-toast-user'));
  let toast_password = new bootstrap.Toast(document.getElementById('live-toast-password'));
  let toast_user_signup = new bootstrap.Toast(document.getElementById('live-toast-user-signup'));
  let toast_password_signup = new bootstrap.Toast(document.getElementById('live-toast-password-signup'));
  let toast_success_signup = new bootstrap.Toast(document.getElementById('live-toast-success-signup'));
  let toast_nome_cognome = new bootstrap.Toast(document.getElementById('live-toast-nome-cognome-signup'))
  let url_def_profilo = "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F009%2F292%2F244%2Foriginal%2Fdefault-avatar-icon-of-social-media-user-vector.jpg&f=1&nofb=1&ipt=30ecd67e8a826fc9133f03458abfbaf765b17fb95f307d31defd3a70984f01fd&ipo=images"





  let csstext_hide_element = "display:none !important";
  let csstext_show_element = "display:flex !important";


  document.getElementById("btn-login-main").addEventListener("click", CheckLoginCredentials)

  document.getElementById("btn-login-href").addEventListener("click", function () {
    document.getElementById("login-page-container").style.cssText = csstext_show_element;
    document.getElementById("signup-page-container").style.cssText = csstext_hide_element;
  })

  document.getElementById("btn-signup-main").addEventListener("click", SignUpUser)
  document.getElementById("btn-signup-href").addEventListener("click", function () {
    document.getElementById("login-page-container").style.cssText = csstext_hide_element;
    document.getElementById("signup-page-container").style.cssText = csstext_show_element;
  })

  document.getElementById("exit-btn").addEventListener("click",function(){
    sessionStorage.clear()
    window.location = ""
  })

  document.getElementById("modifica-url-foto-profilo").addEventListener("change",function(){
    var url = document.getElementById("modifica-url-foto-profilo").value.trim()
    document.getElementById("modifica-img-profile").src = url;
  })

  navs_array.forEach((el) => {
    el.addEventListener("click", function () {
      HandleNavButton(el);
    });
  });

  function HandleNavButton(nav_btn) {
    navs_array.forEach((el) => {
      el.classList.remove("shadow");
    });
    nav_btn.classList.add("shadow");

    id_main_containers.forEach((id) => {
      document.getElementById(id + "-container").style.cssText = csstext_hide_element;
    });

    document.getElementById(nav_btn.id + "-container").style.cssText =
      "display:block !important;";
    chat_container.scrollTop = chat_container.scrollHeight;

  }
  document.getElementById("btn-send").addEventListener("click", function () {
    let text_sended = document.getElementById("input-chat-main").value;
    console.log(text_sended);
    if (text_sended != "") {
      chat_container.innerHTML += `
      <div class="row">
               <div class="col d-flex pt-3 pb-0 flex-row gap-3 text-light">
                   <div class="col-5"></div>
                   <div
                     class="col-6 border bg-dark shadow mx-3 p-3 rounded-4 prompt-regular chat-message">
                     <span class="fs-7">${text_sended}</span>
                   </div>
                   <div class="col-1"></div>
               </div>
             </div>
   `;
    }

    document.getElementById("input-chat-main").value = "";
    chat_container.scrollTop = chat_container.scrollHeight;

  });


  document.getElementById("input-chat-main").addEventListener("keypress", function () {
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("btn-send").click();
    }
  });


  async function doFetch(url, body = {}, method = "GET") {

    if(method == "POST" || method == "PUT"){
      var richiesta = new Request("http://localhost:8000/" + url, {
        method: method,
        headers: new Headers({
          "Content-Type": "application/json"
        }),
        body: JSON.stringify(body)
      });
    }else{
      var richiesta = new Request("http://localhost:8000/" + url, {
        method: method,
        headers: new Headers({
          "Content-Type": "application/json"
        })
      });
    }
    
    var response = fetch(richiesta).then(response => response.json())
    return response  
  }


  async function CheckLoginCredentials() {

    var username_value = document.getElementById("username_login").value.trim()
    var password_value = document.getElementById("password_login").value.trim()

    await doFetch("login", {
      username: username_value,
      password_user: password_value
    }, "POST").then(res => {
        if (res.is_correct_username) {
          if (res.is_correct_pass) {
            document.getElementById("login-page-container").style.cssText = csstext_hide_element;
            document.getElementById("home-page-container").style.cssText = csstext_show_element;
            sessionStorage.setItem("username", username_value)
            setUpDataOfUser()
          } else {
            toast_password.show();
          }
        } else {
          toast_user.show();
        }
      }
    )


  }

  function checkSessionStorage() {
    if (sessionStorage.getItem("username")) {
      document.getElementById("login-page-container").style.cssText = csstext_hide_element;
      document.getElementById("home-page-container").style.cssText = csstext_show_element;
      setUpDataOfUser()
    }
  }

  checkSessionStorage()

  async function SignUpUser() {
    var username_value = document.getElementById("username_signup").value.trim()
    var password_value = document.getElementById("password_signup").value.trim()
    var password_confirm_value = document.getElementById("password2_signup").value.trim()
    var nome = document.getElementById("nome_signup").value.trim()
    var cognome = document.getElementById("cognome_signup").value.trim()

    if (password_value == password_confirm_value) {
      if (nome != "" && cognome != "") {
        await doFetch("signup",{
          username:username_value,
          password_user:password_value,
          nome:nome,
          cognome:cognome
        },"POST").then(res => {
          if(res.res){
            toast_success_signup.show()
            document.getElementById("login-page-container").style.cssText = csstext_show_element;
            document.getElementById("signup-page-container").style.cssText = csstext_hide_element;

          }else{
            toast_user_signup.show()
          }
        })
      }else{
        toast_nome_cognome.show()
      }
    } else {
      toast_password_signup.show()
    }


  }


  async function setUpDataOfUser(){
    var nome_cognome_view = document.getElementById("nome-cognome-view-general")
    var username_view = document.getElementById("username-view-general")
    var n_followers = document.getElementById("n-followers-view-general")
    var img_profile = document.getElementById("img-profile-view-general")

    await doFetch("getUser/"+sessionStorage.getItem("username"))
    .then(res => {
      console.log(res)
      nome_cognome_view.innerText = res.userout.nome+" "+res.userout.cognome
      if(!res.url_profilo){
        img_profile.src = url_def_profilo
      }
      username_view.innerText = "@"+res.userout.username
      n_followers.innerText = res.data_followings_followers.n_followers

    })
  }


  



};
