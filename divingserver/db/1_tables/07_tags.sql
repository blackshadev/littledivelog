create table if not exists tags (
    tag_id          serial
  , user_id         int         references users(user_id)                       not null
  , text            text                                                        not null
  , color           text                                                        not null
  , primary key(tag_id)
);
