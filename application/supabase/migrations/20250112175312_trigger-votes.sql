set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_challenge_status_to_voting()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Get the challenge and its associated group information
    WITH challenge_info AS (
        SELECT 
            c.id AS challenge_id,
            c.group_id,
            c.status,
            (
                SELECT COUNT(*)
                FROM group_profile gp
                WHERE gp.group_id = c.group_id
            ) AS total_members,
            (
                SELECT COUNT(DISTINCT ep.profile_id)
                FROM encrypted_post ep
                WHERE ep.challenge_id = c.id
            ) AS total_posts
        FROM challenge c
        WHERE c.id = NEW.challenge_id
    )
    UPDATE challenge c
    SET status = 'voting'
    FROM challenge_info ci
    WHERE c.id = ci.challenge_id
    AND ci.status != 'voting'  -- Only update if not already in voting status
    AND ci.total_posts = ci.total_members;  -- Update only when all members have posted

    RETURN NEW;
END;
$function$
;


