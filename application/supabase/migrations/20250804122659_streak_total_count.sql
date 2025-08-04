set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_user_derkaps_by_user(p_user_id uuid, p_current_user_id uuid, p_limit integer DEFAULT 9, p_offset integer DEFAULT 0)
 RETURNS TABLE(id integer, created_at timestamp with time zone, challenge text, caption text, file_path text, base_key text, creator_id uuid, creator_username text, creator_avatar_url text, creator_created_at timestamp with time zone, creator_email text, allowed_users json)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Return derkaps created by the specified user that the current user is allowed to see
  RETURN QUERY
  SELECT 
    d.id,
    d.created_at,
    d.challenge,
    d.caption,
    d.file_path,
    d.base_key,
    d.creator_id,
    p.username as creator_username,
    p.avatar_url as creator_avatar_url,
    p.created_at as creator_created_at,
    p.email as creator_email,
    COALESCE(
      (SELECT json_agg(
        json_build_object(
          'id', au_profile.id,
          'username', au_profile.username,
          'avatar_url', au_profile.avatar_url,
          'created_at', au_profile.created_at,
          'email', au_profile.email
        )
      )
      FROM derkap_allowed_users dau
      JOIN profiles au_profile ON dau.allowed_user_id = au_profile.id
      WHERE dau.derkap_id = d.id),
      '[]'::json
    ) as allowed_users
  FROM derkap_allowed_users dau
  JOIN derkaps d ON dau.derkap_id = d.id
  JOIN profiles p ON d.creator_id = p.id
  WHERE dau.allowed_user_id = p_current_user_id  -- Only derkaps the current user can see
    AND d.creator_id = p_user_id                  -- Only derkaps created by the specified user
  ORDER BY d.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_streak(p_user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    streak_count INTEGER := 0;
    current_date_check DATE;
    previous_date DATE;
    has_post_today BOOLEAN;
    post_date DATE;
BEGIN
    -- Start from today and work backwards
    current_date_check := CURRENT_DATE;
    
    -- Check if user has posted today first
    SELECT EXISTS(
        SELECT 1 
        FROM derkap 
        WHERE creator_id = p_user_id 
        AND DATE(created_at) = current_date_check
    ) INTO has_post_today;
    
    -- If user hasn't posted today, streak is 0
    IF NOT has_post_today THEN
        RETURN 0;
    END IF;
    
    -- Start counting from today
    previous_date := current_date_check;
    
    -- Loop through dates backwards to count consecutive days
    FOR post_date IN (
        SELECT DISTINCT DATE(created_at) as post_date
        FROM derkap
        WHERE creator_id = p_user_id
        AND DATE(created_at) <= current_date_check
        ORDER BY post_date DESC
    ) LOOP
        -- If this date is consecutive to the previous one
        IF post_date = previous_date THEN
            streak_count := streak_count + 1;
            previous_date := previous_date - 1;
        ELSE
            -- If there's a gap, break the streak
            EXIT;
        END IF;
    END LOOP;
    
    RETURN streak_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_total_derkaps(p_user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    total_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO total_count
    FROM derkap
    WHERE creator_id = p_user_id;
    
    RETURN total_count;
END;
$function$
;


