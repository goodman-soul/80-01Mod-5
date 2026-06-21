import { Module, Global } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI4MDB9.ZH6fV1h3b0t5aGk0LWp5d19nN1BtQ2';

export const SUPABASE_CLIENT = 'SUPABASE_CLIENT';

const supabaseProvider = {
  provide: SUPABASE_CLIENT,
  useValue: createClient(SUPABASE_URL, SUPABASE_ANON_KEY),
};

@Global()
@Module({
  providers: [supabaseProvider],
  exports: [SUPABASE_CLIENT],
})
export class DatabaseModule {}
