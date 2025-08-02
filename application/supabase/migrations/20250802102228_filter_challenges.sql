set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_user_allowed_challenges(p_user_id uuid, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0)
 RETURNS TABLE(challenge text, max_created_at timestamp with time zone)
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT 
    d.challenge,
    MAX(d.created_at) as max_created_at
  FROM derkap d
  INNER JOIN derkap_allowed_users dau ON d.id = dau.derkap_id
  WHERE dau.allowed_user_id = p_user_id
    AND d.challenge IS NOT NULL
    AND d.challenge != ''
  GROUP BY d.challenge
  ORDER BY MAX(d.created_at) DESC
  LIMIT p_limit
  OFFSET p_offset;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_derkaps_by_challenge(p_user_id uuid, p_challenge text, p_limit integer DEFAULT 6, p_offset integer DEFAULT 0)
 RETURNS TABLE(id bigint, created_at timestamp with time zone, challenge text, caption text, file_path text, base_key text, creator_id uuid, creator_username text, creator_avatar_url text, creator_email text, allowed_users json)
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
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
    p.email as creator_email,
    COALESCE(
      json_agg(
        json_build_object(
          'id', allowed_profiles.id,
          'username', allowed_profiles.username,
          'avatar_url', allowed_profiles.avatar_url,
          'email', allowed_profiles.email,
          'created_at', allowed_profiles.created_at
        )
      ) FILTER (WHERE allowed_profiles.id IS NOT NULL),
      '[]'::json
    ) as allowed_users
  FROM derkap d
  INNER JOIN derkap_allowed_users dau ON d.id = dau.derkap_id
  INNER JOIN profile p ON d.creator_id = p.id
  LEFT JOIN derkap_allowed_users dau2 ON d.id = dau2.derkap_id
  LEFT JOIN profile allowed_profiles ON dau2.allowed_user_id = allowed_profiles.id
  WHERE dau.allowed_user_id = p_user_id
    AND d.challenge = p_challenge
  GROUP BY d.id, d.created_at, d.challenge, d.caption, d.file_path, d.base_key, d.creator_id, p.username, p.avatar_url, p.email
  ORDER BY d.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
$function$
;


