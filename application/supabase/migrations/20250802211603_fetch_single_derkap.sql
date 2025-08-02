set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_derkap_by_id(p_derkap_id integer, p_current_user_id uuid)
 RETURNS TABLE(id bigint, created_at timestamp with time zone, challenge text, caption text, file_path text, base_key text, creator_id uuid, creator_username text, creator_avatar_url text, creator_created_at timestamp with time zone, creator_email text, creator_birthdate text, allowed_users json)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Return the derkap only if the current user is allowed to see it
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
    p.birthdate as creator_birthdate,
    COALESCE(
      (SELECT json_agg(
        json_build_object(
          'id', au_profile.id,
          'username', au_profile.username,
          'avatar_url', au_profile.avatar_url,
          'created_at', au_profile.created_at,
          'email', au_profile.email,
          'birthdate', au_profile.birthdate
        )
      )
      FROM derkap_allowed_users dau
      JOIN profile au_profile ON dau.allowed_user_id = au_profile.id
      WHERE dau.derkap_id = d.id),
      '[]'::json
    ) as allowed_users
  FROM derkap_allowed_users dau
  JOIN derkap d ON dau.derkap_id = d.id
  JOIN profile p ON d.creator_id = p.id
  WHERE dau.allowed_user_id = p_current_user_id  -- Only if current user is allowed to see it
    AND d.id = p_derkap_id                        -- Specific derkap ID
  LIMIT 1;
END;
$function$
;