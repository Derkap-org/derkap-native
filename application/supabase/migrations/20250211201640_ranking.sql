set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_group_ranking(group_id_param bigint)
 RETURNS TABLE(rank integer, profile_id uuid, username text, avatar_url text, winned_challenges integer)
 LANGUAGE sql
 STABLE
AS $function$
with challenge_winners as (
  -- Find the winners for each challenge
  select
    p.profile_id,
    v.challenge_id
  from vote v
  join post p on v.post_id = p.id
  where p.challenge_id = v.challenge_id
  group by v.challenge_id, p.profile_id
  having count(v.id) = (
    -- Select the max votes received in each challenge
    select max(vote_count)
    from (
      select p.profile_id, v.challenge_id, count(v.id) as vote_count
      from vote v
      join post p on v.post_id = p.id
      where p.challenge_id = v.challenge_id
      group by p.profile_id, v.challenge_id
    ) as max_votes
    where max_votes.challenge_id = v.challenge_id
  )
),
user_wins as (
  -- Count the number of challenges won per user
  select profile_id, count(challenge_id) as winned_challenges
  from challenge_winners
  group by profile_id
),
group_users as (
  -- Get all users in the group
  select gp.profile_id, pr.username, pr.avatar_url
  from group_profile gp
  join profile pr on gp.profile_id = pr.id
  where gp.group_id = group_id_param
)
-- Generate the final ranking table
select 
  row_number() over (order by coalesce(uw.winned_challenges, 0) desc) as rank,
  gu.profile_id,
  gu.username,
  gu.avatar_url,
  coalesce(uw.winned_challenges, 0) as winned_challenges
from group_users gu
left join user_wins uw on gu.profile_id = uw.profile_id
order by winned_challenges desc;
$function$
;


