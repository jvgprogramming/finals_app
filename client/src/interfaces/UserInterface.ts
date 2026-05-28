export interface GenderColumns {
  gender_id: number;
  gender: string;
}

export interface UserColumns {
  user_id: number;
  profile_picture?: string | null;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  suffix_name?: string | null;
  gender_id?: number | string;
  gender: GenderColumns;
  birth_date: string;
  age: number;
  username: string;
}

export interface UserFieldErrors {
  add_user_profile_picture?: string[];
  edit_user_profile_picture?: string[];
  first_name?: string[];
  middle_name?: string[];
  last_name?: string[];
  suffix_name?: string[];
  gender?: string[];
  birth_date?: string[];
  username?: string[];
  password?: string[];
  password_confirmation?: string[];
}