-- Create function to fetch derkaps by user with access control and pagination
CREATE OR REPLACE FUNCTION get_user_derkaps(
  p_target_user_id UUID,
  p_current_user_id UUID,
  p_limit INTEGER DEFAULT 12,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id BIGINT,
  created_at TIMESTAMPTZ,
  challenge TEXT,
  caption TEXT,
  file_path TEXT,
  base_key TEXT,
  creator_id UUID,
  creator_username TEXT,
  creator_avatar_url TEXT,
  creator_created_at TIMESTAMPTZ,
  creator_email TEXT,
  creator_birthdate TEXT,
  allowed_users JSON
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Return derkaps created by the target user that the current user is allowed to see
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
    AND d.creator_id = p_target_user_id           -- Created by target user
  ORDER BY d.created_at DESC                      -- Most recent first
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;