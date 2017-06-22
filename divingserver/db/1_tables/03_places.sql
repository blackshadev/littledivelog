create table if not exists places (
    place_id        serial                                                      not null
  , country_code    char(2)     references countries(iso2)                      not null
  , name            text                                                        not null
  , primary key(place_id)
);