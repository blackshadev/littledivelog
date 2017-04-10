create extension  pgcrypto ;

create table users (
    user_id         serial                                          not null
  , email           text                                            not null
  , password        text                                            not null
  , salt            text                                            not null
  , name            text                                            not null
  
  , inserted        timestamp   default timeszone('UTC', now())     not null
  , primary key(user_id)
);

create table sessions (
    session_id      uuid        default gen_random_uuid()           not null
  , user_id         int         references users(user_id)           not null
  , ip              text                                            not null
  , inserted        timestamp   default timeszone('UTC', now())     not null
)

create table countries (
    iso2            char(2)                                         not null
  , name    	    text                                            not null
  , primary key(country_code) 
)

create table places (
    place_id        serial                                          not null
  , country_code    char(2)     references countries(iso2)          not null
  , name            text                                            not null 
  , primary key(place_id)
)

create table dives (
    dive_id         serial                                          not null
  , user_id         int         references users(user_id)           not null
  , date            timestamp                                       not null
  , divetime        int                                             not null
  , max_depth       numeric(6, 3)                                   not null
  , samples         bjson       default '[]'                        not null
  , country_code    char(2)     references countries(iso2)              null
  , place_id        int         references places(place_id)             null
  
  , inserted        timestamp   default timeszone('UTC', now())     not null
  , primary key(dive_id)  
);

create table buddies (
    buddy_id        serial
  , user_id         int         references users(user_id)           not null
  , text            text                                            not null
  , color           text                                            not null
  , buddy_user_id   int                                                 null
  , email           text                                                null
  , primary key(buddy_id)
);

create table dive_buddies (
    dive_id         int         references dives(dive_id)           not null
  , buddy_id        int         references buddies(buddy_id)        not null
  , primary key(dive_id, buddy_id) 
);

create table tags (
    tag_id          serial
  , user_id         int         references users(user_id)           not null
  , text            text                                            not null
  , color           text                                            not null
  , primary key(tag_id)
);

create table dive_tags (
    dive_id         int         references dives(dive_id)           not null
  , tag_id          int         references tags(tag_id)             not null
  , primary key(dive_id, tag_id) 
);