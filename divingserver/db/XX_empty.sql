truncate table countries cascade;
truncate table users cascade;
truncate table dives cascade;

ALTER SEQUENCE users_user_id_seq RESTART WITH 1;
ALTER SEQUENCE places_place_id_seq RESTART WITH 1;
ALTER SEQUENCE dives_dive_id_seq RESTART WITH 1;
ALTER SEQUENCE buddies_buddy_id_seq RESTART WITH 1;
ALTER SEQUENCE tags_tag_id_seq RESTART WITH 1;