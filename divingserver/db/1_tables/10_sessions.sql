create table if not exists session_tokens (
      token         uuid        default uuid_generate_v4()                      not null
    , user_id       int         references users(user_id)                       not null
    , last_used     timestamp                                                       null
    , description   text                                                            null
    , inserted      timestamp   default (current_timestamp at time zone 'UTC')  not null
    , primary key (token, user_id)
);