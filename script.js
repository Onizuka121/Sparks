window.onload = function () {


  let navs = document.getElementsByClassName("nav");
  let navs_array = Array.from(navs);

  let id_main_containers = ["feeds", "messages", "profile", "profile-user"];
  let chat_container = document.getElementById("chat-container");
  let toast_user = new bootstrap.Toast(document.getElementById('live-toast-user'));
  let toast_password = new bootstrap.Toast(document.getElementById('live-toast-password'));
  let toast_user_signup = new bootstrap.Toast(document.getElementById('live-toast-user-signup'));
  let toast_password_signup = new bootstrap.Toast(document.getElementById('live-toast-password-signup'));
  let toast_success_signup = new bootstrap.Toast(document.getElementById('live-toast-success-signup'));
  let toast_nome_cognome = new bootstrap.Toast(document.getElementById('live-toast-nome-cognome-signup'))
  let url_def_profilo = "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F009%2F292%2F244%2Foriginal%2Fdefault-avatar-icon-of-social-media-user-vector.jpg&f=1&nofb=1&ipt=30ecd67e8a826fc9133f03458abfbaf765b17fb95f307d31defd3a70984f01fd&ipo=images"
  let url_def_back = "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwallpapercave.com%2Fwp%2Fwp3306770.jpg&f=1&nofb=1&ipt=255ec2b94debd3c98f2d21875275b96d20497c8d368fb97852040289beccfa50&ipo=images"
  let csstext_hide_element = "display:none !important";
  let csstext_show_element = "display:block !important";
  let result_image_checker = false


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

  document.getElementById("exit-btn").addEventListener("click", function () {
    sessionStorage.clear()
    window.location = ""
  })

  document.getElementById("modifica-url-foto-profilo").addEventListener("change", function () {
    var url = document.getElementById("modifica-url-foto-profilo").value.trim()
    checkImage(url, 'modifica-img-profile', 'modifica-url-foto-profilo')
  })



  document.getElementById("modifica-url-foto-profilo-back").addEventListener("change", function () {
    var url = document.getElementById("modifica-url-foto-profilo-back").value.trim()
    checkImage(url, 'modifica-img-profilo-back', 'modifica-url-foto-profilo-back', true)
  })

  function checkImage(url, id_img = null, id_input_url = null, back = false) {
    var image = new Image();
    image.onload = function () {
      if (this.width > 0) {
        if (!id_img) {
          result_image_checker = true
        } else {
          if (!back) {
            document.getElementById(id_img).src = url;
          } else {
            document.getElementById(id_img).style.backgroundImage = "url(" + url + ")"
          }
          document.getElementById(id_input_url).style.border = "2px solid green"
        }
      }
    }
    image.onerror = function () {
      if (!id_img) {
        result_image_checker = false
      } else {
        if (!back) {
          document.getElementById(id_img).src = url_def_profilo;
        } else {
          document.getElementById(id_img).style.backgroundImage = "url(" + url_def_back + ")"
        }
        document.getElementById(id_input_url).style.border = "2px solid red"
      }
    }
    image.src = url;
  }


  document.getElementById("insert-feed-url-foto-input").addEventListener("change", function () {
    var url = document.getElementById("insert-feed-url-foto-input").value.trim()
    checkImage(url, "insert-feed-url-foto", "insert-feed-url-foto-input")
  })

  document.getElementById("insert-feed-btn").addEventListener("click", async function () {
    var descrizione_feed = document.getElementById("insert-feed-descrizione").value.trim()
    var url_feed = document.getElementById("insert-feed-url-foto-input").value.trim()

    await doFetch("insertFeed", {
      cod_feed: 0,
      descrizione: descrizione_feed,
      url_foto_feed: url_feed,
      data_inserimento: "",
      username_inser: sessionStorage.getItem("username"),
      url_foto_user_feed: ""
    }, "PUT")
  })

  async function getAllFeeds() {
    await doFetch("allfeeds/" + sessionStorage.getItem("username")).then(res => {
      document.getElementById("posts-container").innerHTML = ""
      res.feeds.forEach(feed => {
        document.getElementById("posts-container").innerHTML += getFormattedCardFeed(feed)
      })
      if (document.getElementById("posts-container").innerHTML == "") {
        document.getElementById("posts-container").innerHTML = `
       <div class="alert alert-light prompt-medium text-center fs-5 shadow m-auto px-5" role="alert">
        NO FEEDS
      </div>
        `
      }
    })


  }

  function getFormattedCardFeed(feed, is_user_feed = false) {
    var user_feed_html = ""

    if (is_user_feed) {
      user_feed_html = `
      <div class="col-2 d-flex align-items-center">
        <div>
        <span class="material-symbols-outlined m-auto bg-danger text-light p-2 rounded-4 fs-4 cancel-feed" id="${feed.cod_feed}">
        delete_forever
        </span>
        </div>
      </div>
      `
    }
    var html_feed = `
    <div class="p-3 d-flex flex-column border rounded-5 text-dark mb-3 shadow w-100">
            <div class="row text-dark">
              <div class="col d-flex flex-row gap-3">
                <img src="${feed.url_foto_user_feed}" alt=""
                  class="rounded-pill" width="50" height="50" />
                <figure>
                  <blockquote class="blockquote">
                    <p class="prompt-medium fs-6">${feed.username_inser}</p>
                  </blockquote>
                  <figcaption class="blockquote-footer prompt-extralight">
                    <span class="sub-span">${feed.data_inserimento}</span>
                  </figcaption>
                </figure>
              </div>
              ${user_feed_html}
             
            </div>
            <div class="px-2 w-100">
              <p class="lh-sm prompt-regular">
               ${feed.descrizione}
              </p>
              <div class="container-fluid">
                <img src="${feed.url_foto_feed}"
                  class="img-fluid rounded-5" alt="..." />
              </div>
            </div>

            <div class="container">
              <div class="row p-4 px-2 w-100">
                <div class="col p-3 text-center">
                  <div class="rounded-5 fs-6 prompt-regular text-primary d-flex flex-row align-items-center gap-2">
                    <span class="material-symbols-outlined text-center">
                      visibility
                    </span>
                    4563
                  </div>
                </div>
                <div class="col interazione like p-3 rounded-5 text-center">
                  <div class="rounded-5 fs-6 prompt-regular text-success d-flex flex-row align-items-center gap-2">
                    <span class="material-symbols-outlined">
                      thumb_up
                    </span>
                    564
                  </div>
                </div>
                <div class="col interazione comment p-3 rounded-5 text-center">
                  <div class="rounded-5 fs-6 prompt-regular text-info d-flex flex-row align-items-center gap-2">
                    <span class="material-symbols-outlined"> comment </span>
                    34
                  </div>
                </div>
                <div class="col-5"></div>
              </div>
            </div>
          </div>
    `

    return html_feed;

  }








  document.getElementById("modifica-btn").addEventListener("click", async function () {
    var nome_modificato = document.getElementById("modifica-nome").value.trim()
    var cognome_modificato = document.getElementById("modifica-cognome").value.trim()
    var descrizione_modificato = document.getElementById("modifica-descrizione").value.trim()
    var url_foto_profilo_modificato = document.getElementById("modifica-url-foto-profilo").value.trim()
    var url_foto_profilo_back_modificato = document.getElementById("modifica-url-foto-profilo-back").value.trim()

    await doFetch("modifyUser", {
      username: sessionStorage.getItem("username"),
      password_user: "",
      nome: nome_modificato,
      cognome: cognome_modificato,
      descrizione: descrizione_modificato,
      url_profilo: url_foto_profilo_modificato,
      url_back_profilo: url_foto_profilo_back_modificato
    }, "POST").then(res => {
      setUpDataOfUser()
    })


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

    if (nav_btn.id == "feeds") {
      getAllFeeds()
    }

    document.getElementById(nav_btn.id + "-container").style.cssText = csstext_show_element;
    chat_container.scrollTop = chat_container.scrollHeight;

  }



  document.getElementById("btn-send").addEventListener("click", async function () {
    var text_sended = document.getElementById("input-chat-main").value;
    var destinatario = this.ariaLabel;

    if (text_sended != "") {
      chat_container.innerHTML += `
        <div class="row">
                <div class="col d-flex pt-3 pb-0 flex-row gap-3 text-light">
                  <div class="col-5"></div>
                  <div class="col-6 border bg-dark shadow mx-3 p-3 rounded-4 prompt-regular chat-message">
                    <span class="fs-7">${text_sended}</span>
                  </div>
                  <div class="col-4"></div>
                </div>
              </div>
      `
      await doFetch("sendMessage", {
        destinatario: destinatario,
        mittente: sessionStorage.getItem("username"),
        cod_mess: 0,
        ora: "",
        messaggio: text_sended,
        url_foto_profilo_dest: ""
      }, "PUT",false).then(res => {
        console.log(res)
      })
    }

    document.getElementById("input-chat-main").value = "";
    chat_container.scrollTop = chat_container.scrollHeight;

  });


  document.getElementById("input-chat-main").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("btn-send").click();
    }
  });
  getAllFeeds()

  async function doFetch(url, body = {}, method = "GET",interval_stop = true) {
    if(interval_stop){
      clearInterval(interval_global)
    }
    if (method == "POST" || method == "PUT") {
      var richiesta = new Request("http://54.90.30.254:8000/" + url, {
        method: method,
        headers: new Headers({
          "Content-Type": "application/json"
        }),
        body: JSON.stringify(body)
      });
    } else {
      var richiesta = new Request("http://54.90.30.254:8000/" + url, {
        method: method,
        headers: new Headers({
          "Content-Type": "application/json"
        })
      });
    }

    var response = fetch(richiesta).then(response => response.json())
    return response
  }


  async function getUserWithChat(){
    await doFetch("getUserWithChat/"+sessionStorage.getItem("username"))
    .then(res => {
      var chats_container = document.getElementById("chats-container")
      if(res.users.length > 0){
        res.users.forEach(user => {
          chats_container.innerHTML += `
            <div class="row w-100 border rounded-pill p-2 m-auto chat-user" aria-label="${user.username}">
              <div class="col d-flex flex-row gap-1">
                <div class="rounded-pill position-relative">
                  <img src="${user.url_foto_profilo}" alt=""
                    class="rounded-pill m-auto" width="30" height="30" />
                  <span
                    class="position-absolute top-100 start-100 translate-middle badge rounded-pill bg-success online-checker">
                    1
                    <span class="visually-hidden">unread messages</span>
                  </span>
                </div>

                <p class="prompt-medium fs-6 m-auto">${user.username}</p>
              </div>
            </div>
          `  
        })

        var chat_user_array = Array.from(document.getElementsByClassName("chat-user")) 
        chat_user_array.forEach(el => {
          el.addEventListener("click",function(){
            clearInterval(interval_global)
            HandleNavButton(navs_array[1])
            getChatData(el.ariaLabel)
          })
        })
      }else{
        chats_container.innerHTML = `
         <div class="alert alert-light prompt-medium text-center fs-6 m-auto px-5" role="alert">
        NO CHATS
      </div>
        `
      }
      
    })
  }

  getUserWithChat()


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
          getAllFeeds()
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
        await doFetch("signup", {
          username: username_value,
          password_user: password_value,
          nome: nome,
          cognome: cognome
        }, "POST").then(res => {
          if (res.res) {
            toast_success_signup.show()
            document.getElementById("login-page-container").style.cssText = csstext_show_element;
            document.getElementById("signup-page-container").style.cssText = csstext_hide_element;

          } else {
            toast_user_signup.show()
          }
        })
      } else {
        toast_nome_cognome.show()
      }
    } else {
      toast_password_signup.show()
    }


  }


  async function setUpDataOfUser() {
    var nome_cognome_view = document.getElementById("nome-cognome-view-general")
    var username_view = document.getElementById("username-view-general")
    var n_followers = document.getElementById("n-followers-view-general")
    var img_profile = document.getElementById("img-profile-view-general")

    await doFetch("getUser/" + sessionStorage.getItem("username"))
      .then(res => {
        nome_cognome_view.innerText = res.userout.nome + " " + res.userout.cognome
        if (!res.userout.url_profilo) {
          img_profile.src = url_def_profilo
        } else {
          img_profile.src = res.userout.url_profilo
        }
        username_view.innerText = "@" + res.userout.username
        n_followers.innerText = res.data_followings_followers.n_followers
        setDataOfProfilo(res)
      })
  }


  function setDataOfProfilo(user, user_out = false) {


    if (!user.userout.url_back) {
      user.userout.url_back = url_def_back;
    }
    if (!user.userout.url_profilo) {
      user.userout.url_profilo = url_def_profilo;
    }

    if (!user_out) {
      document.getElementById("background-profile").style.backgroundImage = "url('" + user.userout.url_back + "')"
      document.getElementById("modifica-img-profilo-back").style.backgroundImage = "url('" + user.userout.url_back + "')"
      document.getElementById("profilo-img").src = user.userout.url_profilo
      document.getElementById("modifica-img-profile").src = user.userout.url_profilo
      document.getElementById("n-followers-profilo").innerText = user.data_followings_followers.n_followers
      document.getElementById("n_followings_view_left").innerText = user.data_followings_followers.n_followings
      document.getElementById("n-followings-profilo").innerText = user.data_followings_followers.n_followings
      document.getElementById("nome-cognome-profilo").innerText = user.userout.nome + " " + user.userout.cognome
      document.getElementById("username-profilo").innerText = "@" + user.userout.username
      document.getElementById("descrizione-profilo").innerText = user.userout.descrizione
      //modal data predefiniti
      document.getElementById("modifica-username").value = user.userout.username
      document.getElementById("modifica-nome").value = user.userout.nome
      document.getElementById("modifica-cognome").value = user.userout.cognome
      document.getElementById("modifica-descrizione").value = user.userout.descrizione
      document.getElementById("modifica-url-foto-profilo").value = user.userout.url_profilo
      document.getElementById("modifica-url-foto-profilo-back").value = user.userout.url_back

      getUsernameFollowings()
    } else {
      document.getElementById("background-profile-user-out").style.backgroundImage = "url('" + user.userout.url_back + "')"
      document.getElementById("img-profile-user-out").src = user.userout.url_profilo
      document.getElementById("n-followers-profilo-user-out").innerText = user.data_followings_followers.n_followers
      document.getElementById("n-followings-profilo-user-out").innerText = user.data_followings_followers.n_followings
      document.getElementById("nome-cognome-profilo-user-out").innerText = user.userout.nome + " " + user.userout.cognome
      document.getElementById("username-profilo-user-out").innerText = "@" + user.userout.username
      document.getElementById("descrizione-profilo-user-out").innerText = user.userout.descrizione
      document.getElementById("unfollow-profilo-btn").ariaLabel = user.userout.username
      document.getElementById("follow-profilo-btn").ariaLabel = user.userout.username
      document.getElementById("btn-chat-id").ariaLabel = user.userout.username
      isFollowingOfUser(user.userout.username, sessionStorage.getItem("username"))
    }

  }




  async function getUsernameFollowings() {
    //followings-container
    await doFetch("getUsernameFollowings/" + sessionStorage.getItem("username"))
      .then(users => {
        document.getElementById('followers-container').innerHTML = ""
        users.followings_data_general.forEach(user => {
          var url_foto_profilo = (user.url_foto_profilo) ? user.url_foto_profilo : url_def_profilo;
          document.getElementById('followers-container').innerHTML += `
        <div class="row w-100 border rounded-pill p-2 m-auto follower following" aria-label="${user.username}">
               <div class="col d-flex flex-row gap-1">
                 <div class="rounded-pill position-relative">
                   <img src="${url_foto_profilo}" alt=""
                     class="rounded-pill m-auto" width="30" height="30" />
                   <span
                     class="position-absolute top-100 start-100 translate-middle badge rounded-pill bg-success online-checker">
                     1
                     <span class="visually-hidden">unread messages</span>
                   </span>
                 </div>
                 <p class="prompt-medium fs-6 m-auto">${user.username}</p>
               </div>
             </div>
       `

        })

        var followings_element = document.getElementsByClassName("following")
        var followings_element_array = Array.from(followings_element)

        followings_element_array.forEach(following_element => {
          following_element.addEventListener("click", function () {
            getProfileOfUser(following_element.ariaLabel)
          })
        })

      })

  }

  async function isFollowingOfUser(username_seguito, username_seguente) {
    await doFetch("isfollowingOfUser", {
      username_seguente: username_seguente,
      username_seguito: username_seguito
    }, "POST").then(res => {

      var isfollowing = res.isfollowing ? true : false;
      changeBtnFollow(isfollowing)

    })
  }

  document.getElementById("unfollow-profilo-btn").addEventListener("click", async function () {
    changeBtnFollow(false)
    await doFetch("unfollow", {
      username_seguito: document.getElementById("unfollow-profilo-btn").ariaLabel,
      username_seguente: sessionStorage.getItem("username")
    }, "POST").then(res => {
      getProfileOfUser(document.getElementById("unfollow-profilo-btn").ariaLabel)
      getSuggestions()
      getUsernameFollowings()
      setUpDataOfUser()
    })

  })

  document.getElementById("follow-profilo-btn").addEventListener("click", async function () {
    changeBtnFollow(true)
    await doFetch("follow", {
      username_seguito: document.getElementById("unfollow-profilo-btn").ariaLabel,
      username_seguente: sessionStorage.getItem("username")
    }, "POST").then(res => {
      getProfileOfUser(document.getElementById("unfollow-profilo-btn").ariaLabel)
      getSuggestions()
      getUsernameFollowings()
      setUpDataOfUser()

    })
  })

  document.getElementById("btn-chat-id").addEventListener("click", function () {
    HandleNavButton(navs_array[1])
    getChatData(this.ariaLabel)
  })

  async function getChatData(username_chat) {
    await doFetch("getChatData", {
      destinatario: sessionStorage.getItem("username"),
      mittente: username_chat
    }, "POST",false).then(res => {
      console.log("ricevo")
  
      res.url_foto_profilo = res.url_foto_profilo ? res.url_foto_profilo : url_def_profilo
      var chat_container = document.getElementById("chat-container")
      chat_container.innerHTML = ""
      
      document.getElementById("username-chat-profile-user").innerText = username_chat
      document.getElementById("btn-send").ariaLabel = username_chat
      sessionStorage.setItem("user-chat", username_chat)
      document.getElementById("img-chat-profile-user").src = res.url_foto_profilo

      res.chatdata.forEach(message => {
        if (message.mittente == username_chat) {
          chat_container.innerHTML += `
           <div class="row p-2">
                <div class="col d-flex pt-3 pb-0 flex-row gap-3 text-dark">
                  <img src="${res.url_foto_profilo}" alt=""
                    class="rounded-pill" width="40" height="40" />
                  <p class="prompt-regular fs-6 px-2">
                    ${username_chat} - <span class="text-secondary">${message.ora}</span>
                  </p>
                </div>
                <div class="row">
                  <div class="col-1"></div>
                  <div class="col-6 border shadow mx-3 p-3 rounded-4 prompt-regular chat-message">
                    <span class="fs-6">${message.messaggio}</span>
                  </div>
                </div>
              </div>
          `
          
        } else if (message.mittente == sessionStorage.getItem("username")) {
          chat_container.innerHTML += `
            <div class="row">
                <div class="col d-flex pt-3 pb-0 flex-row gap-3 text-light">
                  <div class="col-5"></div>
                  <div class="col-6 border bg-dark shadow mx-3 p-3 rounded-4 prompt-regular chat-message">
                    <span class="fs-7">${message.messaggio}</span>
                  </div>
                  <div class="col-4"></div>
                </div>
              </div>
          `
        }
        
      })
      chat_container.scrollTop = chat_container.scrollHeight;
    })

    var interval = setInterval( () => {
      getChatData(username_chat)
      clearInterval(interval)
  }, 2000);
  interval_global = interval;
    



  }

  var interval_global;
  

  async function changeBtnFollow(isfollowing) {
    if (isfollowing) {
      document.getElementById("unfollow-profilo-btn").style.cssText = csstext_show_element;
      document.getElementById("follow-profilo-btn").style.cssText = csstext_hide_element;
    } else {
      document.getElementById("follow-profilo-btn").style.cssText = csstext_show_element;
      document.getElementById("unfollow-profilo-btn").style.cssText = csstext_hide_element;
    }
  }



  async function getProfileOfUser(username) {
    
    await doFetch("getUser/" + username)
      .then(user_data => {
        setDataOfProfilo(user_data, true)
        id_main_containers.forEach((id) => {
          document.getElementById(id + "-container").style.cssText = csstext_hide_element;
        });
        document.getElementById("profile-user-container").style.cssText = csstext_show_element;

      })
  }



  async function getSuggestions() {//some users
    await doFetch("getSuggestionsUsers/" + sessionStorage.getItem("username"))
      .then(users_sugg => {
        document.getElementById('suggestions-container').innerHTML = ""
        users_sugg.suggestions_users.forEach(user => {
          var url_foto_profilo = (user.url_foto_profilo) ? user.url_foto_profilo : url_def_profilo;
          document.getElementById('suggestions-container').innerHTML += `
          <div class="row w-100 border rounded-4 p-2 m-auto prompt-medium following" aria-label='${user.username}'>
              <div class="col-8 d-flex flex-row gap-3 align-items-center">
                <div class="rounded-pill">
                  <img src="${url_foto_profilo}" alt=""
                    class="rounded-pill m-auto" width="30" height="30" />
                </div>
                <div class="mt-3">
                  <p class="prompt-medium fs-6">${user.username}</p>
                </div>
              </div>
              <div class="col-4 rounded-3 bg-dark text-light text-center p-1 fs-6 follow-btn" aria-label="${user.username}">
                  follow
                </div>
            </div>
        `
        });
        let follow_btns = document.getElementsByClassName("follow-btn");
        let follow_btns_array = Array.from(follow_btns)

        follow_btns_array.forEach(el => {
          el.addEventListener("click", function () {
            followUser(el.ariaLabel)
            getUsernameFollowings()
            setUpDataOfUser()
          })
        })

      })
  }


  async function followUser(username_seguito) {
    await doFetch("follow", {
      username_seguente: sessionStorage.getItem("username"),
      username_seguito: username_seguito
    }, "POST").then(res => {

      getSuggestions()
      getUsernameFollowings()
      getAllFeeds()

    })
  }

  getSuggestions()



  var nav_feeds_array = Array.from(document.getElementsByClassName("nav-feeds"))
  nav_feeds_array.forEach(nav_feeds => {
    nav_feeds.addEventListener("click", function () {
      nav_feeds_array.forEach(nav_feeds => {
        nav_feeds.classList.remove("shadow", "border", "prompt-medium")
        nav_feeds.classList.add("prompt-light")

      })
      nav_feeds.classList.add("shadow", "border", "prompt-medium")
      if (nav_feeds.ariaLabel == "popularFeeds") {
        getAllFeeds()
      } else {
        getUserFeeds()
      }
    })
  })

  async function getUserFeeds() {
    await doFetch("getAllUserFeeds/" + sessionStorage.getItem("username"))
      .then(user_feeds => {
        document.getElementById("posts-container").innerHTML = ""
        user_feeds.feeds.forEach(feed => {
          document.getElementById("posts-container").innerHTML += getFormattedCardFeed(feed, true)
          var cancel_feed_array = Array.from(document.getElementsByClassName("cancel-feed"))
          cancel_feed_array.forEach(cancel_btn => {
            cancel_btn.addEventListener("click", async function () {
              await doFetch("removeFeed/" + cancel_btn.id, {}, "DELETE")
                .then(res => {
                  if (res.res == 1) {
                    getUserFeeds()
                  }
                })
            })
          })
        })
        if (document.getElementById("posts-container").innerHTML == "") {
          document.getElementById("posts-container").innerHTML = `
       <div class="alert alert-light prompt-medium text-center fs-5 shadow m-auto px-5" role="alert">
        NO FEEDS
      </div>
        `
        }
      })
  }

      

};
