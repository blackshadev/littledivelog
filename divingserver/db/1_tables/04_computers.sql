
create table if not exists computers (
    computer_id       serial                                                    not null
  , user_id           int     references users(user_id)                         not null
  , serial            bigint                                                        null
  , vendor            text                                                          null
  , model             bigint                                                        null
  , type              bigint                                                        null
  , name              text                                                          null
  , last_read         timestamp                                                     null
  , last_fingerprint  text                                                          null
  , primary key(computer_id)
);
create index ix_computers_user on computers(user_id);