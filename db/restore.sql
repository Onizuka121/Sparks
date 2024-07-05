create table if not exists utenti(
  
  username varchar(50) primary key,
  password_user varchar(255) not null,
  nome varchar(50) not null,
  cognome varchar(50) not null,
  url_foto_profilo text,
  url_foto_background_profilo text,
  descrizione text
  );

  create table if not exists feeds (
    cod_feed int primary key auto_increment,
    descrizione text,
    url_foto_feed text,
    data_inserimento date not null,
    username_inser varchar(50) not null,
    foreign key (username_inser) references utenti(username)
        on update cascade
        on delete cascade
);


create table if not exists interazioni (
  
  cod_interazione int primary key auto_increment,
  data_ora datetime not null default current_timestamp,
  is_comment bool not null default false,
  comment_text text,
  is_mi_piace bool not null default true,
  username_inter varchar(50) not null,
  cod_feed_inter int not null,
  foreign key (username_inter) references utenti(username)
  on update cascade
  on delete cascade,
  foreign key (cod_feed_inter) references feeds(cod_feed)
  on update cascade
  on delete cascade
  
  
  );

create table if not exists seguiti(
  
  cod_seguiti int primary key auto_increment,
  username_seguente varchar(50) not null,
  username_seguito varchar(50) not null,
  foreign key (username_seguente) references utenti(username)
  on update cascade
  on delete cascade,
  foreign key (username_seguito) references utenti(username)
  on update cascade
  on delete cascade
  
  );

create table if not exists messaggi(
  
  cod_mess int primary key auto_increment,
  ora timestamp default current_timestamp,
  messaggio text not null,
  username_mittente varchar(50) not null,
  username_destinatario varchar(50) not null,
  foreign key (username_mittente) references utenti(username)
  on update cascade
  on delete cascade,
  foreign key (username_destinatario) references utenti(username)
  on update cascade
  on delete cascade
  
  );
