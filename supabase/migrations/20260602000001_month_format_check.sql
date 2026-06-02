-- Garante que o campo month siga o formato "YYYY-MM" em items e expenses

alter table items
  add constraint items_month_format
  check (month ~ '^\d{4}-\d{2}$');

alter table expenses
  add constraint expenses_month_format
  check (month ~ '^\d{4}-\d{2}$');
