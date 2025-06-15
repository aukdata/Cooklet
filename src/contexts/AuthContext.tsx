import React, { createContext, useContext, useEffect, useState } from 'react';
import { type User as SupabaseUser, type Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { type User } from '../types';

// 認証コンテキストの型定義
interface AuthContextType {
  user: User | null; // アプリケーション内のユーザー情報
  supabaseUser: SupabaseUser | null; // Supabase認証ユーザー情報
  session: Session | null; // 認証セッション
  loading: boolean; // 認証状態の読み込み中フラグ
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>; // ログイン関数
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>; // サインアップ関数
  signOut: () => Promise<void>; // ログアウト関数
}

// 認証コンテキストを作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 認証コンテキストを利用するためのカスタムフック
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 認証プロバイダーコンポーネント
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 認証状態の管理
  const [user, setUser] = useState<User | null>(null); // アプリケーション内ユーザー情報
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null); // Supabaseユーザー情報
  const [session, setSession] = useState<Session | null>(null); // 認証セッション
  const [loading, setLoading] = useState(true); // 読み込み状態

  // Supabaseユーザーからアプリケーション内ユーザー情報を取得する関数
  const fetchUserProfile = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      console.log('ユーザープロフィール取得開始:', supabaseUser.id);
      
      // タイムアウト付きでデータベース接続を試行
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Database connection timeout')), 10000);
      });
      
      const queryPromise = supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
      
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
      
      if (error) {
        console.error('ユーザープロフィール取得エラー:', error);
        // usersテーブルにプロフィールが存在しない場合は作成を試行
        if (error.code === 'PGRST116') {
          console.log('プロフィールが存在しないため作成します');
          try {
            const { data: newUser, error: insertError } = await supabase
              .from('users')
              .insert({
                id: supabaseUser.id,
                email: supabaseUser.email || '',
              })
              .select()
              .single();
            
            if (insertError) {
              console.error('プロフィール作成エラー:', insertError);
              // 作成に失敗した場合は簡易ユーザーオブジェクトを返す
              return {
                id: supabaseUser.id,
                email: supabaseUser.email || '',
                name: undefined,
                google_id: undefined,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
            }
            
            console.log('プロフィール作成成功:', newUser);
            return newUser;
          } catch (createError) {
            console.error('プロフィール作成例外:', createError);
            return {
              id: supabaseUser.id,
              email: supabaseUser.email || '',
              name: undefined,
              google_id: undefined,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
          }
        }
        // usersテーブルが存在しない場合は簡易ユーザーオブジェクトを作成
        if (error.message.includes('relation "users" does not exist')) {
          console.log('usersテーブルが存在しないため、簡易ユーザーを作成');
          return {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: undefined,
            google_id: undefined,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
        return null;
      }
      
      console.log('ユーザープロフィール取得成功:', data);
      return data;
    } catch (error) {
      console.error('ユーザープロフィール取得例外:', error);
      // タイムアウトまたはデータベース接続エラーの場合は簡易ユーザーオブジェクトを作成
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: undefined,
        google_id: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    // 初期セッション取得
    const initializeAuth = async () => {
      try {
        console.log('認証初期化開始');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('セッション取得エラー:', error);
          if (isMounted) {
            setSession(null);
            setSupabaseUser(null);
            setUser(null);
            setLoading(false);
          }
          return;
        }
        
        if (isMounted) {
          setSession(session);
          setSupabaseUser(session?.user ?? null);
          
          if (session?.user) {
            const userProfile = await fetchUserProfile(session.user);
            setUser(userProfile);
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('認証初期化エラー:', error);
        if (isMounted) {
          setSession(null);
          setSupabaseUser(null);
          setUser(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // 認証状態変更の監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('認証状態変更:', _event, session?.user?.id);
      
      if (isMounted) {
        setSession(session);
        setSupabaseUser(session?.user ?? null);
        
        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user);
          setUser(userProfile);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // メール・パスワードでログインする関数
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  // メール・パスワードでアカウント作成する関数
  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) return { error };

    // usersテーブルにユーザープロフィールを作成
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email,
        });

      if (profileError) {
        console.error('ユーザープロフィール作成エラー:', profileError);
        return { error: profileError };
      }
    }

    return { error };
  };

  // ログアウトする関数
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    supabaseUser,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};