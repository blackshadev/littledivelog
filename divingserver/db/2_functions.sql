create type dive_record as(
    dive_id		int
  , date		  text
  , divetime	int
  , max_depth	numeric(6, 3)
  , place		  json
  , tags		  json
  , buddies   json
  , tanks     json
);

create or replace function get_dives(
    p_user_id int
)
returns setof dive_record
as $$
select dive_id
	   , date::text
     , divetime
     , max_depth
     , (
         select COALESCE(row_to_json(b), '{ "country_code": null, "name": null, "place_id": null }')
           from (
               select p.country_code, p.name, p.place_id 
                 from places p
                where p.place_id = d.place_id
           ) b
       ) as place
     , (	
         select COALESCE(array_to_json(array_agg(row_to_json(b))), '[]')
           from (
             select tag.tag_id, tag.color, tag.text
               from dive_tags d_t
               join tags tag on d_t.tag_id = tag.tag_id
              where d_t.dive_id = d.dive_id
           ) b
       ) as tags
     , (	
         select COALESCE(array_to_json(array_agg(row_to_json(b))), '[]')
           from (
             select bud.buddy_id, bud.color, bud.text
               from dive_buddies d_b
               join buddies bud on d_b.buddy_id = bud.buddy_id
              where d_b.dive_id = d.dive_id
           ) b
       ) as buddies
     , to_json(d.tanks) 
  from dives d
 where d.user_id = p_user_id
 order by d.date desc
 $$
 language sql
 strict;
 