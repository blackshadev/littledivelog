create table if not exists equipment (
      user_id     int     not null references users(user_id)
    , tanks       tank[]  null
    , primary key (user_id)
);
