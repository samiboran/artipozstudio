-- ============================================================
-- Supabase Security Advisor "Security Definer View" uyarısını düzeltir:
-- public.favorite_counts view'ı SECURITY DEFINER davranışıyla (view
-- sahibinin yetkileriyle) çalışıyordu, bu da sorguyu yapan kullanıcının
-- RLS politikalarını atlayabileceği anlamına gelir. security_invoker
-- açılınca view artık sorguyu yapan kullanıcının kendi yetkileriyle
-- çalışır (Postgres 15+ / Supabase'in önerdiği standart düzeltme).
--
-- Not: Bu view Artı Poz kod tabanında (bu repo) hiçbir yerde
-- oluşturulmamış/kullanılmıyor — muhtemelen daha önce elle veya başka
-- bir oturumda eklenmiş. Var olan tanımını değiştirmiyoruz, sadece
-- güvenlik modunu düzeltiyoruz.
-- Supabase SQL Editor'de çalıştır.
-- ============================================================

alter view public.favorite_counts set (security_invoker = on);
