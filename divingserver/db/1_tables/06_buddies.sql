
create table if not exists buddies (
    buddy_id        serial
  , user_id         int         references users(user_id)                       not null
  , text            text                                                        not null
  , color           text                                                        not null
  , buddy_user_id   int                                                             null
  , email           text                                                            null
  , primary key(buddy_id)
);
