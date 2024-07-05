window.onload = function () {

  let navs = document.getElementsByClassName("nav");
  let navs_array = Array.from(navs);
  let id_main_containers = ["feeds", "messages", "username"];
  let chat_container = document.getElementById("chat-container");
  

  let csstext_hide_element = "display:none !important";
  let csstext_show_element = "display:flex !important";


  document.getElementById("btn-login-main").addEventListener("click",CheckLoginCredentials)

  document.getElementById("btn-login-href").addEventListener("click",function() {
    document.getElementById("login-page-container").style.cssText = csstext_show_element;
    document.getElementById("signup-page-container").style.cssText = csstext_hide_element;
  })

  document.getElementById("btn-signup-main").addEventListener("click",SignUpUser)
  document.getElementById("btn-signup-href").addEventListener("click",function() {
    document.getElementById("login-page-container").style.cssText = csstext_hide_element;
    document.getElementById("signup-page-container").style.cssText = csstext_show_element;
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
    if(text_sended != ""){
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

  document.getElementById("input-chat-main").addEventListener("keypress",function(){
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("btn-send").click();
  }});

  function CheckLoginCredentials(){
    document.getElementById("login-page-container").style.cssText = csstext_hide_element;
    document.getElementById("home-page-container").style.cssText = csstext_show_element;
  }

  function SignUpUser(){
    
  }

};
