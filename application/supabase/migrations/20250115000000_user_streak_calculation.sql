-- Migration to add user streak calculation function
-- This function calculates consecutive days a user has posted at least one derkap

-- Function to calculate user streak
CREATE OR REPLACE FUNCTION get_user_streak(p_user_id uuid)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
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
$$;

-- Function to get total derkaps count for a user
CREATE OR REPLACE FUNCTION get_user_total_derkaps(p_user_id uuid)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    total_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO total_count
    FROM derkap
    WHERE creator_id = p_user_id;
    
    RETURN total_count;
END;
$$;