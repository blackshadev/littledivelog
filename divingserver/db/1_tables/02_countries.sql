
create table if not exists countries (
    iso2          char(2)                                                       not null
  , name    	    text                                                        not null
  , primary key(iso2)
);