create type dive_record as(
    dive_id		int
  , date		timestamp
  , divetime	int
  , max_depth	numeric(6, 3)
  , place		json
  , tags		json
  , buddies 	json
);

create or replace function get_dives(
    p_session_id uuid
)
returns setof dive_record
as $$
select dive_id
	   , date::text
     , divetime
     , max_depth
     , (
         select row_to_json(b)
           from (
               select p.country_code, p.name, p.place_id 
                 from places p
                where p.place_id = d.place_id
           ) b
       ) as place
     , (	
         select array_to_json(array_agg(row_to_json(b)))
           from (
             select tag.color, tag.text
               from dive_tags d_t
               join tags tag on d_t.tag_id = tag.tag_id
              where d_t.dive_id = d.dive_id
           ) b
       ) as tags
     , (	
         select array_to_json(array_agg(row_to_json(b)))
           from (
             select bud.color, bud.text
               from dive_buddies d_b
               join buddies bud on d_b.buddy_id = bud.buddy_id
              where d_b.dive_id = d.dive_id
           ) b
       ) as buddies
  from dives d
  join sessions s on d.user_id = s.user_id
 where s.session_id = p_session_id
 $$
 language sql
 strict;