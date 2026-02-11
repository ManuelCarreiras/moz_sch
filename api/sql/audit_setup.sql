-- ============================================================
-- Audit Trigger Function (must be created first)
-- Uses current_setting('app.audit_user', true) for updated_by
-- (current_user is reserved in PostgreSQL, so we use audit_user)
-- (set by Flask app at transaction start - no updated_by column needed on audited tables)
-- ============================================================
CREATE OR REPLACE FUNCTION fn_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    pk VARCHAR(50);
    update_by VARCHAR(50);
BEGIN
    -- Get primary key (assumes PK column is "_id")
    -- NEW is NULL for DELETE, OLD is NULL for INSERT
    pk := CASE WHEN TG_OP = 'DELETE' THEN (OLD._id)::text ELSE (NEW._id)::text END;

    -- Get user from session variable (set by app) or from row if column exists
    update_by := NULLIF(current_setting('app.audit_user', true), '');

    -- Insert into audit_log
    INSERT INTO audit_log(_id, entry_id, updated_by, operacao, tabela, data, old_data, new_data)
    VALUES (
        gen_random_uuid(),
        pk,
        update_by,
        TG_OP,
        TG_TABLE_NAME,
        now(),
        CASE
            WHEN TG_OP IN ('UPDATE','DELETE') THEN row_to_json(OLD)
            ELSE NULL
        END,
        CASE
            WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)
            ELSE NULL
        END
    );

    RETURN NULL;  -- AFTER trigger, nothing to modify
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Create audit triggers dynamically for all tables with _id
-- (excluding audit_log itself)
-- ============================================================
DO $$
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN
        SELECT pt.tablename
        FROM pg_tables pt
        WHERE pt.schemaname = 'public'
        AND pt.tablename != 'audit_log'
        AND EXISTS (
            SELECT 1 FROM information_schema.columns c
            WHERE c.table_schema = 'public'
            AND c.table_name = pt.tablename
            AND c.column_name = '_id'
        )
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_trigger t
            JOIN pg_class c ON t.tgrelid = c.oid
            WHERE c.relname = tbl.tablename
            AND t.tgname = 'trg_audit_' || tbl.tablename
        ) THEN
            EXECUTE format(
                'CREATE TRIGGER trg_audit_%I AFTER INSERT OR UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger()',
                tbl.tablename,
                tbl.tablename
            );
            RAISE NOTICE 'Created audit trigger for %', tbl.tablename;
        END IF;
    END LOOP;
END$$;

-- ============================================================
-- Enable Row-Level Security and create policies on audit_log
-- ============================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_log') THEN
        ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

        IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE policyname = 'insert_only_audit' AND tablename = 'audit_log'
        ) THEN
            CREATE POLICY insert_only_audit
            ON audit_log
            FOR INSERT
            TO PUBLIC
            WITH CHECK (true);
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE policyname = 'select_audit_logs' AND tablename = 'audit_log'
        ) THEN
            CREATE POLICY select_audit_logs
            ON audit_log
            FOR SELECT
            TO PUBLIC
            USING (true);
        END IF;

        RAISE NOTICE 'RLS enabled and policies created for audit_log table';
    END IF;
END$$;
