-- Carousel takılmasının kök nedeni: sistemde önceden yüklenmiş, hâlâ büyük
-- boyutlu görseller. Bu sütun, Admin panelinin arka planda otomatik olarak
-- (Sami'nin elle bir butona basmasına gerek kalmadan) bir kerelik toplu
-- sıkıştırmayı ne zaman çalıştırdığını işaretler — bu satır boşken Admin her
-- açıldığında sıkıştırma otomatik tetiklenir, tamamlandığında bu alan
-- damgalanır ve bir daha otomatik çalışmaz.
alter table site_settings add column if not exists images_compressed_at timestamptz;
