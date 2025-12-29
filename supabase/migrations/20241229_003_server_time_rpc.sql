-- Migration: Server Time RPC Function
-- Purpose: Provide server time for client synchronization to prevent time manipulation
-- Requirements: 8.1

-- Create RPC function to return current server time
CREATE OR REPLACE FUNCTION get_server_time()
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN jsonb_build_object(
        'server_time', NOW(),
        'server_time_ms', EXTRACT(EPOCH FROM NOW()) * 1000
    );
END;
$$;

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION get_server_time() TO authenticated;
GRANT EXECUTE ON FUNCTION get_server_time() TO anon;
