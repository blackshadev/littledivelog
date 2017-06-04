insert into users (
    email
  , password
  , salt
  , name
) values (
    'vinnie@script4web.nl'
  , ''
  , ''
  , 'Vincent'
);

insert into places (
    country_code, name
) values (
    'NL', 'De beldert'
), (
    'NL', 'Het heidemeer'
), (
    'EG', 'Fanadir Daght'
);

insert into dives (
    user_id
  , date
  , divetime
  , max_depth
  , samples
  , country_code
  , place_id
) values (
    1
  , '2017-04-11 21:05:10'
  , '1500'
  , '5.65'
  , '[]'
  , 'NL'
  , 1
), (
    1
  , '2017-04-03 07:12:04'
  , '3780'
  , '12.45'
  , '[]'
  , 'NL'
  , 1
);

insert into buddies (
    user_id
  , text
  , color
) values (
    1
  , 'Gonard'
  , '#ff00ff'
), (
    1
  , 'Iris'
  , '#0110ff'
);

insert into dive_buddies (
    dive_id, buddy_id
) values (
    1, 1
), (
    2, 2
);

insert into tags (
    user_id
  , text
  , color
) values (
    1
  , 'Night'
  , '#09021f'
), (
    1
  , 'Deco'
  , '#87f210'
);

insert into dive_tags (
    dive_id, tag_id
) values (
    1, 1
), (
    2, 1
), (
    2, 2
)
;