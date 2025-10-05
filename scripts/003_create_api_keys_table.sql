-- Create api_keys table
create table api_keys (
  user_id uuid references auth.users(id) primary key,
  key_encrypted text not null,
  created_at timestamp default now()
);

-- Enable Row Level Security
alter table api_keys enable row level security;

-- Policy: users can manage their own API key
create policy "Users can manage their own API key"
  on api_keys
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
