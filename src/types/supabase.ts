// Supabase database types for type-safe queries
export interface SupabaseTable<T = unknown> {
  select(columns?: string): SupabaseQueryBuilder<T>
  insert(data: Partial<T> | Partial<T>[]): SupabaseQueryBuilder<T>
  update(data: Partial<T>): SupabaseQueryBuilder<T>
  delete(): SupabaseQueryBuilder<T>
  upsert(data: Partial<T> | Partial<T>[]): SupabaseQueryBuilder<T>
}

export interface SupabaseQueryBuilder<T = unknown> {
  eq(column: string, value: unknown): SupabaseQueryBuilder<T>
  neq(column: string, value: unknown): SupabaseQueryBuilder<T>
  or(condition: string): SupabaseQueryBuilder<T>
  limit(count: number): SupabaseQueryBuilder<T>
  single(): Promise<{ data: T | null; error: Error | null }>
  maybeSingle(): Promise<{ data: T | null; error: Error | null }>
  select(columns?: string): SupabaseQueryBuilder<T>
  then<TResult1 = { data: T[] | null; error: Error | null }, TResult2 = never>(
    onfulfilled?:
      | ((value: {
          data: T[] | null
          error: Error | null
        }) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2>
}

export interface SupabaseQuery<T = unknown> {
  eq(column: string, value: unknown): SupabaseQuery<T>
  neq(column: string, value: unknown): SupabaseQuery<T>
  or(condition: string): SupabaseQuery<T>
  limit(count: number): SupabaseQuery<T>
  single(): Promise<{ data: T | null; error: Error | null }>
  maybeSingle(): Promise<{ data: T | null; error: Error | null }>
  select(columns?: string): SupabaseQuery<T>
}

export interface SupabaseRPC {
  <T = unknown>(
    functionName: string,
    params?: Record<string, unknown>
  ): Promise<{ data: T | null; error: Error | null }>
}

// Type for challenge_submissions table
export interface DbChallengeSubmission {
  id: string
  challenge_id: string
  profile_id: string
  challenge_title: string
  github_url: string
  live_site_url: string
  submission_description: string | null
  screenshots?: string[] | null
  submitted_at: string
  created_at: string
  updated_at: string
}
