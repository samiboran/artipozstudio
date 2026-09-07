#!/usr/bin/env bash
# supabase/functions/ altındaki HER fonksiyonu tek seferde deploy eder.
#
# Neden bu script var: Bu repoda edge function'lar için otomatik bir deploy
# sistemi (CI) yok — `git push`/PR merge Supabase'deki ÇALIŞAN kodu
# DEĞİŞTİRMEZ. Bu unutulduğunda bir fonksiyon GitHub'da güncel ama
# Supabase'de aylarca eski kod çalışır durumda kalabiliyor (create-film-request
# başına geldi). Tek tek "şunu deploy ettim mi" diye hatırlamak yerine bu
# script'i çalıştırmak, listedeki HİÇBİR fonksiyonun atlanmadığını garanti eder.
#
# Kullanım (yerel makinende, bir kere kurulum sonrası):
#   1) Supabase CLI kurulu olmalı: https://supabase.com/docs/guides/cli
#   2) supabase login                              (bir kere)
#   3) supabase link --project-ref qrbkzjosorimiwdbwyyl   (bir kere, bu repoyu projeye bağlar)
#   4) ./scripts/deploy-edge-functions.sh           (her edge function değişikliğinden sonra)
#
# Bu script Claude Code'un sandbox ortamından ÇALIŞTIRILAMAZ — Supabase'e
# giriş yapılmış bir CLI oturumu gerektirir, o da bu ortamda yok.

set -euo pipefail
cd "$(dirname "$0")/.."

FUNCTIONS=(
  create-order
  create-photo-print-order
  create-frame-order
  create-film-request
  send-contact-email
  notify-shipped
)

echo "Deploy edilecek fonksiyonlar: ${FUNCTIONS[*]}"
echo

for fn in "${FUNCTIONS[@]}"; do
  echo "→ $fn deploy ediliyor..."
  supabase functions deploy "$fn"
  echo
done

echo "Tamamlandı — ${#FUNCTIONS[@]} fonksiyon deploy edildi."
