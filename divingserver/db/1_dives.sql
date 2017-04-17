
create table if not exists users (
    user_id         serial                                                      not null
  , email           text                                                        not null
  , password        text                                                        not null
  , salt            text                                                        not null
  , name            text                                                        not null
  
  , inserted        timestamp   default (current_timestamp at time zone 'UTC')  not null
  , primary key(user_id)
);

create table if not exists sessions (
    session_id      uuid        default uuid_generate_v4()	                    not null
  , user_id         int         references users(user_id)                       not null
  , ip              text                                                        not null
  , inserted        timestamp   default (current_timestamp at time zone 'UTC')  not null
);

create table if not exists countries (
    iso2          char(2)                                                       not null
  , name    	    text                                                          not null
  , primary key(iso2) 
);

create table if not exists places (
    place_id        serial                                                      not null
  , country_code    char(2)     references countries(iso2)                      not null
  , name            text                                                        not null 
  , primary key(place_id)
);

create table if not exists dives (
    dive_id         serial                                                      not null
  , user_id         int         references users(user_id)                       not null
  , date            timestamp                                                   not null
  , divetime        int                                                         not null
  , max_depth       numeric(6, 3)                                               not null
  , samples         json        default '[]'                                    not null
  , country_code    char(2)     references countries(iso2)                          null
  , place_id        int         references places(place_id)                         null
  
  , inserted        timestamp   default (current_timestamp at time zone 'UTC')  not null
  , primary key(dive_id)  
);

create table if not exists buddies (
    buddy_id        serial
  , user_id         int         references users(user_id)                       not null
  , text            text                                                        not null
  , color           text                                                        not null
  , buddy_user_id   int                                                             null
  , email           text                                                            null
  , primary key(buddy_id)
);

create table if not exists dive_buddies (
    dive_id         int         references dives(dive_id)                       not null
  , buddy_id        int         references buddies(buddy_id)                    not null
  , primary key(dive_id, buddy_id) 
);

create table if not exists tags (
    tag_id          serial
  , user_id         int         references users(user_id)                       not null
  , text            text                                                        not null
  , color           text                                                        not null
  , primary key(tag_id)
);

create table if not exists dive_tags (
    dive_id         int         references dives(dive_id)                       not null
  , tag_id          int         references tags(tag_id)                         not null
  , primary key(dive_id, tag_id) 
);