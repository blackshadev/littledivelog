
create type pressure_unit as enum(
    'psi'
  , 'bar'
);

create type pressure as (
    "begin"           int
  , "end"             int
  , "type"            pressure_unit
);

create type tank as (
    volume        int
  , oxygen        int
  , pressure      pressure
);

create table if not exists dives (
    dive_id         serial                                                      not null
  , user_id         int         references users(user_id)                       not null
  , date            timestamp with timezone                                     not null
  , divetime        int                                                         not null
  , max_depth       numeric(6, 3)                                               not null
  , samples         json        default '[]'                                    not null
  , country_code    char(2)     references countries(iso2)                          null
  , place_id        int         references places(place_id)                         null
  , tanks           tank[]                                                      not null

  , updated         timestamp   default (current_timestamp at time zone 'UTC')  not null
  , inserted        timestamp   default (current_timestamp at time zone 'UTC')  not null
  , fingerprint     text                                                            null
  , computer_id     int         references computers(computer_id)                   null
  , primary key(dive_id)
  , check(array_length(tanks, 1) > 0)
);
create index dive_country on dives(country_code);
create index dive_place on dives(place_id);
create index dive_computer_id on dives(computer_id);
create unique index dive_fingerprint on dives(fingerprint);

create table if not exists dive_buddies (
    dive_id         int         references dives(dive_id)                       not null
  , buddy_id        int         references buddies(buddy_id)                    not null
  , primary key(dive_id, buddy_id)
);

create table if not exists dive_tags (
    dive_id         int         references dives(dive_id)                       not null
  , tag_id          int         references tags(tag_id)                         not null
  , primary key(dive_id, tag_id)
);
