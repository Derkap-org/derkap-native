-- Migration to add function for fetching user's allowed challenges with pagination

CREATE OR REPLACE FUNCTION public.get_user_allowed_challenges(
  p_user_id uuid,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(challenge text, max_created_at timestamp with time zone)
LANGUAGE sql
SECURITY DEFINER
AS $$
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
$$;

-- Grant necessary permissions
GRANT ALL ON FUNCTION "public"."get_user_allowed_challenges"("uuid", integer, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_allowed_challenges"("uuid", integer, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_allowed_challenges"("uuid", integer, integer) TO "service_role";