
create table if not exists remote_sessions (
    session_id      uuid        default uuid_generate_v4()	                    not null
  , user_id         int         references users(user_id)                       not null
  , ip              text                                                        not null
  , inserted        timestamp   default (current_timestamp at time zone 'UTC')  not null
  , last_used       timestamp   default (current_timestamp at time zone 'UTC')  not null
  , primary key(session_id)
);
create index ix_session_user on remote_sessions(session_id);

