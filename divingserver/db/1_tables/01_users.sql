
create table if not exists users (
    user_id         serial                                                      not null
  , email           text                                                        not null
  , password        text                                                        not null
  , name            text                                                        not null

  , inserted        timestamp   default (current_timestamp at time zone 'UTC')  not null
  , primary key(user_id)
);
