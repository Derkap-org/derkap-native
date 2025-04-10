alter table "public"."comment" drop constraint "comment_derkap_id_fkey";

alter table "public"."comment" add constraint "comment_derkap_id_fkey" FOREIGN KEY (derkap_id) REFERENCES derkap(id) ON DELETE CASCADE not valid;

alter table "public"."comment" validate constraint "comment_derkap_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_group_ranking(group_id_param bigint)
 RETURNS TABLE(rank integer, profile_id uuid, username text, avatar_url text, winned_challenges integer)
 LANGUAGE sql
 STABLE
AS $function$
WITH challenge_winners AS (
  -- Find the winners for each challenge in the specified group with status "ended"
  SELECT
    p.profile_id,
    v.challenge_id
  FROM vote v
  JOIN post p ON v.post_id = p.id
  JOIN challenge c ON v.challenge_id = c.id  -- Ensure challenge belongs to the group
  WHERE c.group_id = group_id_param  -- ✅ Only count challenges in this group
    AND c.status = 'ended'  -- ✅ Only consider challenges that are "ended"
  GROUP BY v.challenge_id, p.profile_id
  HAVING COUNT(v.id) = (
    -- Select the max votes received in each challenge
    SELECT MAX(vote_count)
    FROM (
      SELECT p.profile_id, v.challenge_id, COUNT(v.id) AS vote_count
      FROM vote v
      JOIN post p ON v.post_id = p.id
      JOIN challenge c ON v.challenge_id = c.id  -- Ensure challenge belongs to the group
      WHERE p.challenge_id = v.challenge_id
        AND c.status = 'ended'  -- ✅ Only count votes from ended challenges
      GROUP BY p.profile_id, v.challenge_id
    ) AS max_votes
    WHERE max_votes.challenge_id = v.challenge_id
  )
),
user_wins AS (
  -- Count the number of challenges won per user (only in this group)
  SELECT profile_id, COUNT(challenge_id) AS winned_challenges
  FROM challenge_winners
  GROUP BY profile_id
),
group_users AS (
  -- Get all users in the specified group
  SELECT gp.profile_id, pr.username, pr.avatar_url
  FROM group_profile gp
  JOIN profile pr ON gp.profile_id = pr.id
  WHERE gp.group_id = group_id_param
)
-- Generate the final ranking table
SELECT 
  ROW_NUMBER() OVER (ORDER BY COALESCE(uw.winned_challenges, 0) DESC) AS rank,
  gu.profile_id,
  gu.username,
  gu.avatar_url,
  COALESCE(uw.winned_challenges, 0) AS winned_challenges
FROM group_users gu
LEFT JOIN user_wins uw ON gu.profile_id = uw.profile_id
ORDER BY winned_challenges DESC;
$function$
;


